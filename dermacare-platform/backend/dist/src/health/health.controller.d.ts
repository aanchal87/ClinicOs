import { PrismaService } from '../prisma.service';
export declare class HealthController {
    private prisma;
    constructor(prisma: PrismaService);
    getHealth(res: any): Promise<any>;
    getDatabaseHealth(res: any): Promise<any>;
    getRedisHealth(res: any): Promise<any>;
    private checkDb;
    private checkRedis;
    private checkStorage;
}
