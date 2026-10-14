"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedicineService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let MedicineService = class MedicineService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async searchMedicines(query) {
        if (!query) {
            return this.prisma.medicine.findMany({
                where: { deletedAt: null },
                take: 10,
            });
        }
        return this.prisma.medicine.findMany({
            where: {
                name: {
                    contains: query,
                },
                deletedAt: null,
            },
            take: 20,
        });
    }
    async createMedicine(name, category) {
        return this.prisma.medicine.create({
            data: {
                name,
                category,
            },
        });
    }
};
exports.MedicineService = MedicineService;
exports.MedicineService = MedicineService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MedicineService);
//# sourceMappingURL=medicine.service.js.map