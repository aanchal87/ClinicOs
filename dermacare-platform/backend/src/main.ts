import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RedisIoAdapter } from './common/adapters/redis-io.adapter';
import { AppLogger } from './common/logger/app-logger';
import * as express from 'express';
import * as path from 'path';

async function bootstrap() {
  // Validate mandatory environment variables
  const requiredEnvVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'REDIS_URL',
    'ENCRYPTION_KEY',
    'STORAGE_PATH',
  ];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.error(`CRITICAL CONFIGURATION ERROR: Missing required environment variable: ${envVar}`);
      process.exit(1);
    }
  }

  const logger = new AppLogger();
  const app = await NestFactory.create(AppModule, { logger });
  
  // Enable CORS configurations with credentials support
  app.enableCors({
    origin: ['http://localhost:3000'],
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Accept,Authorization',
  });
  
  // Serve uploaded files statically
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
  
  try {
    const redisIoAdapter = new RedisIoAdapter(app);
    await redisIoAdapter.connectToRedis();
    app.useWebSocketAdapter(redisIoAdapter);
    logger.log('WebSocket Redis adapter connected and registered.');
  } catch (error: any) {
    logger.warn(`Failed to connect to Redis. Falling back to default in-memory WebSocket adapter: ${error.message}`);
  }
  
  const port = process.env.PORT || 3001;
  await app.listen(port);
  logger.log(`Backend server is running on port ${port}`);
}
bootstrap();
