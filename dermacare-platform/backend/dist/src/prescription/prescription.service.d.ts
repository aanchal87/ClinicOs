import { PrismaService } from '../prisma.service';
import { AuditLogService } from '../common/audit-log/audit-log.service';
import { NotificationService } from '../notification/notification.service';
export declare class PrescriptionService {
    private prisma;
    private auditLogService;
    private notificationService;
    constructor(prisma: PrismaService, auditLogService: AuditLogService, notificationService: NotificationService);
    createPrescription(dto: any, clinicId?: string, userPayload?: any): Promise<({
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
        clinic: {
            id: string;
            address: string;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            deletedAt: Date | null;
            name: string;
            city: string;
            state: string;
            pincode: string;
            contactNumber: string | null;
            workingHours: string;
            doctorId: string;
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
        clinic: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            deletedAt: Date | null;
            address: string;
            city: string;
            state: string;
            pincode: string;
            contactNumber: string | null;
            workingHours: string;
            doctorId: string;
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
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
        items: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            deletedAt: Date | null;
            prescriptionId: string;
            drugName: string;
            drugCategory: string;
            strength: string | null;
            dosageForm: string | null;
            dose: string;
            frequency: string;
            duration: string;
            instructions: string | null;
        }[];
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
=======
        doctorId: string;
        clinicId: string;
        patientId: string;
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
        advice: string | null;
        medicalRecordId: string | null;
    }) | null>;
    getPatientPrescriptions(patientId: string, clinicId?: string): Promise<({
<<<<<<< HEAD
        clinic: {
            id: string;
            address: string;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            deletedAt: Date | null;
            name: string;
            city: string;
            state: string;
            pincode: string;
            contactNumber: string | null;
            workingHours: string;
            doctorId: string;
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
        clinic: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            deletedAt: Date | null;
            address: string;
            city: string;
            state: string;
            pincode: string;
            contactNumber: string | null;
            workingHours: string;
            doctorId: string;
        };
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
        items: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            deletedAt: Date | null;
            prescriptionId: string;
            drugName: string;
            drugCategory: string;
            strength: string | null;
            dosageForm: string | null;
            dose: string;
            frequency: string;
            duration: string;
            instructions: string | null;
        }[];
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
=======
        doctorId: string;
        clinicId: string;
        patientId: string;
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
        advice: string | null;
        medicalRecordId: string | null;
    })[]>;
    getPrescriptionDetails(prescriptionId: string, clinicId?: string): Promise<{
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
        clinic: {
            id: string;
            address: string;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            deletedAt: Date | null;
            name: string;
            city: string;
            state: string;
            pincode: string;
            contactNumber: string | null;
            workingHours: string;
            doctorId: string;
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
        clinic: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            deletedAt: Date | null;
            address: string;
            city: string;
            state: string;
            pincode: string;
            contactNumber: string | null;
            workingHours: string;
            doctorId: string;
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
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
        medicalRecord: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            deletedAt: Date | null;
<<<<<<< HEAD
            clinicId: string;
            patientId: string;
            doctorId: string;
=======
            doctorId: string;
            clinicId: string;
            patientId: string;
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
            appointmentId: string | null;
            chiefComplaint: string;
            historyOfPresent: string | null;
            examinationFindings: string | null;
            diagnosis: string;
            treatmentPlan: string;
            skinType: string | null;
            lesionType: string | null;
            bodyArea: string | null;
            visitId: string | null;
        } | null;
        items: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            deletedAt: Date | null;
            prescriptionId: string;
            drugName: string;
            drugCategory: string;
            strength: string | null;
            dosageForm: string | null;
            dose: string;
            frequency: string;
            duration: string;
            instructions: string | null;
        }[];
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
=======
        doctorId: string;
        clinicId: string;
        patientId: string;
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
        advice: string | null;
        medicalRecordId: string | null;
    }>;
}
