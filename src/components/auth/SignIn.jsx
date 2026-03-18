import React, { useState, useEffect } from 'react'
import { FcGoogle } from 'react-icons/fc';
import { FaGithub, FaEye, FaEyeSlash } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { signInSchema } from '../../utils/validationSchemas';
import { pushToast } from '../../utils/toaster';

const SignIn = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [fieldErrors, setFieldErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        document.title = 'Sign In - AI Pasta';
    }, []);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const error = params.get('error');
        if (error) {
            pushToast({ message: error, type: 'error' });
        }
    }, []);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false
    });
    const handleSubmit = async (e) => {
        e.preventDefault();
        setFieldErrors({});

        const parsed = signInSchema.safeParse(formData);
        if (!parsed.success) {
            const nextFieldErrors = parsed.error.flatten().fieldErrors;
            setFieldErrors(nextFieldErrors);
            return;
        }

        setLoading(true);

        try {
            const response = await login({
                email: parsed.data.email,
                password: parsed.data.password
            });
            if (response.success) {
                navigate('/new');
            }
        } catch (error) {
            console.log('Sign in error', error);
        } finally {
            setLoading(false);
        }
    }
    const handleChange = (e) => {
        const { name, type, value, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        })
        setFieldErrors((prev) => ({ ...prev, [name]: '' }));

    }
    const handleSocialSignIn = (provider) => {
        console.log(provider);

    }

    const handleGithubSignIn = async () => {
        window.location.href = `${import.meta.env.VITE_API_URL}/api/v1/auth/github`;
    }
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-4 py-12">
            <div className="max-w-md w-full space-y-8 bg-slate-800/50 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-slate-700">
                <div>
                    <h2 className="text-center text-3xl font-bold text-white">
                        Welcome back
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-400">
                        Sign in to continue to your account
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                                Email address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="appearance-none relative block w-full px-4 py-3 border border-slate-600 placeholder-gray-500 text-white rounded-lg bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                                placeholder="your@email.com"
                            />
                            {fieldErrors.email?.[0] && (
                                <p className="mt-1 text-sm text-red-400">{fieldErrors.email[0]}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="appearance-none relative block w-full px-4 py-3 border border-slate-600 placeholder-gray-500 text-white rounded-lg bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition pr-12"
                                    placeholder="Enter your password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300 transition"
                                >
                                    {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                                </button>
                            </div>
                            {fieldErrors.password?.[0] && (
                                <p className="mt-1 text-sm text-red-400">{fieldErrors.password[0]}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="rememberMe"
                                type="checkbox"
                                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-slate-600 rounded bg-slate-700"
                                checked={formData.rememberMe}
                                onChange={handleChange}
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                                Remember me
                            </label>
                        </div>

                        <div className="text-sm">
                            <Link to="/forgot-password" className="font-medium text-purple-400 hover:text-purple-300 transition">
                                Forgot password?
                            </Link>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-600"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-slate-800 text-gray-400">Or continue with</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => handleSocialSignIn('google')}
                            className="flex items-center justify-center gap-2 px-4 py-3 border border-slate-600 rounded-lg text-white bg-slate-700/50 hover:bg-slate-700 transition cursor-pointer"
                        >
                            <FcGoogle className="text-xl" />
                            Google
                        </button>
                        <button
                            type="button"
                            onClick={() => handleGithubSignIn()}
                            className="flex items-center justify-center gap-2 px-4 py-3 border border-slate-600 rounded-lg text-white bg-slate-700/50 hover:bg-slate-700 transition cursor-pointer"
                        >
                            <FaGithub className="text-xl" />
                            GitHub
                        </button>
                    </div>
                </form>

                <div className="text-center">
                    <p className="text-sm text-gray-400">
                        Don't have an account?{' '}
                        <Link to="/sign-up" className="font-medium text-purple-400 hover:text-purple-300 transition">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default SignIn
