import React, { useState } from 'react'
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [email, setEmail] = useState('');
    const handleSubmit = () => {
        console.log('test');

    }
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-4 py-12">
            <div className="max-w-md w-full space-y-8 bg-slate-800/50 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-slate-700">
                <div>
                    <Link
                        to="/sign-in"
                        className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition mb-4"
                    >
                        <FaArrowLeft />
                        Back to sign in
                    </Link>
                    <h2 className="text-center text-3xl font-bold text-white">
                        Forgot password?
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-400">
                        No worries, we'll send you reset instructions
                    </p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-3 rounded-lg text-sm">
                        <div className="flex items-start gap-3">
                            <FaEnvelope className="text-xl flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-medium mb-1">Check your email</p>
                                <p className="text-sm text-green-300">
                                    We've sent password reset instructions to <strong>{email}</strong>
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {!success ? (
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                                Email address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="appearance-none relative block w-full px-4 py-3 border border-slate-600 placeholder-gray-500 text-white rounded-lg bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                                placeholder="your@email.com"
                            />
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Sending...' : 'Send reset instructions'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="space-y-4">
                        <button
                            onClick={() => setSuccess(false)}
                            className="w-full py-3 px-4 border border-slate-600 text-sm font-medium rounded-lg text-white bg-slate-700/50 hover:bg-slate-700 transition"
                        >
                            Try another email
                        </button>
                        <Link
                            to="/sign-in"
                            className="block w-full text-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition"
                        >
                            Back to sign in
                        </Link>
                    </div>
                )}

                <div className="text-center pt-4">
                    <p className="text-sm text-gray-400">
                        Remember your password?{' '}
                        <Link to="/sign-in" className="font-medium text-purple-400 hover:text-purple-300 transition">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default ForgotPassword