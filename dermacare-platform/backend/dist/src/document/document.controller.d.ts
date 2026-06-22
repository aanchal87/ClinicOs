import { DocumentService } from './document.service';
import * as express from 'express';
export declare class DocumentController {
    private documentService;
    constructor(documentService: DocumentService);
    getDocuments(patientId: string, req: any): Promise<{
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
    uploadDocument(patientId: string, file: any, dto: any, req: any): Promise<{
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
    deleteDocument(id: string, req: any): Promise<{
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
    downloadDocument(id: string, res: express.Response, req: any): Promise<void>;
}
