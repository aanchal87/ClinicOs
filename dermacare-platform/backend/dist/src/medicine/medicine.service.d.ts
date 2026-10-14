import { PrismaService } from '../prisma.service';
export declare class MedicineService {
    private prisma;
    constructor(prisma: PrismaService);
    searchMedicines(query: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        deletedAt: Date | null;
        name: string;
        category: string | null;
    }[]>;
    createMedicine(name: string, category?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        deletedAt: Date | null;
        name: string;
        category: string | null;
    }>;
}
