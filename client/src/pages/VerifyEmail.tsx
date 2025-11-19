import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';

export const VerifyEmail = () => {
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const email = searchParams.get('email');
    const token = searchParams.get('token');

    useEffect(() => {
        if (token && email) {
            verify(token);
        }
    }, [token, email]);

    const verify = async (code: string) => {
        try {
            await axios.post('http://localhost:3000/api/auth/verify-email', { email, otp: code });
            setMessage('Email verified successfully! Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Verification failed');
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            setError('Email is missing');
            return;
        }
        verify(otp);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md">
                <h2 className="text-2xl font-bold text-center mb-6">Verify Email</h2>
                {message && <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{message}</div>}
                {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

                <p className="text-center text-gray-600 mb-6">
                    We sent a verification code to <strong>{email}</strong>.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Enter OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="123456"
                        required
                    />
                    <Button type="submit" className="w-full">Verify</Button>
                </form>
            </Card>
        </div>
    );
};
