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
        patientId: string;
        status: string;
        notes: string | null;
        appointmentId: string | null;
        reason: string | null;
        tokenId: string | null;
        closedAt: Date | null;
    }>;
}
