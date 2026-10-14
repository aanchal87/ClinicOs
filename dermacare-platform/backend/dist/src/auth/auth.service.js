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
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const jwt_1 = require("@nestjs/jwt");
const redis_service_1 = require("../common/redis/redis.service");
const audit_log_service_1 = require("../common/audit-log/audit-log.service");
const bcrypt = __importStar(require("bcrypt"));
let AuthService = AuthService_1 = class AuthService {
    prisma;
    jwtService;
    redisService;
    auditLogService;
    logger = new common_1.Logger(AuthService_1.name);
    constructor(prisma, jwtService, redisService, auditLogService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.redisService = redisService;
        this.auditLogService = auditLogService;
    }
    async registerDoctor(dto) {
        const { email, phone, password, fullName, mciNumber, specializations, qualifications, experienceYears, clinicName, clinicAddress, clinicCity, clinicState, clinicPincode, clinicContact, clinicWorkingHours, } = dto;
        const existingUser = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { email: email },
                    phone ? { phone: phone } : undefined,
                ].filter(Boolean),
            },
        });
        if (existingUser) {
            throw new common_1.ConflictException('A user with this email or phone already exists.');
        }
        const existingMci = await this.prisma.doctor.findUnique({
            where: { mciNumber: mciNumber },
        });
        if (existingMci) {
            throw new common_1.ConflictException('MCI Medical Registration Number is already registered.');
        }
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);
        const doctorRole = await this.prisma.role.findUnique({
            where: { name: 'DOCTOR' },
        });
        return this.prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    email,
                    phone,
                    passwordHash,
                    role: 'DOCTOR',
                    roleId: doctorRole ? doctorRole.id : null,
                },
            });
            const doctor = await tx.doctor.create({
                data: {
                    userId: user.id,
                    fullName,
                    mciNumber,
                    specializations: specializations || 'Dermatology',
                    qualifications: qualifications || 'MBBS',
                    experienceYears: parseInt(experienceYears, 10) || 0,
                    approvalStatus: 'APPROVED',
                },
            });
            const clinic = await tx.clinic.create({
                data: {
                    doctorId: doctor.id,
                    name: clinicName || `${fullName}'s Skin Clinic`,
                    address: clinicAddress || '',
                    city: clinicCity || '',
                    state: clinicState || '',
                    pincode: clinicPincode || '',
                    contactNumber: clinicContact || phone,
                    workingHours: clinicWorkingHours || '09:00-17:00',
                },
            });
            await tx.clinicUser.create({
                data: {
                    clinicId: clinic.id,
                    userId: user.id,
                },
            });
            await tx.clinicSettings.createMany({
                data: [
                    { clinicId: clinic.id, key: 'clinicName', value: clinicName || `${fullName}'s Skin Clinic` },
                    { clinicId: clinic.id, key: 'enableWhatsappReminders', value: 'true' },
                    { clinicId: clinic.id, key: 'enableEmailNotifications', value: 'true' },
                    { clinicId: clinic.id, key: 'enable_reports', value: 'true' },
                    { clinicId: clinic.id, key: 'enable_laboratory', value: 'true' },
                    { clinicId: clinic.id, key: 'enable_gallery', value: 'true' },
                    { clinicId: clinic.id, key: 'enable_followups', value: 'true' },
                    { clinicId: clinic.id, key: 'enable_queue', value: 'true' },
                    { clinicId: clinic.id, key: 'enable_whatsapp', value: 'true' },
                ],
            });
            await tx.auditLog.create({
                data: {
                    userId: user.id,
                    role: 'DOCTOR',
                    action: 'USER_REGISTER',
                    details: `Registered doctor Adrian Vance and created clinic ${clinic.name}`,
                },
            });
            return {
                id: user.id,
                email: user.email,
                role: user.role,
                doctor: {
                    id: doctor.id,
                    fullName: doctor.fullName,
                    mciNumber: doctor.mciNumber,
                },
            };
        });
    }
    async generateTokens(user, clinicId) {
        const payload = { sub: user.id, email: user.email, role: user.role, clinicId };
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: process.env.JWT_SECRET,
                expiresIn: '15m',
            }),
            this.jwtService.signAsync(payload, {
                secret: process.env.JWT_REFRESH_SECRET || (process.env.JWT_SECRET + '-refresh'),
                expiresIn: '7d',
            }),
        ]);
        return { accessToken, refreshToken };
    }
    async loginDoctor(dto, ipAddress) {
        const { email, password } = dto;
        const user = await this.prisma.user.findUnique({
            where: { email },
            include: {
                doctor: {
                    include: {
                        clinics: true,
                    },
                },
            },
        });
        if (!user || !user.isActive) {
            throw new common_1.UnauthorizedException('Invalid email or password.');
        }
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            throw new common_1.UnauthorizedException('Invalid email or password.');
        }
        const clinicUsers = await this.prisma.clinicUser.findMany({
            where: { userId: user.id },
            select: { clinicId: true }
        });
        const clinicId = clinicUsers.length > 0 ? clinicUsers[0].clinicId : null;
        const { accessToken, refreshToken } = await this.generateTokens(user, clinicId);
        const sessionKey = `session:${user.id}:${refreshToken}`;
        const sessionData = JSON.stringify({
            userId: user.id,
            email: user.email,
            role: user.role,
            clinicId,
            loginAt: new Date().toISOString(),
            ipAddress,
        });
        try {
            await this.redisService.set(sessionKey, sessionData, 604800);
        }
        catch (e) {
            this.logger.error('Redis session write failed:', e);
        }
        await this.auditLogService.log({
            userId: user.id,
            role: user.role,
            action: 'USER_LOGIN',
            ipAddress,
            details: `User logged in: ${user.email}`,
            metadata: { userId: user.id, role: user.role, clinicId },
        });
        return {
            message: 'Login successful',
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                clinicId,
                doctor: user.doctor ? {
                    id: user.doctor.id,
                    fullName: user.doctor.fullName,
                    mciNumber: user.doctor.mciNumber,
                    specializations: user.doctor.specializations,
                    qualifications: user.doctor.qualifications,
                    experienceYears: user.doctor.experienceYears,
                    clinics: user.doctor.clinics || [],
                } : null,
            },
        };
    }
    async refresh(oldRefreshToken, ipAddress) {
        if (!oldRefreshToken) {
            throw new common_1.UnauthorizedException('Refresh token is missing.');
        }
        let payload;
        try {
            payload = await this.jwtService.verifyAsync(oldRefreshToken, {
                secret: process.env.JWT_REFRESH_SECRET || (process.env.JWT_SECRET + '-refresh'),
            });
        }
        catch (e) {
            throw new common_1.UnauthorizedException('Invalid or expired refresh token.');
        }
        const userId = payload.sub;
        const sessionKey = `session:${userId}:${oldRefreshToken}`;
        let sessionExists = false;
        try {
            const session = await this.redisService.get(sessionKey);
            sessionExists = !!session;
        }
        catch (e) {
            this.logger.error('Redis session lookup failed:', e);
            sessionExists = true;
        }
        if (!sessionExists) {
            throw new common_1.UnauthorizedException('Session has expired or is invalid.');
        }
        try {
            await this.redisService.del(sessionKey);
        }
        catch (e) {
            this.logger.error('Redis session delete failed:', e);
        }
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user || !user.isActive) {
            throw new common_1.UnauthorizedException('User no longer exists or is inactive.');
        }
        const clinicUsers = await this.prisma.clinicUser.findMany({
            where: { userId: user.id },
            select: { clinicId: true }
        });
        const clinicId = clinicUsers.length > 0 ? clinicUsers[0].clinicId : null;
        const { accessToken, refreshToken: newRefreshToken } = await this.generateTokens(user, clinicId);
        const newSessionKey = `session:${user.id}:${newRefreshToken}`;
        const sessionData = JSON.stringify({
            userId: user.id,
            email: user.email,
            role: user.role,
            clinicId,
            loginAt: new Date().toISOString(),
            ipAddress,
        });
        try {
            await this.redisService.set(newSessionKey, sessionData, 604800);
        }
        catch (e) {
            this.logger.error('Redis session write failed:', e);
        }
        await this.auditLogService.log({
            userId: user.id,
            role: user.role,
            action: 'TOKEN_REFRESH',
            ipAddress,
            details: 'Rotated refresh token and generated new access token',
            metadata: { userId: user.id, clinicId },
        });
        return {
            accessToken,
            refreshToken: newRefreshToken,
        };
    }
    async logout(refreshToken, ipAddress) {
        if (!refreshToken) {
            return { message: 'Logged out successfully' };
        }
        let userId = null;
        let role = null;
        try {
            const payload = await this.jwtService.verifyAsync(refreshToken, {
                secret: process.env.JWT_REFRESH_SECRET || (process.env.JWT_SECRET + '-refresh'),
            });
            userId = payload.sub;
            role = payload.role;
        }
        catch (e) {
            try {
                const decoded = this.jwtService.decode(refreshToken);
                if (decoded) {
                    userId = decoded.sub;
                    role = decoded.role;
                }
            }
            catch (_) { }
        }
        if (userId) {
            const sessionKey = `session:${userId}:${refreshToken}`;
            try {
                await this.redisService.del(sessionKey);
            }
            catch (e) {
                this.logger.error('Redis session delete failed during logout:', e);
            }
            await this.auditLogService.log({
                userId,
                role: role || undefined,
                action: 'USER_LOGOUT',
                ipAddress,
                details: 'User logged out and session invalidated',
                metadata: { userId },
            });
        }
        return { message: 'Logout successful' };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        redis_service_1.RedisService,
        audit_log_service_1.AuditLogService])
], AuthService);
//# sourceMappingURL=auth.service.js.map