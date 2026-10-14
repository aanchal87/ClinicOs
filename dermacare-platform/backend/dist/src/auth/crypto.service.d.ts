export declare class CryptoService {
    private readonly logger;
    private readonly algorithm;
    private readonly key;
    encrypt(text: string): string;
    decrypt(encryptedText: string): string;
    hash(text: string): string;
    mask(text: string): string;
}
