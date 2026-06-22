import { PrismaService } from '../prisma.service';
export declare class MedicineService {
    private prisma;
    constructor(prisma: PrismaService);
    searchMedicines(query: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        deletedAt: Date | null;
        category: string | null;
    }[]>;
    createMedicine(name: string, category?: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        deletedAt: Date | null;
        category: string | null;
    }>;
}
