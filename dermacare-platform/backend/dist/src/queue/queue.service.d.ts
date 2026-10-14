import { PrismaService } from '../prisma.service';
import { QueueGateway } from './queue.gateway';
import { AuditLogService } from '../common/audit-log/audit-log.service';
import { NotificationService } from '../notification/notification.service';
export declare class QueueService {
    private prisma;
    private queueGateway;
    private auditLogService;
    private notificationService;
    private readonly logger;
    constructor(prisma: PrismaService, queueGateway: QueueGateway, auditLogService: AuditLogService, notificationService: NotificationService);
    getTokens(clinicId?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        deletedAt: Date | null;
<<<<<<< HEAD
        clinicId: string | null;
        patientId: string;
        startTime: string | null;
        endTime: string | null;
        status: string;
=======
        startTime: string | null;
        endTime: string | null;
        clinicId: string | null;
        status: string;
        patientId: string;
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
        tokenNumber: string;
        patientName: string;
        priority: string;
        visitReason: string;
        doctorName: string;
        checkInTime: string;
    }[]>;
    createToken(dto: any, clinicId?: string, userPayload?: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        deletedAt: Date | null;
<<<<<<< HEAD
        clinicId: string | null;
        patientId: string;
        startTime: string | null;
        endTime: string | null;
        status: string;
=======
        startTime: string | null;
        endTime: string | null;
        clinicId: string | null;
        status: string;
        patientId: string;
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
        tokenNumber: string;
        patientName: string;
        priority: string;
        visitReason: string;
        doctorName: string;
        checkInTime: string;
    }>;
    updateTokenStatus(tokenId: string, status: string, clinicId?: string, userPayload?: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        deletedAt: Date | null;
<<<<<<< HEAD
        clinicId: string | null;
        patientId: string;
        startTime: string | null;
        endTime: string | null;
        status: string;
=======
        startTime: string | null;
        endTime: string | null;
        clinicId: string | null;
        status: string;
        patientId: string;
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
        tokenNumber: string;
        patientName: string;
        priority: string;
        visitReason: string;
        doctorName: string;
        checkInTime: string;
    }>;
    broadcastUpdate(eventName: string, data: any): void;
}
