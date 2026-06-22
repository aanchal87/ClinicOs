export declare class DoctorController {
    getDashboardStats(doctorId: string): {
        stats: {
            todaysAppointments: number;
            monthlyAppointments: number;
            activePatients: number;
            followUpsDue: number;
            revenue: string;
        };
        appointments: {
            id: string;
            patientName: string;
            age: number;
            gender: string;
            time: string;
            type: string;
            status: string;
        }[];
    };
}
