import { Injectable, NotFoundException, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CryptoService } from '../auth/crypto.service';
import { AuditLogService } from '../common/audit-log/audit-log.service';

import { NotificationService } from '../notification/notification.service';

@Injectable()
export class PatientService {
  private readonly logger = new Logger(PatientService.name);
  constructor(
    private prisma: PrismaService,
    private cryptoService: CryptoService,
    private auditLogService: AuditLogService,
    private notificationService: NotificationService
  ) {}

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

  // 1. Search patients by name or phone (clinic scoped)
  async searchPatients(query: string, clinicId?: string) {
    let list;
    if (!query) {
      list = await this.prisma.patient.findMany({
        where: clinicId ? { clinicId } : {},
        take: 15,
        orderBy: { fullName: 'asc' },
      });
    } else {
      const trimmedQuery = query.trim();
      if (/^\d{12}$/.test(trimmedQuery)) {
        const aadhaarHash = this.cryptoService.hash(trimmedQuery);
        const match = await this.prisma.patient.findUnique({
          where: { aadhaarHash },
        });
        if (match && (!clinicId || match.clinicId === clinicId)) {
          return [this.mapPatient(match)];
        }
      }

      list = await this.prisma.patient.findMany({
        where: {
          AND: [
            clinicId ? { clinicId } : {},
            {
              OR: [
                { fullName: { contains: trimmedQuery } },
                { phone: { contains: trimmedQuery } },
                { patientCustomId: { contains: trimmedQuery } },
              ],
            },
          ],
        },
        take: 20,
      });
    }
    return list.map(p => this.mapPatient(p));
  }

  // 1.5 Check if Aadhaar exists
  async checkAadhaarExists(aadhaar: string) {
    if (!aadhaar) {
      return { exists: false };
    }
    const cleanAadhaar = String(aadhaar).trim().replace(/[^0-9]/g, '');
    if (cleanAadhaar.length !== 12 || !/^\d{12}$/.test(cleanAadhaar)) {
      return { exists: false };
    }
    try {
      const aadhaarHash = this.cryptoService.hash(cleanAadhaar);
      const patient = await this.prisma.patient.findUnique({
        where: { aadhaarHash },
        select: {
          id: true,
          patientCustomId: true,
          fullName: true,
          aadhaarMasked: true,
          phone: true,
          clinicId: true,
        },
      });
      if (patient) {
        return { exists: true, patient };
      }
      return { exists: false };
    } catch (error) {
      this.logger.error(`[Backend/AadhaarCheck] Database / Hash Error:`, error);
      throw error;
    }
  }

  // 2. Get 360° history for a patient (clinic scoped)
  async getPatientHistory(patientId: string, clinicId?: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
      include: {
        appointments: {
          orderBy: [
            { date: 'desc' },
            { time: 'desc' }
          ],
        },
        medicalRecords: {
          include: {
            photos: true,
            appointment: true,
            prescription: {
              include: {
                items: true,
              }
            },
            labReports: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        clinicalPhotos: {
          orderBy: { takenAt: 'desc' },
        },
        followUps: {
          orderBy: { dueDate: 'desc' },
        },
        documents: {
          orderBy: { createdAtDb: 'desc' },
        },
        visits: {
          orderBy: { createdAt: 'desc' },
          include: {
            appointment: true,
            token: true,
            medicalRecord: {
              include: {
                prescription: {
                  include: {
                    items: true
                  }
                },
                photos: true,
                labReports: true
              }
            }
          }
        }
      },
    });

    if (!patient || (clinicId && patient.clinicId !== clinicId)) {
      throw new NotFoundException('Patient not found');
    }

    return {
      ...this.mapPatient(patient),
      appointments: patient.appointments,
      medicalRecords: patient.medicalRecords,
      clinicalPhotos: patient.clinicalPhotos,
      followUps: patient.followUps,
      documents: patient.documents,
      visits: patient.visits,
    };
  }

