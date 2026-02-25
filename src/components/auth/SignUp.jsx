import React, { useRef, useState } from 'react'
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from '../../context/AuthContext';
import { signUpSchema } from '../../utils/validationSchemas';

const SignUp = () => {
    const { signup, socialLogin } = useAuth();
    const googleBtnRef = useRef(null);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    })
    const [fieldErrors, setFieldErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFieldErrors({});

        const parsed = signUpSchema.safeParse(formData);
        if (!parsed.success) {
            const nextFieldErrors = parsed.error.flatten().fieldErrors;
            setFieldErrors(nextFieldErrors);
            return;
        }

        setLoading(true);

        try {
            const response = await signup({
                fullName: parsed.data.fullName,
                email: parsed.data.email,
                phone: parsed.data.phone,
                password: parsed.data.password
            });
            if (response.success) {
                navigate('/dashboard');
            }
        } catch (error) {
            console.log('Sign up error', error);
        } finally {
            setLoading(false);
        }
    }
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        })
        setFieldErrors((prev) => ({ ...prev, [name]: '' }));

    }
    const handleBackendLogin = async (idToken) => {
        try {
            const response = await socialLogin('google', idToken);
            if (response.success) {
                navigate('/dashboard');
            }
        } catch (error) {
            console.log('Sign up error', error);
        } finally {
            setLoading(false);
        }
    };
    const handleSocialSignIn = (provider) => {
        console.log(provider);

    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-4 py-12">
            <div className="max-w-md w-full space-y-8 bg-slate-800/50 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-slate-700">
                <div>
                    <h2 className="text-center text-3xl font-bold text-white">
                        Create your account
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-400">
                        Join us and start your AI journey
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-2">
                                Full Name
                            </label>
                            <input
                                id="fullName"
                                name="fullName"
                                type="text"
                                required
                                value={formData.fullName}
                                onChange={handleChange}
                                className="appearance-none relative block w-full px-4 py-3 border border-slate-600 placeholder-gray-500 text-white rounded-lg bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                                placeholder="Enter your full name"
                            />
                            {fieldErrors.fullName?.[0] && (
                                <p className="mt-1 text-sm text-red-400">{fieldErrors.fullName[0]}</p>
                            )}
                        </div>

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
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                                Phone number
                            </label>
                            <input
                                id="phone"
                                name="phone"
                                type="tel"
                                required
                                value={formData.phone}
                                onChange={handleChange}
                                className="appearance-none relative block w-full px-4 py-3 border border-slate-600 placeholder-gray-500 text-white rounded-lg bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                                placeholder="your phone number"
                            />
                            {fieldErrors.phone?.[0] && (
                                <p className="mt-1 text-sm text-red-400">{fieldErrors.phone[0]}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="appearance-none relative block w-full px-4 py-3 border border-slate-600 placeholder-gray-500 text-white rounded-lg bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                                placeholder="Min. 8 characters"
                            />
                            {fieldErrors.password?.[0] && (
                                <p className="mt-1 text-sm text-red-400">{fieldErrors.password[0]}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                                Confirm Password
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="appearance-none relative block w-full px-4 py-3 border border-slate-600 placeholder-gray-500 text-white rounded-lg bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                                placeholder="Re-enter your password"
                            />
                            {fieldErrors.confirmPassword?.[0] && (
                                <p className="mt-1 text-sm text-red-400">{fieldErrors.confirmPassword[0]}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating account...' : 'Sign up'}
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
                            onClick={() => googleBtnRef.current?.click()}
                            className="flex items-center justify-center gap-2 px-4 py-3 border border-slate-600 rounded-lg text-white bg-slate-700/50 hover:bg-slate-700 transition"
                        >
                            <FcGoogle className="text-xl" />
                            Google
                        </button>
                        <div className="hidden">
                            <GoogleLogin
                                onSuccess={(cred) => handleBackendLogin(cred.credential)}
                                ref={googleBtnRef}
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => handleSocialSignIn('github')}
                            className="flex items-center justify-center gap-2 px-4 py-3 border border-slate-600 rounded-lg text-white bg-slate-700/50 hover:bg-slate-700 transition"
                        >
                            <FaGithub className="text-xl" />
                            GitHub
                        </button>
                    </div>
                </form>

                <div className="text-center">
                    <p className="text-sm text-gray-400">
                        Already have an account?{' '}
                        <Link to="/sign-in" className="font-medium text-purple-400 hover:text-purple-300 transition">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default SignUp
