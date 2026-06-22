import { Module, Global } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { WhatsAppProvider } from './whatsapp.provider';

@Global()
@Module({
  controllers: [NotificationController],
  providers: [NotificationService, WhatsAppProvider],
  exports: [NotificationService, WhatsAppProvider],
})
export class NotificationModule {}