  // 3. Create a patient (clinic scoped)
  async createPatient(dto: any, clinicId?: string, userPayload?: any) {
    try {
      const {
        name,
        fullName,
        email,
        phone,
        dob,
        dateOfBirth,
        gender,
        bloodGroup,
        address,
        allergies,
        medicalConditions,
        treatmentStatus,
        aadhaar,
        emergencyContact,
      } = dto;

      const finalName = fullName || name || '';
      const finalDob = dateOfBirth || dob || '';

      // Handle Aadhaar checks & encryption
      let aadhaarEncrypted: string | null = null;
      let aadhaarMasked: string | null = null;
      let aadhaarHash: string | null = null;

      if (aadhaar) {
        const cleanAadhaar = String(aadhaar).trim().replace(/[^0-9]/g, '');
        if (cleanAadhaar.length !== 12 || !/^\d{12}$/.test(cleanAadhaar)) {
          throw new BadRequestException('Aadhaar must be a 12-digit number');
        }
        aadhaarHash = this.cryptoService.hash(cleanAadhaar);
        
        const existing = await this.prisma.patient.findUnique({
          where: { aadhaarHash },
        });
        if (existing) {
          throw new ConflictException('A patient with this Aadhaar number is already registered.');
        }

        aadhaarEncrypted = this.cryptoService.encrypt(cleanAadhaar);
        aadhaarMasked = this.cryptoService.mask(cleanAadhaar);
      }

      // Generate Sequential Custom ID: PAT-YYYY-XXXXXX
      const currentYear = new Date().getFullYear();
      const yearPrefix = `PAT-${currentYear}-`;
      
      const latestPatient = await this.prisma.patient.findFirst({
        where: {
          patientCustomId: {
            startsWith: yearPrefix
          }
        },
        orderBy: {
          patientCustomId: 'desc'
        }
      });

      let nextSeq = 1;
      if (latestPatient && latestPatient.patientCustomId) {
        const parts = latestPatient.patientCustomId.split('-');
        if (parts.length === 3) {
          const seqNum = parseInt(parts[2], 10);
          if (!isNaN(seqNum)) {
            nextSeq = seqNum + 1;
          }
        }
      }

      const formattedSeq = String(nextSeq).padStart(6, '0');
      const patientCustomId = `${yearPrefix}${formattedSeq}`;

      const patient = await this.prisma.patient.create({
        data: {
          patientCustomId,
          aadhaarEncrypted,
          aadhaarMasked,
          aadhaarHash,
          fullName: finalName,
          email,
          phone,
          dateOfBirth: finalDob,
          gender,
          bloodGroup,
          address,
          allergies: Array.isArray(allergies) ? allergies.join(',') : (allergies || ''),
          medicalConditions: Array.isArray(medicalConditions) ? medicalConditions.join(',') : (medicalConditions || ''),
          emergencyContact,
          treatmentStatus: treatmentStatus || 'Consultation',
          clinicId: clinicId || dto.clinicId || null,
        },
      });

      // Audit Log
      await this.auditLogService.log({
        userId: userPayload?.sub,
        role: userPayload?.role,
        action: 'PATIENT_CREATED',
        details: `Created patient "${finalName}" with Custom ID "${patientCustomId}"`,
        metadata: { patientId: patient.id, clinicId },
      });
      
      // Trigger Priority Workflow 1: PATIENT REGISTRATION notification
      try {
        const resolvedClinicId = patient.clinicId || clinicId || 'default-clinic-id';
        const clinic = await this.prisma.clinic.findFirst({
          where: { id: resolvedClinicId }
        });
        const clinicName = clinic?.name || 'ClinicOS';
        const contactNumber = clinic?.contactNumber || '';
        const messageText = `Registration Successful\n\nPatient Name: ${patient.fullName}\nPatient ID: ${patient.patientCustomId}\nClinic Name: ${clinicName}\nContact Number: ${contactNumber}`;
        
        await this.notificationService.sendWhatsApp(
          patient.id,
          patient.phone,
          'PATIENT_REGISTERED',
          messageText,
          null,
          patient.clinicId
        );
      } catch (err: any) {
        this.logger.error(`Failed to trigger patient registration WhatsApp: ${err.message}`);
      }
      
      return this.mapPatient(patient);
    } catch (error) {
      this.logger.error('Patient creation failed:', error);
      throw error;
    }
  }

