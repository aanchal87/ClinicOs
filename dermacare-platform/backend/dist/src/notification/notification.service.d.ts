import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { WhatsAppProvider } from './whatsapp.provider';
export declare class NotificationService implements OnModuleInit, OnModuleDestroy {
    private prisma;
    private whatsappProvider;
    private readonly logger;
    private schedulerInterval;
    private lastRunDate;
    constructor(prisma: PrismaService, whatsappProvider: WhatsAppProvider);
    onModuleInit(): void;
    onModuleDestroy(): void;
    private checkAndRunFollowUpCron;
    triggerDailyFollowUps(dateStr: string): Promise<{
        processed: number;
        sent: number;
    }>;
    sendWhatsApp(patientId: string, phone: string, type: string, message: string, attachmentPath?: string | null, clinicId?: string | null): Promise<{
        error: string | null;
        id: string;
<<<<<<< HEAD
        phone: string;
        createdAt: Date;
        patientId: string;
        status: string;
=======
        createdAt: Date;
        phone: string;
        status: string;
        patientId: string;
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
        type: string;
        message: string;
        sentAt: Date | null;
    }>;
    createFollowUp(dto: any): Promise<{
<<<<<<< HEAD
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
=======
        doctor: {
            id: string;
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            deletedAt: Date | null;
<<<<<<< HEAD
=======
            fullName: string;
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
            mciNumber: string;
            specializations: string;
            qualifications: string;
            experienceYears: number;
            consultationFee: number;
            approvalStatus: string;
            userId: string;
        };
<<<<<<< HEAD
=======
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
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        deletedAt: Date | null;
<<<<<<< HEAD
        clinicId: string;
        patientId: string;
        doctorId: string;
        reason: string | null;
        notes: string | null;
        status: string;
=======
        doctorId: string;
        clinicId: string;
        reason: string | null;
        notes: string | null;
        status: string;
        patientId: string;
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
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
<<<<<<< HEAD
        clinicId: string;
        patientId: string;
        doctorId: string;
        reason: string | null;
        notes: string | null;
        status: string;
=======
        doctorId: string;
        clinicId: string;
        reason: string | null;
        notes: string | null;
        status: string;
        patientId: string;
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
        appointmentId: string | null;
        priority: string;
        dueDate: string;
        reminderCount: number;
        lastRemindedAt: Date | null;
    }[]>;
    getAllFollowUps(): Promise<({
        patient: {
            id: string;
<<<<<<< HEAD
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
=======
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            deletedAt: Date | null;
<<<<<<< HEAD
            clinicId: string | null;
=======
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
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        deletedAt: Date | null;
<<<<<<< HEAD
        clinicId: string;
        patientId: string;
        doctorId: string;
        reason: string | null;
        notes: string | null;
        status: string;
=======
        doctorId: string;
        clinicId: string;
        reason: string | null;
        notes: string | null;
        status: string;
        patientId: string;
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
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
<<<<<<< HEAD
        phone: string;
        createdAt: Date;
        patientId: string;
        status: string;
=======
        createdAt: Date;
        phone: string;
        status: string;
        patientId: string;
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
        type: string;
        message: string;
        sentAt: Date | null;
    })[]>;
    resendNotification(id: string): Promise<{
        error: string | null;
        id: string;
<<<<<<< HEAD
        phone: string;
        createdAt: Date;
        patientId: string;
        status: string;
=======
        createdAt: Date;
        phone: string;
        status: string;
        patientId: string;
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
        type: string;
        message: string;
        sentAt: Date | null;
    }>;
    sendManualWhatsApp(patientId: string, message: string, clinicId?: string | null): Promise<{
        error: string | null;
        id: string;
<<<<<<< HEAD
        phone: string;
        createdAt: Date;
        patientId: string;
        status: string;
=======
        createdAt: Date;
        phone: string;
        status: string;
        patientId: string;
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
        type: string;
        message: string;
        sentAt: Date | null;
    }>;
}
