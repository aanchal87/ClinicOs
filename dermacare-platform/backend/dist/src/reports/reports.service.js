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
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let ReportsService = class ReportsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getReportsData(clinicId) {
        const now = new Date();
        const startOfToday = new Date(now);
        startOfToday.setHours(0, 0, 0, 0);
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        startOfMonth.setHours(0, 0, 0, 0);
        const patientsToday = await this.prisma.visit.findMany({
            where: {
                createdAt: { gte: startOfToday },
                clinicId: clinicId || undefined,
                deletedAt: null
            },
            distinct: ['patientId']
        }).then(list => list.length);
        const patientsThisWeek = await this.prisma.visit.findMany({
            where: {
                createdAt: { gte: startOfWeek },
                clinicId: clinicId || undefined,
                deletedAt: null
            },
            distinct: ['patientId']
        }).then(list => list.length);
        const patientsThisMonth = await this.prisma.visit.findMany({
            where: {
                createdAt: { gte: startOfMonth },
                clinicId: clinicId || undefined,
                deletedAt: null
            },
            distinct: ['patientId']
        }).then(list => list.length);
        const completedTokens = await this.prisma.queueToken.findMany({
            where: {
                status: 'completed',
                clinicId: clinicId || undefined,
                deletedAt: null
            }
        });
        let totalWaitTimeMin = 0;
        let longestWaitTimeMin = 0;
        let waitCount = 0;
        completedTokens.forEach((t) => {
            if (t.startTime && t.checkInTime) {
                const waitTimeMs = t.updatedAt.getTime() - t.createdAt.getTime();
                const waitTimeMin = Math.max(0, Math.floor(waitTimeMs / 60000));
                totalWaitTimeMin += waitTimeMin;
                if (waitTimeMin > longestWaitTimeMin) {
                    longestWaitTimeMin = waitTimeMin;
                }
                waitCount++;
            }
        });
        const averageWaitTime = waitCount > 0 ? Math.round(totalWaitTimeMin / waitCount) : 0;
        const totalFollowUps = await this.prisma.followUp.count({
            where: {
                clinicId: clinicId || undefined,
                deletedAt: null
            }
        });
        const completedFollowUps = await this.prisma.followUp.count({
            where: {
                status: { in: ['BOOKED', 'Completed', 'COMPLETED'] },
                clinicId: clinicId || undefined,
                deletedAt: null
            }
        });
        const followUpConversion = totalFollowUps > 0 ? Math.round((completedFollowUps / totalFollowUps) * 100) : 0;
        const consultations = await this.prisma.medicalRecord.groupBy({
            by: ['doctorId'],
            _count: {
                id: true,
            },
            where: {
                clinicId: clinicId || undefined,
                deletedAt: null,
            },
        });
        const doctorPerformance = await Promise.all(consultations.map(async (item) => {
            const doctor = await this.prisma.doctor.findUnique({
                where: { id: item.doctorId },
            });
            return {
                doctorName: doctor?.fullName || 'Unknown Doctor',
                consultationsCount: item._count.id,
            };
        }));
        const medicalRecords = await this.prisma.medicalRecord.findMany({
            where: {
                clinicId: clinicId || undefined,
                deletedAt: null
            },
            select: {
                diagnosis: true
            }
        });
        const diagnosesCounts = {};
        medicalRecords.forEach(r => {
            if (r.diagnosis) {
                const name = r.diagnosis.trim();
                diagnosesCounts[name] = (diagnosesCounts[name] || 0) + 1;
            }
        });
        const topDiagnoses = Object.entries(diagnosesCounts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
        const prescriptionItems = await this.prisma.prescriptionItem.findMany({
            where: {
                prescription: {
                    clinicId: clinicId || undefined,
                    deletedAt: null
                }
            },
            select: {
                drugName: true
            }
        });
        const drugCounts = {};
        prescriptionItems.forEach(item => {
            if (item.drugName) {
                const name = item.drugName.trim();
                drugCounts[name] = (drugCounts[name] || 0) + 1;
            }
        });
        const topPrescribedMedicines = Object.entries(drugCounts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
        const totalPatients = await this.prisma.patient.count({
            where: {
                clinicId: clinicId || undefined,
                deletedAt: null
            }
        });
        const completedPatients = await this.prisma.patient.count({
            where: {
                treatmentStatus: 'Completed',
                clinicId: clinicId || undefined,
                deletedAt: null
            }
        });
        const treatmentCompletionRate = totalPatients > 0 ? Math.round((completedPatients / totalPatients) * 100) : 0;
        return {
            patientsToday,
            patientsThisWeek,
            patientsThisMonth,
            averageWaitTime,
            longestWaitTime: longestWaitTimeMin,
            followUpConversion,
            doctorPerformance,
            topDiagnoses,
            topPrescribedMedicines,
            treatmentCompletionRate
        };
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map