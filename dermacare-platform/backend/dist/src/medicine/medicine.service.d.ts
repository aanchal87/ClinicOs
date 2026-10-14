import { PrismaService } from '../prisma.service';
export declare class MedicineService {
    private prisma;
    constructor(prisma: PrismaService);
    searchMedicines(query: string): Promise<{
        id: string;
<<<<<<< HEAD
=======
        name: string;
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        deletedAt: Date | null;
<<<<<<< HEAD
        name: string;
=======
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
        category: string | null;
    }[]>;
    createMedicine(name: string, category?: string): Promise<{
        id: string;
<<<<<<< HEAD
=======
        name: string;
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        deletedAt: Date | null;
<<<<<<< HEAD
        name: string;
=======
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
        category: string | null;
    }>;
}
