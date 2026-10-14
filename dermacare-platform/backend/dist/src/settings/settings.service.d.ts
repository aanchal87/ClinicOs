import { PrismaService } from '../prisma.service';
export declare class SettingsService {
    private prisma;
    constructor(prisma: PrismaService);
    getSettings(clinicId: string): Promise<Record<string, string>>;
    updateSetting(clinicId: string, key: string, value: string): Promise<{
        id: string;
        updatedAt: Date;
        clinicId: string;
        key: string;
        value: string;
    }>;
}
