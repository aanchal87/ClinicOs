import { Controller, Get, Query, Req } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { Permissions } from '../auth/permissions.decorator';

@Controller('reports')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get()
  @Permissions('READ_REPORTS')
  async getReports(@Query('clinicId') clinicId: string, @Req() req: any) {
    const user = req.user;
    const finalClinicId = user.role === 'SUPER_ADMIN' ? clinicId : user.clinicId;
    return this.reportsService.getReportsData(finalClinicId);
  }
}
