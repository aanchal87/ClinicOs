"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var NotificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const whatsapp_provider_1 = require("./whatsapp.provider");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let NotificationService = NotificationService_1 = class NotificationService {
    prisma;
    whatsappProvider;
    logger = new common_1.Logger(NotificationService_1.name);
    schedulerInterval = null;
    lastRunDate = null;
    constructor(prisma, whatsappProvider) {
        this.prisma = prisma;
        this.whatsappProvider = whatsappProvider;
    }
    onModuleInit() {
        this.logger.log('NotificationService initialized. Starting 9 AM local cron scheduler loop...');
        this.schedulerInterval = setInterval(() => {
            this.checkAndRunFollowUpCron();
        }, 60 * 1000);
    }
    onModuleDestroy() {
        if (this.schedulerInterval) {
            clearInterval(this.schedulerInterval);
        }
    }
    async checkAndRunFollowUpCron() {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const todayStr = now.toISOString().split('T')[0];
        if (hours === 9 && minutes >= 0 && minutes <= 5 && this.lastRunDate !== todayStr) {
            this.logger.log(`[Cron Trigger] Daily 9 AM scheduler triggered for date ${todayStr}`);
            this.lastRunDate = todayStr;
            try {
                await this.triggerDailyFollowUps(todayStr);
            }
            catch (err) {
                this.logger.error(`[Cron Trigger] Error running daily follow ups: ${err.message}`);
            }
        }
    }
    async triggerDailyFollowUps(dateStr) {
        this.logger.log(`[Follow-Up Cron] Processing follow-ups scheduled for: ${dateStr}`);
        const followups = await this.prisma.followUp.findMany({
            where: {
                dueDate: dateStr,
                status: 'SCHEDULED',
            },
            include: {
                patient: true,
                doctor: true,
                clinic: true,
            },
        });
        this.logger.log(`[Follow-Up Cron] Found ${followups.length} scheduled follow-ups`);
        let sentCount = 0;
        for (const fu of followups) {
            try {
                const message = `Follow-Up Appointment Reminder\n\nDear ${fu.patient.fullName},\nThis is a reminder for your scheduled follow-up with ${fu.doctor.fullName} at ${fu.clinic?.name || 'ClinicOS'}.\nScheduled Date: ${fu.dueDate}.\nPlease contact us at ${fu.clinic?.contactNumber || ''} if you need to reschedule.`;
                const notif = await this.prisma.notification.create({
                    data: {
                        patientId: fu.patientId,
                        type: 'FOLLOWUP_REMINDER',
                        status: 'PENDING',
                        phone: fu.patient.phone,
                        message,
                    },
                });
                const result = await this.whatsappProvider.sendMessage(fu.patient.phone, message, null, fu.clinicId);
                if (result.success) {
                    await this.prisma.notification.update({
                        where: { id: notif.id },
                        data: {
                            status: 'SENT',
                            sentAt: new Date(),
                        },
                    });
                    await this.prisma.followUp.update({
                        where: { id: fu.id },
                        data: {
                            status: 'REMINDER_SENT',
                            reminderCount: fu.reminderCount + 1,
                            lastRemindedAt: new Date(),
                        },
                    });
                    sentCount++;
                }
                else {
                    await this.prisma.notification.update({
                        where: { id: notif.id },
                        data: {
                            status: 'FAILED',
                            error: result.error,
                        },
                    });
                }
            }
            catch (err) {
                this.logger.error(`[Follow-Up Cron] Failed to send reminder for Follow-up ID ${fu.id}: ${err.message}`);
            }
        }
        return { processed: followups.length, sent: sentCount };
    }
    async sendWhatsApp(patientId, phone, type, message, attachmentPath, clinicId) {
        const notif = await this.prisma.notification.create({
            data: {
                patientId,
                type,
                status: 'PENDING',
                phone,
                message,
            },
        });
        try {
            const result = await this.whatsappProvider.sendMessage(phone, message, attachmentPath, clinicId);
            if (result.success) {
                return this.prisma.notification.update({
                    where: { id: notif.id },
                    data: {
                        status: 'SENT',
                        sentAt: new Date(),
                    },
                });
            }
            else {
                return this.prisma.notification.update({
                    where: { id: notif.id },
                    data: {
                        status: 'FAILED',
                        error: result.error,
                    },
                });
            }
        }
        catch (err) {
            return this.prisma.notification.update({
                where: { id: notif.id },
                data: {
                    status: 'FAILED',
                    error: err.message,
                },
            });
        }
    }
    async createFollowUp(dto) {
        const { appointmentId, clinicId, doctorId, patientId, dueDate, reason, priority, notes, } = dto;
        return this.prisma.$transaction(async (tx) => {
            let resolvedClinicId = clinicId;
            let resolvedDoctorId = doctorId;
            if (!resolvedDoctorId) {
                const firstDoc = await tx.doctor.findFirst();
                if (firstDoc)
                    resolvedDoctorId = firstDoc.id;
            }
            if (!resolvedClinicId) {
                const firstClinic = await tx.clinic.findFirst({ where: { doctorId: resolvedDoctorId } });
                if (firstClinic) {
                    resolvedClinicId = firstClinic.id;
                }
                else {
                    const anyClinic = await tx.clinic.findFirst();
                    if (anyClinic)
                        resolvedClinicId = anyClinic.id;
                }
            }
            const followup = await tx.followUp.create({
                data: {
                    appointmentId: appointmentId || null,
                    clinicId: resolvedClinicId,
                    doctorId: resolvedDoctorId,
                    patientId,
                    dueDate: dueDate || new Date().toISOString(),
                    reason: reason || 'Skin Check-up',
                    priority: priority || 'ROUTINE',
                    notes: notes || '',
                    status: 'SCHEDULED',
                },
                include: {
                    patient: true,
                    doctor: true,
                },
            });
            return followup;
        });
    }
    async getPatientFollowUps(patientId) {
        return this.prisma.followUp.findMany({
            where: { patientId },
            orderBy: { dueDate: 'asc' },
        });
    }
    async getAllFollowUps() {
        return this.prisma.followUp.findMany({
            include: {
                patient: true,
            },
            orderBy: { dueDate: 'asc' },
        });
    }
    async getOutboxLogs() {
        return this.prisma.notification.findMany({
            orderBy: { createdAt: 'desc' },
            take: 50,
            include: {
                patient: {
                    select: { fullName: true }
                }
            }
        });
    }
    async resendNotification(id) {
        const notif = await this.prisma.notification.findUnique({
            where: { id },
            include: { patient: true }
        });
        if (!notif) {
            throw new common_1.NotFoundException('Notification not found');
        }
        await this.prisma.notification.update({
            where: { id },
            data: { status: 'PENDING', error: null },
        });
        let attachmentPath = null;
        if (notif.type === 'CONSULTATION_COMPLETED') {
            const prescription = await this.prisma.prescription.findFirst({
                where: { patientId: notif.patientId },
                orderBy: { createdAt: 'desc' }
            });
            if (prescription) {
                const uploadsDir = path.join(process.cwd(), 'uploads', 'prescriptions');
                const fileName = `prescription-${prescription.id}.pdf`;
                const filePath = path.join(uploadsDir, fileName);
                if (fs.existsSync(filePath)) {
                    attachmentPath = filePath;
                }
            }
        }
        try {
            const result = await this.whatsappProvider.sendMessage(notif.phone, notif.message, attachmentPath, notif.patient.clinicId);
            if (result.success) {
                return this.prisma.notification.update({
                    where: { id },
                    data: {
                        status: 'SENT',
                        sentAt: new Date(),
                    },
                });
            }
            else {
                return this.prisma.notification.update({
                    where: { id },
                    data: {
                        status: 'FAILED',
                        error: result.error,
                    },
                });
            }
        }
        catch (err) {
            return this.prisma.notification.update({
                where: { id },
                data: {
                    status: 'FAILED',
                    error: err.message,
                },
            });
        }
    }
    async sendManualWhatsApp(patientId, message, clinicId) {
        const patient = await this.prisma.patient.findUnique({
            where: { id: patientId }
        });
        if (!patient) {
            throw new common_1.NotFoundException('Patient not found');
        }
        return this.sendWhatsApp(patient.id, patient.phone, 'MANUAL_DOCTOR_MSG', message, null, clinicId || patient.clinicId);
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = NotificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        whatsapp_provider_1.WhatsAppProvider])
], NotificationService);
//# sourceMappingURL=notification.service.js.map