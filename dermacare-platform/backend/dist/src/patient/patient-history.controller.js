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
exports.PatientHistoryController = void 0;
const common_1 = require("@nestjs/common");
const patient_history_service_1 = require("./patient-history.service");
const permissions_decorator_1 = require("../auth/permissions.decorator");
let PatientHistoryController = class PatientHistoryController {
    patientHistoryService;
    constructor(patientHistoryService) {
        this.patientHistoryService = patientHistoryService;
    }
    async getHistory(id, req) {
        const user = req.user;
        const clinicId = user.role === 'SUPER_ADMIN' ? undefined : user.clinicId;
        return this.patientHistoryService.getPatientHistory(id, clinicId);
    }
};
exports.PatientHistoryController = PatientHistoryController;
__decorate([
    (0, common_1.Get)(':id/history'),
    (0, permissions_decorator_1.Permissions)('READ_PATIENTS'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PatientHistoryController.prototype, "getHistory", null);
exports.PatientHistoryController = PatientHistoryController = __decorate([
    (0, common_1.Controller)('patients'),
    __metadata("design:paramtypes", [patient_history_service_1.PatientHistoryService])
], PatientHistoryController);
//# sourceMappingURL=patient-history.controller.js.map