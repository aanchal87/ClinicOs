import { SettingsService } from './settings.service';
export declare class SettingsController {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
    getSettings(req: any): Promise<Record<string, string>>;
    updateSettings(body: Record<string, any>, req: any): Promise<any[]>;
}
