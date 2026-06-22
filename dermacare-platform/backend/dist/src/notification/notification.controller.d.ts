import { NotificationService } from './notification.service';
export declare class NotificationController {
    private readonly notificationService;
    constructor(notificationService: NotificationService);
    createFollowUp(dto: any): Promise<{
        doctor: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            deletedAt: Date | null;
            fullName: string;
            mciNumber: string;
            specializations: string;
            qualifications: string;
            experienceYears: number;
            consultationFee: number;
            approvalStatus: string;
            userId: string;
        };
        patient: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            deletedAt: Date | null;
            email: string | null;
            phone: string;
            fullName: string;
            address: string | null;
            clinicId: string | null;
            patientCustomId: string | null;
            aadhaarEncrypted: string | null;
            aadhaarMasked: string | null;
            aadhaarHash: string | null;
            dateOfBirth: string | null;
            gender: string | null;
            bloodGroup: string | null;
            allergies: string;
            medicalConditions: string;
            emergencyContact: string | null;
            treatmentStatus: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        deletedAt: Date | null;
        doctorId: string;
        clinicId: string;
        reason: string | null;
        notes: string | null;
        status: string;
        patientId: string;
        appointmentId: string | null;
        priority: string;
        dueDate: string;
        reminderCount: number;
        lastRemindedAt: Date | null;
    }>;
    getPatientFollowUps(patientId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        deletedAt: Date | null;
        doctorId: string;
        clinicId: string;
        reason: string | null;
        notes: string | null;
        status: string;
        patientId: string;
        appointmentId: string | null;
        priority: string;
        dueDate: string;
        reminderCount: number;
        lastRemindedAt: Date | null;
    }[]>;
    getAllFollowUps(): Promise<({
        patient: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            deletedAt: Date | null;
            email: string | null;
            phone: string;
            fullName: string;
            address: string | null;
            clinicId: string | null;
            patientCustomId: string | null;
            aadhaarEncrypted: string | null;
            aadhaarMasked: string | null;
            aadhaarHash: string | null;
            dateOfBirth: string | null;
            gender: string | null;
            bloodGroup: string | null;
            allergies: string;
            medicalConditions: string;
            emergencyContact: string | null;
            treatmentStatus: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        deletedAt: Date | null;
        doctorId: string;
        clinicId: string;
        reason: string | null;
        notes: string | null;
        status: string;
        patientId: string;
        appointmentId: string | null;
        priority: string;
        dueDate: string;
        reminderCount: number;
        lastRemindedAt: Date | null;
    })[]>;
    getOutboxLogs(): Promise<({
        patient: {
            fullName: string;
        };
    } & {
        error: string | null;
        id: string;
        createdAt: Date;
        phone: string;
        status: string;
        patientId: string;
        type: string;
        message: string;
        sentAt: Date | null;
    })[]>;
    getWhatsappOutbox(): Promise<({
        patient: {
            fullName: string;
        };
    } & {
        error: string | null;
        id: string;
        createdAt: Date;
        phone: string;
        status: string;
        patientId: string;
        type: string;
        message: string;
        sentAt: Date | null;
    })[]>;
    resendNotification(id: string): Promise<{
        error: string | null;
        id: string;
        createdAt: Date;
        phone: string;
        status: string;
        patientId: string;
        type: string;
        message: string;
        sentAt: Date | null;
    }>;
    triggerDailyFollowUps(date: string): Promise<{
        processed: number;
        sent: number;
    }>;
    simulateTriggerReminders(date: string): Promise<{
        processed: number;
        sent: number;
    }>;
    sendManualWhatsApp(dto: {
        patientId: string;
        message: string;
        clinicId?: string;
    }): Promise<{
        error: string | null;
        id: string;
        createdAt: Date;
        phone: string;
        status: string;
        patientId: string;
        type: string;
        message: string;
        sentAt: Date | null;
    }>;
}
