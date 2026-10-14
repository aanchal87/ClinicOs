import { Controller, Get, Param, Req } from '@nestjs/common';
import { PatientHistoryService } from './patient-history.service';
import { Permissions } from '../auth/permissions.decorator';

@Controller('patients')
export class PatientHistoryController {
  constructor(private patientHistoryService: PatientHistoryService) {}

  @Get(':id/history')
  @Permissions('READ_PATIENTS')
  async getHistory(@Param('id') id: string, @Req() req: any) {
    const user = req.user;
    const clinicId = user.role === 'SUPER_ADMIN' ? undefined : user.clinicId;
    return this.patientHistoryService.getPatientHistory(id, clinicId);
  }
}
