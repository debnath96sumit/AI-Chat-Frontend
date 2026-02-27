import React, { useState } from 'react'
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { forgotPasswordSchema } from '../../utils/validationSchemas';
import { authAPI } from '../../utils/api';
const ForgotPassword = () => {
    const [fieldErrors, setFieldErrors] = useState({});
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
    })
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFieldErrors({});

        const parsed = forgotPasswordSchema.safeParse(formData);
        if (!parsed.success) {
            const nextFieldErrors = parsed.error.flatten().fieldErrors;
            setFieldErrors(nextFieldErrors);
            return;
        }

        setLoading(true);
        try {
            const response = await authAPI.forgotPassword({
                email: parsed.data.email
            });
            console.log('Forgot password response', response);

            if (response.statusCode === 200) {
                navigate('/verify-otp', {
                    state: {
                        email: parsed.data.email
                    }
                });
            }
        } catch (error) {
            console.log('Forgot password error', error);
        } finally {
            setLoading(false);
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
        setFieldErrors((prev) => ({
            ...prev,
            [name]: ''
        }))
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
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Sending...' : 'Send reset instructions'}
                        </button>
                    </div>
                </form>

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