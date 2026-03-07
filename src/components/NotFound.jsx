import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Ghost, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NotFound = () => {
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        document.title = '404 Not Found - AI Chat Bot';
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden flex flex-col justify-center items-center px-6 relative">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 opacity-50">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
                    <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
                    <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-2000"></div>
                </div>
            </div>

            <div className="relative z-10 text-center flex flex-col items-center max-w-2xl mx-auto">
                <Ghost className="w-24 h-24 md:w-32 md:h-32 mb-8 text-purple-400 animate-bounce" />

                <h1 className="text-7xl md:text-9xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                    404
                </h1>

                <h2 className="text-3xl md:text-4xl font-semibold mb-6">
                    <span className="bg-gradient-to-r from-white via-purple-200 to-cyan-300 bg-clip-text text-transparent">
                        Page Not Found
                    </span>
                </h2>

                <p className="text-lg md:text-xl text-gray-300 mb-10 leading-relaxed">
                    The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                </p>

                <Link
                    to={isAuthenticated ? "/new" : "/"}
                    className="group flex flex-row items-center justify-center bg-gradient-to-r from-purple-600 to-cyan-600 px-8 py-4 rounded-full text-lg font-semibold hover:from-purple-700 hover:to-cyan-700 transition-all transform hover:scale-105"
                >
                    <ArrowLeft className="mr-2 w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    Back to Homepage
                </Link>
            </div>
        </div>
    );
};

export default NotFound;
