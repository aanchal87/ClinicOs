import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

const algorithm = 'aes-256-gcm';
const encryptionKey = process.env.ENCRYPTION_KEY;
if (!encryptionKey) {
  throw new Error('ENCRYPTION_KEY environment variable is required for seeding!');
}
const key = crypto.scryptSync(
  encryptionKey,
  'salt-clinicos',
  32
);

function encrypt(text: string): string {
  if (!text) return '';
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${encrypted}:${authTag}`;
}

function hash(text: string): string {
  if (!text) return '';
  return crypto.createHash('sha256').update(text).digest('hex');
}

function mask(text: string): string {
  if (!text || text.length < 4) return 'XXXX-XXXX-XXXX';
  const last4 = text.slice(-4);
  return `XXXX-XXXX-${last4}`;
}

async function main() {
  console.log('Seeding ClinicOS database...');

  // 1. Clear existing data
  await prisma.tokenHistory.deleteMany({});
  await prisma.queueEvent.deleteMany({});
  await prisma.visit.deleteMany({});
  await prisma.medicine.deleteMany({});
  await prisma.clinicSettings.deleteMany({});
  await prisma.clinicUser.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.document.deleteMany({});
  await prisma.labReport.deleteMany({});
  await prisma.queueToken.deleteMany({});
  await prisma.notificationLog.deleteMany({});
  await prisma.followUp.deleteMany({});
  await prisma.prescriptionItem.deleteMany({});
  await prisma.prescription.deleteMany({});
  await prisma.clinicalPhoto.deleteMany({});
  await prisma.medicalRecord.deleteMany({});
  await prisma.appointment.deleteMany({});
  await prisma.patient.deleteMany({});
  await prisma.clinicSchedule.deleteMany({});
  await prisma.clinic.deleteMany({});
  await prisma.doctor.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.permission.deleteMany({});
  await prisma.role.deleteMany({});

  // 2. Create Roles
  const superAdminRole = await prisma.role.create({
    data: { name: 'SUPER_ADMIN' },
  });
  const doctorRole = await prisma.role.create({
    data: { name: 'DOCTOR' },
  });
  const receptionistRole = await prisma.role.create({
    data: { name: 'RECEPTIONIST' },
  });

  // 3. Create Permissions and map to roles
  const permissionsList = [
    'READ_PATIENTS',
    'CREATE_PATIENTS',
    'UPDATE_PATIENTS',
    'DELETE_PATIENTS',
    'READ_APPOINTMENTS',
    'CREATE_APPOINTMENTS',
    'READ_QUEUE',
    'MANAGE_QUEUE',
    'READ_CONSULTATIONS',
    'CREATE_CONSULTATIONS',
    'READ_PRESCRIPTIONS',
    'CREATE_PRESCRIPTIONS',
    'READ_LABS',
    'UPLOAD_LABS',
    'DELETE_LABS',
    'REVIEW_LABS',
    'READ_REPORTS',
    'READ_AUDIT_LOGS',
    'MANAGE_USERS',
    'MANAGE_SETTINGS'
  ];

  const doctorPermissions = [
    'READ_PATIENTS',
    'CREATE_PATIENTS',
    'READ_APPOINTMENTS',
    'READ_QUEUE',
    'MANAGE_QUEUE',
    'READ_CONSULTATIONS',
    'CREATE_CONSULTATIONS',
    'READ_PRESCRIPTIONS',
    'CREATE_PRESCRIPTIONS',
    'READ_LABS',
    'UPLOAD_LABS',
    'REVIEW_LABS',
    'READ_REPORTS'
  ];

  const receptionistPermissions = [
    'READ_PATIENTS',
    'CREATE_PATIENTS',
    'READ_APPOINTMENTS',
    'CREATE_APPOINTMENTS',
    'READ_QUEUE',
    'MANAGE_QUEUE'
  ];

  const createdPerms: Record<string, any> = {};
  for (const name of permissionsList) {
    const perm = await prisma.permission.create({
      data: { name },
    });
    createdPerms[name] = perm;
  }

  // Connect all permissions to SUPER_ADMIN
  await prisma.role.update({
    where: { id: superAdminRole.id },
    data: {
      permissions: {
        connect: permissionsList.map(name => ({ id: createdPerms[name].id }))
      }
    }
  });

  // Connect DOCTOR permissions
  await prisma.role.update({
    where: { id: doctorRole.id },
    data: {
      permissions: {
        connect: doctorPermissions.map(name => ({ id: createdPerms[name].id }))
      }
    }
  });

  // Connect RECEPTIONIST permissions
  await prisma.role.update({
    where: { id: receptionistRole.id },
    data: {
      permissions: {
        connect: receptionistPermissions.map(name => ({ id: createdPerms[name].id }))
      }
    }
  });

  // 4. Create Users (hashed passwords)
  const saltRounds = 10;
  const isProd = process.env.NODE_ENV === 'production';
  const docEmail = process.env.INITIAL_DOCTOR_EMAIL || (isProd ? null : 'doctor@clinicios.com');
  const docPass = process.env.INITIAL_DOCTOR_PASSWORD || (isProd ? null : 'doctor123');
  const recepEmail = process.env.INITIAL_RECEPTIONIST_EMAIL || (isProd ? null : 'receptionist@clinicios.com');
  const recepPass = process.env.INITIAL_RECEPTIONIST_PASSWORD || (isProd ? null : 'receptionist123');
  const adminEmail = process.env.INITIAL_ADMIN_EMAIL || (isProd ? null : 'admin@clinicios.com');
  const adminPass = process.env.INITIAL_ADMIN_PASSWORD || (isProd ? null : 'admin123');

  if (isProd && (!docEmail || !docPass || !recepEmail || !recepPass || !adminEmail || !adminPass)) {
    throw new Error('Production environment requires INITIAL_DOCTOR_EMAIL, INITIAL_DOCTOR_PASSWORD, INITIAL_RECEPTIONIST_EMAIL, INITIAL_RECEPTIONIST_PASSWORD, INITIAL_ADMIN_EMAIL, and INITIAL_ADMIN_PASSWORD to be defined!');
  }

  const doctorPasswordHash = await bcrypt.hash(docPass!, saltRounds);
  const receptionistPasswordHash = await bcrypt.hash(recepPass!, saltRounds);
  const adminPasswordHash = await bcrypt.hash(adminPass!, saltRounds);

  const docUser = await prisma.user.create({
    data: {
      email: docEmail!,
      phone: '+15551234567',
      passwordHash: doctorPasswordHash,
      role: 'DOCTOR',
      roleId: doctorRole.id,
    },
  });

  const recepUser = await prisma.user.create({
    data: {
      email: recepEmail!,
      phone: '+15557654321',
      passwordHash: receptionistPasswordHash,
      role: 'RECEPTIONIST',
      roleId: receptionistRole.id,
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      email: adminEmail!,
      phone: '+15550000000',
      passwordHash: adminPasswordHash,
      role: 'SUPER_ADMIN',
      roleId: superAdminRole.id,
    },
  });

  // 5. Create Doctor profile
  const doctor = await prisma.doctor.create({
    data: {
      userId: docUser.id,
      fullName: 'Dr. Adrian Vance',
      mciNumber: 'MCI-908123-A',
      specializations: 'Dermatology,Cosmetology',
      qualifications: 'MBBS, MD (Dermatology)',
      experienceYears: 12,
      consultationFee: 150.00,
    },
  });

  // 6. Create Clinic
  const clinic = await prisma.clinic.create({
    data: {
      doctorId: doctor.id,
      name: 'Vance Dermacare Center',
      address: '742 Evergreen Plaza, Suite 400',
      city: 'Gotham',
      state: 'NY',
      pincode: '10001',
      contactNumber: '+1 (555) 019-9000',
      workingHours: '09:00 AM - 05:00 PM',
    },
  });

  // 7. Create Clinic Schedule
  for (let i = 1; i <= 5; i++) {
    await prisma.clinicSchedule.create({
      data: {
        clinicId: clinic.id,
        dayOfWeek: i,
        startTime: '09:00',
        endTime: '17:00',
        breakStartTime: '13:00',
        breakEndTime: '14:00',
      },
    });
  }

  // Create Clinic Users mapping
  await prisma.clinicUser.create({
    data: {
      clinicId: clinic.id,
      userId: docUser.id,
    },
  });

  await prisma.clinicUser.create({
    data: {
      clinicId: clinic.id,
      userId: recepUser.id,
    },
  });

  await prisma.clinicUser.create({
    data: {
      clinicId: clinic.id,
      userId: adminUser.id,
    },
  });

  // Create Clinic Settings (including feature flags)
  await prisma.clinicSettings.createMany({
    data: [
      { clinicId: clinic.id, key: 'clinicName', value: 'Vance Dermacare Center' },
      { clinicId: clinic.id, key: 'enableWhatsappReminders', value: 'true' },
      { clinicId: clinic.id, key: 'enableEmailNotifications', value: 'true' },
      { clinicId: clinic.id, key: 'enable_reports', value: 'true' },
      { clinicId: clinic.id, key: 'enable_laboratory', value: 'true' },
      { clinicId: clinic.id, key: 'enable_gallery', value: 'true' },
      { clinicId: clinic.id, key: 'enable_followups', value: 'true' },
      { clinicId: clinic.id, key: 'enable_queue', value: 'true' },
      { clinicId: clinic.id, key: 'enable_whatsapp', value: 'true' },
    ],
  });

  if (process.env.NODE_ENV === 'production') {
    console.log('Production Environment: Skipping patient, visit, and SOAP record creation.');
    console.log('ClinicOS database successfully seeded for production.');
    return;
  }

  // 8. Create Patients
  const patient1 = await prisma.patient.create({
    data: {
      id: 'p-1',
      patientCustomId: 'PAT-2026-000001',
      aadhaarEncrypted: encrypt('111122223333'),
      aadhaarMasked: mask('111122223333'),
      aadhaarHash: hash('111122223333'),
      fullName: 'Sarah Jenkins',
      email: 'sarah.j@example.com',
      phone: '555-0199',
      dateOfBirth: '1994-08-12',
      gender: 'FEMALE',
      bloodGroup: 'O+',
      address: '742 Evergreen Terrace, Springfield',
      allergies: 'Penicillin,Sulfa drugs',
      medicalConditions: 'Atopic Dermatitis,Acne Vulgaris',
      emergencyContact: 'Jane Jenkins: 555-9999',
      treatmentStatus: 'Active Treatment',
    },
  });

  const patient2 = await prisma.patient.create({
    data: {
      id: 'p-2',
      patientCustomId: 'PAT-2026-000002',
      aadhaarEncrypted: encrypt('444455556666'),
      aadhaarMasked: mask('444455556666'),
      aadhaarHash: hash('444455556666'),
      fullName: 'David Miller',
      email: 'david.miller@example.com',
      phone: '555-0144',
      dateOfBirth: '1981-11-23',
      gender: 'MALE',
      bloodGroup: 'A-',
      address: '123 Maple Street, Riverdale',
      allergies: '',
      medicalConditions: 'Psoriasis',
      emergencyContact: 'Lily Chang: 555-8888',
      treatmentStatus: 'Consultation',
    },
  });

  const patient3 = await prisma.patient.create({
    data: {
      id: 'p-3',
      patientCustomId: 'PAT-2026-000003',
      aadhaarEncrypted: encrypt('777788889999'),
      aadhaarMasked: mask('777788889999'),
      aadhaarHash: hash('777788889999'),
      fullName: 'Elena Rostova',
      email: 'elena.rostova@example.com',
      phone: '555-0188',
      dateOfBirth: '1998-04-05',
      gender: 'FEMALE',
      bloodGroup: 'B+',
      address: '456 Oak Avenue, Metropolis',
      allergies: 'Aspirin',
      medicalConditions: 'Rosacea',
      emergencyContact: 'John Watson: 555-7777',
      treatmentStatus: 'Maintenance',
    },
  });

  const patient4 = await prisma.patient.create({
    data: {
      id: 'p-4',
      patientCustomId: 'PAT-2026-000004',
      aadhaarEncrypted: encrypt('888899990000'),
      aadhaarMasked: mask('888899990000'),
      aadhaarHash: hash('888899990000'),
      fullName: 'Marcus Chen',
      email: 'marcus.chen@example.com',
      phone: '555-0111',
      dateOfBirth: '1976-06-30',
      gender: 'MALE',
      bloodGroup: 'AB+',
      address: '789 Pine Lane, Gotham',
      allergies: '',
      medicalConditions: 'Contact Dermatitis',
      emergencyContact: 'John Chen: 555-6666',
      treatmentStatus: 'Completed',
    },
  });

  // Create visits for past consultations
  const visit1 = await prisma.visit.create({
    data: {
      patientId: patient1.id,
      reason: 'Red, itchy patches on elbows and behind knees',
      notes: 'Initial eczema check',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    }
  });

  const visit2 = await prisma.visit.create({
    data: {
      patientId: patient1.id,
      reason: 'Progress review',
      notes: 'Follow-up for eczema',
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    }
  });

  // 9. Create past consultations/medical records
  const record1 = await prisma.medicalRecord.create({
    data: {
      clinicId: clinic.id,
      doctorId: doctor.id,
      patientId: patient1.id,
      visitId: visit1.id,
      chiefComplaint: 'Red, itchy patches on elbows and behind knees. Flares up during winter.',
      historyOfPresent: 'Symptoms have persisted for 6 months. Used over-the-counter moisturizers with minimal relief.',
      examinationFindings: 'Dry, erythematous plaques with excoriation on bilateral flexural areas.',
      diagnosis: 'Severe Atopic Dermatitis flare-up',
      treatmentPlan: 'Apply topical steroid cream twice daily for 14 days. Avoid scented soaps and use ceramide-based emollients.',
      skinType: 'Dry',
      lesionType: 'Plaque',
      bodyArea: 'Elbows/Knees',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    },
  });

  const record2 = await prisma.medicalRecord.create({
    data: {
      clinicId: clinic.id,
      doctorId: doctor.id,
      patientId: patient1.id,
      visitId: visit2.id,
      chiefComplaint: 'Progress review. Inflammation decreased, but skin remains dry.',
      historyOfPresent: 'Follow-up for eczema treatment. Efficacy of topical steroids was high, itchiness reduced.',
      examinationFindings: 'Erythema reduced by 70%. Minimal scaling. No active excoriation.',
      diagnosis: 'Resolving Atopic Dermatitis',
      treatmentPlan: 'Step down to Tacrolimus ointment daily. Continue daily barrier repair cream.',
      skinType: 'Dry',
      lesionType: 'Macule',
      bodyArea: 'Elbows/Knees',
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
    },
  });

  // 10. Create Prescriptions
  const prescription1 = await prisma.prescription.create({
    data: {
      medicalRecordId: record1.id,
      clinicId: clinic.id,
      doctorId: doctor.id,
      patientId: patient1.id,
      advice: 'Apply topicals after bathing while skin is damp. Use soft cotton clothing.',
    },
  });

  await prisma.prescriptionItem.createMany({
    data: [
      {
        prescriptionId: prescription1.id,
        drugName: 'Mometasone Furoate 0.1% Ointment',
        drugCategory: 'Topical',
        strength: '0.1%',
        dosageForm: 'Ointment',
        dose: 'Apply thin layer',
        frequency: 'Once daily',
        duration: '14 days',
        instructions: 'Apply in the evening on affected areas',
      },
      {
        prescriptionId: prescription1.id,
        drugName: 'Cetirizine 10mg Tablets',
        drugCategory: 'Oral',
        strength: '10mg',
        dosageForm: 'Tablet',
        dose: '1 tablet',
        frequency: 'Once daily',
        duration: '14 days',
        instructions: 'Take at night if itching prevents sleep',
      }
    ],
  });

  const prescription2 = await prisma.prescription.create({
    data: {
      medicalRecordId: record2.id,
      clinicId: clinic.id,
      doctorId: doctor.id,
      patientId: patient1.id,
      advice: 'Monitor skin for thinning. Transition to non-steroidal ointment if clear.',
    },
  });

  await prisma.prescriptionItem.createMany({
    data: [
      {
        prescriptionId: prescription2.id,
        drugName: 'Tacrolimus 0.03% Ointment',
        drugCategory: 'Topical',
        strength: '0.03%',
        dosageForm: 'Ointment',
        dose: 'Apply thin layer',
        frequency: 'Once daily',
        duration: '30 days',
        instructions: 'Apply on elbows and knees after barrier cream',
      }
    ],
  });

  // 11. Create Appointments
  await prisma.appointment.create({
    data: {
      clinicId: clinic.id,
      doctorId: doctor.id,
      patientId: patient1.id,
      date: new Date().toISOString().split('T')[0],
      time: '10:00 AM',
      type: 'Eczema Follow-up',
      status: 'CONFIRMED',
      notes: 'Monthly review of progress',
    },
  });

  // 12. Create Queue Tokens and link Visits
  const token1 = await prisma.queueToken.create({
    data: {
      tokenNumber: 'T-01',
      patientId: patient1.id,
      patientName: patient1.fullName,
      priority: 'normal',
      visitReason: 'Eczema Follow-up Review',
      doctorName: 'Dr. Adrian Vance',
      status: 'started',
      checkInTime: '09:45 AM',
      startTime: '10:05 AM',
    },
  });

  const visit3 = await prisma.visit.create({
    data: {
      patientId: patient1.id,
      tokenId: token1.id,
      reason: 'Eczema Follow-up Review',
      notes: 'Token started, ready for consultation',
    },
  });

  const token2 = await prisma.queueToken.create({
    data: {
      tokenNumber: 'T-02',
      patientId: patient2.id,
      patientName: patient2.fullName,
      priority: 'normal',
      visitReason: 'Psoriasis Initial Consultation',
      doctorName: 'Dr. Adrian Vance',
      status: 'waiting',
      checkInTime: '10:10 AM',
    },
  });

  const visit4 = await prisma.visit.create({
    data: {
      patientId: patient2.id,
      tokenId: token2.id,
      reason: 'Psoriasis Initial Consultation',
      notes: 'Waiting in lobby',
    },
  });

  const token3 = await prisma.queueToken.create({
    data: {
      tokenNumber: 'T-03',
      patientId: patient3.id,
      patientName: patient3.fullName,
      priority: 'high',
      visitReason: 'Acute rosacea flare-up',
      doctorName: 'Dr. Adrian Vance',
      status: 'waiting',
      checkInTime: '10:20 AM',
    },
  });

  const visit5 = await prisma.visit.create({
    data: {
      patientId: patient3.id,
      tokenId: token3.id,
      reason: 'Acute rosacea flare-up',
      notes: 'Waiting in lobby (High priority)',
    },
  });

  // 13. Create Lab Reports
  await prisma.labReport.create({
    data: {
      medicalRecordId: record1.id,
      testName: 'Complete Blood Count (CBC) & IgE Level',
      testDate: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'completed',
      results: JSON.stringify([
        { parameter: 'White Blood Cell (WBC)', value: '7.2 K/uL', range: '4.5 - 11.0 K/uL' },
        { parameter: 'Hemoglobin (Hgb)', value: '14.1 g/dL', range: '12.0 - 16.0 g/dL' },
        { parameter: 'Absolute Eosinophils', value: '450 cells/uL', range: '30 - 350 cells/uL' },
        { parameter: 'Total Serum IgE', value: '380 IU/mL', range: '< 100 IU/mL' }
      ]),
    },
  });

  // 14. Create Follow-up Recalls
  await prisma.followUp.createMany({
    data: [
      {
        clinicId: clinic.id,
        doctorId: doctor.id,
        patientId: patient1.id,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 14 days from now
        reason: 'Review Eczema Step-down Treatment',
        priority: 'ROUTINE',
        status: 'SCHEDULED',
      },
      {
        clinicId: clinic.id,
        doctorId: doctor.id,
        patientId: patient3.id,
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days ago
        reason: 'Rosacea medication check',
        priority: 'URGENT',
        status: 'SCHEDULED',
      }
    ],
  });

  // 15. Create Documents
  await prisma.document.create({
    data: {
      patientId: patient1.id,
      documentName: 'Eczema_Referral_Sheet_StJude.pdf',
      documentType: 'Referral',
      fileSize: '1.2 MB',
      uploadedBy: 'Receptionist Staff',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    },
  });

  // 16. Clinic Settings seeded above during initialization
  // (Left blank here to avoid duplication)

  // 17. Seed some medicines
  await prisma.medicine.createMany({
    data: [
      { name: 'Mometasone Furoate 0.1% Cream', category: 'Topical' },
      { name: 'Tacrolimus 0.03% Ointment', category: 'Topical' },
      { name: 'Cetirizine 10mg Tablets', category: 'Oral' },
      { name: 'Hydroxyzine 25mg Tablets', category: 'Oral' },
      { name: 'Ketoconazole 2% Shampoo', category: 'Topical' }
    ],
  });

  console.log('Database seeding completed successfully! 🚀');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
