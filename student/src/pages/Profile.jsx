import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { User, Mail, MapPin, Briefcase, Linkedin, Github, Globe, GraduationCap, Plus, Trash2, Camera, Save, Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [user, setUser] = useState(null);

    // Form States
    const [formData, setFormData] = useState({
        headline: '',
        bio: '',
        socials: { linkedin: '', github: '', portfolio: '', instagram: '' },
        education: []
    });
    const [profilePreview, setProfilePreview] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [activeTab, setActiveTab] = useState('about'); // about, socials, education

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const storedUser = JSON.parse(localStorage.getItem('studentUser'));
                if (!storedUser || !storedUser._id) {
                    navigate('/login');
                    return;
                }

                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/students/${storedUser._id}`);
                setUser(res.data);

                // Initialize Form
                setFormData({
                    headline: res.data.headline || '',
                    bio: res.data.bio || '',
                    socials: res.data.socials || { linkedin: '', github: '', portfolio: '', instagram: '' },
                    education: res.data.education || []
                });
                setProfilePreview(res.data.profilePicture);
            } catch (err) {
                console.error("Error fetching profile:", err);
                toast.error("Failed to load profile");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [navigate]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setProfilePreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleInputChange = (e, section = null) => {
        const { name, value } = e.target;
        if (section) {
            setFormData(prev => ({
                ...prev,
                [section]: { ...prev[section], [name]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleEducationChange = (index, field, value) => {
        const newEducation = [...formData.education];
        newEducation[index][field] = value;
        setFormData(prev => ({ ...prev, education: newEducation }));
    };

    const addEducation = () => {
        setFormData(prev => ({
            ...prev,
            education: [...prev.education, { degree: '', institution: '', year: '' }]
        }));
    };

    const removeEducation = (index) => {
        const newEducation = formData.education.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, education: newEducation }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        const toastId = toast.loading("Saving changes...");

        try {
            const data = new FormData();
            data.append('headline', formData.headline);
            data.append('bio', formData.bio);
            data.append('socials', JSON.stringify(formData.socials));
            data.append('education', JSON.stringify(formData.education));

            if (selectedFile) {
                data.append('profilePicture', selectedFile);
            }

            const res = await axios.put(`${import.meta.env.VITE_API_URL}/api/students/profile/${user._id}`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data.success) {
                toast.success("Profile Updated!", { id: toastId });
                // Update Local Storage User details if picture changed
                const storedUser = JSON.parse(localStorage.getItem('studentUser'));
                localStorage.setItem('studentUser', JSON.stringify({
                    ...storedUser,
                    profilePicture: res.data.user.profilePicture,
                    name: res.data.user.name // Ensure name sync
                }));
            }
        } catch (err) {
            console.error("Update failed:", err);
            toast.error("Update failed. Try again.", { id: toastId });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin text-indigo-600" size={40} /></div>;

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <button onClick={() => navigate('/dashboard')} className="mb-6 flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors">
                <ArrowLeft size={20} /> Back to Dashboard
            </button>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Left: Profile Card */}
                <div className="md:w-1/3">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center sticky top-24">
                        <div className="relative group mb-4">
                            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg ring-2 ring-indigo-50">
                                {profilePreview ? (
                                    <img src={profilePreview} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 text-4xl font-bold">
                                        {user.name.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full shadow-lg hover:bg-indigo-700 transition-colors"
                            >
                                <Camera size={16} />
                            </button>
                            <input type="file" ref={fileInputRef} hidden onChange={handleFileChange} accept="image/*" />
                        </div>

                        <h2 className="text-xl font-bold text-gray-900 text-center">{user.name}</h2>
                        <input
                            name="headline"
                            value={formData.headline}
                            onChange={handleInputChange}
                            placeholder="Add a headline (e.g. Frontend Developer)"
                            className="text-sm text-center text-gray-500 mt-1 py-1 w-full border-b border-gray-300 hover:border-gray-400 focus:border-indigo-500 focus:outline-none bg-transparent"
                        />

                        <div className="mt-6 w-full space-y-3">
                            <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                <Mail size={16} className="text-indigo-500" />
                                <span className="truncate">{user.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                <MapPin size={16} className="text-indigo-500" />
                                <span>{user.city || 'Location not set'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                <GraduationCap size={16} className="text-indigo-500" />
                                <span>{user.courseName}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Tabs & Forms */}
                <div className="md:w-2/3 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Tabs */}
                    <div className="flex border-b border-gray-100">
                        {['about', 'socials', 'education'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 py-4 text-sm font-semibold capitalize transition-all ${activeTab === tab
                                    ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="p-6">
                        {activeTab === 'about' && (
                            <div className="space-y-4 animate-in fade-in duration-300">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">About Me</label>
                                    <textarea
                                        name="bio"
                                        value={formData.bio}
                                        onChange={handleInputChange}
                                        rows={6}
                                        placeholder="Tell us about yourself..."
                                        className="w-full rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 text-sm p-3"
                                    ></textarea>
                                </div>
                            </div>
                        )}

                        {activeTab === 'socials' && (
                            <div className="space-y-4 animate-in fade-in duration-300">
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                        <Linkedin size={16} className="text-[#0077b5]" /> LinkedIn URL
                                    </label>
                                    <input
                                        name="linkedin"
                                        value={formData.socials.linkedin}
                                        onChange={(e) => handleInputChange(e, 'socials')}
                                        placeholder="https://linkedin.com/in/..."
                                        className="w-full rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 text-sm px-3 py-2"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                        <Github size={16} className="text-gray-900" /> GitHub URL
                                    </label>
                                    <input
                                        name="github"
                                        value={formData.socials.github}
                                        onChange={(e) => handleInputChange(e, 'socials')}
                                        placeholder="https://github.com/..."
                                        className="w-full rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 text-sm px-3 py-2"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                        <Globe size={16} className="text-indigo-600" /> Portfolio Website
                                    </label>
                                    <input
                                        name="portfolio"
                                        value={formData.socials.portfolio}
                                        onChange={(e) => handleInputChange(e, 'socials')}
                                        placeholder="https://..."
                                        className="w-full rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 text-sm px-3 py-2"
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === 'education' && (
                            <div className="space-y-4 animate-in fade-in duration-300">
                                {formData.education.map((edu, index) => (
                                    <div key={index} className="flex flex-col md:flex-row gap-3 p-4 bg-gray-50 rounded-xl relative group">
                                        <button onClick={() => removeEducation(index)} className="absolute top-2 right-2 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Trash2 size={16} />
                                        </button>
                                        <div className="flex-1 flex flex-col gap-2">
                                            <input
                                                value={edu.degree}
                                                onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                                                placeholder="Degree (e.g. B.Tech CSE)"
                                                className="w-full bg-white rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold focus:border-indigo-500 focus:ring-indigo-500 outline-none placeholder-gray-400"
                                            />
                                            <input
                                                value={edu.institution}
                                                onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                                                placeholder="Institution Name"
                                                className="w-full bg-white rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 focus:border-indigo-500 focus:ring-indigo-500 outline-none placeholder-gray-400"
                                            />
                                        </div>
                                        <div className="w-full md:w-32">
                                            <input
                                                value={edu.year}
                                                onChange={(e) => handleEducationChange(index, 'year', e.target.value)}
                                                placeholder="Year (e.g. 2024)"
                                                className="w-full bg-white rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500 outline-none"
                                            />
                                        </div>
                                    </div>
                                ))}
                                <button onClick={addEducation} className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 hover:border-indigo-500 hover:text-indigo-600 flex items-center justify-center gap-2 transition-colors">
                                    <Plus size={18} /> Add Education
                                </button>
                            </div>
                        )}

                        {/* Save Button */}
                        <div className="mt-8 flex justify-end">
                            <button
                                onClick={handleSubmit}
                                disabled={saving}
                                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold shadow-md hover:bg-indigo-700 transition-all disabled:opacity-50"
                            >
                                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
