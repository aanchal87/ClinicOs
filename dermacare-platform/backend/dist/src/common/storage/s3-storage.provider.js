"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3StorageProvider = void 0;
class S3StorageProvider {
    async uploadFile(fileBuffer, folder, fileName) {
        return `https://clinicos-production-s3.s3.amazonaws.com/${folder}/${fileName}`;
    }
    async deleteFile(filePath) {
    }
    async getDownloadUrl(filePath) {
        return filePath;
    }
}
exports.S3StorageProvider = S3StorageProvider;
//# sourceMappingURL=s3-storage.provider.js.map