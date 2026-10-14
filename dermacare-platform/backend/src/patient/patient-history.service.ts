import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PatientHistoryService {
  constructor(private prisma: PrismaService) {}

  private mapPatient(patient: any) {
    if (!patient) return null;
    return {
      ...patient,
      name: patient.fullName,
      dob: patient.dateOfBirth,
      aadhaar: patient.aadhaarMasked || null,
      allergies: patient.allergies ? patient.allergies.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
      medicalConditions: patient.medicalConditions ? patient.medicalConditions.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
    };
  }

  async getPatientHistory(patientId: string, clinicId?: string) {
    const patientRecord = await this.prisma.patient.findUnique({
      where: { id: patientId }
    });

    if (!patientRecord || (clinicId && patientRecord.clinicId !== clinicId)) {
      throw new NotFoundException(`Patient with ID ${patientId} not found`);
    }

    const patient = this.mapPatient(patientRecord);

    const visits = await this.prisma.visit.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
      include: {
        appointment: true,
        token: true,
      }
    });

    const consultations = await this.prisma.medicalRecord.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
      include: {
        photos: true,
        appointment: true,
        prescription: {
          include: {
            items: true
          }
        },
        labReports: true,
      }
    });

    const prescriptions = await this.prisma.prescription.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: true
      }
    });

    const labReports = await this.prisma.labReport.findMany({
      where: {
        medicalRecord: {
          patientId
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const followUps = await this.prisma.followUp.findMany({
      where: { patientId },
      orderBy: { dueDate: 'desc' }
    });

    const documents = await this.prisma.document.findMany({
      where: { patientId },
      orderBy: { createdAtDb: 'desc' }
    });

    const treatmentImages = await this.prisma.clinicalPhoto.findMany({
      where: { patientId },
      orderBy: { takenAt: 'desc' }
    });

    const tokenHistory = await this.prisma.queueToken.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' }
    });

    return {
      patient,
      visits,
      consultations,
      prescriptions,
      labReports,
      followUps,
      documents,
      treatmentImages,
      tokenHistory
    };
  }
}
