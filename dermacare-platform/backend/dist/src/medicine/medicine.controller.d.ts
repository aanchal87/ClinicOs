import { MedicineService } from './medicine.service';
export declare class MedicineController {
    private medicineService;
    constructor(medicineService: MedicineService);
    search(query: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        deletedAt: Date | null;
        name: string;
        category: string | null;
    }[]>;
    create(body: {
        name: string;
        category?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        deletedAt: Date | null;
        name: string;
        category: string | null;
    }>;
}
