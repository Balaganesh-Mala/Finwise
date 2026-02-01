import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { User, Mail, Phone, MapPin, Camera, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        bio: '',
        address: '',
        city: ''
    });

    useEffect(() => {
        const fetchProfile = async () => {
            const storedUser = localStorage.getItem('studentUser');
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);

                try {
                    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                    const res = await axios.get(`${API_URL}/api/students/${parsedUser._id}`);
                    const dbUser = res.data;

                    setFormData({
                        name: dbUser.name || '',
                        email: dbUser.email || '',
                        phone: dbUser.phone || '',
                        bio: '',
                        address: dbUser.address || '',
                        city: dbUser.city || ''
                    });
                } catch (err) {
                    console.error("Failed to fetch fresh profile", err);
                    setFormData({
                        name: parsedUser.name || '',
                        email: parsedUser.email || '',
                        phone: parsedUser.phone || '',
                        bio: '',
                        address: '',
                        city: ''
                    });
                }
            }
            setLoading(false);
        };
        fetchProfile();
    }, []);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const res = await axios.put(`${API_URL}/api/students/update/${user._id}`, {
                name: formData.name,
                phone: formData.phone,
                address: formData.address,
                city: formData.city
            });

            if (res.data.success) {
                toast.success('Profile updated successfully!');
                const updatedUser = { ...user, ...res.data.student };
                localStorage.setItem('studentUser', JSON.stringify(updatedUser)); // Update LocalStorage
                setUser(updatedUser);
            }
        } catch (error) {
            toast.error('Error updating profile');
            console.error(error);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Account Settings</h1>
                <p className="text-gray-500 mt-1">Manage your profile and preferences.</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="h-32 bg-indigo-600"></div>

                <div className="px-8 pb-8">
                    <div className="relative flex justify-between items-end -mt-12 mb-6">
                        <div className="relative">
                            <div className="w-24 h-24 bg-white rounded-full p-1 shadow-lg">
                                <div className="w-full h-full bg-gray-200 rounded-full overflow-hidden flex items-center justify-center text-gray-400">
                                    <User size={40} />
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={handleSave}
                            className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-2"
                        >
                            <Save size={18} />
                            Save Changes
                        </button>
                    </div>

                    <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                />
                                <div className="absolute left-3 top-3.5 text-gray-400">
                                    <User size={18} />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            <div className="relative">
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    disabled
                                    className="w-full pl-10 p-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
                                />
                                <div className="absolute left-3 top-3.5 text-gray-400">
                                    <Mail size={18} />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    placeholder="+1 (555) 000-0000"
                                />
                                <div className="absolute left-3 top-3.5 text-gray-400">
                                    <Phone size={18} />
                                </div>
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    placeholder="Street Address"
                                />
                                <div className="absolute left-3 top-3.5 text-gray-400">
                                    <MapPin size={18} />
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;
