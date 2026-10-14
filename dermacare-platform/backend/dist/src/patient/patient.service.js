"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var PatientService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatientService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const crypto_service_1 = require("../auth/crypto.service");
const audit_log_service_1 = require("../common/audit-log/audit-log.service");
const storage_provider_factory_1 = require("../common/storage/storage.provider.factory");
const crypto_1 = require("crypto");
const notification_service_1 = require("../notification/notification.service");
let PatientService = PatientService_1 = class PatientService {
    prisma;
    cryptoService;
    auditLogService;
    notificationService;
    storageProvider;
    logger = new common_1.Logger(PatientService_1.name);
    constructor(prisma, cryptoService, auditLogService, notificationService, storageProvider) {
        this.prisma = prisma;
        this.cryptoService = cryptoService;
        this.auditLogService = auditLogService;
        this.notificationService = notificationService;
        this.storageProvider = storageProvider;
    }
    mapPatient(patient) {
        if (!patient)
            return null;
        return {
            ...patient,
            name: patient.fullName,
            dob: patient.dateOfBirth,
            aadhaar: patient.aadhaarMasked || null,
            allergies: patient.allergies ? patient.allergies.split(',').map((s) => s.trim()).filter(Boolean) : [],
            medicalConditions: patient.medicalConditions ? patient.medicalConditions.split(',').map((s) => s.trim()).filter(Boolean) : [],
        };
    }
    async searchPatients(query, clinicId) {
        let list;
        if (!query) {
            list = await this.prisma.patient.findMany({
                where: clinicId ? { clinicId } : {},
                take: 15,
                orderBy: { fullName: 'asc' },
            });
        }
        else {
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
    async checkAadhaarExists(aadhaar) {
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
        }
        catch (error) {
            this.logger.error(`[Backend/AadhaarCheck] Database / Hash Error:`, error);
            throw error;
        }
    }
    async getPatientHistory(patientId, clinicId) {
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
            throw new common_1.NotFoundException('Patient not found');
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
    async createPatient(dto, clinicId, userPayload) {
        try {
            const { name, fullName, email, phone, dob, dateOfBirth, gender, bloodGroup, address, allergies, medicalConditions, treatmentStatus, aadhaar, emergencyContact, } = dto;
            const finalName = fullName || name || '';
            const finalDob = dateOfBirth || dob || '';
            let aadhaarEncrypted = null;
            let aadhaarMasked = null;
            let aadhaarHash = null;
            if (aadhaar) {
                const cleanAadhaar = String(aadhaar).trim().replace(/[^0-9]/g, '');
                if (cleanAadhaar.length !== 12 || !/^\d{12}$/.test(cleanAadhaar)) {
                    throw new common_1.BadRequestException('Aadhaar must be a 12-digit number');
                }
                aadhaarHash = this.cryptoService.hash(cleanAadhaar);
                const existing = await this.prisma.patient.findUnique({
                    where: { aadhaarHash },
                });
                if (existing) {
                    throw new common_1.ConflictException('A patient with this Aadhaar number is already registered.');
                }
                aadhaarEncrypted = this.cryptoService.encrypt(cleanAadhaar);
                aadhaarMasked = this.cryptoService.mask(cleanAadhaar);
            }
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
            await this.auditLogService.log({
                userId: userPayload?.sub,
                role: userPayload?.role,
                action: 'PATIENT_CREATED',
                details: `Created patient "${finalName}" with Custom ID "${patientCustomId}"`,
                metadata: { patientId: patient.id, clinicId },
            });
            try {
                const resolvedClinicId = patient.clinicId || clinicId || 'default-clinic-id';
                const clinic = await this.prisma.clinic.findFirst({
                    where: { id: resolvedClinicId }
                });
                const clinicName = clinic?.name || 'ClinicOS';
                const contactNumber = clinic?.contactNumber || '';
                const messageText = `Registration Successful\n\nPatient Name: ${patient.fullName}\nPatient ID: ${patient.patientCustomId}\nClinic Name: ${clinicName}\nContact Number: ${contactNumber}`;
                await this.notificationService.sendWhatsApp(patient.id, patient.phone, 'PATIENT_REGISTERED', messageText, null, patient.clinicId);
            }
            catch (err) {
                this.logger.error(`Failed to trigger patient registration WhatsApp: ${err.message}`);
            }
            return this.mapPatient(patient);
        }
        catch (error) {
            this.logger.error('Patient creation failed:', error);
            throw error;
        }
    }
    async getPatientById(id, clinicId) {
        const patient = await this.prisma.patient.findUnique({
            where: { id },
        });
        if (!patient || (clinicId && patient.clinicId !== clinicId)) {
            throw new common_1.NotFoundException('Patient not found');
        }
        return this.mapPatient(patient);
    }
    async updatePatient(id, dto, clinicId, userPayload) {
        const existingPatient = await this.prisma.patient.findUnique({
            where: { id }
        });
        if (!existingPatient || (clinicId && existingPatient.clinicId !== clinicId)) {
            throw new common_1.NotFoundException('Patient not found');
        }
        const { name, fullName, email, phone, dob, dateOfBirth, gender, bloodGroup, address, allergies, medicalConditions, treatmentStatus, aadhaar, emergencyContact, } = dto;
        const data = {};
        if (fullName !== undefined || name !== undefined)
            data.fullName = fullName || name;
        if (email !== undefined)
            data.email = email;
        if (phone !== undefined)
            data.phone = phone;
        if (dateOfBirth !== undefined || dob !== undefined)
            data.dateOfBirth = dateOfBirth || dob;
        if (gender !== undefined)
            data.gender = gender;
        if (bloodGroup !== undefined)
            data.bloodGroup = bloodGroup;
        if (address !== undefined)
            data.address = address;
        if (emergencyContact !== undefined)
            data.emergencyContact = emergencyContact;
        if (allergies !== undefined) {
            data.allergies = Array.isArray(allergies) ? allergies.join(',') : allergies;
        }
        if (medicalConditions !== undefined) {
            data.medicalConditions = Array.isArray(medicalConditions) ? medicalConditions.join(',') : medicalConditions;
        }
        if (treatmentStatus !== undefined)
            data.treatmentStatus = treatmentStatus;
        if (aadhaar !== undefined) {
            if (aadhaar === null || aadhaar === '') {
                data.aadhaarEncrypted = null;
                data.aadhaarMasked = null;
                data.aadhaarHash = null;
            }
            else {
                const cleanAadhaar = String(aadhaar).trim().replace(/\s/g, '');
                if (cleanAadhaar.length !== 12 || !/^\d{12}$/.test(cleanAadhaar)) {
                    throw new common_1.BadRequestException('Aadhaar must be a 12-digit number');
                }
                const aadhaarHash = this.cryptoService.hash(cleanAadhaar);
                const existing = await this.prisma.patient.findFirst({
                    where: {
                        aadhaarHash,
                        id: { not: id },
                    },
                });
                if (existing) {
                    throw new common_1.ConflictException('A patient with this Aadhaar number is already registered.');
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
        await this.auditLogService.log({
            userId: userPayload?.sub,
            role: userPayload?.role,
            action: 'PATIENT_UPDATED',
            details: `Updated details for patient ID "${id}" ("${patient.fullName}")`,
            metadata: { patientId: id, clinicId },
        });
        return this.mapPatient(patient);
    }
    async createMedicalRecord(patientId, dto, clinicId, userPayload) {
        const existingPatient = await this.prisma.patient.findUnique({
            where: { id: patientId }
        });
        if (!existingPatient || (clinicId && existingPatient.clinicId !== clinicId)) {
            throw new common_1.NotFoundException('Patient not found');
        }
        const { appointmentId, chiefComplaint, historyOfPresent, examinationFindings, diagnosis, treatmentPlan, skinType, lesionType, bodyArea, } = dto;
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
            }
            else {
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
        await this.auditLogService.log({
            userId: userPayload?.sub,
            role: userPayload?.role,
            action: 'CONSULTATION_COMPLETED',
            details: `Completed consultation/SOAP record ID "${record.id}" for patient ID "${patientId}"`,
            metadata: { recordId: record.id, patientId, clinicId: record.clinicId },
        });
        return record;
    }
    async uploadClinicalPhoto(patientId, dto, clinicId, userPayload) {
        const existingPatient = await this.prisma.patient.findUnique({
            where: { id: patientId }
        });
        if (!existingPatient || (clinicId && existingPatient.clinicId !== clinicId)) {
            throw new common_1.NotFoundException('Patient not found');
        }
        const { medicalRecordId, photoUrl, bodyArea, photoType, notes, } = dto;
        let finalClinicId = clinicId || dto.clinicId;
        if (!finalClinicId || finalClinicId === 'default-clinic-id') {
            const firstClinic = await this.prisma.clinic.findFirst();
            if (firstClinic)
                finalClinicId = firstClinic.id;
        }
        const photo = await this.prisma.clinicalPhoto.create({
            data: {
                patientId,
                medicalRecordId: medicalRecordId || null,
                clinicId: finalClinicId || 'default-clinic-id',
                photoUrl,
                bodyArea: bodyArea || 'Face',
                photoType: photoType || 'CLINICAL',
                notes: notes || '',
            },
        });
        await this.auditLogService.log({
            userId: userPayload?.sub,
            role: userPayload?.role,
            action: 'DOCUMENT_UPLOAD',
            details: `Uploaded clinical photo ID "${photo.id}" for patient ID "${patientId}"`,
            metadata: { photoId: photo.id, patientId, clinicId: finalClinicId },
        });
        return photo;
    }
    async uploadClinicalPhotoFile(patientId, file, dto, clinicId, userPayload) {
        const patient = await this.prisma.patient.findUnique({ where: { id: patientId } });
        if (!patient || (clinicId && patient.clinicId !== clinicId)) {
            throw new common_1.NotFoundException('Patient not found');
        }
        if (!file?.buffer) {
            throw new common_1.BadRequestException('Choose an image to upload');
        }
        const extensionByMimeType = {
            'image/jpeg': 'jpg',
            'image/png': 'png',
            'image/webp': 'webp',
        };
        const extension = extensionByMimeType[file.mimetype];
        if (!extension) {
            throw new common_1.BadRequestException('Upload a JPEG, PNG, or WebP image');
        }
        const photoType = String(dto.photoType || '').toUpperCase();
        if (photoType !== 'BEFORE' && photoType !== 'AFTER') {
            throw new common_1.BadRequestException('Photo type must be BEFORE or AFTER');
        }
        const photoUrl = await this.storageProvider.uploadFile(file.buffer, 'treatment-images', `${patientId}-${(0, crypto_1.randomUUID)()}.${extension}`);
        const finalClinicId = patient.clinicId || clinicId || (await this.prisma.clinic.findFirst({ select: { id: true } }))?.id;
        if (!finalClinicId) {
            throw new common_1.BadRequestException('Patient is not assigned to a clinic');
        }
        const photo = await this.prisma.clinicalPhoto.create({
            data: {
                patientId,
                clinicId: finalClinicId,
                medicalRecordId: dto.medicalRecordId || null,
                photoUrl,
                bodyArea: String(dto.bodyArea || 'Face').trim().slice(0, 100),
                photoType,
                notes: String(dto.notes || '').trim().slice(0, 2000),
                createdBy: userPayload?.sub || null,
            },
        });
        await this.auditLogService.log({
            userId: userPayload?.sub,
            role: userPayload?.role,
            action: 'DOCUMENT_UPLOAD',
            details: `Uploaded ${photoType.toLowerCase()} treatment photo for patient ID ${patientId}`,
            metadata: { photoId: photo.id, patientId, clinicId: finalClinicId, photoType },
        });
        return photo;
    }
    async closeVisit(visitId) {
        const visit = await this.prisma.visit.findUnique({
            where: { id: visitId }
        });
        if (!visit) {
            throw new common_1.NotFoundException(`Visit with ID ${visitId} not found`);
        }
        return this.prisma.visit.update({
            where: { id: visitId },
            data: {
                status: 'CLOSED',
                closedAt: new Date(),
            },
        });
    }
};
exports.PatientService = PatientService;
exports.PatientService = PatientService = PatientService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(4, (0, common_1.Inject)(storage_provider_factory_1.StorageProviderToken)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        crypto_service_1.CryptoService,
        audit_log_service_1.AuditLogService,
        notification_service_1.NotificationService, Object])
], PatientService);
//# sourceMappingURL=patient.service.js.map