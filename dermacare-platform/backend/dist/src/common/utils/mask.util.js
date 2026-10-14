"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.maskSensitiveInfo = maskSensitiveInfo;
function maskSensitiveInfo(value) {
    if (value === null || value === undefined)
        return value;
    if (typeof value === 'string') {
        let masked = value.replace(/\b([A-Za-z0-9._%+-])[A-Za-z0-9._%+-]*@([A-Za-z0-9.-]+\.[A-Z|a-z]{2,})\b/g, '$1*****@$2');
        masked = masked.replace(/\b\d{12}\b/g, 'XXXX-XXXX-XXXX');
        masked = masked.replace(/\b\d{4}\s\d{4}\s\d{4}\b/g, 'XXXX XXXX XXXX');
        masked = masked.replace(/\beyJ[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*\b/g, '[JWT_TOKEN_MASKED]');
        masked = masked.replace(/\b\d{10}\b/g, 'XXXXXXXXXX');
        masked = masked.replace(/\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g, 'XXX-XXX-XXXX');
        return masked;
    }
    if (Array.isArray(value)) {
        return value.map(item => maskSensitiveInfo(item));
    }
    if (typeof value === 'object') {
        if (value instanceof Date || Buffer.isBuffer(value)) {
            return value;
        }
        const maskedObj = {};
        for (const key in value) {
            if (Object.prototype.hasOwnProperty.call(value, key)) {
                const lowerKey = key.toLowerCase();
                if (lowerKey.includes('aadhaar') ||
                    lowerKey.includes('phone') ||
                    lowerKey.includes('email') ||
                    lowerKey.includes('password') ||
                    lowerKey.includes('token') ||
                    lowerKey.includes('jwt') ||
                    lowerKey.includes('secret') ||
                    lowerKey.includes('key')) {
                    if (typeof value[key] === 'string') {
                        maskedObj[key] = maskSensitiveInfo(value[key]);
                    }
                    else {
                        maskedObj[key] = '[MASKED]';
                    }
                }
                else {
                    maskedObj[key] = maskSensitiveInfo(value[key]);
                }
            }
        }
        return maskedObj;
    }
    return value;
}
//# sourceMappingURL=mask.util.js.map