import React, { useState } from 'react';
import { FaCheckCircle, FaEye, FaEyeSlash } from 'react-icons/fa';
import { userAPI } from '../../utils/api';
import { changePasswordSchema } from '../../utils/validationSchemas';

const ChangePassword = ({ onClose }) => {
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFieldErrors({});
        setError('');

        const parsed = changePasswordSchema.safeParse(formData);

        if (!parsed.success) {
            const nextFieldErrors = parsed.error.flatten().fieldErrors;
            setFieldErrors(nextFieldErrors);
            return;
        }

        setLoading(true);

        try {
            const response = await userAPI.changePassword({
                oldPassword: parsed.data.currentPassword,
                newPassword: parsed.data.newPassword
            });

            if (response.success) {
                setSuccess(true);

                // Auto close modal after 1.5s
                setTimeout(() => {
                    onClose?.();
                }, 1500);
            }
        } catch (err) {
            setError(err?.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        setFieldErrors(prev => ({ ...prev, [name]: '' }));
    };

    return (
        <div className="w-full max-w-md">
            <div className="bg-slate-800 rounded-2xl shadow-xl border border-slate-700 p-6">

                <div className="mb-6">
                    <h2 className="text-xl font-bold text-white">
                        Change Password
                    </h2>
                    <p className="mt-1 text-sm text-gray-400">
                        Update your password to keep your account secure
                    </p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm mb-4">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-3 rounded-lg mb-4">
                        <div className="flex items-center gap-3">
                            <FaCheckCircle />
                            <span>Password changed successfully!</span>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Current Password */}
                    <div>
                        <label className="block text-sm text-gray-300 mb-1">
                            Current Password
                        </label>
                        <div className="relative">
                            <input
                                type="password"
                                name="currentPassword"
                                value={formData.currentPassword}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300 transition"
                            >
                                {showCurrentPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                            </button>
                        </div>
                        {fieldErrors.currentPassword?.[0] && (
                            <p className="text-sm text-red-400 mt-1">
                                {fieldErrors.currentPassword[0]}
                            </p>
                        )}
                    </div>

                    {/* New Password */}
                    <div>
                        <label className="block text-sm text-gray-300 mb-1">
                            New Password
                        </label>
                        <div className="relative">
                            <input
                                type="password"
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white focus:ring-2 focus:ring-purple-500 outline-none"
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
                            <p className="text-sm text-red-400 mt-1">
                                {fieldErrors.newPassword[0]}
                            </p>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-sm text-gray-300 mb-1">
                            Confirm Password
                        </label>
                        <div className="relative">
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300 transition"
                            >
                                {showConfirmPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                            </button>
                        </div>
                        {fieldErrors.confirmPassword?.[0] && (
                            <p className="text-sm text-red-400 mt-1">
                                {fieldErrors.confirmPassword[0]}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading || success}
                        className="w-full py-2 rounded-lg text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90 disabled:opacity-50"
                    >
                        {loading ? 'Changing...' : 'Change Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChangePassword;