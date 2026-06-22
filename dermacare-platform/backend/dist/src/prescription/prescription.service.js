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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrescriptionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const audit_log_service_1 = require("../common/audit-log/audit-log.service");
const notification_service_1 = require("../notification/notification.service");
const pdf_generator_util_1 = require("../notification/pdf-generator.util");
let PrescriptionService = class PrescriptionService {
    prisma;
    auditLogService;
    notificationService;
    constructor(prisma, auditLogService, notificationService) {
        this.prisma = prisma;
        this.auditLogService = auditLogService;
        this.notificationService = notificationService;
    }
    async createPrescription(dto, clinicId, userPayload) {
        const { medicalRecordId, doctorId, patientId, advice, items, } = dto;
        const patient = await this.prisma.patient.findUnique({
            where: { id: patientId }
        });
        if (!patient || (clinicId && patient.clinicId !== clinicId)) {
            throw new common_1.NotFoundException('Patient not found');
        }
        const finalClinicId = clinicId || dto.clinicId || patient.clinicId || 'default-clinic-id';
        const result = await this.prisma.$transaction(async (tx) => {
            let resolvedDoctorId = doctorId;
            if (!resolvedDoctorId || resolvedDoctorId === 'mock-doc-1') {
                const firstDoc = await tx.doctor.findFirst();
                if (firstDoc)
                    resolvedDoctorId = firstDoc.id;
            }
            const prescription = await tx.prescription.create({
                data: {
                    medicalRecordId: medicalRecordId || null,
                    clinicId: finalClinicId,
                    doctorId: resolvedDoctorId || 'mock-doc-1',
                    patientId,
                    advice: advice || '',
                },
            });
            if (items && items.length > 0) {
                for (const item of items) {
                    await tx.prescriptionItem.create({
                        data: {
                            prescriptionId: prescription.id,
                            drugName: item.drugName,
                            drugCategory: item.drugCategory || 'Oral',
                            strength: item.strength || '',
                            dosageForm: item.dosageForm || 'Tablet',
                            dose: item.dose || '1 tablet',
                            frequency: item.frequency || 'Once daily',
                            duration: item.duration || '7 days',
                            instructions: item.instructions || '',
                        },
                    });
                }
            }
            return tx.prescription.findUnique({
                where: { id: prescription.id },
                include: {
                    items: true,
                    patient: true,
                    doctor: true,
                    clinic: true,
                },
            });
        });
        if (result) {
            await this.auditLogService.log({
                userId: userPayload?.sub,
                role: userPayload?.role,
                action: 'PRESCRIPTION_GENERATED',
                details: `Generated prescription ID "${result.id}" for patient ID "${patientId}" containing ${items?.length || 0} items`,
                metadata: { prescriptionId: result.id, patientId, clinicId: result.clinicId },
            });
            try {
                const pdfPath = (0, pdf_generator_util_1.generatePrescriptionPdf)(result);
                const doctorName = result.doctor?.fullName || 'Doctor';
                const visitDate = new Date(result.createdAt).toLocaleDateString();
                const messageText = `Consultation Completed\n\nDoctor Name: ${doctorName}\nVisit Date: ${visitDate}\nYour digital prescription has been generated. Please find the attached PDF.`;
                await this.notificationService.sendWhatsApp(result.patientId, result.patient.phone, 'CONSULTATION_COMPLETED', messageText, pdfPath, result.clinicId);
            }
            catch (err) {
                this.prisma.$connect().then(() => { });
            }
        }
        return result;
    }
    async getPatientPrescriptions(patientId, clinicId) {
        const patient = await this.prisma.patient.findUnique({
            where: { id: patientId }
        });
        if (!patient || (clinicId && patient.clinicId !== clinicId)) {
            throw new common_1.NotFoundException('Patient not found');
        }
        return this.prisma.prescription.findMany({
            where: { patientId },
            include: {
                items: true,
                doctor: true,
                clinic: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getPrescriptionDetails(prescriptionId, clinicId) {
        const rx = await this.prisma.prescription.findUnique({
            where: { id: prescriptionId },
            include: {
                items: true,
                patient: true,
                doctor: true,
                clinic: true,
                medicalRecord: true,
            },
        });
        if (!rx || (clinicId && rx.clinicId !== clinicId)) {
            throw new common_1.NotFoundException('Prescription not found');
        }
        return rx;
    }
};
exports.PrescriptionService = PrescriptionService;
exports.PrescriptionService = PrescriptionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_log_service_1.AuditLogService,
        notification_service_1.NotificationService])
], PrescriptionService);
//# sourceMappingURL=prescription.service.js.map