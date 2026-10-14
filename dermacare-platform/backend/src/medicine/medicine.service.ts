import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class MedicineService {
  constructor(private prisma: PrismaService) {}

  async searchMedicines(query: string) {
    if (!query) {
      return this.prisma.medicine.findMany({
        where: { deletedAt: null },
        take: 10,
      });
    }

    return this.prisma.medicine.findMany({
      where: {
        name: {
          contains: query,
        },
        deletedAt: null,
      },
      take: 20,
    });
  }

  async createMedicine(name: string, category?: string) {
    return this.prisma.medicine.create({
      data: {
        name,
        category,
      },
    });
  }
}
