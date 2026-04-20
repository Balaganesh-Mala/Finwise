import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Bell, 
    Save, 
    Lock, 
    Eye, 
    EyeOff, 
    Monitor,
    Smartphone,
    UserCircle,
    Key,
    Activity
} from 'lucide-react';
import toast from 'react-hot-toast';

const SettingItem = ({ icon: Icon, color, title, description, children }) => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded-xl ${color}`}>
                    <Icon size={22} />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-gray-900">{title}</h2>
                    <p className="text-sm text-gray-500">{description}</p>
                </div>
            </div>
        </div>
        <div className="p-6">
            {children}
        </div>
    </div>
);

const ToggleRow = ({ label, sublabel, checked, onChange }) => (
    <div className="flex items-center justify-between py-2">
        <div className="flex flex-col">
            <span className="text-gray-800 font-semibold text-sm">{label}</span>
            {sublabel && <span className="text-xs text-gray-400">{sublabel}</span>}
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
            <input
                type="checkbox"
                className="sr-only peer"
                checked={checked}
                onChange={onChange}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
        </label>
    </div>
);

const Settings = () => {
    const [loading, setLoading] = useState(false);
    const [pwdLoading, setPwdLoading] = useState(false);

    const [preferences, setPreferences] = useState({
        emailUpdates: true,
        newCourseAlerts: false,
        assignmentNotifs: true,
        showOnLeaderboard: true,
        publicProfile: true,
        typingSounds: true,
        compactMode: false
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            const storedUser = JSON.parse(localStorage.getItem('studentUser'));
            if (!storedUser) return;

            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                const { data } = await axios.get(`${API_URL}/api/students/${storedUser._id}`);
                if (data && data.preferences) {
                    setPreferences({
                        ...preferences,
                        ...data.preferences
                    });
                }
            } catch (err) {
                console.error("Failed to fetch fresh settings:", err);
                if (storedUser.preferences) setPreferences({ ...preferences, ...storedUser.preferences });
            }
        };

        fetchUserData();
    }, []);

    const handleToggle = (key) => {
        setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const savePreferences = async () => {
        setLoading(true);
        try {
            const user = JSON.parse(localStorage.getItem('studentUser'));
            if (!user) return;

            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const res = await axios.put(`${API_URL}/api/students/profile/${user._id}`, {
                preferences
            });

            if (res.data.success) {
                const updatedUser = { ...user, preferences: res.data.user.preferences };
                localStorage.setItem('studentUser', JSON.stringify(updatedUser));
                toast.success("Preferences saved successfully!");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to save preferences");
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        
        const currentPwd = passwordData.currentPassword.trim();
        const newPwd = passwordData.newPassword.trim();
        const confirmPwd = passwordData.confirmPassword.trim();

        if (newPwd !== confirmPwd) {
            return toast.error("New passwords do not match!");
        }
        if (newPwd.length < 6) {
            return toast.error("Password must be at least 6 characters long");
        }

        setPwdLoading(true);
        try {
            const user = JSON.parse(localStorage.getItem('studentUser'));
            const token = localStorage.getItem('studentToken');
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            
            const res = await axios.post(`${API_URL}/api/students/change-password/${user._id}`, {
                currentPassword: currentPwd,
                newPassword: newPwd
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                toast.success("Password updated successfully!");
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                setShowPassword(false);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update password");
        } finally {
            setPwdLoading(false);
        }
    };


    return (
        <div className="max-w-4xl mx-auto py-4 px-4 sm:px-0">
            <div className="mb-10 text-center sm:text-left">
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Settings</h1>
                <p className="text-gray-500 mt-2 font-medium">Customize your learning experience and keep your account secure.</p>
            </div>

            <div className="space-y-6">
                {/* Account Security */}
                <SettingItem 
                    icon={Lock} 
                    color="bg-red-50 text-red-600" 
                    title="Account Security" 
                    description="Update your password to keep your account safe."
                >
                    <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Current Password</label>
                            <div className="relative">
                                <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
                                    placeholder="••••••••"
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">New Password</label>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                    placeholder="Min. 6 chars"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Confirm New</label>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                    placeholder="Match passwords"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2 mt-2">
                             <button 
                                type="button" 
                                onClick={() => setShowPassword(!showPassword)}
                                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                             >
                                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />} 
                                {showPassword ? "Hide Passwords" : "Show Passwords"}
                             </button>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={pwdLoading}
                                className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center gap-2"
                            >
                                <Save size={16} />
                                {pwdLoading ? 'Updating...' : 'Update Password'}
                            </button>
                        </div>
                    </form>
                </SettingItem>


                {/* Notifications */}
                <SettingItem 
                    icon={Bell} 
                    color="bg-amber-50 text-amber-600" 
                    title="Notifications" 
                    description="Stay updated with the latest courses and activities."
                >
                    <div className="space-y-6">
                        <ToggleRow 
                            label="Email Updates" 
                            sublabel="Get notified when a course you're enrolled in is updated."
                            checked={preferences.emailUpdates} 
                            onChange={() => handleToggle('emailUpdates')} 
                        />
                        <div className="h-px bg-gray-50"></div>
                        <ToggleRow 
                            label="New Course Alerts" 
                            sublabel="Receive emails about newly launched courses and bonus content."
                            checked={preferences.newCourseAlerts} 
                            onChange={() => handleToggle('newCourseAlerts')} 
                        />
                        <div className="h-px bg-gray-50"></div>
                        <ToggleRow 
                            label="Assignment Notifications" 
                            sublabel="In-portal alerts for upcoming deadlines and submissions."
                            checked={preferences.assignmentNotifs} 
                            onChange={() => handleToggle('assignmentNotifs')} 
                        />
                    </div>
                </SettingItem>

                {/* App Experience */}
                <SettingItem 
                    icon={Activity} 
                    color="bg-indigo-50 text-indigo-600" 
                    title="Application Experience" 
                    description="Customize the interface to suit your style."
                >
                    <div className="space-y-6">
                        <ToggleRow 
                            label="Typing Practice Sounds" 
                            sublabel="Play key press sounds during typing speed challenges."
                            checked={preferences.typingSounds} 
                            onChange={() => handleToggle('typingSounds')} 
                        />
                        <div className="h-px bg-gray-50"></div>
                        <ToggleRow 
                            label="Compact Sidebar" 
                            sublabel="Show a slim sidebar by default for more screen space."
                            checked={preferences.compactMode} 
                            onChange={() => handleToggle('compactMode')} 
                        />
                    </div>
                </SettingItem>

                {/* Final Save Button */}
                <div className="sticky bottom-6 flex justify-center sm:justify-end z-10 pt-4">
                    <button
                        onClick={savePreferences}
                        disabled={loading}
                        className="bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-black text-sm hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all disabled:opacity-50 flex items-center gap-3 transform hover:-translate-y-1 active:scale-95"
                    >
                        <Activity size={18} className={loading ? 'animate-spin' : ''} />
                        {loading ? 'Saving Changes...' : 'Save All Preferences'}
                    </button>
                </div>
            </div>
        </div>
    );

}
export default Settings;
