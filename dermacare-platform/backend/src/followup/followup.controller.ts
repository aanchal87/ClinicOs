import { Controller, Get, Post, Put, Body, Param, Query, Req } from '@nestjs/common';
import { FollowUpService } from './followup.service';
import { Permissions } from '../auth/permissions.decorator';

@Controller('followups')
export class FollowUpController {
  constructor(private followupService: FollowUpService) {}

  @Get()
  @Permissions('READ_PATIENTS')
  async getFollowUps(@Query('doctorId') doctorId: string, @Req() req: any) {
    const user = req.user;
    const clinicId = user.role === 'SUPER_ADMIN' ? undefined : user.clinicId;
    return this.followupService.getFollowUps(doctorId, clinicId);
  }

  @Get('patient/:patientId')
  @Permissions('READ_PATIENTS')
  async getPatientFollowUps(@Param('patientId') patientId: string, @Req() req: any) {
    const user = req.user;
    const clinicId = user.role === 'SUPER_ADMIN' ? undefined : user.clinicId;
    return this.followupService.getPatientFollowUps(patientId, clinicId);
  }

  @Post()
  @Permissions('READ_PATIENTS') // both Doctor and Receptionist can create follow-up reminders
  async createFollowUp(@Body() dto: any, @Req() req: any) {
    const user = req.user;
    const clinicId = user.role === 'SUPER_ADMIN' ? undefined : user.clinicId;
    return this.followupService.createFollowUp(dto, clinicId);
  }

  @Put(':id/status')
  @Permissions('READ_PATIENTS')
  async updateStatus(@Param('id') id: string, @Body('status') status: string, @Req() req: any) {
    const user = req.user;
    const clinicId = user.role === 'SUPER_ADMIN' ? undefined : user.clinicId;
    return this.followupService.updateFollowUpStatus(id, status, clinicId);
  }
}
