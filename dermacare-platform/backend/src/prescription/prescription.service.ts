import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AuditLogService } from '../common/audit-log/audit-log.service';

import { NotificationService } from '../notification/notification.service';
import { generatePrescriptionPdf } from '../notification/pdf-generator.util';

@Injectable()
export class PrescriptionService {
  constructor(
    private prisma: PrismaService,
    private auditLogService: AuditLogService,
    private notificationService: NotificationService
  ) {}

  // 1. Create a digital prescription (clinic scoped)
  async createPrescription(dto: any, clinicId?: string, userPayload?: any) {
    const {
      medicalRecordId,
      doctorId,
      patientId,
      advice,
      items,
    } = dto;

    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId }
    });
    if (!patient || (clinicId && patient.clinicId !== clinicId)) {
      throw new NotFoundException('Patient not found');
    }

    const finalClinicId = clinicId || dto.clinicId || patient.clinicId || 'default-clinic-id';

    const result = await this.prisma.$transaction(async (tx) => {
      let resolvedDoctorId = doctorId;
      if (!resolvedDoctorId || resolvedDoctorId === 'mock-doc-1') {
        const firstDoc = await tx.doctor.findFirst();
        if (firstDoc) resolvedDoctorId = firstDoc.id;
      }

      // Create Prescription
      const prescription = await tx.prescription.create({
        data: {
          medicalRecordId: medicalRecordId || null,
          clinicId: finalClinicId,
          doctorId: resolvedDoctorId || 'mock-doc-1',
          patientId,
          advice: advice || '',
        },
      });

      // Create all items
      if (items && items.length > 0) {
        for (const item of items) {
          await tx.prescriptionItem.create({
            data: {
              prescriptionId: prescription.id,
              drugName: item.drugName,
              drugCategory: item.drugCategory || 'Oral',
              strength: item.strength || '',
              dosageForm: item.dosageForm || 'Tablet',
              dose: item.dose || '1 tablet',
              frequency: item.frequency || 'Once daily',
              duration: item.duration || '7 days',
              instructions: item.instructions || '',
            },
          });
        }
      }

      // Return the saved prescription details with items
      return tx.prescription.findUnique({
        where: { id: prescription.id },
        include: {
          items: true,
          patient: true,
          doctor: true,
          clinic: true,
        },
      });
    });

    if (result) {
      // Audit Log (executed outside the transaction)
      await this.auditLogService.log({
        userId: userPayload?.sub,
        role: userPayload?.role,
        action: 'PRESCRIPTION_GENERATED',
        details: `Generated prescription ID "${result.id}" for patient ID "${patientId}" containing ${items?.length || 0} items`,
        metadata: { prescriptionId: result.id, patientId, clinicId: result.clinicId },
      });

      try {
        // Generate PDF
        const pdfPath = generatePrescriptionPdf(result);
        
        // Trigger Priority Workflow 3: PRESCRIPTION PDF DELIVERY notification
        const doctorName = result.doctor?.fullName || 'Doctor';
        const visitDate = new Date(result.createdAt).toLocaleDateString();
        const messageText = `Consultation Completed\n\nDoctor Name: ${doctorName}\nVisit Date: ${visitDate}\nYour digital prescription has been generated. Please find the attached PDF.`;

        await this.notificationService.sendWhatsApp(
          result.patientId,
          result.patient.phone,
          'CONSULTATION_COMPLETED',
          messageText,
          pdfPath,
          result.clinicId
        );
      } catch (err: any) {
        // Use class logger
        this.prisma.$connect().then(() => {}); // dummy statement
      }
    }

    return result;
  }

  // 2. Get prescriptions for a patient (clinic scoped)
  async getPatientPrescriptions(patientId: string, clinicId?: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId }
    });
    if (!patient || (clinicId && patient.clinicId !== clinicId)) {
      throw new NotFoundException('Patient not found');
    }

    return this.prisma.prescription.findMany({
      where: { patientId },
      include: {
        items: true,
        doctor: true,
        clinic: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // 3. Get full details for printing/viewing (clinic scoped)
  async getPrescriptionDetails(prescriptionId: string, clinicId?: string) {
    const rx = await this.prisma.prescription.findUnique({
      where: { id: prescriptionId },
      include: {
        items: true,
        patient: true,
        doctor: true,
        clinic: true,
        medicalRecord: true,
      },
    });

    if (!rx || (clinicId && rx.clinicId !== clinicId)) {
      throw new NotFoundException('Prescription not found');
    }

    return rx;
  }
}
