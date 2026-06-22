import { PrismaService } from '../prisma.service';
import { CryptoService } from '../auth/crypto.service';
import { AuditLogService } from '../common/audit-log/audit-log.service';
import { NotificationService } from '../notification/notification.service';
export declare class PatientService {
    private prisma;
    private cryptoService;
    private auditLogService;
    private notificationService;
    private readonly logger;
    constructor(prisma: PrismaService, cryptoService: CryptoService, auditLogService: AuditLogService, notificationService: NotificationService);
    private mapPatient;
    searchPatients(query: string, clinicId?: string): Promise<any>;
    checkAadhaarExists(aadhaar: string): Promise<{
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
    getPatientHistory(patientId: string, clinicId?: string): Promise<any>;
    createPatient(dto: any, clinicId?: string, userPayload?: any): Promise<any>;
    getPatientById(id: string, clinicId?: string): Promise<any>;
    updatePatient(id: string, dto: any, clinicId?: string, userPayload?: any): Promise<any>;
    createMedicalRecord(patientId: string, dto: any, clinicId?: string, userPayload?: any): Promise<{
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
    uploadClinicalPhoto(patientId: string, dto: any, clinicId?: string, userPayload?: any): Promise<{
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
    closeVisit(visitId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        deletedAt: Date | null;
        clinicId: string | null;
        reason: string | null;
        notes: string | null;
        status: string;
        closedAt: Date | null;
        patientId: string;
        appointmentId: string | null;
        tokenId: string | null;
    }>;
}
