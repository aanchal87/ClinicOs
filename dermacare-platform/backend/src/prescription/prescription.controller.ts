import { Controller, Post, Get, Body, Param, Req } from '@nestjs/common';
import { PrescriptionService } from './prescription.service';
import { Permissions } from '../auth/permissions.decorator';

@Controller('prescriptions')
export class PrescriptionController {
  constructor(private prescriptionService: PrescriptionService) {}

  @Post()
  @Permissions('CREATE_PRESCRIPTIONS')
  async create(@Body() dto: any, @Req() req: any) {
    const user = req.user;
    const clinicId = user.role === 'SUPER_ADMIN' ? undefined : user.clinicId;
    return this.prescriptionService.createPrescription(dto, clinicId, user);
  }

  @Get('patient/:patientId')
  @Permissions('READ_PRESCRIPTIONS')
  async getPatientPrescriptions(@Param('patientId') patientId: string, @Req() req: any) {
    const user = req.user;
    const clinicId = user.role === 'SUPER_ADMIN' ? undefined : user.clinicId;
    return this.prescriptionService.getPatientPrescriptions(patientId, clinicId);
  }

  @Get(':id')
  @Permissions('READ_PRESCRIPTIONS')
  async getPrescriptionDetails(@Param('id') id: string, @Req() req: any) {
    const user = req.user;
    const clinicId = user.role === 'SUPER_ADMIN' ? undefined : user.clinicId;
    return this.prescriptionService.getPrescriptionDetails(id, clinicId);
  }
}
