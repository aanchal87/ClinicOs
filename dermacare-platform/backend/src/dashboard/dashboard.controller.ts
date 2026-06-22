import { Controller, Get, Req, Query, HttpStatus, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { RedisService } from '../common/redis/redis.service';
import { Permissions } from '../auth/permissions.decorator';

@Controller('dashboard')
export class DashboardController {
  constructor(
    private prisma: PrismaService,
    private redisService: RedisService
  ) {}

  // ---------------------------------------------------------------------------
  // DOCTOR SUB-ROUTES (READ_CONSULTATIONS)
  // ---------------------------------------------------------------------------

  @Get('doctor/stats')
  @Permissions('READ_CONSULTATIONS')
  async getDoctorStats(@Req() req: any) {
    const user = req.user;
    const clinicId = user.clinicId;
    if (!clinicId) {
      return { todaysAppointments: 0, activePatients: 0, followUpsDue: 0, revenue: 0, pendingLabReviews: 0, completedConsultations: 0 };
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [
      todaysAppointmentsCount,
      activePatientsCount,
      followUpsDueCount,
      pendingLabReviewsCount,
      completedConsultationsCount,
      doctor,
      checkedInCount
    ] = await Promise.all([
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

  @Get('doctor/queue')
  @Permissions('READ_CONSULTATIONS')
  async getDoctorQueue(@Req() req: any) {
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

  @Get('doctor/recent-activity')
  @Permissions('READ_CONSULTATIONS')
  async getDoctorRecentActivity(@Req() req: any) {
    const user = req.user;
    const clinicId = user.clinicId;
    if (!clinicId) return [];

    return this.prisma.auditLog.findMany({
      where: { role: { in: ['DOCTOR', 'RECEPTIONIST'] } },
      orderBy: { timestamp: 'desc' },
      take: 8,
      include: { user: { select: { email: true, role: true } } }
    });
  }

  // Monolithic route for backward compatibility
  @Get('doctor')
  @Permissions('READ_CONSULTATIONS')
  async getDoctorDashboard(@Req() req: any) {
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

  // ---------------------------------------------------------------------------
  // RECEPTIONIST SUB-ROUTES (READ_APPOINTMENTS)
  // ---------------------------------------------------------------------------

  @Get('receptionist/stats')
  @Permissions('READ_APPOINTMENTS')
  async getReceptionistStats(@Req() req: any) {
    const user = req.user;
    const clinicId = user.clinicId;
    if (!clinicId) {
      return { todaysAppointments: 0, checkedInToday: 0, newRegistrations: 0, waitingPatients: 0, missedAppointments: 0, followUpCalls: 0, paymentsPending: 0 };
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [
      todaysAppointmentsCount,
      checkedInCount,
      newRegistrationsCount,
      waitingPatientsCount,
      missedAppointmentsCount,
      followUpCallsCount,
      pendingPaymentsAppts
    ] = await Promise.all([
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

  // Monolithic route for backward compatibility
  @Get('receptionist')
  @Permissions('READ_APPOINTMENTS')
  async getReceptionistDashboard(@Req() req: any) {
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

  // ---------------------------------------------------------------------------
  // SUPER ADMIN SUB-ROUTES (SUPER_ADMIN role checked in handler)
  // ---------------------------------------------------------------------------

  @Get('superadmin/health')
  async getSuperAdminHealth(@Req() req: any) {
    const user = req.user;
    if (user.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Access denied. Super Admin role required.');
    }

    let dbStatus = 'healthy';
    let redisStatus = 'healthy';
    let activeSessionsCount = 0;

    const [dbCheck, sessionKeys] = await Promise.allSettled([
      this.prisma.$queryRaw`SELECT 1`,
      this.redisService.getKeys('session:*')
    ]);

    if (dbCheck.status === 'rejected') dbStatus = 'unhealthy';
    if (sessionKeys.status === 'fulfilled') {
      activeSessionsCount = sessionKeys.value.length;
    } else {
      redisStatus = 'unhealthy';
    }

    return {
      api: 'healthy',
      database: dbStatus,
      redis: redisStatus,
      activeSessions: activeSessionsCount
    };
  }

  @Get('superadmin/stats')
  async getSuperAdminStats(@Req() req: any) {
    const user = req.user;
    if (user.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Access denied. Super Admin role required.');
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

  @Get('superadmin/audit-logs')
  async getSuperAdminAuditLogs(@Req() req: any) {
    const user = req.user;
    if (user.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Access denied. Super Admin role required.');
    }

    return this.prisma.auditLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: 20,
      include: { user: { select: { email: true, role: true } } }
    });
  }

  @Get('superadmin/users')
  async getSuperAdminUsers(@Req() req: any) {
    const user = req.user;
    if (user.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Access denied. Super Admin role required.');
    }

    return this.prisma.user.findMany({
      select: { id: true, email: true, role: true, isActive: true, createdAt: true },
      take: 10,
      orderBy: { createdAt: 'desc' }
    });
  }

  @Get('superadmin/clinics')
  async getSuperAdminClinics(@Req() req: any) {
    const user = req.user;
    if (user.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Access denied. Super Admin role required.');
    }

    return this.prisma.clinic.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' }
    });
  }

  // Monolithic route for backward compatibility
  @Get('superadmin')
  async getSuperAdminDashboard(@Req() req: any) {
    const user = req.user;
    if (user.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Access denied. Super Admin role required.');
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
}
