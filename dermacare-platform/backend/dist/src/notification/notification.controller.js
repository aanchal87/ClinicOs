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
exports.NotificationController = void 0;
const common_1 = require("@nestjs/common");
const notification_service_1 = require("./notification.service");
let NotificationController = class NotificationController {
    notificationService;
    constructor(notificationService) {
        this.notificationService = notificationService;
    }
    async createFollowUp(dto) {
        return this.notificationService.createFollowUp(dto);
    }
    async getPatientFollowUps(patientId) {
        return this.notificationService.getPatientFollowUps(patientId);
    }
    async getAllFollowUps() {
        return this.notificationService.getAllFollowUps();
    }
    async getOutboxLogs() {
        return this.notificationService.getOutboxLogs();
    }
    async getWhatsappOutbox() {
        return this.notificationService.getOutboxLogs();
    }
    async resendNotification(id) {
        return this.notificationService.resendNotification(id);
    }
    async triggerDailyFollowUps(date) {
        const targetDate = date || new Date().toISOString().split('T')[0];
        return this.notificationService.triggerDailyFollowUps(targetDate);
    }
    async simulateTriggerReminders(date) {
        const targetDate = date || new Date().toISOString().split('T')[0];
        return this.notificationService.triggerDailyFollowUps(targetDate);
    }
    async sendManualWhatsApp(dto) {
        return this.notificationService.sendManualWhatsApp(dto.patientId, dto.message, dto.clinicId);
    }
};
exports.NotificationController = NotificationController;
__decorate([
    (0, common_1.Post)('followup'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "createFollowUp", null);
__decorate([
    (0, common_1.Get)('followup/:patientId'),
    __param(0, (0, common_1.Param)('patientId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "getPatientFollowUps", null);
__decorate([
    (0, common_1.Get)('followups'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "getAllFollowUps", null);
__decorate([
    (0, common_1.Get)('outbox'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "getOutboxLogs", null);
__decorate([
    (0, common_1.Get)('whatsapp-outbox'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "getWhatsappOutbox", null);
__decorate([
    (0, common_1.Post)(':id/resend'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "resendNotification", null);
__decorate([
    (0, common_1.Post)('trigger-followups'),
    __param(0, (0, common_1.Body)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "triggerDailyFollowUps", null);
__decorate([
    (0, common_1.Post)('simulate-trigger'),
    __param(0, (0, common_1.Body)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "simulateTriggerReminders", null);
__decorate([
    (0, common_1.Post)('send-manual'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "sendManualWhatsApp", null);
exports.NotificationController = NotificationController = __decorate([
    (0, common_1.Controller)('notifications'),
    __metadata("design:paramtypes", [notification_service_1.NotificationService])
], NotificationController);
//# sourceMappingURL=notification.controller.js.map