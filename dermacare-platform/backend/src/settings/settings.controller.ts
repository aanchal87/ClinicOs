import { Controller, Get, Put, Body, Req } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { Permissions } from '../auth/permissions.decorator';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  async getSettings(@Req() req: any) {
    const user = req.user;
    return this.settingsService.getSettings(user.clinicId);
  }

  @Put()
  @Permissions('MANAGE_SETTINGS')
  async updateSettings(@Body() body: Record<string, any>, @Req() req: any) {
    const user = req.user;
    const results: any[] = [];
    for (const [key, value] of Object.entries(body)) {
      results.push(await this.settingsService.updateSetting(user.clinicId, key, String(value)));
    }
    return results;
  }
}
