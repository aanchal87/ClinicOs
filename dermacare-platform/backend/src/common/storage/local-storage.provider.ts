import { StorageProvider } from './storage.provider';
import * as fs from 'fs';
import * as path from 'path';

export class LocalStorageProvider implements StorageProvider {
  private baseDir = path.resolve(process.env.STORAGE_PATH || 'uploads');

  constructor() {
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
    const directories = ['patients', 'lab-reports', 'documents', 'treatment-images'];
    for (const dir of directories) {
      const targetPath = path.join(this.baseDir, dir);
      if (!fs.existsSync(targetPath)) {
        fs.mkdirSync(targetPath, { recursive: true });
      }
    }
  }

  async uploadFile(fileBuffer: Buffer, folder: string, fileName: string): Promise<string> {
    const targetDir = path.join(this.baseDir, folder);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const filePath = path.join(targetDir, fileName);
    await fs.promises.writeFile(filePath, fileBuffer);
    
    // Return relative URL path
    return path.join('uploads', folder, fileName).replace(/\\/g, '/');
  }

  async deleteFile(filePath: string): Promise<void> {
    const fullPath = path.resolve(process.cwd(), filePath);
    if (fs.existsSync(fullPath)) {
      await fs.promises.unlink(fullPath);
    }
  }

  async getDownloadUrl(filePath: string): Promise<string> {
    return `/${filePath.replace(/\\/g, '/')}`;
  }
}
