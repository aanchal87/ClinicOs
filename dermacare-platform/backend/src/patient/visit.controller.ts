import { Controller, Patch, Param } from '@nestjs/common';
import { PatientService } from './patient.service';

@Controller('visits')
export class VisitController {
  constructor(private patientService: PatientService) {}

  @Patch(':id/close')
  async closeVisit(@Param('id') id: string) {
    return this.patientService.closeVisit(id);
  }
}
