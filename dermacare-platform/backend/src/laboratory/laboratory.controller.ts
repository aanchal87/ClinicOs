import { Controller, Get, Post, Delete, Patch, Body, Param, UseInterceptors, UploadedFile, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { LaboratoryService } from './laboratory.service';
import { Permissions } from '../auth/permissions.decorator';

@Controller('laboratory')
export class LaboratoryController {
  constructor(private laboratoryService: LaboratoryService) {}

  @Get()
  @Permissions('READ_LABS')
  async getReports(@Req() req: any) {
    const user = req.user;
    const clinicId = user.role === 'SUPER_ADMIN' ? undefined : user.clinicId;
    return this.laboratoryService.getReports(undefined, clinicId);
  }

  @Get('patient/:patientId')
  @Permissions('READ_LABS')
  async getPatientReports(@Param('patientId') patientId: string, @Req() req: any) {
    const user = req.user;
    const clinicId = user.role === 'SUPER_ADMIN' ? undefined : user.clinicId;
    return this.laboratoryService.getReports(patientId, clinicId);
  }

  @Post()
  @Permissions('UPLOAD_LABS')
  async createReport(@Body() dto: any, @Req() req: any) {
    const user = req.user;
    const clinicId = user.role === 'SUPER_ADMIN' ? undefined : user.clinicId;
    return this.laboratoryService.createReport(dto, clinicId, user);
  }

  @Post('upload')
  @Permissions('UPLOAD_LABS')
  @UseInterceptors(FileInterceptor('file'))
  async uploadReport(@UploadedFile() file: any, @Body() dto: any, @Req() req: any) {
    const user = req.user;
    const clinicId = user.role === 'SUPER_ADMIN' ? undefined : user.clinicId;
    return this.laboratoryService.uploadReport(file, dto, clinicId, user);
  }

  @Delete(':id')
  @Permissions('DELETE_LABS')
  async deleteReport(@Param('id') id: string, @Req() req: any) {
    const user = req.user;
    const clinicId = user.role === 'SUPER_ADMIN' ? undefined : user.clinicId;
    return this.laboratoryService.deleteReport(id, clinicId, user);
  }

  @Patch(':id/status')
  @Permissions('UPLOAD_LABS')
  async updateStatus(@Param('id') id: string, @Body('status') status: string, @Req() req: any) {
    const user = req.user;
    const clinicId = user.role === 'SUPER_ADMIN' ? undefined : user.clinicId;
    return this.laboratoryService.updateStatus(id, status, clinicId);
  }

  @Patch(':id/review')
  @Permissions('REVIEW_LABS')
  async reviewReport(
    @Param('id') id: string,
    @Body() dto: { reviewedBy: string; reviewNotes: string },
    @Req() req: any,
  ) {
    const user = req.user;
    const clinicId = user.role === 'SUPER_ADMIN' ? undefined : user.clinicId;
    return this.laboratoryService.reviewReport(id, dto, clinicId, user);
  }
}
