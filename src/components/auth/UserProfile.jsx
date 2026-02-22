import React, { useEffect, useState } from 'react'
import { FaUser, FaEnvelope, FaCog, FaSignOutAlt, FaCamera } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const UserProfile = () => {
    const { user, logout, updateProfile } = useAuth();
    const navigate = useNavigate();

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        profilePicture: ''
    });

    useEffect(() => {
        if (user) {
            setFormData({
                fullName: user.fullName || '',
                email: user.email || '',
                profilePicture: user.profilePicture || ''
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleLogout = () => {
        logout();               // from context
        navigate('/login');
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();

        try {
            await updateProfile(formData);   // call API via context
            setSuccess('Profile updated');
            setIsEditing(false);
        } catch (err) {
            setError(err.message || 'Update failed');
        }
    };

    if (!user) return null;   // or skeleton loader

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-4 py-12">
            <div className="max-w-4xl mx-auto">
                <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl shadow-2xl border border-slate-700 overflow-hidden">

                    {/* Header */}
                    <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-6 flex justify-between">
                        <h1 className="text-2xl font-bold text-white">My Profile</h1>
                        <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition">
                            <FaSignOutAlt /> Logout
                        </button>
                    </div>

                    <div className="p-8 flex flex-col md:flex-row gap-8">

                        {/* Avatar */}
                        <div className="flex flex-col items-center space-y-4">
                            <div className="relative">
                                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-4xl font-bold overflow-hidden">
                                    {formData.profilePicture
                                        ? <img src={formData.profilePicture} className="w-full h-full object-cover" />
                                        : <span>{formData.fullName?.charAt(0)?.toUpperCase()}</span>}
                                </div>

                                {isEditing && (
                                    <button className="absolute bottom-0 right-0 bg-purple-600 rounded-full p-2">
                                        <FaCamera />
                                    </button>
                                )}
                            </div>

                            <h2 className="text-xl font-bold text-white">{user.fullName}</h2>
                            <p className="text-gray-400">{user.email}</p>
                        </div>

                        {/* Form */}
                        <div className="flex-1">
                            <div className="flex justify-between mb-6">
                                <h3 className="text-white flex items-center gap-2">
                                    <FaCog /> Account Settings
                                </h3>

                                {!isEditing && (
                                    <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-purple-600 rounded-lg">
                                        Edit
                                    </button>
                                )}
                            </div>

                            <form onSubmit={handleUpdateProfile} className="space-y-4">

                                <input name="fullName" value={formData.fullName} onChange={handleChange} disabled={!isEditing} className="input" />
                                <input name="email" value={formData.email} onChange={handleChange} disabled={!isEditing} className="input" />
                                <input name="profilePicture" value={formData.profilePicture} onChange={handleChange} disabled={!isEditing} className="input" />

                                {isEditing && (
                                    <div className="flex gap-3">
                                        <button className="flex-1 bg-purple-600 py-2 rounded">Save</button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsEditing(false);
                                                setFormData({
                                                    fullName: user.fullName,
                                                    email: user.email,
                                                    profilePicture: user.profilePicture || ''
                                                });
                                            }}
                                            className="flex-1 bg-slate-700 py-2 rounded"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                )}
                            </form>

                            <button onClick={() => navigate('/change-password')} className="w-full mt-6 bg-slate-700 py-3 rounded">
                                Change Password
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;