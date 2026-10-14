import { PrismaService } from '../prisma.service';
export declare class UsersController {
    private prisma;
    constructor(prisma: PrismaService);
    updateUserStatus(id: string, isActive: boolean, req: any): Promise<{
        id: string;
<<<<<<< HEAD
        email: string;
        role: string;
=======
        role: string;
        email: string;
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
        isActive: boolean;
    }>;
}
