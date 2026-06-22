import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class CryptoService {
  private readonly logger = new Logger(CryptoService.name);
  private readonly algorithm = 'aes-256-gcm';
  private readonly key = crypto.scryptSync(
    process.env.ENCRYPTION_KEY!,
    'salt-clinicos',
    32
  );

  encrypt(text: string): string {
    if (!text) return '';
    const iv = crypto.randomBytes(12); // GCM standard IV is 12 bytes
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag().toString('hex');
    
    // Combine IV, ciphertext, and auth tag into a single string
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  }

  decrypt(encryptedText: string): string {
    if (!encryptedText) return '';
    try {
      const [ivHex, authTagHex, encryptedHex] = encryptedText.split(':');
      if (!ivHex || !authTagHex || !encryptedHex) return '';
      
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');
      const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
      decipher.setAuthTag(authTag);
      
      let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (err) {
      this.logger.error('Decryption failed:', err);
      return '';
    }
  }

  hash(text: string): string {
    if (!text) return '';
    return crypto.createHash('sha256').update(text).digest('hex');
  }

  mask(text: string): string {
    if (!text || text.length < 4) return 'XXXX-XXXX-XXXX';
    const last4 = text.slice(-4);
    return `XXXX-XXXX-${last4}`;
  }
}
