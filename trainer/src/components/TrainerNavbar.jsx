import React, { useState, useEffect } from 'react';
import { Bell, Search, ChevronDown, LogOut, User, Settings, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const TrainerNavbar = ({ onMenuClick }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Notification State
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [profileOpen, setProfileOpen] = useState(false);

    // Fetch Notifications
    const fetchNotifications = async () => {
        if (!user?._id) return;
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            // recipientModel='Trainer' is important here
            const { data } = await axios.get(`${API_URL}/api/notifications?recipientId=${user._id}&recipientModel=Trainer`);
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.isRead).length);
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, [user?._id]);

    const handleNotificationClick = async (notif) => {
        if (!notif.isRead) {
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                await axios.put(`${API_URL}/api/notifications/${notif._id}/read`);
                setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
                setUnreadCount(prev => Math.max(0, prev - 1));
            } catch (error) {
                console.error(error);
            }
        }
        if (notif.link) navigate(notif.link);
        setShowNotifications(false);
    };

    return (
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30">
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="p-2 -ml-2 text-gray-400 hover:text-gray-600 md:hidden"
                >
                    <Menu size={24} />
                </button>

                {/* Search (Placeholder) */}
                <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 w-48 sm:w-64 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                    <Search size={18} className="text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="bg-transparent border-none outline-none text-sm ml-2 w-full text-gray-700 placeholder-gray-400"
                    />
                </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-6">
                {/* Notification Bell */}
                <div className="relative">
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                        )}
                    </button>

                    {showNotifications && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)}></div>
                            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 p-2 z-20 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                                <div className="p-2 border-b border-gray-50 flex justify-between items-center">
                                    <h3 className="font-semibold text-sm text-gray-700">Notifications</h3>
                                    <span className="text-xs text-indigo-600 font-medium">{unreadCount} New</span>
                                </div>
                                <div className="max-h-80 overflow-y-auto">
                                    {notifications.length > 0 ? (
                                        notifications.map(n => (
                                            <div
                                                key={n._id}
                                                onClick={() => handleNotificationClick(n)}
                                                className={`p-3 rounded-lg mb-1 cursor-pointer transition-colors ${n.isRead ? 'bg-white hover:bg-gray-50' : 'bg-indigo-50/50 hover:bg-indigo-50'}`}
                                            >
                                                <div className="flex gap-3">
                                                    <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${n.isRead ? 'bg-gray-300' : 'bg-indigo-500'}`} />
                                                    <div>
                                                        <p className={`text-sm ${n.isRead ? 'text-gray-600' : 'text-gray-900 font-medium'} leading-tight`}>{n.title}</p>
                                                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{n.message}</p>
                                                        <p className="text-[10px] text-gray-400 mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-gray-400 text-sm">No notifications</div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>

                {/* Profile Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setProfileOpen(!profileOpen)}
                        className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 py-1.5 px-2 rounded-lg transition-colors border border-transparent hover:border-gray-200 focus:outline-none"
                    >
                        <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold border border-indigo-200 shadow-sm">
                            {user?.photo ? (
                                <img src={user.photo} alt="Profile" className="w-full h-full rounded-full object-cover" />
                            ) : (
                                user?.name?.charAt(0) || 'T'
                            )}
                        </div>
                        <div className="text-left hidden md:block">
                            <p className="text-sm font-bold text-gray-700 leading-none">{user?.name || 'Trainer'}</p>
                            <p className="text-xs text-gray-400 mt-1 truncate max-w-[100px]">{user?.email}</p>
                        </div>
                        <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {profileOpen && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)}></div>
                            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 p-2 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                                <button
                                    onClick={() => { navigate('/profile'); setProfileOpen(false); }}
                                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-600 hover:text-indigo-600 transition-colors text-sm font-medium"
                                >
                                    <User size={16} /> My Profile
                                </button>
                                <button
                                    onClick={() => { navigate('/settings'); setProfileOpen(false); }}
                                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-600 hover:text-indigo-600 transition-colors text-sm font-medium"
                                >
                                    <Settings size={16} /> Settings
                                </button>
                                <div className="h-px bg-gray-100 my-1"></div>
                                <button
                                    onClick={logout}
                                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors text-sm font-medium"
                                >
                                    <LogOut size={16} /> Sign Out
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default TrainerNavbar;
