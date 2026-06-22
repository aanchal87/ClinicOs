import { StorageProvider } from '../common/storage/storage.provider';
export declare class LocalStorageProvider implements StorageProvider {
    private baseDir;
    constructor();
    uploadFile(fileBuffer: Buffer, folder: string, fileName: string): Promise<string>;
    deleteFile(filePath: string): Promise<void>;
    getDownloadUrl(filePath: string): Promise<string>;
}
