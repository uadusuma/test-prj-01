import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { IUserRepository } from '../repositories/IUserRepository';
import { CreateUserDTO, User } from '../models/User';
import { EmailService } from './EmailService';
import defaultRedis from '../config/redis';
import { Redis } from 'ioredis';

export class AuthService {
    private redis: Redis | any;

    constructor(
        private userRepository: IUserRepository,
        private emailService: EmailService,
        redis?: Redis | any
    ) {
        this.redis = redis || defaultRedis;
    }

    async register(data: CreateUserDTO): Promise<User> {
        const existingUser = await this.userRepository.findByEmail(data.email);
        if (existingUser) {
            throw new Error('User already exists');
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);
        const user: User = {
            id: uuidv4(),
            email: data.email,
            password: hashedPassword,
            isVerified: false,
            provider: 'local',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        await this.userRepository.create(user);

        // Generate OTP/Token
        const token = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit OTP
        // Store OTP in Redis with expiry (e.g., 15 mins)
        await this.redis.set(`otp:${user.email}`, token, 'EX', 900);

        await this.emailService.sendVerificationEmail(user.email, token);

        return user;
    }

    async login(data: CreateUserDTO): Promise<{ user: User; token: string }> {
        const user = await this.userRepository.findByEmail(data.email);
        if (!user || !user.password) {
            throw new Error('Invalid credentials');
        }

        const isMatch = await bcrypt.compare(data.password, user.password);
        if (!isMatch) {
            throw new Error('Invalid credentials');
        }

        if (!user.isVerified) {
            throw new Error('Email not verified');
        }

        const token = this.generateToken(user);
        return { user, token };
    }

    async verifyEmail(email: string, otp: string): Promise<boolean> {
        const storedOtp = await this.redis.get(`otp:${email}`);
        if (!storedOtp || storedOtp !== otp) {
            throw new Error('Invalid or expired OTP');
        }

        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new Error('User not found');
        }

        user.isVerified = true;
        user.updatedAt = new Date().toISOString();
        await this.userRepository.update(user);
        await this.redis.del(`otp:${email}`);

        return true;
    }

    private generateToken(user: User): string {
        return jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '1d' }
        );
    }
}
