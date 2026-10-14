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
exports.VisitController = void 0;
const common_1 = require("@nestjs/common");
const patient_service_1 = require("./patient.service");
let VisitController = class VisitController {
    patientService;
    constructor(patientService) {
        this.patientService = patientService;
    }
    async closeVisit(id) {
        return this.patientService.closeVisit(id);
    }
};
exports.VisitController = VisitController;
__decorate([
    (0, common_1.Patch)(':id/close'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VisitController.prototype, "closeVisit", null);
exports.VisitController = VisitController = __decorate([
    (0, common_1.Controller)('visits'),
    __metadata("design:paramtypes", [patient_service_1.PatientService])
], VisitController);
//# sourceMappingURL=visit.controller.js.map