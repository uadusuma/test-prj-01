import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { CreateUserSchema } from '../models/User';

export class AuthController {
    constructor(private authService: AuthService) { }

    register = async (req: Request, res: Response) => {
        try {
            const validatedData = CreateUserSchema.parse(req.body);
            const user = await this.authService.register(validatedData);
            res.status(201).json({ message: 'User registered. Please verify your email.', userId: user.id });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    };

    login = async (req: Request, res: Response) => {
        try {
            const validatedData = CreateUserSchema.parse(req.body);
            const { user, token } = await this.authService.login(validatedData);
            res.json({ user, token });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    };

    verifyEmail = async (req: Request, res: Response) => {
        try {
            const { email, otp } = req.body;
            if (!email || !otp) {
                return res.status(400).json({ message: 'Email and OTP are required' });
            }
            await this.authService.verifyEmail(email, otp);
            res.json({ message: 'Email verified successfully' });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    };
}
