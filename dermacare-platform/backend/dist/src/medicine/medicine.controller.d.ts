import { MedicineService } from './medicine.service';
export declare class MedicineController {
    private medicineService;
    constructor(medicineService: MedicineService);
    search(query: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        deletedAt: Date | null;
        category: string | null;
    }[]>;
    create(body: {
        name: string;
        category?: string;
    }): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        deletedAt: Date | null;
        category: string | null;
    }>;
}
