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
exports.DashboardController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const redis_service_1 = require("../common/redis/redis.service");
const permissions_decorator_1 = require("../auth/permissions.decorator");
let DashboardController = class DashboardController {
    prisma;
    redisService;
    constructor(prisma, redisService) {
        this.prisma = prisma;
        this.redisService = redisService;
    }
    async getDoctorStats(req) {
        const user = req.user;
        const clinicId = user.clinicId;
        if (!clinicId) {
            return { todaysAppointments: 0, activePatients: 0, followUpsDue: 0, revenue: 0, pendingLabReviews: 0, completedConsultations: 0 };
        }
        const todayStr = new Date().toISOString().split('T')[0];
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const [todaysAppointmentsCount, activePatientsCount, followUpsDueCount, pendingLabReviewsCount, completedConsultationsCount, doctor, checkedInCount] = await Promise.all([
            this.prisma.appointment.count({
                where: { clinicId, date: todayStr, status: { not: 'CANCELLED' } }
            }),
            this.prisma.patient.count({ where: { clinicId } }),
            this.prisma.followUp.count({
                where: { clinicId, dueDate: { lte: todayStr }, status: 'SCHEDULED' }
            }),
            this.prisma.labReport.count({
                where: { clinicId, status: { not: 'Reviewed' } }
            }),
            this.prisma.medicalRecord.count({
                where: { clinicId, createdAt: { gte: startOfToday } }
            }),
            this.prisma.doctor.findFirst({
                where: { clinics: { some: { id: clinicId } } }
            }),
            this.prisma.appointment.count({
                where: { clinicId, date: todayStr, status: { in: ['IN_PROGRESS', 'COMPLETED'] } }
            })
        ]);
        const fee = doctor?.consultationFee || 150.0;
        const todaysRevenue = checkedInCount * fee;
        return {
            todaysAppointments: todaysAppointmentsCount,
            activePatients: activePatientsCount,
            followUpsDue: followUpsDueCount,
            pendingLabReviews: pendingLabReviewsCount,
            completedConsultations: completedConsultationsCount,
            revenue: todaysRevenue
        };
    }
    async getDoctorQueue(req) {
        const user = req.user;
        const clinicId = user.clinicId;
        if (!clinicId) {
            return { currentPatient: null, nextTokens: [] };
        }
        const [currentPatientToken, nextTokens] = await Promise.all([
            this.prisma.queueToken.findFirst({
                where: { clinicId, status: 'started' },
                orderBy: { updatedAt: 'desc' }
            }),
            this.prisma.queueToken.findMany({
                where: { clinicId, status: { in: ['waiting', 'called'] } },
                orderBy: { tokenNumber: 'asc' },
                take: 5
            })
        ]);
        return {
            currentPatient: currentPatientToken,
            nextTokens
        };
    }
    async getDoctorRecentActivity(req) {
        const user = req.user;
        const clinicId = user.clinicId;
        if (!clinicId)
            return [];
        return this.prisma.auditLog.findMany({
            where: { role: { in: ['DOCTOR', 'RECEPTIONIST'] } },
            orderBy: { timestamp: 'desc' },
            take: 8,
            include: { user: { select: { email: true, role: true } } }
        });
    }
    async getDoctorDashboard(req) {
        const user = req.user;
        const clinicId = user.clinicId;
        if (!clinicId) {
            return {
                stats: { todaysAppointments: 0, activePatients: 0, followUpsDue: 0, revenue: 0, pendingLabReviews: 0, completedConsultations: 0 },
                appointments: [],
                nextTokens: [],
                currentPatient: null,
                recentActivity: []
            };
        }
        const todayStr = new Date().toISOString().split('T')[0];
        const [stats, queue, appointments, recentActivity] = await Promise.all([
            this.getDoctorStats(req),
            this.getDoctorQueue(req),
            this.prisma.appointment.findMany({
                where: { clinicId, date: todayStr, status: { not: 'CANCELLED' } },
                include: { patient: true },
                orderBy: { time: 'asc' }
            }),
            this.getDoctorRecentActivity(req)
        ]);
        return {
            stats,
            appointments,
            currentPatient: queue.currentPatient,
            nextTokens: queue.nextTokens,
            recentActivity
        };
    }
    async getReceptionistStats(req) {
        const user = req.user;
        const clinicId = user.clinicId;
        if (!clinicId) {
            return { todaysAppointments: 0, checkedInToday: 0, newRegistrations: 0, waitingPatients: 0, missedAppointments: 0, followUpCalls: 0, paymentsPending: 0 };
        }
        const todayStr = new Date().toISOString().split('T')[0];
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const [todaysAppointmentsCount, checkedInCount, newRegistrationsCount, waitingPatientsCount, missedAppointmentsCount, followUpCallsCount, pendingPaymentsAppts] = await Promise.all([
            this.prisma.appointment.count({ where: { clinicId, date: todayStr } }),
            this.prisma.appointment.count({
                where: { clinicId, date: todayStr, status: { in: ['IN_PROGRESS', 'COMPLETED'] } }
            }),
            this.prisma.patient.count({
                where: { clinicId, createdAt: { gte: startOfToday } }
            }),
            this.prisma.queueToken.count({
                where: { clinicId, status: { in: ['waiting', 'called'] } }
            }),
            this.prisma.queueToken.count({
                where: { clinicId, status: 'missed', createdAt: { gte: startOfToday } }
            }),
            this.prisma.followUp.count({
                where: { clinicId, dueDate: todayStr, status: 'SCHEDULED' }
            }),
            this.prisma.appointment.count({
                where: { clinicId, date: todayStr, status: 'PENDING' }
            })
        ]);
        return {
            todaysAppointments: todaysAppointmentsCount,
            checkedInToday: checkedInCount,
            newRegistrations: newRegistrationsCount,
            waitingPatients: waitingPatientsCount,
            missedAppointments: missedAppointmentsCount,
            followUpCalls: followUpCallsCount,
            paymentsPending: pendingPaymentsAppts
        };
    }
    async getReceptionistDashboard(req) {
        const user = req.user;
        const clinicId = user.clinicId;
        if (!clinicId) {
            return {
                stats: { todaysAppointments: 0, checkedInToday: 0, newRegistrations: 0, waitingPatients: 0, missedAppointments: 0, followUpCalls: 0, paymentsPending: 0 },
                appointments: [],
                queueStatus: []
            };
        }
        const todayStr = new Date().toISOString().split('T')[0];
        const [stats, appointments, queueStatus] = await Promise.all([
            this.getReceptionistStats(req),
            this.prisma.appointment.findMany({
                where: { clinicId, date: todayStr },
                include: { patient: true },
                orderBy: { time: 'asc' }
            }),
            this.prisma.queueToken.findMany({
                where: { clinicId },
                orderBy: { createdAt: 'desc' },
                take: 15
            })
        ]);
        return {
            stats,
            appointments,
            queueStatus
        };
    }
    async getSuperAdminHealth(req) {
        const user = req.user;
        if (user.role !== 'SUPER_ADMIN') {
            throw new common_1.ForbiddenException('Access denied. Super Admin role required.');
        }
        let dbStatus = 'healthy';
        let redisStatus = 'healthy';
        let activeSessionsCount = 0;
        const [dbCheck, sessionKeys] = await Promise.allSettled([
            this.prisma.$queryRaw `SELECT 1`,
            this.redisService.getKeys('session:*')
        ]);
        if (dbCheck.status === 'rejected')
            dbStatus = 'unhealthy';
        if (sessionKeys.status === 'fulfilled') {
            activeSessionsCount = sessionKeys.value.length;
        }
        else {
            redisStatus = 'unhealthy';
        }
        return {
            api: 'healthy',
            database: dbStatus,
            redis: redisStatus,
            activeSessions: activeSessionsCount
        };
    }
    async getSuperAdminStats(req) {
        const user = req.user;
        if (user.role !== 'SUPER_ADMIN') {
            throw new common_1.ForbiddenException('Access denied. Super Admin role required.');
        }
        const [userCount, clinicCount, patientCount, completedApps] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.clinic.count(),
            this.prisma.patient.count(),
            this.prisma.appointment.count({ where: { status: 'COMPLETED' } })
        ]);
        return {
            totalUsers: userCount,
            totalClinics: clinicCount,
            totalPatients: patientCount,
            totalRevenue: completedApps * 150
        };
    }
    async getSuperAdminAuditLogs(req) {
        const user = req.user;
        if (user.role !== 'SUPER_ADMIN') {
            throw new common_1.ForbiddenException('Access denied. Super Admin role required.');
        }
        return this.prisma.auditLog.findMany({
            orderBy: { timestamp: 'desc' },
            take: 20,
            include: { user: { select: { email: true, role: true } } }
        });
    }
    async getSuperAdminUsers(req) {
        const user = req.user;
        if (user.role !== 'SUPER_ADMIN') {
            throw new common_1.ForbiddenException('Access denied. Super Admin role required.');
        }
        return this.prisma.user.findMany({
            select: { id: true, email: true, role: true, isActive: true, createdAt: true },
            take: 10,
            orderBy: { createdAt: 'desc' }
        });
    }
    async getSuperAdminClinics(req) {
        const user = req.user;
        if (user.role !== 'SUPER_ADMIN') {
            throw new common_1.ForbiddenException('Access denied. Super Admin role required.');
        }
        return this.prisma.clinic.findMany({
            take: 10,
            orderBy: { createdAt: 'desc' }
        });
    }
    async getSuperAdminDashboard(req) {
        const user = req.user;
        if (user.role !== 'SUPER_ADMIN') {
            throw new common_1.ForbiddenException('Access denied. Super Admin role required.');
        }
        const [health, stats, auditLogs, users, clinics] = await Promise.all([
            this.getSuperAdminHealth(req),
            this.getSuperAdminStats(req),
            this.getSuperAdminAuditLogs(req),
            this.getSuperAdminUsers(req),
            this.getSuperAdminClinics(req)
        ]);
        return {
            systemHealth: health,
            stats,
            auditLogs,
            users,
            clinics
        };
    }
};
exports.DashboardController = DashboardController;
__decorate([
    (0, common_1.Get)('doctor/stats'),
    (0, permissions_decorator_1.Permissions)('READ_CONSULTATIONS'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getDoctorStats", null);
__decorate([
    (0, common_1.Get)('doctor/queue'),
    (0, permissions_decorator_1.Permissions)('READ_CONSULTATIONS'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getDoctorQueue", null);
__decorate([
    (0, common_1.Get)('doctor/recent-activity'),
    (0, permissions_decorator_1.Permissions)('READ_CONSULTATIONS'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getDoctorRecentActivity", null);
__decorate([
    (0, common_1.Get)('doctor'),
    (0, permissions_decorator_1.Permissions)('READ_CONSULTATIONS'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getDoctorDashboard", null);
__decorate([
    (0, common_1.Get)('receptionist/stats'),
    (0, permissions_decorator_1.Permissions)('READ_APPOINTMENTS'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getReceptionistStats", null);
__decorate([
    (0, common_1.Get)('receptionist'),
    (0, permissions_decorator_1.Permissions)('READ_APPOINTMENTS'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getReceptionistDashboard", null);
__decorate([
    (0, common_1.Get)('superadmin/health'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getSuperAdminHealth", null);
__decorate([
    (0, common_1.Get)('superadmin/stats'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getSuperAdminStats", null);
__decorate([
    (0, common_1.Get)('superadmin/audit-logs'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getSuperAdminAuditLogs", null);
__decorate([
    (0, common_1.Get)('superadmin/users'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getSuperAdminUsers", null);
__decorate([
    (0, common_1.Get)('superadmin/clinics'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getSuperAdminClinics", null);
__decorate([
    (0, common_1.Get)('superadmin'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getSuperAdminDashboard", null);
exports.DashboardController = DashboardController = __decorate([
    (0, common_1.Controller)('dashboard'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService])
], DashboardController);
//# sourceMappingURL=dashboard.controller.js.map