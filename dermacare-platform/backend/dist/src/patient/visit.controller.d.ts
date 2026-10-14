import { PatientService } from './patient.service';
export declare class VisitController {
    private patientService;
    constructor(patientService: PatientService);
    closeVisit(id: string): Promise<{
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
    }>;
}
