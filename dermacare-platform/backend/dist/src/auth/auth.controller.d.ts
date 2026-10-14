import { AuthService } from './auth.service';
import * as express from 'express';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(registerDto: any): Promise<{
        id: string;
        email: string;
        role: string;
        doctor: {
            id: string;
            fullName: string;
            mciNumber: string;
        };
    }>;
    login(loginDto: any, ip: string, res: express.Response): Promise<{
        message: string;
        accessToken: string;
        user: {
            id: string;
            email: string;
            role: string;
            clinicId: string | null;
            doctor: {
                id: string;
                fullName: string;
                mciNumber: string;
                specializations: string;
                qualifications: string;
                experienceYears: number;
                clinics: {
                    id: string;
<<<<<<< HEAD
                    address: string;
=======
                    name: string;
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
                    createdAt: Date;
                    updatedAt: Date;
                    createdBy: string | null;
                    deletedAt: Date | null;
<<<<<<< HEAD
                    name: string;
=======
                    address: string;
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
                    city: string;
                    state: string;
                    pincode: string;
                    contactNumber: string | null;
                    workingHours: string;
                    doctorId: string;
                }[];
            } | null;
        };
    }>;
    refresh(req: express.Request, ip: string, res: express.Response): Promise<{
        accessToken: string;
    }>;
    logout(req: express.Request, ip: string, res: express.Response): Promise<{
        message: string;
    }>;
}
