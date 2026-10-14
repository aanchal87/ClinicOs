import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getSettings(clinicId: string) {
    if (!clinicId) {
      // Return empty if no clinic context
      return {};
    }
    const records = await this.prisma.clinicSettings.findMany({
      where: { clinicId },
    });
    return records.reduce((acc, rec) => {
      acc[rec.key] = rec.value;
      return acc;
    }, {} as Record<string, string>);
  }

  async updateSetting(clinicId: string, key: string, value: string) {
    if (!clinicId) {
      throw new Error('Clinic ID is required to update settings.');
    }
    return this.prisma.clinicSettings.upsert({
      where: {
        clinicId_key: {
          clinicId,
          key,
        },
      },
      update: { value },
      create: { clinicId, key, value },
    });
  }
}
