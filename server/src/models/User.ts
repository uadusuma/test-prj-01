import { z } from 'zod';

export const UserSchema = z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    password: z.string().optional(), // Optional for OAuth users
    isVerified: z.boolean().default(false),
    provider: z.enum(['local', 'google', 'facebook']),
    providerId: z.string().optional(),
    createdAt: z.string(), // Redis stores dates as strings in JSON
    updatedAt: z.string(),
});

export type User = z.infer<typeof UserSchema>;

export const CreateUserSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

export type CreateUserDTO = z.infer<typeof CreateUserSchema>;
