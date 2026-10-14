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
    createToken(dto: any, req: any): Promise<{
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
    updateStatus(id: string, status: string, req: any): Promise<{
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
}
