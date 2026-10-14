const { PrismaClient } = require('@prisma/client');
const { performance } = require('perf_hooks');

const prisma = new PrismaClient();

async function measureQuery(name, queryFn) {
  const start = performance.now();
  try {
    await queryFn();
    const duration = (performance.now() - start).toFixed(2);
    console.log(`[PASS] ${name}: ${duration} ms`);
  } catch (err) {
    const duration = (performance.now() - start).toFixed(2);
    console.error(`[FAIL] ${name}: ${duration} ms - Error: ${err.message}`);
  }
}

async function run() {
  console.log("Measuring individual database queries for doctor dashboard...\n");
  
  const clinicId = 'default-clinic-id'; // using a mock clinicId or any seeded clinicId
  
  // Let's find a valid clinicId from the database first
  const clinic = await prisma.clinic.findFirst();
  const targetClinicId = clinic ? clinic.id : clinicId;
  console.log(`Using Clinic ID: ${targetClinicId}\n`);

  const todayStr = new Date().toISOString().split('T')[0];
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  await measureQuery("1. Appointments FindMany", () =>
    prisma.appointment.findMany({
      where: { clinicId: targetClinicId, date: todayStr, status: { not: 'CANCELLED' } },
      include: { patient: true },
      orderBy: { time: 'asc' },
    })
  );

  await measureQuery("2. Patients Count", () =>
    prisma.patient.count({ where: { clinicId: targetClinicId } })
  );

  await measureQuery("3. FollowUps Count", () =>
    prisma.followUp.count({
      where: { clinicId: targetClinicId, dueDate: { lte: todayStr }, status: 'SCHEDULED' },
    })
  );

  await measureQuery("4. LabReport Count", () =>
    prisma.labReport.count({
      where: { clinicId: targetClinicId, status: { not: 'Reviewed' } },
    })
  );

  await measureQuery("5. MedicalRecord Count", () =>
    prisma.medicalRecord.count({
      where: { clinicId: targetClinicId, createdAt: { gte: startOfToday } },
    })
  );

  await measureQuery("6. Doctor FindFirst", () =>
    prisma.doctor.findFirst({
      where: { clinics: { some: { id: targetClinicId } } },
    })
  );

  await measureQuery("7. Appointment Count (Checked-In/Completed)", () =>
    prisma.appointment.count({
      where: { clinicId: targetClinicId, date: todayStr, status: { in: ['IN_PROGRESS', 'COMPLETED'] } },
    })
  );

  await measureQuery("8. QueueToken FindFirst (Current Patient)", () =>
    prisma.queueToken.findFirst({
      where: { clinicId: targetClinicId, status: 'started' },
      orderBy: { updatedAt: 'desc' },
    })
  );

  await measureQuery("9. QueueToken FindMany (Next Tokens)", () =>
    prisma.queueToken.findMany({
      where: { clinicId: targetClinicId, status: { in: ['waiting', 'called'] } },
      orderBy: { tokenNumber: 'asc' },
      take: 5,
    })
  );

  await measureQuery("10. AuditLog FindMany", () =>
    prisma.auditLog.findMany({
      where: { role: { in: ['DOCTOR', 'RECEPTIONIST'] } },
      orderBy: { timestamp: 'desc' },
      take: 8,
      include: { user: { select: { email: true, role: true } } },
    })
  );

  // Let's close prisma connection
  await prisma.$disconnect();
}

run();
