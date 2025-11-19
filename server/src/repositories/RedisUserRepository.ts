import { IUserRepository } from './IUserRepository';
import { User } from '../models/User';
import defaultRedis from '../config/redis';
import { Redis } from 'ioredis';

export class RedisUserRepository implements IUserRepository {
    private readonly USER_PREFIX = 'user:';
    private readonly EMAIL_INDEX = 'user:email:';
    private redis: Redis | any;

    constructor(redis?: Redis | any) {
        this.redis = redis || defaultRedis;
    }

    async create(user: User): Promise<User> {
        const userKey = `${this.USER_PREFIX}${user.id}`;
        const emailKey = `${this.EMAIL_INDEX}${user.email}`;

        // Transaction to ensure atomicity
        const pipeline = this.redis.pipeline();
        pipeline.set(userKey, JSON.stringify(user));
        pipeline.set(emailKey, user.id);
        await pipeline.exec();

        return user;
    }

    async findByEmail(email: string): Promise<User | null> {
        const userId = await this.redis.get(`${this.EMAIL_INDEX}${email}`);
        if (!userId) return null;
        return this.findById(userId);
    }

    async findById(id: string): Promise<User | null> {
        const data = await this.redis.get(`${this.USER_PREFIX}${id}`);
        if (!data) return null;
        return JSON.parse(data) as User;
    }

    async update(user: User): Promise<User> {
        const userKey = `${this.USER_PREFIX}${user.id}`;
        await this.redis.set(userKey, JSON.stringify(user));
        return user;
    }

    async delete(id: string): Promise<void> {
        const user = await this.findById(id);
        if (user) {
            const userKey = `${this.USER_PREFIX}${id}`;
            const emailKey = `${this.EMAIL_INDEX}${user.email}`;

            const pipeline = this.redis.pipeline();
            pipeline.del(userKey);
            pipeline.del(emailKey);
            await pipeline.exec();
        }
    }
}
