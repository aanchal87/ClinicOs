"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LaboratoryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const storage_provider_factory_1 = require("../common/storage/storage.provider.factory");
const audit_log_service_1 = require("../common/audit-log/audit-log.service");
let LaboratoryService = class LaboratoryService {
    prisma;
    storageProvider;
    auditLogService;
    constructor(prisma, storageProvider, auditLogService) {
        this.prisma = prisma;
        this.storageProvider = storageProvider;
        this.auditLogService = auditLogService;
    }
    async getReports(patientId, clinicId) {
        const where = {};
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
    async createReport(dto, clinicId, userPayload) {
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
    async uploadReport(file, dto, clinicId, userPayload) {
        let filePath = null;
        if (file) {
            const fileName = `${Date.now()}-${file.originalname}`;
            filePath = await this.storageProvider.uploadFile(file.buffer, 'lab-reports', fileName);
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
    async deleteReport(id, clinicId, userPayload) {
        const report = await this.prisma.labReport.findUnique({
            where: { id },
        });
        if (!report || (clinicId && report.clinicId !== clinicId)) {
            throw new common_1.NotFoundException('Lab report not found');
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
    async updateStatus(id, status, clinicId) {
        const report = await this.prisma.labReport.findUnique({
            where: { id },
        });
        if (!report || (clinicId && report.clinicId !== clinicId)) {
            throw new common_1.NotFoundException('Lab report not found');
        }
        return this.prisma.labReport.update({
            where: { id },
            data: { status },
        });
    }
    async reviewReport(id, dto, clinicId, userPayload) {
        const report = await this.prisma.labReport.findUnique({
            where: { id },
        });
        if (!report || (clinicId && report.clinicId !== clinicId)) {
            throw new common_1.NotFoundException('Lab report not found');
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
};
exports.LaboratoryService = LaboratoryService;
exports.LaboratoryService = LaboratoryService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(storage_provider_factory_1.StorageProviderToken)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, Object, audit_log_service_1.AuditLogService])
], LaboratoryService);
//# sourceMappingURL=laboratory.service.js.map