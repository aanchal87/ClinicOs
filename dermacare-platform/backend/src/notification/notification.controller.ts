import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('followup')
  async createFollowUp(@Body() dto: any) {
    return this.notificationService.createFollowUp(dto);
  }

  @Get('followup/:patientId')
  async getPatientFollowUps(@Param('patientId') patientId: string) {
    return this.notificationService.getPatientFollowUps(patientId);
  }

  @Get('followups')
  async getAllFollowUps() {
    return this.notificationService.getAllFollowUps();
  }

  @Get('outbox')
  async getOutboxLogs() {
    return this.notificationService.getOutboxLogs();
  }

  @Get('whatsapp-outbox')
  async getWhatsappOutbox() {
    return this.notificationService.getOutboxLogs();
  }

  @Post(':id/resend')
  async resendNotification(@Param('id') id: string) {
    return this.notificationService.resendNotification(id);
  }

  @Post('trigger-followups')
  async triggerDailyFollowUps(@Body('date') date: string) {
    const targetDate = date || new Date().toISOString().split('T')[0];
    return this.notificationService.triggerDailyFollowUps(targetDate);
  }

  @Post('simulate-trigger')
  async simulateTriggerReminders(@Body('date') date: string) {
    const targetDate = date || new Date().toISOString().split('T')[0];
    return this.notificationService.triggerDailyFollowUps(targetDate);
  }

  @Post('send-manual')
  async sendManualWhatsApp(
    @Body() dto: { patientId: string; message: string; clinicId?: string }
  ) {
    return this.notificationService.sendManualWhatsApp(
      dto.patientId,
      dto.message,
      dto.clinicId
    );
  }
}
