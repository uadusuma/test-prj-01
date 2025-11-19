import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { AuthService } from '../services/AuthService';
import { RedisUserRepository } from '../repositories/RedisUserRepository';
import { EmailService } from '../services/EmailService';
import passport from '../config/passport';
import jwt from 'jsonwebtoken';


const router = Router();

const userRepository = new RedisUserRepository();
const emailService = new EmailService();
const authService = new AuthService(userRepository, emailService);
const authController = new AuthController(authService);

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/verify-email', authController.verifyEmail);

// OAuth Routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { session: false }), (req, res) => {
    const user = req.user as any;
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
    res.redirect(`${process.env.CLIENT_URL}/login?token=${token}`);
});

router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));
router.get('/facebook/callback', passport.authenticate('facebook', { session: false }), (req, res) => {
    const user = req.user as any;
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
    res.redirect(`${process.env.CLIENT_URL}/login?token=${token}`);
});

export default router;
