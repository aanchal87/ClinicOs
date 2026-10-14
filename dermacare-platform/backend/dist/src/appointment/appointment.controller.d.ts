import { AppointmentService } from './appointment.service';
export declare class AppointmentController {
    private appointmentService;
    constructor(appointmentService: AppointmentService);
    saveSchedule(dto: any): Promise<any[]>;
    getSchedule(clinicId: string, req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        deletedAt: Date | null;
<<<<<<< HEAD
        clinicId: string;
=======
        isActive: boolean;
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
        dayOfWeek: number;
        startTime: string;
        endTime: string;
        breakStartTime: string | null;
        breakEndTime: string | null;
<<<<<<< HEAD
        isActive: boolean;
=======
        clinicId: string;
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
    }[]>;
    getSlots(clinicId: string, date: string, req: any): Promise<{
        time: string;
        available: boolean;
    }[]>;
    book(dto: any, req: any): Promise<{
<<<<<<< HEAD
        clinic: {
            id: string;
            address: string;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            deletedAt: Date | null;
            name: string;
            doctorId: string;
            city: string;
            state: string;
            pincode: string;
            contactNumber: string | null;
            workingHours: string;
        };
        patient: {
            id: string;
            patientCustomId: string | null;
            aadhaarHash: string | null;
            aadhaarEncrypted: string | null;
            aadhaarMasked: string | null;
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
            userId: string;
=======
            fullName: string;
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
            mciNumber: string;
            specializations: string;
            qualifications: string;
            experienceYears: number;
            consultationFee: number;
            approvalStatus: string;
<<<<<<< HEAD
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        deletedAt: Date | null;
        clinicId: string;
        time: string;
        date: string;
        doctorId: string;
        patientId: string;
        type: string;
        status: string;
        notes: string | null;
    }>;
    list(doctorId: string, date: string, req: any): Promise<({
        clinic: {
            id: string;
            address: string;
=======
            userId: string;
        };
        clinic: {
            id: string;
            name: string;
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            deletedAt: Date | null;
<<<<<<< HEAD
            name: string;
            doctorId: string;
=======
            address: string;
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
            city: string;
            state: string;
            pincode: string;
            contactNumber: string | null;
            workingHours: string;
<<<<<<< HEAD
        };
        patient: {
            id: string;
            patientCustomId: string | null;
            aadhaarHash: string | null;
            aadhaarEncrypted: string | null;
            aadhaarMasked: string | null;
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
            doctorId: string;
        };
        patient: {
            id: string;
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
        time: string;
        date: string;
        doctorId: string;
        patientId: string;
        type: string;
        status: string;
        notes: string | null;
=======
        doctorId: string;
        clinicId: string;
        notes: string | null;
        status: string;
        patientId: string;
        date: string;
        time: string;
        type: string;
    }>;
    list(doctorId: string, date: string, req: any): Promise<({
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
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        deletedAt: Date | null;
        doctorId: string;
        clinicId: string;
        notes: string | null;
        status: string;
        patientId: string;
        date: string;
        time: string;
        type: string;
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
    })[]>;
    updateStatus(id: string, status: string): Promise<{
        patient: {
            id: string;
<<<<<<< HEAD
            patientCustomId: string | null;
            aadhaarHash: string | null;
            aadhaarEncrypted: string | null;
            aadhaarMasked: string | null;
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
        time: string;
        date: string;
        doctorId: string;
        patientId: string;
        type: string;
        status: string;
        notes: string | null;
=======
        doctorId: string;
        clinicId: string;
        notes: string | null;
        status: string;
        patientId: string;
        date: string;
        time: string;
        type: string;
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
    }>;
    checkIn(id: string, req: any): Promise<{
        visit: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            deletedAt: Date | null;
            clinicId: string | null;
<<<<<<< HEAD
            patientId: string;
            status: string;
            notes: string | null;
            appointmentId: string | null;
            reason: string | null;
            tokenId: string | null;
            closedAt: Date | null;
=======
            reason: string | null;
            notes: string | null;
            status: string;
            closedAt: Date | null;
            patientId: string;
            appointmentId: string | null;
            tokenId: string | null;
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
        };
        token: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            deletedAt: Date | null;
<<<<<<< HEAD
            clinicId: string | null;
            patientId: string;
            status: string;
            priority: string;
            startTime: string | null;
            endTime: string | null;
            tokenNumber: string;
            patientName: string;
=======
            startTime: string | null;
            endTime: string | null;
            clinicId: string | null;
            status: string;
            patientId: string;
            tokenNumber: string;
            patientName: string;
            priority: string;
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
            visitReason: string;
            doctorName: string;
            checkInTime: string;
        };
    } | {
        message: string;
        visit: {
            token: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                createdBy: string | null;
                deletedAt: Date | null;
<<<<<<< HEAD
                clinicId: string | null;
                patientId: string;
                status: string;
                priority: string;
                startTime: string | null;
                endTime: string | null;
                tokenNumber: string;
                patientName: string;
=======
                startTime: string | null;
                endTime: string | null;
                clinicId: string | null;
                status: string;
                patientId: string;
                tokenNumber: string;
                patientName: string;
                priority: string;
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
                visitReason: string;
                doctorName: string;
                checkInTime: string;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            deletedAt: Date | null;
            clinicId: string | null;
<<<<<<< HEAD
            patientId: string;
            status: string;
            notes: string | null;
            appointmentId: string | null;
            reason: string | null;
            tokenId: string | null;
            closedAt: Date | null;
=======
            reason: string | null;
            notes: string | null;
            status: string;
            closedAt: Date | null;
            patientId: string;
            appointmentId: string | null;
            tokenId: string | null;
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
        };
        token: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            deletedAt: Date | null;
<<<<<<< HEAD
            clinicId: string | null;
            patientId: string;
            status: string;
            priority: string;
            startTime: string | null;
            endTime: string | null;
            tokenNumber: string;
            patientName: string;
=======
            startTime: string | null;
            endTime: string | null;
            clinicId: string | null;
            status: string;
            patientId: string;
            tokenNumber: string;
            patientName: string;
            priority: string;
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
            visitReason: string;
            doctorName: string;
            checkInTime: string;
        } | null;
    }>;
}
