"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageProviderFactory = exports.StorageProviderToken = void 0;
const local_storage_provider_1 = require("../../storage/local-storage.provider");
const s3_storage_provider_1 = require("./s3-storage.provider");
exports.StorageProviderToken = 'StorageProvider';
exports.StorageProviderFactory = {
    provide: exports.StorageProviderToken,
    useFactory: () => {
        const type = process.env.STORAGE_TYPE || 'local';
        if (type === 's3') {
            return new s3_storage_provider_1.S3StorageProvider();
        }
        return new local_storage_provider_1.LocalStorageProvider();
    },
};
//# sourceMappingURL=storage.provider.factory.js.map