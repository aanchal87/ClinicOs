import { Controller, Get, Query } from '@nestjs/common';

@Controller('doctor')
export class DoctorController {
  @Get('dashboard')
  getDashboardStats(@Query('doctorId') doctorId: string) {
    // Standard response for Dr. Sharma's dashboard with stats and today's schedule
    return {
      stats: {
        todaysAppointments: 4,
        monthlyAppointments: 48,
        activePatients: 36,
        followUpsDue: 8,
        revenue: '₹24,500',
      },
      appointments: [
        {
          id: '1',
          patientName: 'Rohan Gupta',
          age: 24,
          gender: 'Male',
          time: '10:00 AM',
          type: 'Acne Consultation',
          status: 'Confirmed',
        },
        {
          id: '2',
          patientName: 'Priya Sharma',
          age: 29,
          gender: 'Female',
          time: '11:30 AM',
          type: 'Chemical Peel Follow-Up',
          status: 'In Progress',
        },
        {
          id: '3',
          patientName: 'Amit Verma',
          age: 35,
          gender: 'Male',
          time: '02:00 PM',
          type: 'Hair Loss Treatment',
          status: 'Pending',
        },
        {
          id: '4',
          patientName: 'Sanya Malhotra',
          age: 27,
          gender: 'Female',
          time: '04:30 PM',
          type: 'Laser Therapy Session',
          status: 'Pending',
        },
      ],
    };
  }
}
