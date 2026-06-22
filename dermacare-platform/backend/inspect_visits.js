const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function inspect() {
  const visits = await prisma.visit.findMany({
    include: {
      appointment: true,
      token: true
    }
  });
  console.log('--- ALL VISITS ---');
  console.log(JSON.stringify(visits, null, 2));

  const medicalRecords = await prisma.medicalRecord.findMany({});
  console.log('--- ALL MEDICAL RECORDS ---');
  console.log(JSON.stringify(medicalRecords, null, 2));
}

inspect().catch(console.error).finally(() => prisma.$disconnect());
