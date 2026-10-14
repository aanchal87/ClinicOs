"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const storage_provider_factory_1 = require("../common/storage/storage.provider.factory");
const audit_log_service_1 = require("../common/audit-log/audit-log.service");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
let DocumentService = class DocumentService {
    prisma;
    storageProvider;
    auditLogService;
    constructor(prisma, storageProvider, auditLogService) {
        this.prisma = prisma;
        this.storageProvider = storageProvider;
        this.auditLogService = auditLogService;
    }
    async getDocuments(patientId, clinicId) {
        const patient = await this.prisma.patient.findUnique({
            where: { id: patientId }
        });
        if (!patient || (clinicId && patient.clinicId !== clinicId)) {
            throw new common_1.NotFoundException('Patient not found');
        }
        return this.prisma.document.findMany({
            where: { patientId },
            orderBy: { createdAtDb: 'desc' },
        });
    }
    async uploadDocument(patientId, file, dto, clinicId, userPayload) {
        const patient = await this.prisma.patient.findUnique({
            where: { id: patientId }
        });
        if (!patient || (clinicId && patient.clinicId !== clinicId)) {
            throw new common_1.NotFoundException('Patient not found');
        }
        const { documentType, uploadedBy } = dto;
        if (!file) {
            throw new Error('No file provided for upload');
        }
        const fileName = `${Date.now()}-${file.originalname}`;
        const filePath = await this.storageProvider.uploadFile(file.buffer, 'documents', fileName);
        const sizeMB = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
        const finalClinicId = clinicId || patient.clinicId || null;
        const document = await this.prisma.document.create({
            data: {
                patientId,
                documentName: file.originalname,
                documentType: documentType || 'Miscellaneous',
                fileSize: sizeMB,
                uploadedBy: uploadedBy || userPayload?.role || 'Staff',
                filePath,
                createdAt: new Date().toLocaleDateString(),
                clinicId: finalClinicId,
            },
        });
        await this.auditLogService.log({
            userId: userPayload?.sub,
            role: userPayload?.role,
            action: 'DOCUMENT_UPLOAD',
            details: `Uploaded document "${document.documentName}" (Type: ${document.documentType}) for patient ID ${patientId}`,
            metadata: { documentId: document.id, patientId, clinicId: finalClinicId },
        });
        return document;
    }
    async deleteDocument(id, clinicId, userPayload) {
        const doc = await this.prisma.document.findUnique({ where: { id } });
        if (!doc || (clinicId && doc.clinicId !== clinicId)) {
            throw new common_1.NotFoundException('Document not found');
        }
        if (doc.filePath) {
            await this.storageProvider.deleteFile(doc.filePath);
        }
        const deletedDoc = await this.prisma.document.delete({ where: { id } });
        await this.auditLogService.log({
            userId: userPayload?.sub,
            role: userPayload?.role,
            action: 'DOCUMENT_DELETE',
            details: `Deleted document "${doc.documentName}" (Type: ${doc.documentType}) for patient ID ${doc.patientId}`,
            metadata: { documentId: id, patientId: doc.patientId, clinicId: doc.clinicId },
        });
        return deletedDoc;
    }
    async downloadDocument(id, clinicId, userPayload) {
        const doc = await this.prisma.document.findUnique({ where: { id } });
        if (!doc || (clinicId && doc.clinicId !== clinicId)) {
            throw new common_1.NotFoundException('Document not found');
        }
        if (!doc.filePath) {
            throw new common_1.NotFoundException('Document file path is not set');
        }
        const absolutePath = path.resolve(process.cwd(), doc.filePath);
        if (!fs.existsSync(absolutePath)) {
            throw new common_1.NotFoundException('Document file not found on disk');
        }
        await this.auditLogService.log({
            userId: userPayload?.sub,
            role: userPayload?.role,
            action: 'DOCUMENT_DOWNLOAD',
            details: `Downloaded document "${doc.documentName}" (Type: ${doc.documentType}) for patient ID ${doc.patientId}`,
            metadata: { documentId: id, patientId: doc.patientId, clinicId: doc.clinicId },
        });
        return { absolutePath, documentName: doc.documentName };
    }
};
exports.DocumentService = DocumentService;
exports.DocumentService = DocumentService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(storage_provider_factory_1.StorageProviderToken)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, Object, audit_log_service_1.AuditLogService])
], DocumentService);
//# sourceMappingURL=document.service.js.map