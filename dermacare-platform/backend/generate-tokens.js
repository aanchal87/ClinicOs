const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Parse .env manually
let jwtSecret = 'development-secret-key-for-backend-run-321';
try {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/JWT_SECRET=["']?([^"'#\r\n]+)["']?/);
    if (match && match[1]) {
      jwtSecret = match[1].trim();
    }
  }
} catch (e) {
  console.warn("Could not read .env file, using default secret:", e.message);
}

async function run() {
  console.log("Generating fresh JWT tokens directly from database...");
  
  try {
    const doctorUser = await prisma.user.findUnique({
      where: { email: 'doctor@clinicios.com' }
    });
    
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@clinicios.com' }
    });
    
    if (!doctorUser || !adminUser) {
      console.error("Could not find doctor or admin user in database. Please run seeding first.");
      process.exit(1);
    }
    
    const doctorClinicUser = await prisma.clinicUser.findFirst({
      where: { userId: doctorUser.id }
    });
    const doctorClinicId = doctorClinicUser ? doctorClinicUser.clinicId : null;
    
    const adminClinicUser = await prisma.clinicUser.findFirst({
      where: { userId: adminUser.id }
    });
    const adminClinicId = adminClinicUser ? adminClinicUser.clinicId : null;
    
    // Generate tokens
    const doctorPayload = {
      sub: doctorUser.id,
      email: doctorUser.email,
      role: doctorUser.role,
      clinicId: doctorClinicId
    };
    
    const adminPayload = {
      sub: adminUser.id,
      email: adminUser.email,
      role: adminUser.role,
      clinicId: adminClinicId
    };
    
    const doctorToken = jwt.sign(doctorPayload, jwtSecret, { expiresIn: '1h' }); // 1 hour for testing
    const adminToken = jwt.sign(adminPayload, jwtSecret, { expiresIn: '1h' });
    
    const cachePath = path.join(__dirname, '../../clinicos-frontend/.token-cache.json');
    
    fs.writeFileSync(cachePath, JSON.stringify({
      doctorToken,
      adminToken,
      timestamp: Date.now()
    }), 'utf8');
    
    console.log("Successfully generated tokens and cached them at:", cachePath);
    console.log(`Doctor Token: Bearer ${doctorToken.substring(0, 15)}...`);
    console.log(`Admin Token: Bearer ${adminToken.substring(0, 15)}...`);
  } catch (e) {
    console.error("Token generation failed:", e);
  } finally {
    await prisma.$disconnect();
  }
}

run();
