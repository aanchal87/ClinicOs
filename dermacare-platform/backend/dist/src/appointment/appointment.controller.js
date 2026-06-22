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
exports.AppointmentController = void 0;
const common_1 = require("@nestjs/common");
const appointment_service_1 = require("./appointment.service");
const permissions_decorator_1 = require("../auth/permissions.decorator");
let AppointmentController = class AppointmentController {
    appointmentService;
    constructor(appointmentService) {
        this.appointmentService = appointmentService;
    }
    async saveSchedule(dto) {
        return this.appointmentService.saveSchedule(dto);
    }
    async getSchedule(clinicId, req) {
        const user = req.user;
        const finalClinicId = user.role === 'SUPER_ADMIN' ? clinicId : user.clinicId;
        return this.appointmentService.getSchedule(finalClinicId);
    }
    async getSlots(clinicId, date, req) {
        const user = req.user;
        const finalClinicId = user.role === 'SUPER_ADMIN' ? clinicId : user.clinicId;
        return this.appointmentService.getAvailableSlots(finalClinicId, date);
    }
    async book(dto, req) {
        const user = req.user;
        return this.appointmentService.bookAppointment(dto, user);
    }
    async list(doctorId, date, req) {
        const user = req.user;
        const clinicId = user.role === 'SUPER_ADMIN' ? undefined : user.clinicId;
        return this.appointmentService.listAppointments(doctorId, date, clinicId);
    }
    async updateStatus(id, status) {
        return this.appointmentService.updateStatus(id, status);
    }
    async checkIn(id, req) {
        const user = req.user;
        return this.appointmentService.checkIn(id, user);
    }
};
exports.AppointmentController = AppointmentController;
__decorate([
    (0, common_1.Post)('schedule'),
    (0, permissions_decorator_1.Permissions)('MANAGE_SETTINGS'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppointmentController.prototype, "saveSchedule", null);
__decorate([
    (0, common_1.Get)('schedule'),
    (0, permissions_decorator_1.Permissions)('READ_APPOINTMENTS'),
    __param(0, (0, common_1.Query)('clinicId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AppointmentController.prototype, "getSchedule", null);
__decorate([
    (0, common_1.Get)('slots'),
    (0, permissions_decorator_1.Permissions)('READ_APPOINTMENTS'),
    __param(0, (0, common_1.Query)('clinicId')),
    __param(1, (0, common_1.Query)('date')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], AppointmentController.prototype, "getSlots", null);
__decorate([
    (0, common_1.Post)('book'),
    (0, permissions_decorator_1.Permissions)('CREATE_APPOINTMENTS'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AppointmentController.prototype, "book", null);
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.Permissions)('READ_APPOINTMENTS'),
    __param(0, (0, common_1.Query)('doctorId')),
    __param(1, (0, common_1.Query)('date')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], AppointmentController.prototype, "list", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, permissions_decorator_1.Permissions)('CREATE_APPOINTMENTS'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AppointmentController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Post)(':id/checkin'),
    (0, permissions_decorator_1.Permissions)('CREATE_APPOINTMENTS'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AppointmentController.prototype, "checkIn", null);
exports.AppointmentController = AppointmentController = __decorate([
    (0, common_1.Controller)('appointments'),
    __metadata("design:paramtypes", [appointment_service_1.AppointmentService])
], AppointmentController);
//# sourceMappingURL=appointment.controller.js.map