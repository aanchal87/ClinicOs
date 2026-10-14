import { QueueService } from './queue.service';
export declare class QueueController {
    private queueService;
    constructor(queueService: QueueService);
    getTokens(req: any): Promise<{
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
    }[]>;
    createToken(dto: any, req: any): Promise<{
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
    }>;
    updateStatus(id: string, status: string, req: any): Promise<{
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
    }>;
}
