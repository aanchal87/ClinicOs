import { StorageProvider } from './storage.provider';

export class S3StorageProvider implements StorageProvider {
  async uploadFile(fileBuffer: Buffer, folder: string, fileName: string): Promise<string> {
    // console.log(`[S3StorageProvider] Simulated S3 upload: ${folder}/${fileName}`);
    return `https://clinicos-production-s3.s3.amazonaws.com/${folder}/${fileName}`;
  }

  async deleteFile(filePath: string): Promise<void> {
    // console.log(`[S3StorageProvider] Simulated S3 delete: ${filePath}`);
  }

  async getDownloadUrl(filePath: string): Promise<string> {
    return filePath;
  }
}
