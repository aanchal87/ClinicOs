import { ReportsService } from './reports.service';
export declare class ReportsController {
    private reportsService;
    constructor(reportsService: ReportsService);
    getReports(clinicId: string, req: any): Promise<{
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
