import React, { useState } from 'react'
import { FaUser, FaEnvelope, FaCog, FaSignOutAlt, FaCamera } from 'react-icons/fa';

const UserProfile = () => {
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const formData = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    })
    const handleLogout = () => {
        console.log('test');

    }
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-4 py-12">
            <div className="max-w-4xl mx-auto">
                <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl shadow-2xl border border-slate-700 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-6">
                        <div className="flex items-center justify-between">
                            <h1 className="text-2xl font-bold text-white">My Profile</h1>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition"
                            >
                                <FaSignOutAlt />
                                Logout
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-8">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm mb-6">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-3 rounded-lg text-sm mb-6">
                                {success}
                            </div>
                        )}

                        <div className="flex flex-col md:flex-row gap-8">
                            {/* Profile Picture Section */}
                            <div className="flex flex-col items-center space-y-4">
                                <div className="relative">
                                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-4xl font-bold overflow-hidden">
                                        {formData.profilePicture ? (
                                            <img
                                                src={formData.profilePicture}
                                                alt="Profile"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span>{formData.username.charAt(0).toUpperCase()}</span>
                                        )}
                                    </div>
                                    {isEditing && (
                                        <button className="absolute bottom-0 right-0 bg-purple-600 rounded-full p-2 hover:bg-purple-700 transition">
                                            <FaCamera className="text-white" />
                                        </button>
                                    )}
                                </div>
                                <h2 className="text-xl font-bold text-white">{user?.username}</h2>
                                <p className="text-gray-400 text-sm">{user?.email}</p>
                            </div>

                            {/* Profile Form Section */}
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                        <FaCog />
                                        Account Settings
                                    </h3>
                                    {!isEditing && (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition text-sm"
                                        >
                                            Edit Profile
                                        </button>
                                    )}
                                </div>

                                <form onSubmit={handleUpdateProfile} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            <FaUser className="inline mr-2" />
                                            Username
                                        </label>
                                        <input
                                            type="text"
                                            name="username"
                                            value={formData.username}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className="w-full px-4 py-3 border border-slate-600 placeholder-gray-500 text-white rounded-lg bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition disabled:opacity-60 disabled:cursor-not-allowed"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            <FaEnvelope className="inline mr-2" />
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className="w-full px-4 py-3 border border-slate-600 placeholder-gray-500 text-white rounded-lg bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition disabled:opacity-60 disabled:cursor-not-allowed"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Profile Picture URL
                                        </label>
                                        <input
                                            type="url"
                                            name="profilePicture"
                                            value={formData.profilePicture}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            placeholder="https://example.com/image.jpg"
                                            className="w-full px-4 py-3 border border-slate-600 placeholder-gray-500 text-white rounded-lg bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition disabled:opacity-60 disabled:cursor-not-allowed"
                                        />
                                    </div>

                                    {isEditing && (
                                        <div className="flex gap-3 pt-4">
                                            <button
                                                type="submit"
                                                className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition font-medium"
                                            >
                                                Save Changes
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsEditing(false);
                                                    setFormData({
                                                        username: user.username || '',
                                                        email: user.email || '',
                                                        profilePicture: user.profilePicture || ''
                                                    });
                                                    setError('');
                                                }}
                                                className="flex-1 py-3 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition font-medium"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    )}
                                </form>

                                <div className="mt-8 pt-8 border-t border-slate-700">
                                    <button
                                        onClick={() => navigate('/change-password')}
                                        className="w-full py-3 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition font-medium"
                                    >
                                        Change Password
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default UserProfile