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
exports.PatientHistoryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let PatientHistoryService = class PatientHistoryService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    mapPatient(patient) {
        if (!patient)
            return null;
        return {
            ...patient,
            name: patient.fullName,
            dob: patient.dateOfBirth,
            aadhaar: patient.aadhaarMasked || null,
            allergies: patient.allergies ? patient.allergies.split(',').map((s) => s.trim()).filter(Boolean) : [],
            medicalConditions: patient.medicalConditions ? patient.medicalConditions.split(',').map((s) => s.trim()).filter(Boolean) : [],
        };
    }
    async getPatientHistory(patientId, clinicId) {
        const patientRecord = await this.prisma.patient.findUnique({
            where: { id: patientId }
        });
        if (!patientRecord || (clinicId && patientRecord.clinicId !== clinicId)) {
            throw new common_1.NotFoundException(`Patient with ID ${patientId} not found`);
        }
        const patient = this.mapPatient(patientRecord);
        const visits = await this.prisma.visit.findMany({
            where: { patientId },
            orderBy: { createdAt: 'desc' },
            include: {
                appointment: true,
                token: true,
            }
        });
        const consultations = await this.prisma.medicalRecord.findMany({
            where: { patientId },
            orderBy: { createdAt: 'desc' },
            include: {
                photos: true,
                appointment: true,
                prescription: {
                    include: {
                        items: true
                    }
                },
                labReports: true,
            }
        });
        const prescriptions = await this.prisma.prescription.findMany({
            where: { patientId },
            orderBy: { createdAt: 'desc' },
            include: {
                items: true
            }
        });
        const labReports = await this.prisma.labReport.findMany({
            where: {
                medicalRecord: {
                    patientId
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        const followUps = await this.prisma.followUp.findMany({
            where: { patientId },
            orderBy: { dueDate: 'desc' }
        });
        const documents = await this.prisma.document.findMany({
            where: { patientId },
            orderBy: { createdAtDb: 'desc' }
        });
        const treatmentImages = await this.prisma.clinicalPhoto.findMany({
            where: { patientId },
            orderBy: { takenAt: 'desc' }
        });
        const tokenHistory = await this.prisma.queueToken.findMany({
            where: { patientId },
            orderBy: { createdAt: 'desc' }
        });
        return {
            patient,
            visits,
            consultations,
            prescriptions,
            labReports,
            followUps,
            documents,
            treatmentImages,
            tokenHistory
        };
    }
};
exports.PatientHistoryService = PatientHistoryService;
exports.PatientHistoryService = PatientHistoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PatientHistoryService);
//# sourceMappingURL=patient-history.service.js.map