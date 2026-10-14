# ClinicOS Production Error Tracking Setup Guide (Sentry)

This guide documents how to configure Sentry in **ClinicOS** to monitor and track runtime exceptions, failed API requests, and React crashes in staging and production.

---

## 1. Backend Integration (NestJS)

To track unhandled exceptions, database crashes, and system faults on the backend:

### Step 1: Install Sentry SDK
Run inside `/backend`:
```bash
npm install --save @sentry/nestjs @sentry/profiling-node
```

### Step 2: Initialize Sentry in `main.ts`
Initialize Sentry at the very beginning of the bootstrap function before creating the NestJS application:

```typescript
import * as Sentry from "@sentry/nestjs";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

async function bootstrap() {
  if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      integrations: [
        nodeProfilingIntegration(),
      ],
      tracesSampleRate: 0.1, // Sample 10% of transactions for performance
      profilesSampleRate: 0.1, // Sample 10% of profiles
      environment: 'staging',
    });
  }
  
  // ... rest of bootstrap
}
```

### Step 3: Implement Global Exceptions Filter
Create a NestJS global exception filter `sentry.filter.ts` to capture and report all unhandled exceptions:

```typescript
// src/common/filters/sentry-exception.filter.ts
import { Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import * as Sentry from '@sentry/nestjs';

@Catch()
export class SentryExceptionFilter extends BaseExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    
    // Determine status code
    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    // Report HTTP 5xx errors and native runtime errors to Sentry
    if (status >= 500 || !(exception instanceof HttpException)) {
      Sentry.captureException(exception);
    }

    super.catch(exception, host);
  }
}
```

Register the filter globally in `main.ts`:
```typescript
import { HttpAdapterHost } from '@nestjs/core';
import { SentryExceptionFilter } from './common/filters/sentry-exception.filter';

// inside bootstrap()
const { httpAdapter } = app.get(HttpAdapterHost);
app.useGlobalFilters(new SentryExceptionFilter(httpAdapter));
```

---

## 2. Frontend Integration (Next.js - `clinicos-frontend`)

For tracking React rendering failures, NextJS Server-Side rendering bugs, and API fetch failures:

### Step 1: Install Sentry SDK
Run inside `/clinicos-frontend`:
```bash
npm install --save @sentry/nextjs
```

### Step 2: Run Wizard or Initialize Configs
Configure using the Sentry wizard:
```bash
npx @sentry/wizard@latest -i nextjs
```
This automatically creates three files in the root of your Next.js directory:
- `sentry.server.config.ts` (Server runtime exceptions)
- `sentry.edge.config.ts` (Edge runtime exceptions)
- `sentry.client.config.ts` (Client-side browser exceptions)

Verify `sentry.client.config.ts` contains:
```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  environment: 'staging',
  // Track failed API requests
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});
```

---

## 3. Frontend Integration (Vite - `dermacare-platform/frontend`)

To capture runtime JavaScript exceptions and failed fetch calls in the client dashboard:

### Step 1: Install Sentry SDK
Run inside `/frontend`:
```bash
npm install --save @sentry/react
```

### Step 2: Initialize Sentry in `main.jsx`
Add Sentry initialization before rendering the root component:

```javascript
import React from "react";
import ReactDOM from "react-dom/client";
import * as Sentry from "@sentry/react";
import App from "./App";
import "./index.css";

if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    environment: 'staging',
  });
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### Step 3: Wrap App in Error Boundary
Wrap your components in Sentry's Error Boundary to capture React lifecycle crashes:

```javascript
// Inside App.jsx
import * as Sentry from "@sentry/react";

function App() {
  // ... state and logic
  
  return (
    <Sentry.ErrorBoundary fallback={<FallbackComponent />}>
      {/* Rest of components */}
    </Sentry.ErrorBoundary>
  );
}

function FallbackComponent() {
  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h2>Oops! Something went wrong.</h2>
      <p>Our engineering team has been notified. Please refresh the page.</p>
    </div>
  );
}
```

---

## 4. API Request Failure Tracking (Axios/Fetch)

To capture HTTP client errors (e.g. 404, 503) inside API clients:

### Axios Interceptor Configuration (`apiClient.ts`)
Update Axios client to report network errors directly to Sentry:

```typescript
import axios from 'axios';
import * as Sentry from '@sentry/nextjs'; // or @sentry/react for Vite

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log network and server errors to Sentry
    if (!error.response || error.response.status >= 500) {
      Sentry.withScope((scope) => {
        scope.setTag("type", "api_request_failure");
        scope.setExtra("url", error.config?.url);
        scope.setExtra("method", error.config?.method);
        scope.setExtra("status", error.response?.status);
        Sentry.captureException(error);
      });
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```
