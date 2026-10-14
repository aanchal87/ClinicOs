import { PrismaService } from '../prisma.service';
export declare class ReportsService {
    private prisma;
    constructor(prisma: PrismaService);
    getReportsData(clinicId?: string): Promise<{
        patientsToday: number;
        patientsThisWeek: number;
        patientsThisMonth: number;
        averageWaitTime: number;
        longestWaitTime: number;
        followUpConversion: number;
        doctorPerformance: {
            doctorName: string;
            consultationsCount: number;
        }[];
        topDiagnoses: {
            name: string;
            count: number;
        }[];
        topPrescribedMedicines: {
            name: string;
            count: number;
        }[];
        treatmentCompletionRate: number;
    }>;
}
