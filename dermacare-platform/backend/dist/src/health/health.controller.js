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
exports.HealthController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const redis_1 = require("redis");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const public_decorator_1 = require("../auth/public.decorator");
let HealthController = class HealthController {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getHealth(res) {
        const dbStatus = await this.checkDb();
        const redisStatus = await this.checkRedis();
        const storageStatus = await this.checkStorage();
        const isHealthy = dbStatus === 'healthy' && redisStatus === 'healthy' && storageStatus === 'healthy';
        const payload = {
            status: isHealthy ? 'healthy' : 'unhealthy',
            api: 'healthy',
            database: dbStatus,
            redis: redisStatus,
            storage: storageStatus,
        };
        return res.status(isHealthy ? common_1.HttpStatus.OK : common_1.HttpStatus.SERVICE_UNAVAILABLE).json(payload);
    }
    async getDatabaseHealth(res) {
        const dbStatus = await this.checkDb();
        const isHealthy = dbStatus === 'healthy';
        return res.status(isHealthy ? common_1.HttpStatus.OK : common_1.HttpStatus.SERVICE_UNAVAILABLE).json({ database: dbStatus });
    }
    async getRedisHealth(res) {
        const redisStatus = await this.checkRedis();
        const isHealthy = redisStatus === 'healthy';
        return res.status(isHealthy ? common_1.HttpStatus.OK : common_1.HttpStatus.SERVICE_UNAVAILABLE).json({ redis: redisStatus });
    }
    async checkDb() {
        try {
            await this.prisma.$queryRaw `SELECT 1`;
            return 'healthy';
        }
        catch (e) {
            return 'unhealthy';
        }
    }
    async checkRedis() {
        const redisUrl = process.env.REDIS_URL;
        if (!redisUrl)
            return 'unhealthy';
        try {
            const client = (0, redis_1.createClient)({
                url: redisUrl,
                socket: { connectTimeout: 1000 }
            });
            await client.connect();
            await client.ping();
            await client.disconnect();
            return 'healthy';
        }
        catch (e) {
            return 'unhealthy';
        }
    }
    async checkStorage() {
        const storagePath = process.env.STORAGE_PATH || 'uploads';
        try {
            const resolvedPath = path.resolve(process.cwd(), storagePath);
            if (!fs.existsSync(resolvedPath)) {
                fs.mkdirSync(resolvedPath, { recursive: true });
            }
            const testFile = path.join(resolvedPath, '.healthcheck');
            fs.writeFileSync(testFile, 'test');
            fs.unlinkSync(testFile);
            return 'healthy';
        }
        catch (e) {
            return 'unhealthy';
        }
    }
};
exports.HealthController = HealthController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "getHealth", null);
__decorate([
    (0, common_1.Get)('database'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "getDatabaseHealth", null);
__decorate([
    (0, common_1.Get)('redis'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "getRedisHealth", null);
exports.HealthController = HealthController = __decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Controller)('health'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], HealthController);
//# sourceMappingURL=health.controller.js.map