<<<<<<< HEAD
import { BadRequestException, Controller, Post, Get, Put, Body, Query, Param, UseGuards, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
=======
import { Controller, Post, Get, Put, Body, Query, Param, UseGuards, Req } from '@nestjs/common';
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
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
<<<<<<< HEAD
  @Permissions('CREATE_CONSULTATIONS')
=======
  @Permissions('UPDATE_PATIENTS')
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
  async addPhoto(
    @Param('id') id: string,
    @Body() dto: any,
    @Req() req: any
  ) {
    const user = req.user;
    const clinicId = user.role === 'SUPER_ADMIN' ? undefined : user.clinicId;
    return this.patientService.uploadClinicalPhoto(id, dto, clinicId, user);
  }
<<<<<<< HEAD

  @Post(':id/photos/upload')
  @Permissions('CREATE_CONSULTATIONS')
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (_req, file, callback) => {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
        return callback(new BadRequestException('Upload a JPEG, PNG, or WebP image'), false);
      }
      callback(null, true);
    },
  }))
  async uploadPhotoFile(
    @Param('id') id: string,
    @UploadedFile() file: any,
    @Body() dto: any,
    @Req() req: any,
  ) {
    const user = req.user;
    const clinicId = user.role === 'SUPER_ADMIN' ? undefined : user.clinicId;
    return this.patientService.uploadClinicalPhotoFile(id, file, dto, clinicId, user);
  }
=======
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
}
