import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Lock, Bell, Shield, AlertTriangle, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const Settings = () => {
    const [loading, setLoading] = useState(false);
    const [passwordData, setPasswordData] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [preferences, setPreferences] = useState({
        emailUpdates: true,
        newCourseAlerts: false,
        assignmentNotifs: true
    });

    const handlePasswordChange = (e) => setPasswordData({ ...passwordData, [e.target.name]: e.target.value });

    const updatePassword = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error("Passwords do not match!");
            return;
        }
        if (passwordData.newPassword.length < 6) {
            toast.error("Password must be at least 6 characters.");
            return;
        }

        setLoading(true);
        try {
            const user = JSON.parse(localStorage.getItem('studentUser'));
            if (!user) return toast.error("User not found");

            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            await axios.put(`${API_URL}/api/students/update/${user._id}`, {
                password: passwordData.newPassword
            });

            toast.success("Password updated successfully!");
            setPasswordData({ newPassword: '', confirmPassword: '' });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update password");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('studentUser'));
        if (user && user.preferences) {
            setPreferences(user.preferences);
        }
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
            // Assuming the backend accepts 'preferences' in the profile update or a dedicated route
            // Since the backend snippet we saw has /profile/:id which handles specific fields, 
            // we might need to update the backend to accept 'preferences'.
            // For now, let's try sending it to /profile/:id (it might be ignored if not in destructuring)
            // Or better, /update/:id (admin route? no, let's use profile and fix backend)

            // Actually, best to just create a 'preferences' field in Student model if needed.
            // Let's send it to /api/students/profile/${user._id}

            const res = await axios.put(`${API_URL}/api/students/profile/${user._id}`, {
                preferences // We will need to update backend to handle this
            });

            // Update local storage
            const updatedUser = { ...user, preferences };
            localStorage.setItem('studentUser', JSON.stringify(updatedUser));

            toast.success("Preferences saved!");
        } catch (error) {
            toast.error("Failed to save preferences");
        } finally {
            setLoading(false);
        }
    };

    const deleteAccount = async () => {
        if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) return;

        try {
            const user = JSON.parse(localStorage.getItem('studentUser'));
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            await axios.delete(`${API_URL}/api/students/${user._id}`);

            toast.success("Account deleted.");
            localStorage.removeItem('studentUser');
            localStorage.removeItem('studentToken');
            window.location.href = '/login';
        } catch (error) {
            toast.error("Could not delete account. Contact support.");
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
                <p className="text-gray-500 mt-1">Manage security and application preferences.</p>
            </div>

            {/* Security Section (Change Password) */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center gap-3">
                    <div className="bg-indigo-50 text-indigo-600 p-2 rounded-lg">
                        <Lock size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">Security</h2>
                        <p className="text-sm text-gray-500">Update your password and secure your account.</p>
                    </div>
                </div>

                <div className="p-6">
                    <form onSubmit={updatePassword} className="max-w-md space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                            <input
                                type="password"
                                name="newPassword"
                                value={passwordData.newPassword}
                                onChange={handlePasswordChange}
                                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                placeholder="Min. 6 characters"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={passwordData.confirmPassword}
                                onChange={handlePasswordChange}
                                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                placeholder="Re-enter new password"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium shadow-md shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2 disabled:opacity-70"
                        >
                            {loading ? <span className="animate-pulse">Updating...</span> : 'Update Password'}
                        </button>
                    </form>
                </div>
            </div>

            {/* Notifications Section */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center gap-3">
                    <div className="bg-orange-50 text-orange-600 p-2 rounded-lg">
                        <Bell size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">Notifications</h2>
                        <p className="text-sm text-gray-500">Choose what updates you want to receive.</p>
                    </div>
                </div>

                <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-gray-700 font-medium text-sm">Email me when a course is updated</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={preferences.emailUpdates}
                                onChange={() => handleToggle('emailUpdates')}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-gray-700 font-medium text-sm">Email me about new courses</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={preferences.newCourseAlerts}
                                onChange={() => handleToggle('newCourseAlerts')}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-gray-700 font-medium text-sm">Notify me on dashboard for assignments</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={preferences.assignmentNotifs}
                                onChange={() => handleToggle('assignmentNotifs')}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                    </div>

                    <div className="pt-4">
                        <button
                            onClick={savePreferences}
                            disabled={loading}
                            className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : 'Save Preferences'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="border border-red-200 rounded-xl overflow-hidden bg-red-50/50">
                <div className="p-6 flex items-start gap-4">
                    <div className="bg-red-100 text-red-600 p-2 rounded-lg shrink-0">
                        <AlertTriangle size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-red-700">Danger Zone</h3>
                        <p className="text-sm text-red-600 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
                        <button
                            onClick={deleteAccount}
                            className="bg-white text-red-600 border border-red-200 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-50 hover:border-red-300 transition-colors"
                        >
                            Delete Account
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

}
export default Settings;
