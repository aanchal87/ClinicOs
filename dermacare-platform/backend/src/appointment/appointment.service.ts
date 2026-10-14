import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { QueueService } from '../queue/queue.service';
import { PatientService } from '../patient/patient.service';
import { AuditLogService } from '../common/audit-log/audit-log.service';

import { NotificationService } from '../notification/notification.service';

@Injectable()
export class AppointmentService {
  constructor(
    private prisma: PrismaService,
    private queueService: QueueService,
    private patientService: PatientService,
    private auditLogService: AuditLogService,
    private notificationService: NotificationService
  ) {}

  // Helper: Convert "09:00" to minutes (540)
  private timeToMinutes(t: string): number {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  }

  // Helper: Convert minutes (600) to "10:00 AM"
  private minutesToTime(m: number): string {
    const h = Math.floor(m / 60);
    const mins = m % 60;
    const period = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 === 0 ? 12 : h % 12;
    return `${displayH.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')} ${period}`;
  }

  // Helper: Normalize date format to YYYY-MM-DD
  private normalizeDate(dStr: string | null | undefined): string {
    if (!dStr) return new Date().toISOString().split('T')[0];
    
    // Check if YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(dStr)) {
      return dStr;
    }
    
    // Check if DD-MM-YYYY or DD/MM/YYYY
    const parts = dStr.split(/[-/]/);
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
      }
      if (parts[2].length === 4) {
        return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
    }
    
    try {
      const parsed = new Date(dStr);
      if (!isNaN(parsed.getTime())) {
        return parsed.toISOString().split('T')[0];
      }
    } catch (e) {}
    
    return dStr;
  }

  // Helper: Resolve Doctor and Clinic IDs from DB (Failsafe)
  private async resolveDoctorAndClinic(doctorId: string, clinicId: string, tx: any) {
    let resolvedDoctorId = doctorId || 'mock-doc-1';
    let resolvedClinicId = clinicId || 'default-clinic-id';

    // 1. Verify doctor
    let doc = await tx.doctor.findFirst({ where: { id: resolvedDoctorId } });
    if (!doc) {
      const firstDoc = await tx.doctor.findFirst();
      if (firstDoc) {
        resolvedDoctorId = firstDoc.id;
      } else {
        // Create a default doctor & user
        let user = await tx.user.findFirst({ where: { email: 'doctor@clinic.com' } });
        if (!user) {
          user = await tx.user.create({
            data: {
              email: 'doctor@clinic.com',
              passwordHash: '$2b$10$TqyG0Kj8Zt6B2iPqA0uE9O1s5n7r2w9y0x', // dummy hash
              role: 'DOCTOR',
            },
          });
        }
        doc = await tx.doctor.create({
          data: {
            id: resolvedDoctorId,
            userId: user.id,
            fullName: 'Dr. Sunita Sharma',
            mciNumber: 'MCI-87903',
            specializations: 'Dermatology',
            qualifications: 'MBBS, MD',
          },
        });
        resolvedDoctorId = doc.id;
      }
    }

    // 2. Verify clinic
    let clinic = await tx.clinic.findFirst({ where: { id: resolvedClinicId } });
    if (!clinic) {
      const firstClinic = await tx.clinic.findFirst({ where: { doctorId: resolvedDoctorId } });
      if (firstClinic) {
        resolvedClinicId = firstClinic.id;
      } else {
        clinic = await tx.clinic.create({
          data: {
            id: resolvedClinicId,
            doctorId: resolvedDoctorId,
            name: 'Sharma Skin Clinic',
            address: '102 Green Park Main Road',
            city: 'New Delhi',
            state: 'Delhi',
            pincode: '110016',
            workingHours: '09:00-17:00',
          },
        });
        resolvedClinicId = clinic.id;
      }
    }

    return { doctorId: resolvedDoctorId, clinicId: resolvedClinicId };
  }

  // 1. Save schedules for a clinic
  async saveSchedule(dto: any) {
    const { clinicId, schedules } = dto;

    return this.prisma.$transaction(async (tx) => {
      // Clear existing schedules
      await tx.clinicSchedule.deleteMany({
        where: { clinicId },
      });

      // Create new ones
      const created: any[] = [];
      for (const sched of schedules) {
        const item = await tx.clinicSchedule.create({
          data: {
            clinicId,
            dayOfWeek: parseInt(sched.dayOfWeek, 10),
            startTime: sched.startTime || '09:00',
            endTime: sched.endTime || '17:00',
            breakStartTime: sched.breakStartTime || '13:00',
            breakEndTime: sched.breakEndTime || '14:00',
            isActive: sched.isActive !== false,
          },
        });
        created.push(item);
      }
      return created;
    });
  }

  // 2. Get clinic schedule
  async getSchedule(clinicId: string) {
    let finalClinicId = clinicId;
    if (clinicId === 'default-clinic-id') {
      const clinic = await this.prisma.clinic.findFirst();
      if (clinic) finalClinicId = clinic.id;
    }
    return this.prisma.clinicSchedule.findMany({
      where: { clinicId: finalClinicId },
      orderBy: { dayOfWeek: 'asc' },
    });
  }

  // 3. Get available slots for a date
  async getAvailableSlots(clinicId: string, date: string) {
    let finalClinicId = clinicId;
    if (clinicId === 'default-clinic-id') {
      const clinic = await this.prisma.clinic.findFirst();
      if (clinic) finalClinicId = clinic.id;
    }

    const normDate = this.normalizeDate(date);
    const dateObj = new Date(normDate);
    const dayOfWeek = dateObj.getDay(); // 0 = Sunday, 1 = Monday, etc.

    // Find schedule for this day
    let schedule = await this.prisma.clinicSchedule.findFirst({
      where: {
        clinicId: finalClinicId,
        dayOfWeek,
        isActive: true,
      },
    });

    if (!schedule) {
      // Check if this clinic has any schedule config at all
      const count = await this.prisma.clinicSchedule.count({
        where: { clinicId: finalClinicId },
      });
      if (count === 0) {
        // Auto-seed default Monday-Friday working hours (9:00 to 17:00)
        await this.prisma.$transaction(async (tx) => {
          for (let day = 1; day <= 5; day++) {
            await tx.clinicSchedule.create({
              data: {
                clinicId: finalClinicId,
                dayOfWeek: day,
                startTime: '09:00',
                endTime: '17:00',
                breakStartTime: '13:00',
                breakEndTime: '14:00',
                isActive: true,
              },
            });
          }
        });
        // Try finding schedule again
        schedule = await this.prisma.clinicSchedule.findFirst({
          where: {
            clinicId: finalClinicId,
            dayOfWeek,
            isActive: true,
          },
        });
      }
    }

    if (!schedule) {
      // Return empty list if doctor is not working today
      return [];
    }

    // Generate all 15-minute slot times
    const startMins = this.timeToMinutes(schedule.startTime);
    const endMins = this.timeToMinutes(schedule.endTime);
    const breakStart = schedule.breakStartTime ? this.timeToMinutes(schedule.breakStartTime) : null;
    const breakEnd = schedule.breakEndTime ? this.timeToMinutes(schedule.breakEndTime) : null;

    const allSlots: string[] = [];
    for (let m = startMins; m < endMins; m += 15) {
      if (breakStart !== null && breakEnd !== null) {
        if (m >= breakStart && m < breakEnd) {
          continue; // skip break hours
        }
      }
      allSlots.push(this.minutesToTime(m));
    }

    // Find already booked slots on this date
    const bookedAppointments = await this.prisma.appointment.findMany({
      where: {
        clinicId: finalClinicId,
        date: normDate,
        status: { not: 'CANCELLED' },
      },
      select: { time: true },
    });

    const bookedTimes = new Set(bookedAppointments.map((app) => app.time));

    // Map slots to show availability
    return allSlots.map((timeStr) => ({
      time: timeStr,
      available: !bookedTimes.has(timeStr),
    }));
  }

  // 4. Book appointment (handles patient creation as well)
  async bookAppointment(dto: any, userPayload?: any) {
    const {
      clinicId,
      doctorId,
      date,
      time,
      type,
      fullName,
      phone,
      dateOfBirth,
      gender,
      notes,
    } = dto;

    const normDate = this.normalizeDate(date);
    const normDOB = this.normalizeDate(dateOfBirth);

    // Find or create patient using primary registration service
    let patient = await this.prisma.patient.findFirst({
      where: { phone },
    });

    if (!patient) {
      patient = await this.patientService.createPatient({
        fullName,
        phone,
        dateOfBirth: normDOB,
        gender,
      }, clinicId, userPayload);
    }

    // Run in transaction
    const appt = await this.prisma.$transaction(async (tx) => {
      // Resolve clinic and doctor failsafe
      const resolved = await this.resolveDoctorAndClinic(doctorId, clinicId, tx);

      // Verify slot is not already booked
      const existing = await tx.appointment.findFirst({
        where: {
          clinicId: resolved.clinicId,
          date: normDate,
          time,
          status: { not: 'CANCELLED' },
        },
      });

      if (existing) {
        throw new ConflictException('This slot is already booked.');
      }

      // Create appointment
      return tx.appointment.create({
        data: {
          clinicId: resolved.clinicId,
          doctorId: resolved.doctorId,
          patientId: patient!.id,
          date: normDate,
          time,
          type: type || 'Consultation',
          notes,
          status: 'PENDING',
        },
        include: {
          patient: true,
          clinic: true,
          doctor: true,
        },
      });
    });

    // Audit Log
    await this.auditLogService.log({
      userId: userPayload?.sub,
      role: userPayload?.role,
      action: 'APPOINTMENT_BOOKED',
      details: `Booked appointment ID "${appt.id}" for patient ID "${patient!.id}" on ${normDate} at ${time}`,
      metadata: { appointmentId: appt.id, patientId: patient!.id, clinicId: appt.clinicId },
    });

    // Trigger Priority Workflow: APPOINTMENT CONFIRMATION notification
    try {
      const doctorName = appt.doctor?.fullName || 'Doctor';
      const clinicName = appt.clinic?.name || 'ClinicOS';
      const patientName = appt.patient.fullName;
      const patientCustomId = appt.patient.patientCustomId || 'N/A';
      const apptDate = appt.date;
      const apptTime = appt.time;
      const apptType = appt.type;
      
      const messageText = `Appointment Booked Successfully\n\nPatient Name: ${patientName}\nPatient ID: ${patientCustomId}\nDoctor: ${doctorName}\nClinic Name: ${clinicName}\nDate: ${apptDate}\nTime: ${apptTime}\nType: ${apptType}`;
      
      await this.notificationService.sendWhatsApp(
        appt.patientId,
        appt.patient.phone,
        'APPOINTMENT_BOOKED',
        messageText,
        null,
        appt.clinicId
      );
    } catch (err: any) {
      console.error(`Failed to trigger appointment booking WhatsApp: ${err.message}`);
    }

    return appt;
  }

  // 5. List all appointments for doctor
  async listAppointments(doctorId: string, date?: string, clinicId?: string) {
    let finalDoctorId = doctorId;
    if (doctorId === 'mock-doc-1') {
      const firstDoc = await this.prisma.doctor.findFirst();
      if (firstDoc) finalDoctorId = firstDoc.id;
    }
    const filter: any = {};
    if (clinicId) {
      filter.clinicId = clinicId;
    }
    if (finalDoctorId && finalDoctorId !== 'all') {
      filter.doctorId = finalDoctorId;
    }
    if (date) {
      filter.date = this.normalizeDate(date);
    }

    return this.prisma.appointment.findMany({
      where: filter,
      include: {
        patient: true,
        clinic: true,
      },
      orderBy: [
        { date: 'asc' },
        { time: 'asc' },
      ],
    });
  }

  // 6. Update appointment status
  async updateStatus(id: string, status: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found.');
    }

    const updated = await this.prisma.appointment.update({
      where: { id },
      data: { status },
      include: {
        patient: true,
      },
    });

    if (status.toUpperCase() === 'NO_SHOW') {
      try {
        const clinic = await this.prisma.clinic.findFirst({
          where: { id: updated.clinicId || 'default-clinic-id' }
        });
        const clinicName = clinic?.name || 'ClinicOS';
        const messageText = `Missed Appointment Notice\n\nDear ${updated.patient.fullName},\nWe missed you for your scheduled appointment on ${updated.date} at ${updated.time} at ${clinicName}.\nPlease contact us to reschedule.`;
        
        await this.notificationService.sendWhatsApp(
          updated.patientId,
          updated.patient.phone,
          'MISSED_APPOINTMENT',
          messageText,
          null,
          updated.clinicId
        );
      } catch (err: any) {
        // Fallback
      }
    }

    return updated;
  }

  // 7. Check-in patient from scheduled appointment
  async checkIn(appointmentId: string, userPayload?: any) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: true,
        doctor: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (appointment.status === 'COMPLETED' || appointment.status === 'CANCELLED') {
      throw new ConflictException(`Cannot check in an appointment that is already ${appointment.status.toLowerCase()}`);
    }

    // Check if check-in has already occurred (Visit already exists)
    const existingVisit = await this.prisma.visit.findFirst({
      where: { appointmentId },
      include: { token: true }
    });

    if (existingVisit) {
      return {
        message: 'Already checked in',
        visit: existingVisit,
        token: existingVisit.token
      };
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Update appointment status to IN_PROGRESS
      const updatedApp = await tx.appointment.update({
        where: { id: appointmentId },
        data: { status: 'IN_PROGRESS' },
      });

      // 2. Count tokens in db to format token number
      const count = await tx.queueToken.count();
      const tokenNumber = `T-${String(count + 1).padStart(2, '0')}`;
      const checkInTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      // 3. Create Queue Token
      const token = await tx.queueToken.create({
        data: {
          tokenNumber,
          patientId: appointment.patientId,
          patientName: appointment.patient.fullName,
          priority: 'normal',
          visitReason: appointment.type || 'Consultation',
          doctorName: appointment.doctor.fullName || 'Dr. Adrian Vance',
          status: 'waiting',
          checkInTime,
          clinicId: appointment.clinicId,
        },
      });

      // 4. Create Visit
      const visit = await tx.visit.create({
        data: {
          patientId: appointment.patientId,
          appointmentId: appointment.id,
          tokenId: token.id,
          reason: appointment.type || 'Consultation',
          notes: 'Checked in from scheduled appointment',
          clinicId: appointment.clinicId,
        },
      });

      // 5. Log transitions
      await tx.tokenHistory.create({
        data: {
          tokenId: token.id,
          status: 'waiting',
          changedBy: 'Receptionist',
          notes: 'Checked in from appointment',
        }
      });

      await tx.queueEvent.create({
        data: {
          eventType: 'token_created',
          payload: JSON.stringify(token),
        }
      });

      return {
        visit,
        token,
      };
    }).then(async (result) => {
      // Audit Log
      await this.auditLogService.log({
        userId: userPayload?.sub,
        role: userPayload?.role,
        action: 'APPOINTMENT_CHECKED_IN',
        details: `Checked in patient ID "${appointment.patientId}" for appointment ID "${appointmentId}" (Token: ${result.token.tokenNumber})`,
        metadata: { appointmentId, patientId: appointment.patientId, tokenNumber: result.token.tokenNumber, clinicId: appointment.clinicId },
      });

      // Broadcast WebSocket update after transaction completes successfully
      this.queueService.broadcastUpdate('token_created', result.token);
      
      // Trigger Priority Workflow 2: TOKEN GENERATION
      try {
        const [queueCount, clinic, patient] = await Promise.all([
          this.prisma.queueToken.count({
            where: {
              clinicId: result.token.clinicId,
              status: { in: ['waiting', 'called', 'started'] },
              createdAt: { lte: result.token.createdAt }
            }
          }),
          this.prisma.clinic.findFirst({
            where: { id: result.token.clinicId || 'default-clinic-id' }
          }),
          this.prisma.patient.findUnique({
            where: { id: result.token.patientId }
          })
        ]);

        if (patient && patient.phone) {
          const clinicName = clinic?.name || 'ClinicOS';
          const messageText = `Token Issued Successfully\n\nToken Number: ${result.token.tokenNumber}\nQueue Position: ${queueCount}\nClinic Name: ${clinicName}`;
          
          await this.notificationService.sendWhatsApp(
            patient.id,
            patient.phone,
            'TOKEN_GENERATED',
            messageText,
            null,
            result.token.clinicId
          );
        }
      } catch (err: any) {
        // Fallback
      }

      return result;
    });
  }
}
