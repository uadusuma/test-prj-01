import { AuthService } from '../src/services/AuthService';
import { RedisUserRepository } from '../src/repositories/RedisUserRepository';
import { EmailService } from '../src/services/EmailService';
import RedisMock from 'ioredis-mock';

async function run() {
    console.log('Starting verification with Redis Mock...');

    const redisMock = new RedisMock();
    const userRepository = new RedisUserRepository(redisMock);
    const emailService = new EmailService();
    const authService = new AuthService(userRepository, emailService, redisMock);

    const email = `test-${Date.now()}@example.com`;
    const password = 'password123';

    console.log('1. Registering user...');
    try {
        const user = await authService.register({ email, password });
        console.log('User registered:', user.id);
    } catch (e) {
        console.error('Registration failed', e);
        process.exit(1);
    }

    console.log('2. Getting OTP from Redis Mock...');
    const otp = await redisMock.get(`otp:${email}`);
    console.log('OTP found:', otp);

    if (!otp) throw new Error('OTP not found');

    console.log('3. Verifying email...');
    await authService.verifyEmail(email, otp);
    console.log('Email verified');

    console.log('4. Logging in...');
    const { token } = await authService.login({ email, password });
    console.log('Login successful, token:', token);

    console.log('Verification complete!');
    process.exit(0);
}

run().catch(err => {
    console.error('Verification failed:', err);
    process.exit(1);
});
