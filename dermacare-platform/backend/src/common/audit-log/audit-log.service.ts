import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class AuditLogService {
  constructor(private prisma: PrismaService) {}

  async log(params: {
    userId?: string;
    role?: string;
    action: string;
    ipAddress?: string;
    details?: string;
    metadata?: Record<string, any>;
  }) {
    try {
      return await this.prisma.auditLog.create({
        data: {
          userId: params.userId || null,
          role: params.role || null,
          action: params.action,
          ipAddress: params.ipAddress || null,
          details: params.details || null,
          metadata: params.metadata ? JSON.stringify(params.metadata) : null,
        },
      });
    } catch (error) {
      console.error('Failed to write audit log:', error);
    }
  }
}
