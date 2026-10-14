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
exports.LaboratoryController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const laboratory_service_1 = require("./laboratory.service");
const permissions_decorator_1 = require("../auth/permissions.decorator");
let LaboratoryController = class LaboratoryController {
    laboratoryService;
    constructor(laboratoryService) {
        this.laboratoryService = laboratoryService;
    }
    async getReports(req) {
        const user = req.user;
        const clinicId = user.role === 'SUPER_ADMIN' ? undefined : user.clinicId;
        return this.laboratoryService.getReports(undefined, clinicId);
    }
    async getPatientReports(patientId, req) {
        const user = req.user;
        const clinicId = user.role === 'SUPER_ADMIN' ? undefined : user.clinicId;
        return this.laboratoryService.getReports(patientId, clinicId);
    }
    async createReport(dto, req) {
        const user = req.user;
        const clinicId = user.role === 'SUPER_ADMIN' ? undefined : user.clinicId;
        return this.laboratoryService.createReport(dto, clinicId, user);
    }
    async uploadReport(file, dto, req) {
        const user = req.user;
        const clinicId = user.role === 'SUPER_ADMIN' ? undefined : user.clinicId;
        return this.laboratoryService.uploadReport(file, dto, clinicId, user);
    }
    async deleteReport(id, req) {
        const user = req.user;
        const clinicId = user.role === 'SUPER_ADMIN' ? undefined : user.clinicId;
        return this.laboratoryService.deleteReport(id, clinicId, user);
    }
    async updateStatus(id, status, req) {
        const user = req.user;
        const clinicId = user.role === 'SUPER_ADMIN' ? undefined : user.clinicId;
        return this.laboratoryService.updateStatus(id, status, clinicId);
    }
    async reviewReport(id, dto, req) {
        const user = req.user;
        const clinicId = user.role === 'SUPER_ADMIN' ? undefined : user.clinicId;
        return this.laboratoryService.reviewReport(id, dto, clinicId, user);
    }
};
exports.LaboratoryController = LaboratoryController;
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.Permissions)('READ_LABS'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LaboratoryController.prototype, "getReports", null);
__decorate([
    (0, common_1.Get)('patient/:patientId'),
    (0, permissions_decorator_1.Permissions)('READ_LABS'),
    __param(0, (0, common_1.Param)('patientId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LaboratoryController.prototype, "getPatientReports", null);
__decorate([
    (0, common_1.Post)(),
    (0, permissions_decorator_1.Permissions)('UPLOAD_LABS'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], LaboratoryController.prototype, "createReport", null);
__decorate([
    (0, common_1.Post)('upload'),
    (0, permissions_decorator_1.Permissions)('UPLOAD_LABS'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], LaboratoryController.prototype, "uploadReport", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, permissions_decorator_1.Permissions)('DELETE_LABS'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LaboratoryController.prototype, "deleteReport", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, permissions_decorator_1.Permissions)('UPLOAD_LABS'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('status')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], LaboratoryController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Patch)(':id/review'),
    (0, permissions_decorator_1.Permissions)('REVIEW_LABS'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], LaboratoryController.prototype, "reviewReport", null);
exports.LaboratoryController = LaboratoryController = __decorate([
    (0, common_1.Controller)('laboratory'),
    __metadata("design:paramtypes", [laboratory_service_1.LaboratoryService])
], LaboratoryController);
//# sourceMappingURL=laboratory.controller.js.map