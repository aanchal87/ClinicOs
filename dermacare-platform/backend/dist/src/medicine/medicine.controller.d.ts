import { MedicineService } from './medicine.service';
export declare class MedicineController {
    private medicineService;
    constructor(medicineService: MedicineService);
    search(query: string): Promise<{
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
    create(body: {
        name: string;
        category?: string;
    }): Promise<{
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
