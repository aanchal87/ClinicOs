import { PrismaService } from '../prisma.service';
export interface WhatsAppMessageResult {
    success: boolean;
    messageId?: string;
    error?: string;
}
export declare class WhatsAppProvider {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    private getCredentials;
    sendMessage(to: string, messageText: string, attachmentPath?: string | null, clinicId?: string | null): Promise<WhatsAppMessageResult>;
}
