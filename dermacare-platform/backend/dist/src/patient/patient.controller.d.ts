import { PatientService } from './patient.service';
export declare class PatientController {
    private patientService;
    constructor(patientService: PatientService);
    getAll(req: any): Promise<any>;
    create(dto: any, req: any): Promise<any>;
    checkAadhaar(aadhaar: string): Promise<{
        exists: boolean;
        patient?: undefined;
    } | {
        exists: boolean;
        patient: {
            id: string;
            patientCustomId: string | null;
            aadhaarMasked: string | null;
            fullName: string;
            phone: string;
            clinicId: string | null;
        };
    }>;
    search(query: string, req: any): Promise<any>;
    getById(id: string, req: any): Promise<any>;
    update(id: string, dto: any, req: any): Promise<any>;
    addRecord(id: string, dto: any, req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        deletedAt: Date | null;
        clinicId: string;
        doctorId: string;
        patientId: string;
        appointmentId: string | null;
        visitId: string | null;
        chiefComplaint: string;
        historyOfPresent: string | null;
        examinationFindings: string | null;
        diagnosis: string;
        treatmentPlan: string;
        skinType: string | null;
        lesionType: string | null;
        bodyArea: string | null;
    }>;
    addPhoto(id: string, dto: any, req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        deletedAt: Date | null;
        clinicId: string;
        takenAt: Date;
        patientId: string;
        notes: string | null;
        bodyArea: string | null;
        medicalRecordId: string | null;
        photoUrl: string;
        thumbnailUrl: string | null;
        photoType: string;
    }>;
    uploadPhotoFile(id: string, file: any, dto: any, req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        deletedAt: Date | null;
        clinicId: string;
        takenAt: Date;
        patientId: string;
        notes: string | null;
        bodyArea: string | null;
        medicalRecordId: string | null;
        photoUrl: string;
        thumbnailUrl: string | null;
        photoType: string;
    }>;
}
