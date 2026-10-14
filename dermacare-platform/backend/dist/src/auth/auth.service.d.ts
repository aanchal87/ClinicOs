import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from '../common/redis/redis.service';
import { AuditLogService } from '../common/audit-log/audit-log.service';
export declare class AuthService {
    private prisma;
    private jwtService;
    private redisService;
    private auditLogService;
    private readonly logger;
    constructor(prisma: PrismaService, jwtService: JwtService, redisService: RedisService, auditLogService: AuditLogService);
    registerDoctor(dto: any): Promise<{
        id: string;
        email: string;
        role: string;
        doctor: {
            id: string;
            fullName: string;
            mciNumber: string;
        };
    }>;
    generateTokens(user: any, clinicId: string | null): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    loginDoctor(dto: any, ipAddress?: string): Promise<{
        message: string;
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            role: string;
            clinicId: string | null;
            doctor: {
                id: string;
                fullName: string;
                mciNumber: string;
                specializations: string;
                qualifications: string;
                experienceYears: number;
                clinics: {
                    id: string;
<<<<<<< HEAD
                    address: string;
=======
                    name: string;
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
                    createdAt: Date;
                    updatedAt: Date;
                    createdBy: string | null;
                    deletedAt: Date | null;
<<<<<<< HEAD
                    name: string;
=======
                    address: string;
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
                    city: string;
                    state: string;
                    pincode: string;
                    contactNumber: string | null;
                    workingHours: string;
                    doctorId: string;
                }[];
            } | null;
        };
    }>;
    refresh(oldRefreshToken: string, ipAddress?: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(refreshToken: string, ipAddress?: string): Promise<{
        message: string;
    }>;
}
