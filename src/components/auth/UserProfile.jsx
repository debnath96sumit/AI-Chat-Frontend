import React, { useEffect, useState } from 'react';
import { FaCog, FaCamera } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { mediaAPI } from '../../utils/api';

const UserProfile = ({ onClose }) => {
    const { user, updateProfileDetails } = useAuth();

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        profileImage: {
            mediaId: '',
            url: ''
        }
    });

    useEffect(() => {
        if (user) {
            setFormData({
                fullName: user.fullName || '',
                email: user.email || '',
                profileImage: user.profileImage || {}
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            await updateProfileDetails(formData);
            setSuccess('Profile updated successfully');
            setIsEditing(false);

            // optional auto close
            // setTimeout(() => onClose?.(), 1500);
        } catch (err) {
            setError(err.message || 'Update failed');
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        console.log('fffffffff', file);

        if (!file) return;

        // Basic validation
        if (!file.type.startsWith('image/')) {
            setError('Please upload an image file');
            return;
        }

        const uploadData = new FormData();
        uploadData.append('file', file);

        setIsUploading(true);
        setError('');
        setSuccess('');

        try {
            const response = await mediaAPI.uploadSingleFile(uploadData);
            // Assuming response structure contains data with _id and url
            // Based on user request: "from the reponse get the _id, url and set it in form data"
            const { _id, url } = response.data || {};

            if (_id && url) {
                setFormData(prev => ({
                    ...prev,
                    profileImage: {
                        mediaId: _id,
                        url: url
                    }
                }));
                setSuccess('Image uploaded successfully. Click Save to update profile.');
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (err) {
            console.error('Upload error:', err);
            setError(err.response?.data?.message || 'File upload failed');
        } finally {
            setIsUploading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="w-full max-w-3xl">
            <div className="bg-slate-800 rounded-2xl shadow-xl border border-slate-700 p-6">

                <div className="flex flex-col md:flex-row gap-8">

                    {/* Avatar Section */}
                    <div className="flex flex-col items-center space-y-4">
                        <div className="relative">
                            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
                                {formData.profileImage.url
                                    ? <img
                                        src={formData.profileImage.url}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                    : <span>{formData.fullName?.charAt(0)?.toUpperCase()}</span>}
                            </div>

                            {isEditing && (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => document.getElementById('profile-upload').click()}
                                        disabled={isUploading}
                                        className="absolute bottom-0 right-0 bg-purple-600 rounded-full p-2 text-white hover:bg-purple-700 transition-colors disabled:opacity-50"
                                    >
                                        <FaCamera size={14} />
                                    </button>
                                    <input
                                        id="profile-upload"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />
                                </>
                            )}
                        </div>

                        <div className="text-center">
                            <h2 className="text-lg font-bold text-white">
                                {user.fullName}
                            </h2>
                            <p className="text-gray-400 text-sm">
                                {user.email}
                            </p>
                        </div>
                    </div>

                    {/* Form Section */}
                    <div className="flex-1">

                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-white flex items-center gap-2">
                                <FaCog /> Account Settings
                            </h3>

                            {!isEditing && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="px-4 py-2 bg-purple-600 rounded-lg text-white text-sm"
                                >
                                    Edit
                                </button>
                            )}
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-3 py-2 rounded mb-4 text-sm">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="bg-green-500/10 border border-green-500/50 text-green-400 px-3 py-2 rounded mb-4 text-sm">
                                {success}
                            </div>
                        )}

                        <form onSubmit={handleUpdateProfile} className="space-y-4">

                            <input
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white disabled:opacity-60"
                                placeholder="Full Name"
                            />

                            <input
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white disabled:opacity-60"
                                placeholder="Email"
                            />

                            {isEditing && (
                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="submit"
                                        disabled={isUploading}
                                        className="flex-1 bg-purple-600 py-2 rounded text-white disabled:opacity-50"
                                    >
                                        {isUploading ? 'Uploading...' : 'Save'}
                                    </button>

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
                                        className="flex-1 bg-slate-700 py-2 rounded text-white"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </form>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;