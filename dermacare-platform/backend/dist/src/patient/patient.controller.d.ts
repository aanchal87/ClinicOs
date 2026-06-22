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
            phone: string;
            fullName: string;
            clinicId: string | null;
            patientCustomId: string | null;
            aadhaarMasked: string | null;
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
        doctorId: string;
        clinicId: string;
        patientId: string;
        appointmentId: string | null;
        chiefComplaint: string;
        historyOfPresent: string | null;
        examinationFindings: string | null;
        diagnosis: string;
        treatmentPlan: string;
        skinType: string | null;
        lesionType: string | null;
        bodyArea: string | null;
        visitId: string | null;
    }>;
    addPhoto(id: string, dto: any, req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        deletedAt: Date | null;
        clinicId: string;
        notes: string | null;
        patientId: string;
        bodyArea: string | null;
        medicalRecordId: string | null;
        takenAt: Date;
        photoUrl: string;
        thumbnailUrl: string | null;
        photoType: string;
    }>;
}
