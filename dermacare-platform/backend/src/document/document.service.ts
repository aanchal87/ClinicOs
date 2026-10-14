import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { StorageProviderToken } from '../common/storage/storage.provider.factory';
import { AuditLogService } from '../common/audit-log/audit-log.service';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class DocumentService {
  constructor(
    private prisma: PrismaService,
    @Inject(StorageProviderToken) private storageProvider: any,
    private auditLogService: AuditLogService
  ) {}

  async getDocuments(patientId: string, clinicId?: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId }
    });
    if (!patient || (clinicId && patient.clinicId !== clinicId)) {
      throw new NotFoundException('Patient not found');
    }

    return this.prisma.document.findMany({
      where: { patientId },
      orderBy: { createdAtDb: 'desc' },
    });
  }

  async uploadDocument(patientId: string, file: any, dto: any, clinicId?: string, userPayload?: any) {
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId }
    });
    if (!patient || (clinicId && patient.clinicId !== clinicId)) {
      throw new NotFoundException('Patient not found');
    }

    const { documentType, uploadedBy } = dto;
    
    if (!file) {
      throw new Error('No file provided for upload');
    }

    const fileName = `${Date.now()}-${file.originalname}`;
    const filePath = await this.storageProvider.uploadFile(
      file.buffer,
      'documents',
      fileName,
    );

    const sizeMB = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
    const finalClinicId = clinicId || patient.clinicId || null;

    const document = await this.prisma.document.create({
      data: {
        patientId,
        documentName: file.originalname,
        documentType: documentType || 'Miscellaneous',
        fileSize: sizeMB,
        uploadedBy: uploadedBy || userPayload?.role || 'Staff',
        filePath,
        createdAt: new Date().toLocaleDateString(),
        clinicId: finalClinicId,
      },
    });

    // Audit Log
    await this.auditLogService.log({
      userId: userPayload?.sub,
      role: userPayload?.role,
      action: 'DOCUMENT_UPLOAD',
      details: `Uploaded document "${document.documentName}" (Type: ${document.documentType}) for patient ID ${patientId}`,
      metadata: { documentId: document.id, patientId, clinicId: finalClinicId },
    });

    return document;
  }

  async deleteDocument(id: string, clinicId?: string, userPayload?: any) {
    const doc = await this.prisma.document.findUnique({ where: { id } });
    if (!doc || (clinicId && doc.clinicId !== clinicId)) {
      throw new NotFoundException('Document not found');
    }

    if (doc.filePath) {
      await this.storageProvider.deleteFile(doc.filePath);
    }

    const deletedDoc = await this.prisma.document.delete({ where: { id } });

    // Audit Log
    await this.auditLogService.log({
      userId: userPayload?.sub,
      role: userPayload?.role,
      action: 'DOCUMENT_DELETE',
      details: `Deleted document "${doc.documentName}" (Type: ${doc.documentType}) for patient ID ${doc.patientId}`,
      metadata: { documentId: id, patientId: doc.patientId, clinicId: doc.clinicId },
    });

    return deletedDoc;
  }

  async downloadDocument(id: string, clinicId?: string, userPayload?: any) {
    const doc = await this.prisma.document.findUnique({ where: { id } });
    if (!doc || (clinicId && doc.clinicId !== clinicId)) {
      throw new NotFoundException('Document not found');
    }

    if (!doc.filePath) {
      throw new NotFoundException('Document file path is not set');
    }

    const absolutePath = path.resolve(process.cwd(), doc.filePath);
    if (!fs.existsSync(absolutePath)) {
      throw new NotFoundException('Document file not found on disk');
    }

    // Audit Log
    await this.auditLogService.log({
      userId: userPayload?.sub,
      role: userPayload?.role,
      action: 'DOCUMENT_DOWNLOAD',
      details: `Downloaded document "${doc.documentName}" (Type: ${doc.documentType}) for patient ID ${doc.patientId}`,
      metadata: { documentId: id, patientId: doc.patientId, clinicId: doc.clinicId },
    });

    return { absolutePath, documentName: doc.documentName };
  }
}
