import { PrismaService } from '../prisma.service';
export declare class UsersController {
    private prisma;
    constructor(prisma: PrismaService);
    updateUserStatus(id: string, isActive: boolean, req: any): Promise<{
        id: string;
        role: string;
        email: string;
        isActive: boolean;
    }>;
}
