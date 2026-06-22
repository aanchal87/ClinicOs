"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const redis_io_adapter_1 = require("./common/adapters/redis-io.adapter");
const app_logger_1 = require("./common/logger/app-logger");
const express = __importStar(require("express"));
const path = __importStar(require("path"));
async function bootstrap() {
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
    const logger = new app_logger_1.AppLogger();
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { logger });
    app.enableCors({
        origin: ['http://localhost:3000'],
        credentials: true,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        allowedHeaders: 'Content-Type,Accept,Authorization',
    });
    app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
    try {
        const redisIoAdapter = new redis_io_adapter_1.RedisIoAdapter(app);
        await redisIoAdapter.connectToRedis();
        app.useWebSocketAdapter(redisIoAdapter);
        logger.log('WebSocket Redis adapter connected and registered.');
    }
    catch (error) {
        logger.warn(`Failed to connect to Redis. Falling back to default in-memory WebSocket adapter: ${error.message}`);
    }
    const port = process.env.PORT || 3001;
    await app.listen(port);
    logger.log(`Backend server is running on port ${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map