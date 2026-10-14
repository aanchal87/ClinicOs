import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Finding patients matching "ekansh"...');
  const patients = await prisma.patient.findMany({
    where: {
      fullName: {
        contains: 'ekansh'
      }
    }
  });

  console.log(`Found ${patients.length} patients:`, patients.map(p => ({ id: p.id, name: p.fullName })));

  for (const patient of patients) {
    console.log(`Deleting patient queue tokens...`);
    await prisma.queueToken.deleteMany({
      where: { patientId: patient.id }
    });
    console.log(`Deleting patient: ${patient.fullName}...`);
    await prisma.patient.delete({
      where: { id: patient.id }
    });
  }
  console.log('Done!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
