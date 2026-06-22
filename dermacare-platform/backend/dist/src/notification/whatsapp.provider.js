"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var WhatsAppProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsAppProvider = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const path = __importStar(require("path"));
let WhatsAppProvider = WhatsAppProvider_1 = class WhatsAppProvider {
    prisma;
    logger = new common_1.Logger(WhatsAppProvider_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getCredentials(clinicId) {
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
            if (providerSetting)
                provider = providerSetting.value;
            if (tokenSetting && tokenSetting.value)
                accessToken = tokenSetting.value;
            if (phoneIdSetting && phoneIdSetting.value)
                phoneNumberId = phoneIdSetting.value;
        }
        return { provider, accessToken, phoneNumberId };
    }
    async sendMessage(to, messageText, attachmentPath, clinicId) {
        const { provider, accessToken, phoneNumberId } = await this.getCredentials(clinicId);
        const cleanTo = to.trim().replace(/[^0-9+]/g, '');
        this.logger.log(`[Outbound WhatsApp] Sending to: ${cleanTo} | Mode: ${provider}`);
        if (attachmentPath) {
            this.logger.log(`[Outbound WhatsApp] Attachment PDF path: ${attachmentPath}`);
        }
        if (provider.toLowerCase() === 'meta' && accessToken && phoneNumberId) {
            try {
                const url = `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`;
                let body;
                if (attachmentPath) {
                    const fileName = path.basename(attachmentPath);
                    body = {
                        messaging_product: 'whatsapp',
                        recipient_type: 'individual',
                        to: cleanTo,
                        type: 'document',
                        document: {
                            link: `http://localhost:3001/uploads/prescriptions/${fileName}`,
                            filename: fileName,
                            caption: messageText,
                        },
                    };
                }
                else {
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
                }
                else {
                    const errMsg = data.error?.message || response.statusText || 'Unknown Meta Cloud API error';
                    this.logger.error(`[Outbound WhatsApp] Meta API Failed: ${JSON.stringify(data)}`);
                    return { success: false, error: errMsg };
                }
            }
            catch (err) {
                this.logger.error(`[Outbound WhatsApp] Connection to Meta API failed: ${err.message}`);
                return { success: false, error: err.message };
            }
        }
        else {
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
};
exports.WhatsAppProvider = WhatsAppProvider;
exports.WhatsAppProvider = WhatsAppProvider = WhatsAppProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WhatsAppProvider);
//# sourceMappingURL=whatsapp.provider.js.map