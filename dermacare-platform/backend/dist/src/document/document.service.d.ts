import { PrismaService } from '../prisma.service';
import { AuditLogService } from '../common/audit-log/audit-log.service';
export declare class DocumentService {
    private prisma;
    private storageProvider;
    private auditLogService;
    constructor(prisma: PrismaService, storageProvider: any, auditLogService: AuditLogService);
    getDocuments(patientId: string, clinicId?: string): Promise<{
        id: string;
        createdAt: string;
        createdBy: string | null;
        deletedAt: Date | null;
        clinicId: string | null;
        patientId: string;
        filePath: string | null;
        documentName: string;
        documentType: string;
        fileSize: string;
        uploadedBy: string;
        uploadedAt: Date;
        createdAtDb: Date;
        updatedAtDb: Date;
    }[]>;
    uploadDocument(patientId: string, file: any, dto: any, clinicId?: string, userPayload?: any): Promise<{
        id: string;
        createdAt: string;
        createdBy: string | null;
        deletedAt: Date | null;
        clinicId: string | null;
        patientId: string;
        filePath: string | null;
        documentName: string;
        documentType: string;
        fileSize: string;
        uploadedBy: string;
        uploadedAt: Date;
        createdAtDb: Date;
        updatedAtDb: Date;
    }>;
    deleteDocument(id: string, clinicId?: string, userPayload?: any): Promise<{
        id: string;
        createdAt: string;
        createdBy: string | null;
        deletedAt: Date | null;
        clinicId: string | null;
        patientId: string;
        filePath: string | null;
        documentName: string;
        documentType: string;
        fileSize: string;
        uploadedBy: string;
        uploadedAt: Date;
        createdAtDb: Date;
        updatedAtDb: Date;
    }>;
    downloadDocument(id: string, clinicId?: string, userPayload?: any): Promise<{
        absolutePath: string;
        documentName: string;
    }>;
}
