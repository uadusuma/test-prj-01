import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export const Home = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <h1 className="text-xl font-bold text-gray-900">T-Shirt POD</h1>
                        <Button variant="outline" onClick={handleLogout}>Log Out</Button>
                    </div>
                </div>
            </nav>
            <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                        Welcome to your Dashboard
                    </h2>
                    <p className="mt-4 text-lg text-gray-500">
                        You are successfully authenticated.
                    </p>
                </div>
            </main>
        </div>
    );
};
