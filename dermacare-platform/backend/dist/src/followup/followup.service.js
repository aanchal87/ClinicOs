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
exports.FollowUpService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let FollowUpService = class FollowUpService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getFollowUps(doctorId, clinicId) {
        let finalDoctorId = doctorId;
        if (doctorId === 'mock-doc-1') {
            const firstDoc = await this.prisma.doctor.findFirst();
            if (firstDoc)
                finalDoctorId = firstDoc.id;
        }
        const filter = {};
        if (clinicId) {
            filter.clinicId = clinicId;
        }
        if (finalDoctorId && finalDoctorId !== 'all') {
            filter.doctorId = finalDoctorId;
        }
        return this.prisma.followUp.findMany({
            where: filter,
            include: {
                patient: true,
            },
            orderBy: { dueDate: 'asc' },
        });
    }
    async getPatientFollowUps(patientId, clinicId) {
        const patient = await this.prisma.patient.findUnique({
            where: { id: patientId }
        });
        if (!patient || (clinicId && patient.clinicId !== clinicId)) {
            throw new common_1.NotFoundException('Patient not found');
        }
        return this.prisma.followUp.findMany({
            where: { patientId },
            orderBy: { dueDate: 'desc' },
        });
    }
    async createFollowUp(dto, clinicId) {
        const { patientId, dueDate, reason, priority, doctorId } = dto;
        const patient = await this.prisma.patient.findUnique({
            where: { id: patientId }
        });
        if (!patient || (clinicId && patient.clinicId !== clinicId)) {
            throw new common_1.NotFoundException('Patient not found');
        }
        let finalDoctorId = doctorId || 'mock-doc-1';
        const firstDoc = await this.prisma.doctor.findFirst();
        if (firstDoc)
            finalDoctorId = firstDoc.id;
        const finalClinicId = clinicId || dto.clinicId || patient.clinicId || 'default-clinic-id';
        return this.prisma.followUp.create({
            data: {
                patientId,
                dueDate,
                reason: reason || '',
                priority: priority || 'ROUTINE',
                status: 'SCHEDULED',
                doctorId: finalDoctorId,
                clinicId: finalClinicId,
            },
            include: {
                patient: true,
            },
        });
    }
    async updateFollowUpStatus(id, status, clinicId) {
        const followup = await this.prisma.followUp.findUnique({
            where: { id },
        });
        if (!followup || (clinicId && followup.clinicId !== clinicId)) {
            throw new common_1.NotFoundException('Follow-up not found');
        }
        return this.prisma.followUp.update({
            where: { id },
            data: { status },
            include: {
                patient: true,
            },
        });
    }
};
exports.FollowUpService = FollowUpService;
exports.FollowUpService = FollowUpService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FollowUpService);
//# sourceMappingURL=followup.service.js.map