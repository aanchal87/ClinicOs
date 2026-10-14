import { Injectable, ConflictException, UnauthorizedException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from '../common/redis/redis.service';
import { AuditLogService } from '../common/audit-log/audit-log.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private redisService: RedisService,
    private auditLogService: AuditLogService
  ) {}

  async registerDoctor(dto: any) {
    const {
      email,
      phone,
      password,
      fullName,
      mciNumber,
      specializations,
      qualifications,
      experienceYears,
      clinicName,
      clinicAddress,
      clinicCity,
      clinicState,
      clinicPincode,
      clinicContact,
      clinicWorkingHours,
    } = dto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          phone ? { phone: phone } : undefined,
        ].filter(Boolean) as any,
      },
    });

    if (existingUser) {
      throw new ConflictException('A user with this email or phone already exists.');
    }

    // Check if doctor MCI number exists
    const existingMci = await this.prisma.doctor.findUnique({
      where: { mciNumber: mciNumber },
    });

    if (existingMci) {
      throw new ConflictException('MCI Medical Registration Number is already registered.');
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const doctorRole = await this.prisma.role.findUnique({
      where: { name: 'DOCTOR' },
    });

    // Run in transaction to make sure all tables are created or none
    return this.prisma.$transaction(async (tx) => {
      // 1. Create User
      const user = await tx.user.create({
        data: {
          email,
          phone,
          passwordHash,
          role: 'DOCTOR',
          roleId: doctorRole ? doctorRole.id : null,
        },
      });

      // 2. Create Doctor
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

      // 3. Create Clinic
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

      // 4. Associate User with Clinic
      await tx.clinicUser.create({
        data: {
          clinicId: clinic.id,
          userId: user.id,
        },
      });

      // 5. Create default Clinic Settings with feature flags
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

      // Write Audit Log
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

  async generateTokens(user: any, clinicId: string | null) {
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

  async loginDoctor(dto: any, ipAddress?: string) {
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
      throw new UnauthorizedException('Invalid email or password.');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    // Get associated clinicId
    const clinicUsers = await this.prisma.clinicUser.findMany({
      where: { userId: user.id },
      select: { clinicId: true }
    });
    const clinicId = clinicUsers.length > 0 ? clinicUsers[0].clinicId : null;

    const { accessToken, refreshToken } = await this.generateTokens(user, clinicId);

    // Save active session in Redis: key = "session:{userId}:{refreshToken}"
    // TTL = 7 days = 7 * 24 * 60 * 60 = 604800 seconds
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
    } catch (e) {
      this.logger.error('Redis session write failed:', e);
    }

    // Write Audit Log
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

  async refresh(oldRefreshToken: string, ipAddress?: string) {
    if (!oldRefreshToken) {
      throw new UnauthorizedException('Refresh token is missing.');
    }

    let payload: any;
    try {
      payload = await this.jwtService.verifyAsync(oldRefreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || (process.env.JWT_SECRET + '-refresh'),
      });
    } catch (e) {
      throw new UnauthorizedException('Invalid or expired refresh token.');
    }

    const userId = payload.sub;
    const sessionKey = `session:${userId}:${oldRefreshToken}`;
    
    let sessionExists = false;
    try {
      const session = await this.redisService.get(sessionKey);
      sessionExists = !!session;
    } catch (e) {
      this.logger.error('Redis session lookup failed:', e);
      // fallback in case Redis goes down: allow token validation
      sessionExists = true;
    }

    if (!sessionExists) {
      throw new UnauthorizedException('Session has expired or is invalid.');
    }

    // Refresh token rotation: delete old session
    try {
      await this.redisService.del(sessionKey);
    } catch (e) {
      this.logger.error('Redis session delete failed:', e);
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User no longer exists or is inactive.');
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
    } catch (e) {
      this.logger.error('Redis session write failed:', e);
    }

    // Write Audit Log for Token Refresh
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

  async logout(refreshToken: string, ipAddress?: string) {
    if (!refreshToken) {
      return { message: 'Logged out successfully' };
    }

    let userId: string | null = null;
    let role: string | null = null;
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || (process.env.JWT_SECRET + '-refresh'),
      });
      userId = payload.sub;
      role = payload.role;
    } catch (e) {
      // If token is expired or has invalid signature, we still delete session from Redis if readable
      try {
        const decoded: any = this.jwtService.decode(refreshToken);
        if (decoded) {
          userId = decoded.sub;
          role = decoded.role;
        }
      } catch (_) {}
    }

    if (userId) {
      const sessionKey = `session:${userId}:${refreshToken}`;
      try {
        await this.redisService.del(sessionKey);
      } catch (e) {
        this.logger.error('Redis session delete failed during logout:', e);
      }

      // Write Audit Log
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
}
