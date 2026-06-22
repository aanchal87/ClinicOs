import { Controller, Post, Get, Patch, Body, Query, Param, Req } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { Permissions } from '../auth/permissions.decorator';

@Controller('appointments')
export class AppointmentController {
  constructor(private appointmentService: AppointmentService) {}

  @Post('schedule')
  @Permissions('MANAGE_SETTINGS')
  async saveSchedule(@Body() dto: any) {
    return this.appointmentService.saveSchedule(dto);
  }

  @Get('schedule')
  @Permissions('READ_APPOINTMENTS')
  async getSchedule(@Query('clinicId') clinicId: string, @Req() req: any) {
    const user = req.user;
    const finalClinicId = user.role === 'SUPER_ADMIN' ? clinicId : user.clinicId;
    return this.appointmentService.getSchedule(finalClinicId);
  }

  @Get('slots')
  @Permissions('READ_APPOINTMENTS')
  async getSlots(
    @Query('clinicId') clinicId: string,
    @Query('date') date: string,
    @Req() req: any
  ) {
    const user = req.user;
    const finalClinicId = user.role === 'SUPER_ADMIN' ? clinicId : user.clinicId;
    return this.appointmentService.getAvailableSlots(finalClinicId, date);
  }

  @Post('book')
  @Permissions('CREATE_APPOINTMENTS')
  async book(@Body() dto: any, @Req() req: any) {
    const user = req.user;
    return this.appointmentService.bookAppointment(dto, user);
  }

  @Get()
  @Permissions('READ_APPOINTMENTS')
  async list(
    @Query('doctorId') doctorId: string,
    @Query('date') date: string,
    @Req() req: any
  ) {
    const user = req.user;
    const clinicId = user.role === 'SUPER_ADMIN' ? undefined : user.clinicId;
    return this.appointmentService.listAppointments(doctorId, date, clinicId);
  }

  @Patch(':id/status')
  @Permissions('CREATE_APPOINTMENTS')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string
  ) {
    return this.appointmentService.updateStatus(id, status);
  }

  @Post(':id/checkin')
  @Permissions('CREATE_APPOINTMENTS')
  async checkIn(@Param('id') id: string, @Req() req: any) {
    const user = req.user;
    return this.appointmentService.checkIn(id, user);
  }
}
