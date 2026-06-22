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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const permissions_decorator_1 = require("./permissions.decorator");
let UsersController = class UsersController {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async updateUserStatus(id, isActive, req) {
        const user = req.user;
        if (user.role !== 'SUPER_ADMIN') {
            throw new common_1.ForbiddenException('Access denied. Super Admin role required.');
        }
        const targetUser = await this.prisma.user.findUnique({
            where: { id },
        });
        if (!targetUser) {
            throw new common_1.NotFoundException('User not found.');
        }
        if (targetUser.role === 'SUPER_ADMIN') {
            throw new common_1.ForbiddenException('Cannot modify status of a Super Admin user.');
        }
        return this.prisma.user.update({
            where: { id },
            data: { isActive },
            select: { id: true, email: true, role: true, isActive: true }
        });
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Put)(':id/status'),
    (0, permissions_decorator_1.Permissions)('MANAGE_USERS'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('isActive')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateUserStatus", null);
exports.UsersController = UsersController = __decorate([
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersController);
//# sourceMappingURL=users.controller.js.map