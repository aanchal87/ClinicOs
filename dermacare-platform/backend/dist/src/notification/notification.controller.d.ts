import { NotificationService } from './notification.service';
export declare class NotificationController {
    private readonly notificationService;
    constructor(notificationService: NotificationService);
    createFollowUp(dto: any): Promise<{
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
        doctor: {
            id: string;
            fullName: string;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            deletedAt: Date | null;
            mciNumber: string;
            specializations: string;
            qualifications: string;
            experienceYears: number;
            consultationFee: number;
            approvalStatus: string;
            userId: string;
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
        reason: string | null;
        notes: string | null;
        status: string;
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
        clinicId: string;
        patientId: string;
        doctorId: string;
        reason: string | null;
        notes: string | null;
        status: string;
        appointmentId: string | null;
        priority: string;
        dueDate: string;
        reminderCount: number;
        lastRemindedAt: Date | null;
    }[]>;
    getAllFollowUps(): Promise<({
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
        reason: string | null;
        notes: string | null;
        status: string;
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
        phone: string;
        createdAt: Date;
        patientId: string;
        status: string;
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
        phone: string;
        createdAt: Date;
        patientId: string;
        status: string;
        type: string;
        message: string;
        sentAt: Date | null;
    })[]>;
    resendNotification(id: string): Promise<{
        error: string | null;
        id: string;
        phone: string;
        createdAt: Date;
        patientId: string;
        status: string;
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
        phone: string;
        createdAt: Date;
        patientId: string;
        status: string;
        type: string;
        message: string;
        sentAt: Date | null;
    }>;
}
