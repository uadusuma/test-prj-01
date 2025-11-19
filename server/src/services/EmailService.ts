import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export class EmailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        // For development, we can use a simple logger or Ethereal
        // Here we assume SMTP settings are provided or we fallback to console
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS && process.env.EMAIL_USER !== 'test@example.com') {
            this.transporter = nodemailer.createTransport({
                service: 'gmail', // Or generic smtp
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });
        } else {
            // Mock transporter for dev without creds
            this.transporter = nodemailer.createTransport({
                jsonTransport: true,
            });
        }
    }

    async sendVerificationEmail(email: string, token: string) {
        const verificationLink = `${process.env.CLIENT_URL}/verify-email?token=${token}&email=${email}`;
        const mailOptions = {
            from: process.env.EMAIL_USER || 'noreply@example.com',
            to: email,
            subject: 'Verify your email',
            html: `
        <h1>Email Verification</h1>
        <p>Please click the link below to verify your email address:</p>
        <a href="${verificationLink}">Verify Email</a>
        <p>Or enter this code: <strong>${token}</strong></p>
      `,
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('Email sent:', info);
            if (info.message) {
                console.log('Message JSON:', JSON.parse(info.message as string));
            }
        } catch (error) {
            console.error('Error sending email:', error);
            throw new Error('Failed to send verification email');
        }
    }
}
