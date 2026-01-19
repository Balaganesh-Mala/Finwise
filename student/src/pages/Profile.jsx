import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { User, Mail, Phone, MapPin, Camera, Save } from 'lucide-react';

const Profile = () => {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        bio: ''
    });

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            setFormData({
                full_name: user?.user_metadata?.full_name || '',
                email: user?.email || '',
                phone: user?.user_metadata?.phone || '',
                bio: user?.user_metadata?.bio || ''
            });
            setLoading(false);
        };
        fetchProfile();
    }, []);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSave = async (e) => {
        e.preventDefault();
        // Update user metadata in Supabase
        const { error } = await supabase.auth.updateUser({
            data: { 
                full_name: formData.full_name,
                phone: formData.phone,
                bio: formData.bio
            }
        });

        if (error) {
            alert('Error updating profile');
        } else {
            alert('Profile updated successfully!');
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
                {/* Banner / Header */}
                <div className="h-32 bg-indigo-600"></div>
                
                <div className="px-8 pb-8">
                    <div className="relative flex justify-between items-end -mt-12 mb-6">
                        <div className="relative">
                            <div className="w-24 h-24 bg-white rounded-full p-1 shadow-lg">
                                <div className="w-full h-full bg-gray-200 rounded-full overflow-hidden flex items-center justify-center text-gray-400">
                                    {user?.user_metadata?.avatar_url ? (
                                        <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={40} />
                                    )}
                                </div>
                            </div>
                            <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-md text-gray-600 hover:text-indigo-600 border border-gray-100">
                                <Camera size={16} />
                            </button>
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
                                    name="full_name"
                                    value={formData.full_name}
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                             <textarea 
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                rows="4"
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                placeholder="Tell us a little about yourself..."
                            ></textarea>
                            <p className="text-xs text-gray-400 mt-1 text-right">0/500 characters</p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;
