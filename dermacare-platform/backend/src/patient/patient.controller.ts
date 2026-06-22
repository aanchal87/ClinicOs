import { Controller, Post, Get, Put, Body, Query, Param, UseGuards, Req } from '@nestjs/common';
import { PatientService } from './patient.service';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import { Permissions } from '../auth/permissions.decorator';

@Controller('patients')
export class PatientController {
  constructor(private patientService: PatientService) {}

  @Get()
  @Permissions('READ_PATIENTS')
  async getAll(@Req() req: any) {
    const user = req.user;
    const clinicId = user.role === 'SUPER_ADMIN' ? undefined : user.clinicId;
    return this.patientService.searchPatients('', clinicId);
  }

  @Post()
  @Permissions('CREATE_PATIENTS')
  async create(@Body() dto: any, @Req() req: any) {
    const user = req.user;
    const clinicId = user.role === 'SUPER_ADMIN' ? undefined : user.clinicId;
    return this.patientService.createPatient(dto, clinicId, user);
  }

  @Post('aadhaar-check')
  @Permissions('READ_PATIENTS')
  @UseGuards(ThrottlerGuard)
  @Throttle({ aadhaar: { limit: 20, ttl: 60000 } })
  async checkAadhaar(@Body('aadhaar') aadhaar: string) {
    return this.patientService.checkAadhaarExists(aadhaar);
  }

  @Get('search')
  @Permissions('READ_PATIENTS')
  @UseGuards(ThrottlerGuard)
  @Throttle({ search: { limit: 60, ttl: 60000 } })
  async search(@Query('query') query: string, @Req() req: any) {
    const user = req.user;
    const clinicId = user.role === 'SUPER_ADMIN' ? undefined : user.clinicId;
    return this.patientService.searchPatients(query || '', clinicId);
  }

  @Get(':id')
  @Permissions('READ_PATIENTS')
  async getById(@Param('id') id: string, @Req() req: any) {
    const user = req.user;
    const clinicId = user.role === 'SUPER_ADMIN' ? undefined : user.clinicId;
    return this.patientService.getPatientById(id, clinicId);
  }

  @Put(':id')
  @Permissions('UPDATE_PATIENTS')
  async update(@Param('id') id: string, @Body() dto: any, @Req() req: any) {
    const user = req.user;
    const clinicId = user.role === 'SUPER_ADMIN' ? undefined : user.clinicId;
    return this.patientService.updatePatient(id, dto, clinicId, user);
  }

  @Post(':id/records')
  @Permissions('CREATE_CONSULTATIONS')
  async addRecord(
    @Param('id') id: string,
    @Body() dto: any,
    @Req() req: any
  ) {
    const user = req.user;
    const clinicId = user.role === 'SUPER_ADMIN' ? undefined : user.clinicId;
    return this.patientService.createMedicalRecord(id, dto, clinicId, user);
  }

  @Post(':id/photos')
  @Permissions('UPDATE_PATIENTS')
  async addPhoto(
    @Param('id') id: string,
    @Body() dto: any,
    @Req() req: any
  ) {
    const user = req.user;
    const clinicId = user.role === 'SUPER_ADMIN' ? undefined : user.clinicId;
    return this.patientService.uploadClinicalPhoto(id, dto, clinicId, user);
  }
}
