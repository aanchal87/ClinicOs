import * as crypto from 'crypto';

export function maskSensitiveInfo(value: any): any {
  if (value === null || value === undefined) return value;
  
  if (typeof value === 'string') {
    // 1. Mask email address
    let masked = value.replace(
      /\b([A-Za-z0-9._%+-])[A-Za-z0-9._%+-]*@([A-Za-z0-9.-]+\.[A-Z|a-z]{2,})\b/g,
      '$1*****@$2'
    );
    
    // 2. Mask Aadhaar (12 digits or formatted 4-4-4)
    masked = masked.replace(
      /\b\d{12}\b/g,
      'XXXX-XXXX-XXXX'
    );
    masked = masked.replace(
      /\b\d{4}\s\d{4}\s\d{4}\b/g,
      'XXXX XXXX XXXX'
    );
    
    // 3. Mask JWT token (starts with eyJ followed by base64 chars)
    masked = masked.replace(
      /\beyJ[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*\b/g,
      '[JWT_TOKEN_MASKED]'
    );
    
    // 4. Mask Phone numbers (common formats, e.g. 555-0199 or 9823456789 or +91 9823456789)
    // Target 10-digit phone numbers
    masked = masked.replace(
      /\b\d{10}\b/g,
      'XXXXXXXXXX'
    );
    // Target international/formatted phone numbers
    masked = masked.replace(
      /\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
      'XXX-XXX-XXXX'
    );
    
    return masked;
  }
  
  if (Array.isArray(value)) {
    return value.map(item => maskSensitiveInfo(item));
  }
  
  if (typeof value === 'object') {
    // If it's a Buffer or Date, don't traverse
    if (value instanceof Date || Buffer.isBuffer(value)) {
      return value;
    }
    
    const maskedObj: any = {};
    for (const key in value) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        const lowerKey = key.toLowerCase();
        
        // Match sensitive keys
        if (
          lowerKey.includes('aadhaar') ||
          lowerKey.includes('phone') ||
          lowerKey.includes('email') ||
          lowerKey.includes('password') ||
          lowerKey.includes('token') ||
          lowerKey.includes('jwt') ||
          lowerKey.includes('secret') ||
          lowerKey.includes('key')
        ) {
          if (typeof value[key] === 'string') {
            maskedObj[key] = maskSensitiveInfo(value[key]);
          } else {
            maskedObj[key] = '[MASKED]';
          }
        } else {
          maskedObj[key] = maskSensitiveInfo(value[key]);
        }
      }
    }
    return maskedObj;
  }
  
  return value;
}
