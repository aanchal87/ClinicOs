import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { QueueGateway } from './queue.gateway';
import { AuditLogService } from '../common/audit-log/audit-log.service';

import { NotificationService } from '../notification/notification.service';

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);

  constructor(
    private prisma: PrismaService,
    private queueGateway: QueueGateway,
    private auditLogService: AuditLogService,
    private notificationService: NotificationService
  ) {}

  async getTokens(clinicId?: string) {
    const list = await this.prisma.queueToken.findMany({
      where: clinicId ? { clinicId } : {},
    });
    
    // Sort priority: emergency -> urgent -> normal, then check-in date/time
    const priorityWeight = (p: string) => {
      switch (p?.toLowerCase()) {
        case 'emergency': return 1;
        case 'urgent': return 2;
        case 'normal':
        default: return 3;
      }
    };

    return list.sort((a, b) => {
      const pA = priorityWeight(a.priority);
      const pB = priorityWeight(b.priority);
      if (pA !== pB) return pA - pB;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  }

  async createToken(dto: any, clinicId?: string, userPayload?: any) {
    const { patientId, patientName, priority, visitReason, doctorName } = dto;
    const finalClinicId = clinicId || dto.clinicId || null;
    
    const count = await this.prisma.queueToken.count({
      where: finalClinicId ? { clinicId: finalClinicId } : {},
    });
    const tokenNumber = `T-${String(count + 1).padStart(2, '0')}`;
    const checkInTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return this.prisma.$transaction(async (tx) => {
      const token = await tx.queueToken.create({
        data: {
          tokenNumber,
          patientId,
          patientName,
          priority: priority || 'normal',
          visitReason,
          doctorName: doctorName || 'Dr. Adrian Vance',
          status: 'waiting',
          checkInTime,
          clinicId: finalClinicId,
        },
      });

      await tx.visit.create({
        data: {
          patientId,
          tokenId: token.id,
          reason: visitReason || 'Walk-in Consultation',
          notes: 'Checked in as walk-in patient',
          clinicId: finalClinicId,
        },
      });

      await tx.tokenHistory.create({
        data: {
          tokenId: token.id,
          status: 'waiting',
          changedBy: userPayload?.role || 'Receptionist',
          notes: 'Walk-in check-in token issued',
        }
      });

      await tx.queueEvent.create({
        data: {
          eventType: 'token_created',
          payload: JSON.stringify(token),
        }
      });

      return token;
    }).then(async (token) => {
      // Audit Log (executed outside the transaction)
      await this.auditLogService.log({
        userId: userPayload?.sub,
        role: userPayload?.role,
        action: 'APPOINTMENT_CHECK_IN',
        details: `Created walk-in token ${token.tokenNumber} for patient ${token.patientName}`,
        metadata: { tokenId: token.id, patientId: token.patientId, tokenNumber: token.tokenNumber, clinicId: token.clinicId },
      });

      this.queueGateway.broadcastQueueUpdate('token_created', token);
      
      // Trigger Priority Workflow 2: TOKEN GENERATION
      try {
        const [queueCount, clinic, patient] = await Promise.all([
          this.prisma.queueToken.count({
            where: {
              clinicId: token.clinicId,
              status: { in: ['waiting', 'called', 'started'] },
              createdAt: { lte: token.createdAt }
            }
          }),
          this.prisma.clinic.findFirst({
            where: { id: token.clinicId || 'default-clinic-id' }
          }),
          this.prisma.patient.findUnique({
            where: { id: token.patientId }
          })
        ]);

        if (patient && patient.phone) {
          const clinicName = clinic?.name || 'ClinicOS';
          const messageText = `Token Issued Successfully\n\nToken Number: ${token.tokenNumber}\nQueue Position: ${queueCount}\nClinic Name: ${clinicName}`;
          
          await this.notificationService.sendWhatsApp(
            patient.id,
            patient.phone,
            'TOKEN_GENERATED',
            messageText,
            null,
            token.clinicId
          );
        }
      } catch (err: any) {
        this.logger.error(`Failed to trigger queue token WhatsApp: ${err.message}`);
      }

      return token;
    });
  }

  async updateTokenStatus(tokenId: string, status: string, clinicId?: string, userPayload?: any) {
    const token = await this.prisma.queueToken.findUnique({
      where: { id: tokenId },
    });

    if (!token || (clinicId && token.clinicId !== clinicId)) {
      throw new NotFoundException('Token not found');
    }

    let targetStatus = status;
    if (status === 'recalled') {
      targetStatus = 'waiting';
    }

    const data: any = { status: targetStatus };
    if (status === 'started') {
      data.startTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (status === 'completed') {
      data.endTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    const updatedToken = await this.prisma.queueToken.update({
      where: { id: tokenId },
      data,
    });

    // Write audit log inside history table
    await this.prisma.tokenHistory.create({
      data: {
        tokenId,
        status, 
        changedBy: userPayload?.role || 'Staff',
        notes: `Token status transitioned to ${status}`,
      }
    });

    await this.prisma.queueEvent.create({
      data: {
        eventType: status === 'recalled' ? 'token_recalled' : `token_${status}`,
        payload: JSON.stringify(updatedToken),
      }
    });

    // Audit Log in system audit trails
    await this.auditLogService.log({
      userId: userPayload?.sub,
      role: userPayload?.role,
      action: 'QUEUE_STATUS_UPDATED',
      details: `Transitioned queue token ${token.tokenNumber} to ${status}`,
      metadata: { tokenId, status, clinicId: token.clinicId },
    });

    // Broadcast Socket update
    let eventName = '';
    if (status === 'called') eventName = 'token_called';
    else if (status === 'started') eventName = 'consultation_started';
    else if (status === 'completed') eventName = 'consultation_completed';
    else if (status === 'missed') eventName = 'token_missed';
    else if (status === 'skipped') eventName = 'token_skipped';
    else if (status === 'cancelled') eventName = 'token_cancelled';
    else if (status === 'recalled') eventName = 'token_recalled';
    else if (status === 'waiting') eventName = 'token_created';

    if (eventName) {
      this.queueGateway.broadcastQueueUpdate(eventName, updatedToken);
    }

    return updatedToken;
  }

  broadcastUpdate(eventName: string, data: any) {
    this.queueGateway.broadcastQueueUpdate(eventName, data);
  }
}
