import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class FollowUpService {
  constructor(private prisma: PrismaService) {}

  async getFollowUps(doctorId?: string, clinicId?: string) {
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

    return this.prisma.followUp.findMany({
      where: filter,
      include: {
        patient: true,
      },
      orderBy: { dueDate: 'asc' },
    });
  }

  async getPatientFollowUps(patientId: string, clinicId?: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId }
    });
    if (!patient || (clinicId && patient.clinicId !== clinicId)) {
      throw new NotFoundException('Patient not found');
    }

    return this.prisma.followUp.findMany({
      where: { patientId },
      orderBy: { dueDate: 'desc' },
    });
  }

  async createFollowUp(dto: any, clinicId?: string) {
    const { patientId, dueDate, reason, priority, doctorId } = dto;
    
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId }
    });
    if (!patient || (clinicId && patient.clinicId !== clinicId)) {
      throw new NotFoundException('Patient not found');
    }

    let finalDoctorId = doctorId || 'mock-doc-1';
    const firstDoc = await this.prisma.doctor.findFirst();
    if (firstDoc) finalDoctorId = firstDoc.id;
    
    const finalClinicId = clinicId || dto.clinicId || patient.clinicId || 'default-clinic-id';

    return this.prisma.followUp.create({
      data: {
        patientId,
        dueDate,
        reason: reason || '',
        priority: priority || 'ROUTINE',
        status: 'SCHEDULED',
        doctorId: finalDoctorId,
        clinicId: finalClinicId,
      },
      include: {
        patient: true,
      },
    });
  }

  async updateFollowUpStatus(id: string, status: string, clinicId?: string) {
    const followup = await this.prisma.followUp.findUnique({
      where: { id },
    });
    if (!followup || (clinicId && followup.clinicId !== clinicId)) {
      throw new NotFoundException('Follow-up not found');
    }
    return this.prisma.followUp.update({
      where: { id },
      data: { status },
      include: {
        patient: true,
      },
    });
  }
}
