import { LaboratoryService } from './laboratory.service';
export declare class LaboratoryController {
    private laboratoryService;
    constructor(laboratoryService: LaboratoryService);
    getReports(req: any): Promise<{
        patientName: string;
        patient: {
            id: string;
<<<<<<< HEAD
            patientCustomId: string | null;
            aadhaarEncrypted: string | null;
            aadhaarMasked: string | null;
            aadhaarHash: string | null;
            fullName: string;
            email: string | null;
            phone: string;
            dateOfBirth: string | null;
            gender: string | null;
            bloodGroup: string | null;
            address: string | null;
            allergies: string;
            medicalConditions: string;
            emergencyContact: string | null;
            treatmentStatus: string;
=======
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            deletedAt: Date | null;
<<<<<<< HEAD
            clinicId: string | null;
=======
            email: string | null;
            phone: string;
            fullName: string;
            address: string | null;
            clinicId: string | null;
            patientCustomId: string | null;
            aadhaarEncrypted: string | null;
            aadhaarMasked: string | null;
            aadhaarHash: string | null;
            dateOfBirth: string | null;
            gender: string | null;
            bloodGroup: string | null;
            allergies: string;
            medicalConditions: string;
            emergencyContact: string | null;
            treatmentStatus: string;
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
        } | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        deletedAt: Date | null;
        clinicId: string | null;
<<<<<<< HEAD
        patientId: string | null;
        status: string;
=======
        status: string;
        patientId: string | null;
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
        medicalRecordId: string | null;
        testName: string;
        testDate: string;
        results: string;
        filePath: string | null;
        reviewNotes: string | null;
        reviewedBy: string | null;
        reviewedAt: Date | null;
    }[]>;
    getPatientReports(patientId: string, req: any): Promise<{
        patientName: string;
        patient: {
            id: string;
<<<<<<< HEAD
            patientCustomId: string | null;
            aadhaarEncrypted: string | null;
            aadhaarMasked: string | null;
            aadhaarHash: string | null;
            fullName: string;
            email: string | null;
            phone: string;
            dateOfBirth: string | null;
            gender: string | null;
            bloodGroup: string | null;
            address: string | null;
            allergies: string;
            medicalConditions: string;
            emergencyContact: string | null;
            treatmentStatus: string;
=======
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            deletedAt: Date | null;
<<<<<<< HEAD
            clinicId: string | null;
=======
            email: string | null;
            phone: string;
            fullName: string;
            address: string | null;
            clinicId: string | null;
            patientCustomId: string | null;
            aadhaarEncrypted: string | null;
            aadhaarMasked: string | null;
            aadhaarHash: string | null;
            dateOfBirth: string | null;
            gender: string | null;
            bloodGroup: string | null;
            allergies: string;
            medicalConditions: string;
            emergencyContact: string | null;
            treatmentStatus: string;
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
        } | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        deletedAt: Date | null;
        clinicId: string | null;
<<<<<<< HEAD
        patientId: string | null;
        status: string;
=======
        status: string;
        patientId: string | null;
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
        medicalRecordId: string | null;
        testName: string;
        testDate: string;
        results: string;
        filePath: string | null;
        reviewNotes: string | null;
        reviewedBy: string | null;
        reviewedAt: Date | null;
    }[]>;
    createReport(dto: any, req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        deletedAt: Date | null;
        clinicId: string | null;
<<<<<<< HEAD
        patientId: string | null;
        status: string;
=======
        status: string;
        patientId: string | null;
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
        medicalRecordId: string | null;
        testName: string;
        testDate: string;
        results: string;
        filePath: string | null;
        reviewNotes: string | null;
        reviewedBy: string | null;
        reviewedAt: Date | null;
    }>;
    uploadReport(file: any, dto: any, req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        deletedAt: Date | null;
        clinicId: string | null;
<<<<<<< HEAD
        patientId: string | null;
        status: string;
=======
        status: string;
        patientId: string | null;
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
        medicalRecordId: string | null;
        testName: string;
        testDate: string;
        results: string;
        filePath: string | null;
        reviewNotes: string | null;
        reviewedBy: string | null;
        reviewedAt: Date | null;
    }>;
    deleteReport(id: string, req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        deletedAt: Date | null;
        clinicId: string | null;
<<<<<<< HEAD
        patientId: string | null;
        status: string;
=======
        status: string;
        patientId: string | null;
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
        medicalRecordId: string | null;
        testName: string;
        testDate: string;
        results: string;
        filePath: string | null;
        reviewNotes: string | null;
        reviewedBy: string | null;
        reviewedAt: Date | null;
    }>;
    updateStatus(id: string, status: string, req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        deletedAt: Date | null;
        clinicId: string | null;
<<<<<<< HEAD
        patientId: string | null;
        status: string;
=======
        status: string;
        patientId: string | null;
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
        medicalRecordId: string | null;
        testName: string;
        testDate: string;
        results: string;
        filePath: string | null;
        reviewNotes: string | null;
        reviewedBy: string | null;
        reviewedAt: Date | null;
    }>;
    reviewReport(id: string, dto: {
        reviewedBy: string;
        reviewNotes: string;
    }, req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        deletedAt: Date | null;
        clinicId: string | null;
<<<<<<< HEAD
        patientId: string | null;
        status: string;
=======
        status: string;
        patientId: string | null;
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
        medicalRecordId: string | null;
        testName: string;
        testDate: string;
        results: string;
        filePath: string | null;
        reviewNotes: string | null;
        reviewedBy: string | null;
        reviewedAt: Date | null;
    }>;
}
