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
exports.PrescriptionController = void 0;
const common_1 = require("@nestjs/common");
const prescription_service_1 = require("./prescription.service");
const permissions_decorator_1 = require("../auth/permissions.decorator");
let PrescriptionController = class PrescriptionController {
    prescriptionService;
    constructor(prescriptionService) {
        this.prescriptionService = prescriptionService;
    }
    async create(dto, req) {
        const user = req.user;
        const clinicId = user.role === 'SUPER_ADMIN' ? undefined : user.clinicId;
        return this.prescriptionService.createPrescription(dto, clinicId, user);
    }
    async getPatientPrescriptions(patientId, req) {
        const user = req.user;
        const clinicId = user.role === 'SUPER_ADMIN' ? undefined : user.clinicId;
        return this.prescriptionService.getPatientPrescriptions(patientId, clinicId);
    }
    async getPrescriptionDetails(id, req) {
        const user = req.user;
        const clinicId = user.role === 'SUPER_ADMIN' ? undefined : user.clinicId;
        return this.prescriptionService.getPrescriptionDetails(id, clinicId);
    }
};
exports.PrescriptionController = PrescriptionController;
__decorate([
    (0, common_1.Post)(),
    (0, permissions_decorator_1.Permissions)('CREATE_PRESCRIPTIONS'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PrescriptionController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('patient/:patientId'),
    (0, permissions_decorator_1.Permissions)('READ_PRESCRIPTIONS'),
    __param(0, (0, common_1.Param)('patientId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PrescriptionController.prototype, "getPatientPrescriptions", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, permissions_decorator_1.Permissions)('READ_PRESCRIPTIONS'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PrescriptionController.prototype, "getPrescriptionDetails", null);
exports.PrescriptionController = PrescriptionController = __decorate([
    (0, common_1.Controller)('prescriptions'),
    __metadata("design:paramtypes", [prescription_service_1.PrescriptionService])
], PrescriptionController);
//# sourceMappingURL=prescription.controller.js.map