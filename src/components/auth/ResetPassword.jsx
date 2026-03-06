import React, { useEffect, useState } from 'react'
import { FaCheckCircle, FaEye, FaEyeSlash } from 'react-icons/fa';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { resetPasswordSchema } from '../../utils/validationSchemas';
import { authAPI } from '../../utils/api';
const ResetPassword = () => {
    const location = useLocation();
    const email = location.state?.email;
    const navigate = useNavigate();
    const [fieldErrors, setFieldErrors] = useState({});
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({
        newPassword: '',
        confirmNewPassword: ''
    });

    // Redirect if no email provided
    useEffect(() => {
        if (!email) {
            navigate('/forgot-password');
        }
    }, [email, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFieldErrors({});

        const parsed = resetPasswordSchema.safeParse(formData);
        if (!parsed.success) {
            const nextFieldErrors = parsed.error.flatten().fieldErrors;
            setFieldErrors(nextFieldErrors);
            return;
        }

        setLoading(true);
        try {
            const response = await authAPI.resetPassword({
                email: email,
                newPassword: parsed.data.newPassword
            });
            console.log('Reset password response', response);

            if (response.statusCode === 200) {
                navigate('/sign-in');
            } else {
                setError(response.message);
            }
        } catch (error) {
            console.log('Reset password error', error);
            navigate('/forgot-password');
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
                    <h2 className="text-center text-3xl font-bold text-white">
                        Reset your password
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-400">
                        Enter your new password below
                    </p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                                New Password
                            </label>
                            <div className="relative">
                                <input
                                    id="newPassword"
                                    name="newPassword"
                                    type="password"
                                    required
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    className="appearance-none relative block w-full px-4 py-3 border border-slate-600 placeholder-gray-500 text-white rounded-lg bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                                    placeholder="Min. 8 characters"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300 transition"
                                >
                                    {showNewPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                                </button>
                            </div>
                            {fieldErrors.newPassword?.[0] && (
                                <p className="mt-1 text-sm text-red-400">{fieldErrors.newPassword[0]}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-300 mb-2">
                                Confirm New Password
                            </label>
                            <div className="relative">
                                <input
                                    id="confirmNewPassword"
                                    name="confirmNewPassword"
                                    type="password"
                                    required
                                    value={formData.confirmNewPassword}
                                    onChange={handleChange}
                                    className="appearance-none relative block w-full px-4 py-3 border border-slate-600 placeholder-gray-500 text-white rounded-lg bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                                    placeholder="Re-enter your password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300 transition"
                                >
                                    {showConfirmPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                                </button>
                            </div>
                            {fieldErrors.confirmNewPassword?.[0] && (
                                <p className="mt-1 text-sm text-red-400">{fieldErrors.confirmNewPassword[0]}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Resetting password...' : 'Reset password'}
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

export default ResetPassword