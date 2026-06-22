import { Controller, Get, Res, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { createClient } from 'redis';
import * as fs from 'fs';
import * as path from 'path';
import { Public } from '../auth/public.decorator';

@Public()
@Controller('health')
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async getHealth(@Res() res: any) {
    const dbStatus = await this.checkDb();
    const redisStatus = await this.checkRedis();
    const storageStatus = await this.checkStorage();

    const isHealthy = dbStatus === 'healthy' && redisStatus === 'healthy' && storageStatus === 'healthy';

    const payload = {
      status: isHealthy ? 'healthy' : 'unhealthy',
      api: 'healthy',
      database: dbStatus,
      redis: redisStatus,
      storage: storageStatus,
    };

    return res.status(isHealthy ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE).json(payload);
  }

  @Get('database')
  async getDatabaseHealth(@Res() res: any) {
    const dbStatus = await this.checkDb();
    const isHealthy = dbStatus === 'healthy';
    return res.status(isHealthy ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE).json({ database: dbStatus });
  }

  @Get('redis')
  async getRedisHealth(@Res() res: any) {
    const redisStatus = await this.checkRedis();
    const isHealthy = redisStatus === 'healthy';
    return res.status(isHealthy ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE).json({ redis: redisStatus });
  }

  private async checkDb(): Promise<string> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return 'healthy';
    } catch (e) {
      return 'unhealthy';
    }
  }

  private async checkRedis(): Promise<string> {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) return 'unhealthy';
    try {
      const client = createClient({
        url: redisUrl,
        socket: { connectTimeout: 1000 }
      });
      await client.connect();
      await client.ping();
      await client.disconnect();
      return 'healthy';
    } catch (e) {
      return 'unhealthy';
    }
  }

  private async checkStorage(): Promise<string> {
    const storagePath = process.env.STORAGE_PATH || 'uploads';
    try {
      const resolvedPath = path.resolve(process.cwd(), storagePath);
      if (!fs.existsSync(resolvedPath)) {
        fs.mkdirSync(resolvedPath, { recursive: true });
      }
      const testFile = path.join(resolvedPath, '.healthcheck');
      fs.writeFileSync(testFile, 'test');
      fs.unlinkSync(testFile);
      return 'healthy';
    } catch (e) {
      return 'unhealthy';
    }
  }
}
