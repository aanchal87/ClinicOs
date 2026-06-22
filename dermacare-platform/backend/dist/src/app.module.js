"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const auth_module_1 = require("./auth/auth.module");
const queue_module_1 = require("./queue/queue.module");
const document_module_1 = require("./document/document.module");
const laboratory_module_1 = require("./laboratory/laboratory.module");
const settings_module_1 = require("./settings/settings.module");
const followup_module_1 = require("./followup/followup.module");
const doctor_controller_1 = require("./doctor/doctor.controller");
const appointment_service_1 = require("./appointment/appointment.service");
const appointment_controller_1 = require("./appointment/appointment.controller");
const patient_service_1 = require("./patient/patient.service");
const patient_controller_1 = require("./patient/patient.controller");
const patient_history_service_1 = require("./patient/patient-history.service");
const patient_history_controller_1 = require("./patient/patient-history.controller");
const visit_controller_1 = require("./patient/visit.controller");
const prescription_service_1 = require("./prescription/prescription.service");
const prescription_controller_1 = require("./prescription/prescription.controller");
const notification_module_1 = require("./notification/notification.module");
const crypto_service_1 = require("./auth/crypto.service");
const medicine_module_1 = require("./medicine/medicine.module");
const reports_module_1 = require("./reports/reports.module");
const storage_module_1 = require("./common/storage/storage.module");
const throttler_1 = require("@nestjs/throttler");
const health_controller_1 = require("./health/health.controller");
const redis_module_1 = require("./common/redis/redis.module");
const audit_log_module_1 = require("./common/audit-log/audit-log.module");
const dashboard_module_1 = require("./dashboard/dashboard.module");
const prisma_module_1 = require("./prisma.module");
const core_1 = require("@nestjs/core");
const auth_guard_1 = require("./auth/auth.guard");
const roles_guard_1 = require("./auth/roles.guard");
const permissions_guard_1 = require("./auth/permissions.guard");
const users_controller_1 = require("./auth/users.controller");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            throttler_1.ThrottlerModule.forRoot([
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
            prisma_module_1.PrismaModule,
            redis_module_1.RedisModule,
            audit_log_module_1.AuditLogModule,
            dashboard_module_1.DashboardModule,
            auth_module_1.AuthModule,
            queue_module_1.QueueModule,
            document_module_1.DocumentModule,
            laboratory_module_1.LaboratoryModule,
            settings_module_1.SettingsModule,
            followup_module_1.FollowUpModule,
            medicine_module_1.MedicineModule,
            reports_module_1.ReportsModule,
            storage_module_1.StorageModule,
            notification_module_1.NotificationModule,
        ],
        controllers: [
            app_controller_1.AppController,
            doctor_controller_1.DoctorController,
            appointment_controller_1.AppointmentController,
            patient_controller_1.PatientController,
            patient_history_controller_1.PatientHistoryController,
            visit_controller_1.VisitController,
            prescription_controller_1.PrescriptionController,
            health_controller_1.HealthController,
            users_controller_1.UsersController,
        ],
        providers: [
            app_service_1.AppService,
            appointment_service_1.AppointmentService,
            patient_service_1.PatientService,
            patient_history_service_1.PatientHistoryService,
            prescription_service_1.PrescriptionService,
            crypto_service_1.CryptoService,
            {
                provide: core_1.APP_GUARD,
                useClass: auth_guard_1.AuthGuard,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: roles_guard_1.RolesGuard,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: permissions_guard_1.PermissionsGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map