import React from 'react'
import { FaArrowLeft, FaCheckCircle } from 'react-icons/fa';

const ChangePassword = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-4 py-12">
            <div className="max-w-md mx-auto">
                <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl shadow-2xl border border-slate-700 p-8">
                    <div className="mb-6">
                        <Link
                            to="/profile"
                            className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition mb-4"
                        >
                            <FaArrowLeft />
                            Back to profile
                        </Link>
                        <h2 className="text-2xl font-bold text-white">Change Password</h2>
                        <p className="mt-2 text-sm text-gray-400">
                            Update your password to keep your account secure
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm mb-6">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-3 rounded-lg mb-6">
                            <div className="flex items-start gap-3">
                                <FaCheckCircle className="text-xl flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-medium mb-1">Password changed successfully!</p>
                                    <p className="text-sm text-green-300">
                                        Redirecting you back to profile...
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-300 mb-2">
                                Current Password
                            </label>
                            <input
                                id="currentPassword"
                                name="currentPassword"
                                type="password"
                                required
                                value={formData.currentPassword}
                                onChange={handleChange}
                                className="appearance-none relative block w-full px-4 py-3 border border-slate-600 placeholder-gray-500 text-white rounded-lg bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                                placeholder="Enter current password"
                            />
                        </div>

                        <div className="pt-4 border-t border-slate-700">
                            <div className="mb-4">
                                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-2">
                                    New Password
                                </label>
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
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                                    Confirm New Password
                                </label>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="appearance-none relative block w-full px-4 py-3 border border-slate-600 placeholder-gray-500 text-white rounded-lg bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                                    placeholder="Re-enter new password"
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading || success}
                                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Changing password...' : 'Change Password'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 p-4 bg-slate-700/30 rounded-lg border border-slate-600">
                        <h3 className="text-sm font-medium text-white mb-2">Password Requirements:</h3>
                        <ul className="text-xs text-gray-400 space-y-1">
                            <li>• At least 8 characters long</li>
                            <li>• Different from your current password</li>
                            <li>• Use a combination of letters, numbers, and symbols</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ChangePassword