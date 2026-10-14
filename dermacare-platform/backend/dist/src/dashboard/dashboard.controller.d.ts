import { PrismaService } from '../prisma.service';
import { RedisService } from '../common/redis/redis.service';
export declare class DashboardController {
    private prisma;
    private redisService;
    constructor(prisma: PrismaService, redisService: RedisService);
    getDoctorStats(req: any): Promise<{
        todaysAppointments: number;
        activePatients: number;
        followUpsDue: number;
        revenue: number;
        pendingLabReviews: number;
        completedConsultations: number;
    }>;
    getDoctorQueue(req: any): Promise<{
        currentPatient: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            deletedAt: Date | null;
            clinicId: string | null;
            patientId: string;
            startTime: string | null;
            endTime: string | null;
            status: string;
            tokenNumber: string;
            patientName: string;
            priority: string;
            visitReason: string;
            doctorName: string;
            checkInTime: string;
        } | null;
        nextTokens: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            deletedAt: Date | null;
            clinicId: string | null;
            patientId: string;
            startTime: string | null;
            endTime: string | null;
            status: string;
            tokenNumber: string;
            patientName: string;
            priority: string;
            visitReason: string;
            doctorName: string;
            checkInTime: string;
        }[];
    }>;
    getDoctorRecentActivity(req: any): Promise<({
        user: {
            email: string;
            role: string;
        } | null;
    } & {
        id: string;
        role: string | null;
        userId: string | null;
        action: string;
        ipAddress: string | null;
        details: string | null;
        metadata: string | null;
        timestamp: Date;
    })[]>;
    getDoctorDashboard(req: any): Promise<{
        stats: {
            todaysAppointments: number;
            activePatients: number;
            followUpsDue: number;
            revenue: number;
            pendingLabReviews: number;
            completedConsultations: number;
        };
        appointments: ({
            patient: {
                id: string;
                patientCustomId: string | null;
                aadhaarEncrypted: string | null;
                aadhaarMasked: string | null;
                aadhaarHash: string | null;
                fullName: string;
                email: string | null;
                phone: string;
                dateOfBirth: string | null;
                gender: string | null;
                bloodGroup: string | null;
                address: string | null;
                allergies: string;
                medicalConditions: string;
                emergencyContact: string | null;
                treatmentStatus: string;
                createdAt: Date;
                updatedAt: Date;
                createdBy: string | null;
                deletedAt: Date | null;
                clinicId: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            deletedAt: Date | null;
            clinicId: string;
            patientId: string;
            doctorId: string;
            notes: string | null;
            status: string;
            date: string;
            time: string;
            type: string;
        })[];
        currentPatient: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            deletedAt: Date | null;
            clinicId: string | null;
            patientId: string;
            startTime: string | null;
            endTime: string | null;
            status: string;
            tokenNumber: string;
            patientName: string;
            priority: string;
            visitReason: string;
            doctorName: string;
            checkInTime: string;
        } | null;
        nextTokens: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            deletedAt: Date | null;
            clinicId: string | null;
            patientId: string;
            startTime: string | null;
            endTime: string | null;
            status: string;
            tokenNumber: string;
            patientName: string;
            priority: string;
            visitReason: string;
            doctorName: string;
            checkInTime: string;
        }[];
        recentActivity: ({
            user: {
                email: string;
                role: string;
            } | null;
        } & {
            id: string;
            role: string | null;
            userId: string | null;
            action: string;
            ipAddress: string | null;
            details: string | null;
            metadata: string | null;
            timestamp: Date;
        })[];
    }>;
    getReceptionistStats(req: any): Promise<{
        todaysAppointments: number;
        checkedInToday: number;
        newRegistrations: number;
        waitingPatients: number;
        missedAppointments: number;
        followUpCalls: number;
        paymentsPending: number;
    }>;
    getReceptionistDashboard(req: any): Promise<{
        stats: {
            todaysAppointments: number;
            checkedInToday: number;
            newRegistrations: number;
            waitingPatients: number;
            missedAppointments: number;
            followUpCalls: number;
            paymentsPending: number;
        };
        appointments: ({
            patient: {
                id: string;
                patientCustomId: string | null;
                aadhaarEncrypted: string | null;
                aadhaarMasked: string | null;
                aadhaarHash: string | null;
                fullName: string;
                email: string | null;
                phone: string;
                dateOfBirth: string | null;
                gender: string | null;
                bloodGroup: string | null;
                address: string | null;
                allergies: string;
                medicalConditions: string;
                emergencyContact: string | null;
                treatmentStatus: string;
                createdAt: Date;
                updatedAt: Date;
                createdBy: string | null;
                deletedAt: Date | null;
                clinicId: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            deletedAt: Date | null;
            clinicId: string;
            patientId: string;
            doctorId: string;
            notes: string | null;
            status: string;
            date: string;
            time: string;
            type: string;
        })[];
        queueStatus: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            deletedAt: Date | null;
            clinicId: string | null;
            patientId: string;
            startTime: string | null;
            endTime: string | null;
            status: string;
            tokenNumber: string;
            patientName: string;
            priority: string;
            visitReason: string;
            doctorName: string;
            checkInTime: string;
        }[];
    }>;
    getSuperAdminHealth(req: any): Promise<{
        api: string;
        database: string;
        redis: string;
        activeSessions: number;
    }>;
    getSuperAdminStats(req: any): Promise<{
        totalUsers: number;
        totalClinics: number;
        totalPatients: number;
        totalRevenue: number;
    }>;
    getSuperAdminAuditLogs(req: any): Promise<({
        user: {
            email: string;
            role: string;
        } | null;
    } & {
        id: string;
        role: string | null;
        userId: string | null;
        action: string;
        ipAddress: string | null;
        details: string | null;
        metadata: string | null;
        timestamp: Date;
    })[]>;
    getSuperAdminUsers(req: any): Promise<{
        id: string;
        email: string;
        createdAt: Date;
        role: string;
        isActive: boolean;
    }[]>;
    getSuperAdminClinics(req: any): Promise<{
        id: string;
        address: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        deletedAt: Date | null;
        name: string;
        city: string;
        state: string;
        pincode: string;
        contactNumber: string | null;
        workingHours: string;
        doctorId: string;
    }[]>;
    getSuperAdminDashboard(req: any): Promise<{
        systemHealth: {
            api: string;
            database: string;
            redis: string;
            activeSessions: number;
        };
        stats: {
            totalUsers: number;
            totalClinics: number;
            totalPatients: number;
            totalRevenue: number;
        };
        auditLogs: ({
            user: {
                email: string;
                role: string;
            } | null;
        } & {
            id: string;
            role: string | null;
            userId: string | null;
            action: string;
            ipAddress: string | null;
            details: string | null;
            metadata: string | null;
            timestamp: Date;
        })[];
        users: {
            id: string;
            email: string;
            createdAt: Date;
            role: string;
            isActive: boolean;
        }[];
        clinics: {
            id: string;
            address: string;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            deletedAt: Date | null;
            name: string;
            city: string;
            state: string;
            pincode: string;
            contactNumber: string | null;
            workingHours: string;
            doctorId: string;
        }[];
    }>;
}
