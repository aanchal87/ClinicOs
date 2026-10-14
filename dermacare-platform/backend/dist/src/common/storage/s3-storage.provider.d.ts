import { StorageProvider } from './storage.provider';
export declare class S3StorageProvider implements StorageProvider {
    uploadFile(fileBuffer: Buffer, folder: string, fileName: string): Promise<string>;
    deleteFile(filePath: string): Promise<void>;
    getDownloadUrl(filePath: string): Promise<string>;
}