  // 4. Get patient by ID (clinic scoped)
  async getPatientById(id: string, clinicId?: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { id },
    });
    if (!patient || (clinicId && patient.clinicId !== clinicId)) {
      throw new NotFoundException('Patient not found');
    }
    return this.mapPatient(patient);
  }

  // 5. Update patient (clinic scoped)
  async updatePatient(id: string, dto: any, clinicId?: string, userPayload?: any) {
    const existingPatient = await this.prisma.patient.findUnique({
      where: { id }
    });
    if (!existingPatient || (clinicId && existingPatient.clinicId !== clinicId)) {
      throw new NotFoundException('Patient not found');
    }

    const {
      name,
      fullName,
      email,
      phone,
      dob,
      dateOfBirth,
      gender,
      bloodGroup,
      address,
      allergies,
      medicalConditions,
      treatmentStatus,
      aadhaar,
      emergencyContact,
    } = dto;

    const data: any = {};
    if (fullName !== undefined || name !== undefined) data.fullName = fullName || name;
    if (email !== undefined) data.email = email;
    if (phone !== undefined) data.phone = phone;
    if (dateOfBirth !== undefined || dob !== undefined) data.dateOfBirth = dateOfBirth || dob;
    if (gender !== undefined) data.gender = gender;
    if (bloodGroup !== undefined) data.bloodGroup = bloodGroup;
    if (address !== undefined) data.address = address;
    if (emergencyContact !== undefined) data.emergencyContact = emergencyContact;
    if (allergies !== undefined) {
      data.allergies = Array.isArray(allergies) ? allergies.join(',') : allergies;
    }
    if (medicalConditions !== undefined) {
      data.medicalConditions = Array.isArray(medicalConditions) ? medicalConditions.join(',') : medicalConditions;
    }
    if (treatmentStatus !== undefined) data.treatmentStatus = treatmentStatus;

    if (aadhaar !== undefined) {
      if (aadhaar === null || aadhaar === '') {
        data.aadhaarEncrypted = null;
        data.aadhaarMasked = null;
        data.aadhaarHash = null;
      } else {
        const cleanAadhaar = String(aadhaar).trim().replace(/\s/g, '');
        if (cleanAadhaar.length !== 12 || !/^\d{12}$/.test(cleanAadhaar)) {
          throw new BadRequestException('Aadhaar must be a 12-digit number');
        }
        const aadhaarHash = this.cryptoService.hash(cleanAadhaar);
        
        const existing = await this.prisma.patient.findFirst({
          where: {
            aadhaarHash,
            id: { not: id },
          },
        });
        if (existing) {
          throw new ConflictException('A patient with this Aadhaar number is already registered.');
        }

        data.aadhaarEncrypted = this.cryptoService.encrypt(cleanAadhaar);
        data.aadhaarMasked = this.cryptoService.mask(cleanAadhaar);
        data.aadhaarHash = aadhaarHash;
      }
    }

    const patient = await this.prisma.patient.update({
      where: { id },
      data,
    });

    // Audit Log
    await this.auditLogService.log({
      userId: userPayload?.sub,
      role: userPayload?.role,
      action: 'PATIENT_UPDATED',
      details: `Updated details for patient ID "${id}" ("${patient.fullName}")`,
      metadata: { patientId: id, clinicId },
    });

    return this.mapPatient(patient);
  }

  // 6. Save new SOAP medical record notes (clinic scoped)
  async createMedicalRecord(patientId: string, dto: any, clinicId?: string, userPayload?: any) {
    const existingPatient = await this.prisma.patient.findUnique({
      where: { id: patientId }
    });
    if (!existingPatient || (clinicId && existingPatient.clinicId !== clinicId)) {
      throw new NotFoundException('Patient not found');
    }

    const {
      appointmentId,
      chiefComplaint,
      historyOfPresent,
      examinationFindings,
      diagnosis,
      treatmentPlan,
      skinType,
      lesionType,
      bodyArea,
    } = dto;

    const record = await this.prisma.$transaction(async (tx) => {
      let resolvedClinicId = clinicId || dto.clinicId;
      let resolvedDoctorId = dto.doctorId;

      if (appointmentId) {
        const appointment = await tx.appointment.findUnique({
          where: { id: appointmentId }
        });
        if (appointment) {
          resolvedClinicId = resolvedClinicId || appointment.clinicId;
          resolvedDoctorId = resolvedDoctorId || appointment.doctorId;
        }
      }

      if (!resolvedClinicId || resolvedClinicId === 'default-clinic-id') {
        const firstClinic = await tx.clinic.findFirst();
        resolvedClinicId = firstClinic?.id || resolvedClinicId || 'default-clinic-id';
      }

      if (!resolvedDoctorId || resolvedDoctorId === 'mock-doc-1') {
        const firstDoctor = await tx.doctor.findFirst();
        resolvedDoctorId = firstDoctor?.id || resolvedDoctorId || 'mock-doc-1';
      }

      // Create Medical Record (mapped to medicalRecord table / consultations mapping)
      const record = await tx.medicalRecord.create({
        data: {
          patientId,
          appointmentId: appointmentId || null,
          clinicId: resolvedClinicId,
          doctorId: resolvedDoctorId,
          chiefComplaint,
          historyOfPresent,
          examinationFindings,
          diagnosis,
          treatmentPlan,
          skinType,
          lesionType,
          bodyArea,
        },
      });

      // If tied to an appointment, mark appointment as COMPLETED and close visit
      if (appointmentId) {
        await tx.appointment.update({
          where: { id: appointmentId },
          data: { status: 'COMPLETED' },
        });
        
        await tx.visit.updateMany({
          where: { appointmentId, status: 'OPEN' },
          data: {
            status: 'CLOSED',
            closedAt: new Date(),
          },
        });
      } else {
        // Find latest open visit for this patient and close it
        const latestOpenVisit = await tx.visit.findFirst({
          where: { patientId, status: 'OPEN' },
          orderBy: { createdAt: 'desc' }
        });
        if (latestOpenVisit) {
          await tx.visit.update({
            where: { id: latestOpenVisit.id },
            data: {
              status: 'CLOSED',
              closedAt: new Date(),
            },
          });
        }
      }

      return record;
    });

    // Audit Log (executed outside the transaction)
    await this.auditLogService.log({
      userId: userPayload?.sub,
      role: userPayload?.role,
      action: 'CONSULTATION_COMPLETED',
      details: `Completed consultation/SOAP record ID "${record.id}" for patient ID "${patientId}"`,
      metadata: { recordId: record.id, patientId, clinicId: record.clinicId },
    });

    return record;
  }

  // 7. Upload photo directly inside patient timeline (clinic scoped)
  async uploadClinicalPhoto(patientId: string, dto: any, clinicId?: string, userPayload?: any) {
    const existingPatient = await this.prisma.patient.findUnique({
      where: { id: patientId }
    });
    if (!existingPatient || (clinicId && existingPatient.clinicId !== clinicId)) {
      throw new NotFoundException('Patient not found');
    }

    const {
      medicalRecordId,
      photoUrl,
      bodyArea,
      photoType,
      notes,
    } = dto;

    let finalClinicId = clinicId || dto.clinicId;
    if (!finalClinicId || finalClinicId === 'default-clinic-id') {
      const firstClinic = await this.prisma.clinic.findFirst();
      if (firstClinic) finalClinicId = firstClinic.id;
    }

    const photo = await this.prisma.clinicalPhoto.create({
      data: {
        patientId,
        medicalRecordId: medicalRecordId || null,
        clinicId: finalClinicId || 'default-clinic-id',
        photoUrl, // Storing base64 string
        bodyArea: bodyArea || 'Face',
        photoType: photoType || 'CLINICAL', // BEFORE, PROGRESS, AFTER, CLINICAL
        notes: notes || '',
      },
    });

    // Audit Log for Document Upload (clinical photo)
    await this.auditLogService.log({
      userId: userPayload?.sub,
      role: userPayload?.role,
      action: 'DOCUMENT_UPLOAD',
      details: `Uploaded clinical photo ID "${photo.id}" for patient ID "${patientId}"`,
      metadata: { photoId: photo.id, patientId, clinicId: finalClinicId },
    });

    return photo;
  }

  async closeVisit(visitId: string) {
    const visit = await this.prisma.visit.findUnique({
      where: { id: visitId }
    });
    if (!visit) {
      throw new NotFoundException(`Visit with ID ${visitId} not found`);
    }

    return this.prisma.visit.update({
      where: { id: visitId },
      data: {
        status: 'CLOSED',
        closedAt: new Date(),
      },
    });
  }
}
