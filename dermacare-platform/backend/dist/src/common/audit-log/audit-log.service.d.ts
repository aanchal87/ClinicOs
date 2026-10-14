import { PrismaService } from '../../prisma.service';
export declare class AuditLogService {
    private prisma;
    constructor(prisma: PrismaService);
    log(params: {
        userId?: string;
        role?: string;
        action: string;
        ipAddress?: string;
        details?: string;
        metadata?: Record<string, any>;
    }): Promise<{
        id: string;
        role: string | null;
        userId: string | null;
        action: string;
        ipAddress: string | null;
        details: string | null;
        metadata: string | null;
        timestamp: Date;
    } | undefined>;
}
