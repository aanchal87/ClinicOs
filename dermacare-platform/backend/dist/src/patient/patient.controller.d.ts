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
        chiefComplaint: string;
        historyOfPresent: string | null;
        examinationFindings: string | null;
        diagnosis: string;
        treatmentPlan: string;
        skinType: string | null;
        lesionType: string | null;
        bodyArea: string | null;
        appointmentId: string | null;
        visitId: string | null;
        doctorId: string;
        patientId: string;
    }>;
    addPhoto(id: string, dto: any, req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        deletedAt: Date | null;
        clinicId: string;
        bodyArea: string | null;
        patientId: string;
        photoUrl: string;
        thumbnailUrl: string | null;
        photoType: string;
        notes: string | null;
        takenAt: Date;
        medicalRecordId: string | null;
    }>;
    uploadPhotoFile(id: string, file: any, dto: any, req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        deletedAt: Date | null;
        clinicId: string;
        bodyArea: string | null;
        patientId: string;
        photoUrl: string;
        thumbnailUrl: string | null;
        photoType: string;
        notes: string | null;
        takenAt: Date;
        medicalRecordId: string | null;
    }>;
}
