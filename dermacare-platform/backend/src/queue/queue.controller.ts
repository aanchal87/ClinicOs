import { Controller, Get, Post, Body, Param, Put, Req } from '@nestjs/common';
import { QueueService } from './queue.service';
import { Permissions } from '../auth/permissions.decorator';

@Controller('queue')
export class QueueController {
  constructor(private queueService: QueueService) {}

  @Get()
  @Permissions('READ_QUEUE')
  async getTokens(@Req() req: any) {
    const user = req.user;
    const clinicId = user.role === 'SUPER_ADMIN' ? undefined : user.clinicId;
    return this.queueService.getTokens(clinicId);
  }

  @Post()
  @Permissions('MANAGE_QUEUE')
  async createToken(@Body() dto: any, @Req() req: any) {
    const user = req.user;
    const clinicId = user.role === 'SUPER_ADMIN' ? undefined : user.clinicId;
    return this.queueService.createToken(dto, clinicId, user);
  }

  @Put(':id/status')
  @Permissions('MANAGE_QUEUE')
  async updateStatus(@Param('id') id: string, @Body('status') status: string, @Req() req: any) {
    const user = req.user;
    const clinicId = user.role === 'SUPER_ADMIN' ? undefined : user.clinicId;
    return this.queueService.updateTokenStatus(id, status, clinicId, user);
  }
}
