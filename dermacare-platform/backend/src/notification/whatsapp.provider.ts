import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as fs from 'fs';
import * as path from 'path';

export interface WhatsAppMessageResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

@Injectable()
export class WhatsAppProvider {
  private readonly logger = new Logger(WhatsAppProvider.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Retrieves active WhatsApp credentials from ClinicSettings (DB) or Env variables as fallback
   */
  private async getCredentials(clinicId?: string | null) {
    let provider = 'sandbox';
    let accessToken = process.env.WHATSAPP_ACCESS_TOKEN || '';
    let phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';

    if (clinicId) {
      const settings = await this.prisma.clinicSettings.findMany({
        where: { clinicId },
      });

      const providerSetting = settings.find((s) => s.key === 'whatsapp_provider');
      const tokenSetting = settings.find((s) => s.key === 'whatsapp_access_token');
      const phoneIdSetting = settings.find((s) => s.key === 'whatsapp_phone_number_id');

      if (providerSetting) provider = providerSetting.value;
      if (tokenSetting && tokenSetting.value) accessToken = tokenSetting.value;
      if (phoneIdSetting && phoneIdSetting.value) phoneNumberId = phoneIdSetting.value;
    }

    return { provider, accessToken, phoneNumberId };
  }

  /**
   * Sends a WhatsApp message (either text or document PDF attachment)
   */
  async sendMessage(
    to: string,
    messageText: string,
    attachmentPath?: string | null,
    clinicId?: string | null
  ): Promise<WhatsAppMessageResult> {
    const { provider, accessToken, phoneNumberId } = await this.getCredentials(clinicId);
    
    // Clean up phone number (remove spaces, symbols; prepend code if missing, but assume clean inputs)
    const cleanTo = to.trim().replace(/[^0-9+]/g, '');

    this.logger.log(`[Outbound WhatsApp] Sending to: ${cleanTo} | Mode: ${provider}`);
    if (attachmentPath) {
      this.logger.log(`[Outbound WhatsApp] Attachment PDF path: ${attachmentPath}`);
    }

    if (provider.toLowerCase() === 'meta' && accessToken && phoneNumberId) {
      try {
        const url = `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`;
        
        let body: any;
        if (attachmentPath) {
          const fileName = path.basename(attachmentPath);
          // If in Meta API mode, we send document link payload
          body = {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: cleanTo,
            type: 'document',
            document: {
              link: `http://localhost:3001/uploads/prescriptions/${fileName}`, // Publicly served mock endpoint
              filename: fileName,
              caption: messageText,
            },
          };
        } else {
          body = {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: cleanTo,
            type: 'text',
            text: {
              preview_url: false,
              body: messageText,
            },
          };
        }

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });

        const data = await response.json();

        if (response.ok && data.messages && data.messages.length > 0) {
          this.logger.log(`[Outbound WhatsApp] Meta API Success! Message ID: ${data.messages[0].id}`);
          return { success: true, messageId: data.messages[0].id };
        } else {
          const errMsg = data.error?.message || response.statusText || 'Unknown Meta Cloud API error';
          this.logger.error(`[Outbound WhatsApp] Meta API Failed: ${JSON.stringify(data)}`);
          return { success: false, error: errMsg };
        }
      } catch (err: any) {
        this.logger.error(`[Outbound WhatsApp] Connection to Meta API failed: ${err.message}`);
        return { success: false, error: err.message };
      }
    } else {
      // Mock Sandbox Mode (Mode 1)
      const mockId = `wamid.HBgM${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      this.logger.log(`[Outbound WhatsApp Mock Log]
------------------------------------
MESSAGE TO   : ${cleanTo}
MESSAGE BODY : ${messageText}
ATTACHMENT   : ${attachmentPath || 'None'}
MESSAGE ID   : ${mockId}
------------------------------------`);
      return { success: true, messageId: mockId };
    }
  }
}
