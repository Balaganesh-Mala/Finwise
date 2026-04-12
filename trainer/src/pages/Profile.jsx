import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { User, Mail, Phone, MapPin, Briefcase, Linkedin, Globe, Loader2, Upload, Lock, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
    const { user, API_URL } = useAuth();
    const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        bio: '',
        specialization: '',
        password: '',
        photo: '',
        socials: {
            linkedin: '',
            github: '',
            website: ''
        }
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('trainerToken');
                const { data } = await axios.get(`${BASE_URL}/api/trainer/auth/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                if (data.success && data.user) {
                    const u = data.user;
                    setFormData({
                        name: u.name || '',
                        email: u.email || '',
                        phone: u.phone || '',
                        bio: u.bio || '',
                        specialization: u.specialization || '',
                        password: '',
                        photo: u.photo || '',
                        socials: u.socialLinks || { linkedin: '', github: '', website: '' }
                    });
                }
            } catch (err) {
                console.error("Failed to fetch profile", err);
                toast.error("Failed to load profile data");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [BASE_URL]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('social.')) {
            const platform = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                socials: { ...prev.socials, [platform]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const tf = new FormData();
        tf.append('file', file);
        
        try {
            const token = localStorage.getItem('trainerToken');
            const { data } = await axios.post(`${BASE_URL}/api/trainer/upload`, tf, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            if (data.success) {
                setFormData(prev => ({ ...prev, photo: data.url }));
                toast.success("Profile picture uploaded!");
            }
        } catch (err) {
            console.error(err);
            toast.error("Image upload failed");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const token = localStorage.getItem('trainerToken');
            const { data } = await axios.put(`${BASE_URL}/api/trainer/profile`, {
                bio: formData.bio,
                phone: formData.phone,
                specialization: formData.specialization,
                photo: formData.photo,
                password: formData.password,
                socials: formData.socials
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success) {
                toast.success('Profile updated successfully!');
                setFormData(prev => ({ ...prev, password: '' })); // Reset password field
                window.location.reload(); 
            }
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px]">
                <Loader2 className="animate-spin h-8 w-8 text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-12">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">My Profile</h1>
                <p className="text-sm text-gray-500 mt-1">Manage your professional information and account security.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Header Information Card */}
                <Card className="border border-gray-200 shadow-sm overflow-hidden bg-white">
                    <CardContent className="p-6 sm:p-8">
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                            <div className="relative shrink-0">
                                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-400">
                                    {formData.photo ? (
                                        <img src={formData.photo} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-4xl font-semibold text-gray-400 bg-gray-100">
                                            {formData.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <label className="absolute bottom-0 right-0 p-2 bg-white border border-gray-200 rounded-full text-gray-600 cursor-pointer hover:bg-gray-50 transition-colors shadow-sm">
                                    {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                                    <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
                                </label>
                            </div>

                            <div className="flex-1 flex flex-col sm:flex-row w-full justify-between items-center sm:items-center gap-4">
                                <div className="text-center sm:text-left space-y-1">
                                    <h2 className="text-2xl font-semibold text-gray-900">{formData.name}</h2>
                                    <p className="text-indigo-600 font-medium text-sm">{user?.role || 'Trainer'}</p>
                                    <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-500 text-sm mt-2">
                                        <Mail size={14} />
                                        {formData.email}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-70"
                                >
                                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                    {saving ? 'Saving...' : 'Save Profile'}
                                </button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Info */}
                    <Card className="border border-gray-200 shadow-sm bg-white">
                        <CardHeader className="border-b border-gray-100 pb-4">
                            <CardTitle className="text-lg font-semibold text-gray-800">Basic Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-6">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700">Phone Number</label>
                                <div className="relative">
                                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="+1 (555) 000-0000"
                                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700">Specialization</label>
                                <div className="relative">
                                    <Briefcase size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        name="specialization"
                                        value={formData.specialization}
                                        onChange={handleChange}
                                        placeholder="e.g. Certified Public Accountant (CPA)"
                                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700">Biography</label>
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleChange}
                                    rows="4"
                                    placeholder="Brief professional background..."
                                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm resize-none"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-6">
                        {/* Financial Presence */}
                        <Card className="border border-gray-200 shadow-sm bg-white">
                            <CardHeader className="border-b border-gray-100 pb-4">
                                <CardTitle className="text-lg font-semibold text-gray-800">Financial Presence</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-6">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700">LinkedIn Profile</label>
                                    <div className="relative">
                                        <Linkedin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="url"
                                            name="social.linkedin"
                                            value={formData.socials?.linkedin || ''}
                                            onChange={handleChange}
                                            placeholder="https://linkedin.com/in/..."
                                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700">Portfolio / Website</label>
                                    <div className="relative">
                                        <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="url"
                                            name="social.website"
                                            value={formData.socials?.website || ''}
                                            onChange={handleChange}
                                            placeholder="https://example.com"
                                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Security */}
                        <Card className="border border-gray-200 shadow-sm bg-white">
                            <CardHeader className="border-b border-gray-100 pb-4">
                                <CardTitle className="text-lg font-semibold text-gray-800">Security</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-6">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700">Update Password</label>
                                    <div className="relative">
                                        <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder="Leave blank to keep current"
                                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default Profile;
