import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
    try {
      await this.$queryRaw`SELECT 1`;
      // Warm up model specific metadata & query AST compilations
      await Promise.allSettled([
        this.appointment.findFirst(),
        this.patient.findFirst(),
        this.followUp.findFirst(),
        this.labReport.findFirst(),
        this.medicalRecord.findFirst(),
        this.doctor.findFirst(),
        this.queueToken.findFirst(),
        this.auditLog.findFirst()
      ]);
      console.log('Prisma query engine warmed up successfully.');
    } catch (e) {
      console.warn('Prisma engine warm up failed:', e.message);
    }
  }
}
