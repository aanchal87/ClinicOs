import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: RedisClientType;
  private readonly logger = new Logger(RedisService.name);

  async onModuleInit() {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
      this.logger.error('REDIS_URL environment variable is missing');
      return;
    }
    this.client = createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 1) {
            return false;
          }
          return 500;
        }
      }
    }) as RedisClientType;
    this.client.on('error', (err) => this.logger.error('Redis Client Error', err.message));
    try {
      await this.client.connect();
      this.logger.log('Redis client successfully connected for session management.');
    } catch (e) {
      this.logger.error('Failed to connect to Redis', e);
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.disconnect();
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (!this.client) throw new Error('Redis client not initialized');
    if (ttlSeconds) {
      await this.client.set(key, value, { EX: ttlSeconds });
    } else {
      await this.client.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    if (!this.client) throw new Error('Redis client not initialized');
    return this.client.get(key);
  }

  async del(key: string): Promise<void> {
    if (!this.client) throw new Error('Redis client not initialized');
    await this.client.del(key);
  }

  async getKeys(pattern: string): Promise<string[]> {
    if (!this.client) throw new Error('Redis client not initialized');
    return this.client.keys(pattern);
  }
}
