import { PrismaService } from '../prisma.service';
export declare class FollowUpService {
    private prisma;
    constructor(prisma: PrismaService);
    getFollowUps(doctorId?: string, clinicId?: string): Promise<({
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
    getPatientFollowUps(patientId: string, clinicId?: string): Promise<{
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
    createFollowUp(dto: any, clinicId?: string): Promise<{
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
    }>;
    updateFollowUpStatus(id: string, status: string, clinicId?: string): Promise<{
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
    }>;
}
