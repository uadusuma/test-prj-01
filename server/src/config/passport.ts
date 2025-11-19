import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { RedisUserRepository } from '../repositories/RedisUserRepository';
import { User } from '../models/User';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

const userRepository = new RedisUserRepository();

passport.serializeUser((user: any, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
    try {
        const user = await userRepository.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

// Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || 'placeholder',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'placeholder',
    callbackURL: '/api/auth/google/callback'
},
    async (accessToken, refreshToken, profile, done) => {
        try {
            const email = profile.emails?.[0].value;
            if (!email) return done(new Error('No email found'), undefined);

            let user = await userRepository.findByEmail(email);

            if (!user) {
                user = {
                    id: uuidv4(),
                    email: email,
                    isVerified: true, // OAuth emails are verified
                    provider: 'google',
                    providerId: profile.id,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                };
                await userRepository.create(user);
            }
            return done(null, user);
        } catch (err) {
            return done(err, undefined);
        }
    }
));

// Facebook Strategy
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID || 'placeholder',
    clientSecret: process.env.FACEBOOK_APP_SECRET || 'placeholder',
    callbackURL: '/api/auth/facebook/callback',
    profileFields: ['id', 'emails', 'name']
},
    async (accessToken, refreshToken, profile, done) => {
        try {
            const email = profile.emails?.[0].value;
            if (!email) return done(new Error('No email found'), undefined);

            let user = await userRepository.findByEmail(email);

            if (!user) {
                user = {
                    id: uuidv4(),
                    email: email,
                    isVerified: true,
                    provider: 'facebook',
                    providerId: profile.id,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                };
                await userRepository.create(user);
            }
            return done(null, user);
        } catch (err) {
            return done(err, undefined);
        }
    }
));

export default passport;
