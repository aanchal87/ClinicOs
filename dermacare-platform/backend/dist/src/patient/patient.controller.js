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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatientController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const patient_service_1 = require("./patient.service");
const throttler_1 = require("@nestjs/throttler");
const permissions_decorator_1 = require("../auth/permissions.decorator");
let PatientController = class PatientController {
    patientService;
    constructor(patientService) {
        this.patientService = patientService;
    }
    async getAll(req) {
        const user = req.user;
        const clinicId = user.role === 'SUPER_ADMIN' ? undefined : user.clinicId;
        return this.patientService.searchPatients('', clinicId);
    }
    async create(dto, req) {
        const user = req.user;
        const clinicId = user.role === 'SUPER_ADMIN' ? undefined : user.clinicId;
        return this.patientService.createPatient(dto, clinicId, user);
    }
    async checkAadhaar(aadhaar) {
        return this.patientService.checkAadhaarExists(aadhaar);
    }
    async search(query, req) {
        const user = req.user;
        const clinicId = user.role === 'SUPER_ADMIN' ? undefined : user.clinicId;
        return this.patientService.searchPatients(query || '', clinicId);
    }
    async getById(id, req) {
        const user = req.user;
        const clinicId = user.role === 'SUPER_ADMIN' ? undefined : user.clinicId;
        return this.patientService.getPatientById(id, clinicId);
    }
    async update(id, dto, req) {
        const user = req.user;
        const clinicId = user.role === 'SUPER_ADMIN' ? undefined : user.clinicId;
        return this.patientService.updatePatient(id, dto, clinicId, user);
    }
    async addRecord(id, dto, req) {
        const user = req.user;
        const clinicId = user.role === 'SUPER_ADMIN' ? undefined : user.clinicId;
        return this.patientService.createMedicalRecord(id, dto, clinicId, user);
    }
    async addPhoto(id, dto, req) {
        const user = req.user;
        const clinicId = user.role === 'SUPER_ADMIN' ? undefined : user.clinicId;
        return this.patientService.uploadClinicalPhoto(id, dto, clinicId, user);
    }
    async uploadPhotoFile(id, file, dto, req) {
        const user = req.user;
        const clinicId = user.role === 'SUPER_ADMIN' ? undefined : user.clinicId;
        return this.patientService.uploadClinicalPhotoFile(id, file, dto, clinicId, user);
    }
};
exports.PatientController = PatientController;
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.Permissions)('READ_PATIENTS'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PatientController.prototype, "getAll", null);
__decorate([
    (0, common_1.Post)(),
    (0, permissions_decorator_1.Permissions)('CREATE_PATIENTS'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PatientController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('aadhaar-check'),
    (0, permissions_decorator_1.Permissions)('READ_PATIENTS'),
    (0, common_1.UseGuards)(throttler_1.ThrottlerGuard),
    (0, throttler_1.Throttle)({ aadhaar: { limit: 20, ttl: 60000 } }),
    __param(0, (0, common_1.Body)('aadhaar')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PatientController.prototype, "checkAadhaar", null);
__decorate([
    (0, common_1.Get)('search'),
    (0, permissions_decorator_1.Permissions)('READ_PATIENTS'),
    (0, common_1.UseGuards)(throttler_1.ThrottlerGuard),
    (0, throttler_1.Throttle)({ search: { limit: 60, ttl: 60000 } }),
    __param(0, (0, common_1.Query)('query')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PatientController.prototype, "search", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, permissions_decorator_1.Permissions)('READ_PATIENTS'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PatientController.prototype, "getById", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, permissions_decorator_1.Permissions)('UPDATE_PATIENTS'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], PatientController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/records'),
    (0, permissions_decorator_1.Permissions)('CREATE_CONSULTATIONS'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], PatientController.prototype, "addRecord", null);
__decorate([
    (0, common_1.Post)(':id/photos'),
    (0, permissions_decorator_1.Permissions)('CREATE_CONSULTATIONS'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], PatientController.prototype, "addPhoto", null);
__decorate([
    (0, common_1.Post)(':id/photos/upload'),
    (0, permissions_decorator_1.Permissions)('CREATE_CONSULTATIONS'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        limits: { fileSize: 10 * 1024 * 1024 },
        fileFilter: (_req, file, callback) => {
            if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
                return callback(new common_1.BadRequestException('Upload a JPEG, PNG, or WebP image'), false);
            }
            callback(null, true);
        },
    })),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], PatientController.prototype, "uploadPhotoFile", null);
exports.PatientController = PatientController = __decorate([
    (0, common_1.Controller)('patients'),
    __metadata("design:paramtypes", [patient_service_1.PatientService])
], PatientController);
//# sourceMappingURL=patient.controller.js.map