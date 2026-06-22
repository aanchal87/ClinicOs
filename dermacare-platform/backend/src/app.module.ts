import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { AuthModule } from './auth/auth.module';
import { QueueModule } from './queue/queue.module';
import { DocumentModule } from './document/document.module';
import { LaboratoryModule } from './laboratory/laboratory.module';
import { SettingsModule } from './settings/settings.module';
import { FollowUpModule } from './followup/followup.module';
import { DoctorController } from './doctor/doctor.controller';
import { AppointmentService } from './appointment/appointment.service';
import { AppointmentController } from './appointment/appointment.controller';
import { PatientService } from './patient/patient.service';
import { PatientController } from './patient/patient.controller';
import { PatientHistoryService } from './patient/patient-history.service';
import { PatientHistoryController } from './patient/patient-history.controller';
import { VisitController } from './patient/visit.controller';
import { PrescriptionService } from './prescription/prescription.service';
import { PrescriptionController } from './prescription/prescription.controller';
import { NotificationModule } from './notification/notification.module';
import { CryptoService } from './auth/crypto.service';
import { MedicineModule } from './medicine/medicine.module';
import { ReportsModule } from './reports/reports.module';
import { StorageModule } from './common/storage/storage.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { HealthController } from './health/health.controller';
import { RedisModule } from './common/redis/redis.module';
import { AuditLogModule } from './common/audit-log/audit-log.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { PrismaModule } from './prisma.module';

import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth/auth.guard';
import { RolesGuard } from './auth/roles.guard';
import { PermissionsGuard } from './auth/permissions.guard';
import { UsersController } from './auth/users.controller';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'auth',
        ttl: 60000,
        limit: 5,
      },
      {
        name: 'aadhaar',
        ttl: 60000,
        limit: 20,
      },
      {
        name: 'search',
        ttl: 60000,
        limit: 60,
      },
    ]),
    PrismaModule,
    RedisModule,
    AuditLogModule,
    DashboardModule,
    AuthModule, 
    QueueModule, 
    DocumentModule, 
    LaboratoryModule,
    SettingsModule,
    FollowUpModule,
    MedicineModule,
    ReportsModule,
    StorageModule,
    NotificationModule,
  ],
  controllers: [
    AppController, 
    DoctorController, 
    AppointmentController, 
    PatientController,
    PatientHistoryController,
    VisitController,
    PrescriptionController,
    HealthController,
    UsersController,
  ],
  providers: [
    AppService, 
    AppointmentService, 
    PatientService,
    PatientHistoryService,
    PrescriptionService,
    CryptoService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
  ],
})
export class AppModule {}
