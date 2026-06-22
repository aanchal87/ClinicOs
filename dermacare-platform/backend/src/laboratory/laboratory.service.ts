import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { StorageProviderToken } from '../common/storage/storage.provider.factory';
import { AuditLogService } from '../common/audit-log/audit-log.service';

@Injectable()
export class LaboratoryService {
  constructor(
    private prisma: PrismaService,
    @Inject(StorageProviderToken) private storageProvider: any,
    private auditLogService: AuditLogService
  ) {}

  async getReports(patientId?: string, clinicId?: string) {
    const where: any = {};
    if (clinicId) {
      where.clinicId = clinicId;
    }
    if (patientId) {
      where.OR = [
        { patientId },
        { medicalRecord: { patientId } }
      ];
    }

    const reports = await this.prisma.labReport.findMany({
      where,
      orderBy: { testDate: 'desc' },
      include: {
        patient: true
      }
    });

    return reports.map(r => ({
      ...r,
      patientName: r.patient?.fullName || 'Patient'
    }));
  }

  async createReport(dto: any, clinicId?: string, userPayload?: any) {
    const { medicalRecordId, patientId, testName, testDate, status, results } = dto;
    const finalClinicId = clinicId || dto.clinicId || null;

    const report = await this.prisma.labReport.create({
      data: {
        medicalRecordId: medicalRecordId || null,
        patientId: patientId || null,
        testName,
        testDate: testDate || new Date().toISOString().split('T')[0],
        status: status || 'Ordered',
        results: typeof results === 'string' ? results : JSON.stringify(results || []),
        clinicId: finalClinicId,
      },
    });

    await this.auditLogService.log({
      userId: userPayload?.sub,
      role: userPayload?.role,
      action: 'LAB_UPLOAD',
      details: `Created lab report for test "${testName}"`,
      metadata: { reportId: report.id, patientId, clinicId: finalClinicId },
    });

    return report;
  }

  async uploadReport(
    file: any,
    dto: {
      patientId?: string;
      medicalRecordId?: string;
      testName: string;
      testDate?: string;
      status?: string;
      results?: string;
      clinicId?: string;
    },
    clinicId?: string,
    userPayload?: any
  ) {
    let filePath: string | null = null;
    if (file) {
      const fileName = `${Date.now()}-${file.originalname}`;
      filePath = await this.storageProvider.uploadFile(
        file.buffer,
        'lab-reports',
        fileName,
      );
    }

    const { patientId, medicalRecordId, testName, testDate, status, results } = dto;
    const finalClinicId = clinicId || dto.clinicId || null;

    const report = await this.prisma.labReport.create({
      data: {
        patientId: patientId || null,
        medicalRecordId: medicalRecordId || null,
        testName,
        testDate: testDate || new Date().toISOString().split('T')[0],
        status: status || 'Uploaded',
        results: results || '[]',
        filePath,
        clinicId: finalClinicId,
      },
    });

    await this.auditLogService.log({
      userId: userPayload?.sub,
      role: userPayload?.role,
      action: 'LAB_UPLOAD',
      details: `Uploaded lab report file for test "${testName}"`,
      metadata: { reportId: report.id, patientId, clinicId: finalClinicId },
    });

    return report;
  }

  async deleteReport(id: string, clinicId?: string, userPayload?: any) {
    const report = await this.prisma.labReport.findUnique({
      where: { id },
    });
    if (!report || (clinicId && report.clinicId !== clinicId)) {
      throw new NotFoundException('Lab report not found');
    }
    if (report.filePath) {
      await this.storageProvider.deleteFile(report.filePath);
    }

    const deleted = await this.prisma.labReport.delete({
      where: { id },
    });

    await this.auditLogService.log({
      userId: userPayload?.sub,
      role: userPayload?.role,
      action: 'DOCUMENT_DELETE',
      details: `Deleted lab report file for ID "${id}"`,
      metadata: { reportId: id, clinicId: report.clinicId },
    });

    return deleted;
  }

  async updateStatus(id: string, status: string, clinicId?: string) {
    const report = await this.prisma.labReport.findUnique({
      where: { id },
    });
    if (!report || (clinicId && report.clinicId !== clinicId)) {
      throw new NotFoundException('Lab report not found');
    }

    return this.prisma.labReport.update({
      where: { id },
      data: { status },
    });
  }

  async reviewReport(id: string, dto: { reviewedBy: string; reviewNotes: string }, clinicId?: string, userPayload?: any) {
    const report = await this.prisma.labReport.findUnique({
      where: { id },
    });
    if (!report || (clinicId && report.clinicId !== clinicId)) {
      throw new NotFoundException('Lab report not found');
    }

    const updated = await this.prisma.labReport.update({
      where: { id },
      data: {
        status: 'Reviewed',
        reviewedBy: dto.reviewedBy,
        reviewNotes: dto.reviewNotes,
        reviewedAt: new Date(),
      },
    });

    await this.auditLogService.log({
      userId: userPayload?.sub,
      role: userPayload?.role,
      action: 'LAB_REVIEW',
      details: `Reviewed lab report ID "${id}" (test: "${report.testName}")`,
      metadata: { reportId: id, clinicId: report.clinicId },
    });

    return updated;
  }
}
