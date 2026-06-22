"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var RedisService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const common_1 = require("@nestjs/common");
const redis_1 = require("redis");
let RedisService = RedisService_1 = class RedisService {
    client;
    logger = new common_1.Logger(RedisService_1.name);
    async onModuleInit() {
        const redisUrl = process.env.REDIS_URL;
        if (!redisUrl) {
            this.logger.error('REDIS_URL environment variable is missing');
            return;
        }
        this.client = (0, redis_1.createClient)({
            url: redisUrl,
            socket: {
                reconnectStrategy: (retries) => {
                    if (retries > 1) {
                        return false;
                    }
                    return 500;
                }
            }
        });
        this.client.on('error', (err) => this.logger.error('Redis Client Error', err.message));
        try {
            await this.client.connect();
            this.logger.log('Redis client successfully connected for session management.');
        }
        catch (e) {
            this.logger.error('Failed to connect to Redis', e);
        }
    }
    async onModuleDestroy() {
        if (this.client) {
            await this.client.disconnect();
        }
    }
    async set(key, value, ttlSeconds) {
        if (!this.client)
            throw new Error('Redis client not initialized');
        if (ttlSeconds) {
            await this.client.set(key, value, { EX: ttlSeconds });
        }
        else {
            await this.client.set(key, value);
        }
    }
    async get(key) {
        if (!this.client)
            throw new Error('Redis client not initialized');
        return this.client.get(key);
    }
    async del(key) {
        if (!this.client)
            throw new Error('Redis client not initialized');
        await this.client.del(key);
    }
    async getKeys(pattern) {
        if (!this.client)
            throw new Error('Redis client not initialized');
        return this.client.keys(pattern);
    }
};
exports.RedisService = RedisService;
exports.RedisService = RedisService = RedisService_1 = __decorate([
    (0, common_1.Injectable)()
], RedisService);
//# sourceMappingURL=redis.service.js.map