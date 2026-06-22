import { Injectable, NotFoundException, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { WhatsAppProvider } from './whatsapp.provider';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class NotificationService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(NotificationService.name);
  private schedulerInterval: NodeJS.Timeout | null = null;
  private lastRunDate: string | null = null;

  constructor(
    private prisma: PrismaService,
    private whatsappProvider: WhatsAppProvider
  ) {}

  onModuleInit() {
    this.logger.log('NotificationService initialized. Starting 9 AM local cron scheduler loop...');
    // Run local scheduler check every 1 minute
    this.schedulerInterval = setInterval(() => {
      this.checkAndRunFollowUpCron();
    }, 60 * 1000);
  }

  onModuleDestroy() {
    if (this.schedulerInterval) {
      clearInterval(this.schedulerInterval);
    }
  }

  /**
   * Periodically checks if it is 9:00 AM local time and runs the follow-up reminder job once a day.
   */
  private async checkAndRunFollowUpCron() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const todayStr = now.toISOString().split('T')[0];

    // Check if it is 9:00 AM (or shortly after, between 9:00 and 9:05) and hasn't run today
    if (hours === 9 && minutes >= 0 && minutes <= 5 && this.lastRunDate !== todayStr) {
      this.logger.log(`[Cron Trigger] Daily 9 AM scheduler triggered for date ${todayStr}`);
      this.lastRunDate = todayStr;
      try {
        await this.triggerDailyFollowUps(todayStr);
      } catch (err: any) {
        this.logger.error(`[Cron Trigger] Error running daily follow ups: ${err.message}`);
      }
    }
  }

  /**
   * Core logic to query follow-ups scheduled for the date and trigger reminders
   */
  async triggerDailyFollowUps(dateStr: string) {
    this.logger.log(`[Follow-Up Cron] Processing follow-ups scheduled for: ${dateStr}`);
    
    // Find all scheduled follow-ups for this date
    const followups = await this.prisma.followUp.findMany({
      where: {
        dueDate: dateStr,
        status: 'SCHEDULED',
      },
      include: {
        patient: true,
        doctor: true,
        clinic: true,
      },
    });

    this.logger.log(`[Follow-Up Cron] Found ${followups.length} scheduled follow-ups`);

    let sentCount = 0;
    for (const fu of followups) {
      try {
        const message = `Follow-Up Appointment Reminder\n\nDear ${fu.patient.fullName},\nThis is a reminder for your scheduled follow-up with ${fu.doctor.fullName} at ${fu.clinic?.name || 'ClinicOS'}.\nScheduled Date: ${fu.dueDate}.\nPlease contact us at ${fu.clinic?.contactNumber || ''} if you need to reschedule.`;
        
        // Log in new Notification log
        const notif = await this.prisma.notification.create({
          data: {
            patientId: fu.patientId,
            type: 'FOLLOWUP_REMINDER',
            status: 'PENDING',
            phone: fu.patient.phone,
            message,
          },
        });

        const result = await this.whatsappProvider.sendMessage(fu.patient.phone, message, null, fu.clinicId);

        if (result.success) {
          await this.prisma.notification.update({
            where: { id: notif.id },
            data: {
              status: 'SENT',
              sentAt: new Date(),
            },
          });

          await this.prisma.followUp.update({
            where: { id: fu.id },
            data: {
              status: 'REMINDER_SENT',
              reminderCount: fu.reminderCount + 1,
              lastRemindedAt: new Date(),
            },
          });
          sentCount++;
        } else {
          await this.prisma.notification.update({
            where: { id: notif.id },
            data: {
              status: 'FAILED',
              error: result.error,
            },
          });
        }
      } catch (err: any) {
        this.logger.error(`[Follow-Up Cron] Failed to send reminder for Follow-up ID ${fu.id}: ${err.message}`);
      }
    }

    return { processed: followups.length, sent: sentCount };
  }

  /**
   * Helper: Send a WhatsApp notification and save state to DB
   */
  async sendWhatsApp(
    patientId: string,
    phone: string,
    type: string,
    message: string,
    attachmentPath?: string | null,
    clinicId?: string | null
  ) {
    const notif = await this.prisma.notification.create({
      data: {
        patientId,
        type,
        status: 'PENDING',
        phone,
        message,
      },
    });

    try {
      const result = await this.whatsappProvider.sendMessage(phone, message, attachmentPath, clinicId);
      if (result.success) {
        return this.prisma.notification.update({
          where: { id: notif.id },
          data: {
            status: 'SENT',
            sentAt: new Date(),
          },
        });
      } else {
        return this.prisma.notification.update({
          where: { id: notif.id },
          data: {
            status: 'FAILED',
            error: result.error,
          },
        });
      }
    } catch (err: any) {
      return this.prisma.notification.update({
        where: { id: notif.id },
        data: {
          status: 'FAILED',
          error: err.message,
        },
      });
    }
  }

  // 1. Create a scheduled follow-up
  async createFollowUp(dto: any) {
    const {
      appointmentId,
      clinicId,
      doctorId,
      patientId,
      dueDate,
      reason,
      priority,
      notes,
    } = dto;

    return this.prisma.$transaction(async (tx) => {
      let resolvedClinicId = clinicId;
      let resolvedDoctorId = doctorId;

      if (!resolvedDoctorId) {
        const firstDoc = await tx.doctor.findFirst();
        if (firstDoc) resolvedDoctorId = firstDoc.id;
      }
      if (!resolvedClinicId) {
        const firstClinic = await tx.clinic.findFirst({ where: { doctorId: resolvedDoctorId } });
        if (firstClinic) {
          resolvedClinicId = firstClinic.id;
        } else {
          const anyClinic = await tx.clinic.findFirst();
          if (anyClinic) resolvedClinicId = anyClinic.id;
        }
      }

      // Create Follow Up
      const followup = await tx.followUp.create({
        data: {
          appointmentId: appointmentId || null,
          clinicId: resolvedClinicId,
          doctorId: resolvedDoctorId,
          patientId,
          dueDate: dueDate || new Date().toISOString(),
          reason: reason || 'Skin Check-up',
          priority: priority || 'ROUTINE',
          notes: notes || '',
          status: 'SCHEDULED',
        },
        include: {
          patient: true,
          doctor: true,
        },
      });

      return followup;
    });
  }

  // Get follow ups for a patient
  async getPatientFollowUps(patientId: string) {
    return this.prisma.followUp.findMany({
      where: { patientId },
      orderBy: { dueDate: 'asc' },
    });
  }

  // Get all follow ups (with patient details)
  async getAllFollowUps() {
    return this.prisma.followUp.findMany({
      include: {
        patient: true,
      },
      orderBy: { dueDate: 'asc' },
    });
  }

  // Get notification logs outbox
  async getOutboxLogs() {
    return this.prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        patient: {
          select: { fullName: true }
        }
      }
    });
  }

  // Resend a notification
  async resendNotification(id: string) {
    const notif = await this.prisma.notification.findUnique({
      where: { id },
      include: { patient: true }
    });
    if (!notif) {
      throw new NotFoundException('Notification not found');
    }

    // Reset status to PENDING
    await this.prisma.notification.update({
      where: { id },
      data: { status: 'PENDING', error: null },
    });

    let attachmentPath: string | null = null;
    if (notif.type === 'CONSULTATION_COMPLETED') {
      const prescription = await this.prisma.prescription.findFirst({
        where: { patientId: notif.patientId },
        orderBy: { createdAt: 'desc' }
      });
      if (prescription) {
        const uploadsDir = path.join(process.cwd(), 'uploads', 'prescriptions');
        const fileName = `prescription-${prescription.id}.pdf`;
        const filePath = path.join(uploadsDir, fileName);
        if (fs.existsSync(filePath)) {
          attachmentPath = filePath;
        }
      }
    }

    try {
      const result = await this.whatsappProvider.sendMessage(notif.phone, notif.message, attachmentPath, notif.patient.clinicId);
      if (result.success) {
        return this.prisma.notification.update({
          where: { id },
          data: {
            status: 'SENT',
            sentAt: new Date(),
          },
        });
      } else {
        return this.prisma.notification.update({
          where: { id },
          data: {
            status: 'FAILED',
            error: result.error,
          },
        });
      }
    } catch (err: any) {
      return this.prisma.notification.update({
        where: { id },
        data: {
          status: 'FAILED',
          error: err.message,
        },
      });
    }
  }

  async sendManualWhatsApp(patientId: string, message: string, clinicId?: string | null) {
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId }
    });
    if (!patient) {
      throw new NotFoundException('Patient not found');
    }
    return this.sendWhatsApp(
      patient.id,
      patient.phone,
      'MANUAL_DOCTOR_MSG',
      message,
      null,
      clinicId || patient.clinicId
    );
  }
}
