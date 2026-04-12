import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { NavLink, Link } from 'react-router-dom';
import {
    LayoutDashboard, Users, Calendar, BookOpen,
    MessageSquare, User, TrendingUp, LogOut, QrCode, ClipboardList
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { cn } from '@/lib/utils';

const Sidebar = ({ isOpen, onClose }) => {
    const { user, logout } = useAuth();
    const [settings, setSettings] = useState({ siteTitle: 'Trainer Portal', logoUrl: '' });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                const { data } = await axios.get(`${API_URL}/api/settings`);
                if (data && data.siteTitle) setSettings(data);
            } catch (error) {
                console.error("Failed to fetch settings:", error);
            }
        };
        fetchSettings();
    }, []);

    const allLinks = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', accessKey: 'dashboard' },
        { name: 'Classes', icon: Calendar, path: '/classes', accessKey: 'classes' },
        { name: 'Students', icon: Users, path: '/students', accessKey: 'students' },
        { name: 'Attendance', icon: Users, path: '/attendance', accessKey: 'attendance' },
        { name: 'Materials', icon: BookOpen, path: '/materials', accessKey: 'materials' },
        { name: 'Submissions', icon: ClipboardList, path: '/submissions', accessKey: 'submissions' },
        { name: 'Mock Interview', icon: MessageSquare, path: '/mock-interview', accessKey: 'mockInterview' },
        { name: 'Comments', icon: MessageSquare, path: '/comments', accessKey: 'comments' },

        { name: 'Analytics', icon: TrendingUp, path: '/analytics', accessKey: 'analytics' },
        { name: 'My QR', icon: QrCode, path: '/my-qr', accessKey: 'myQR' },
        { name: 'Profile', icon: User, path: '/profile', accessKey: 'profile' },
    ];

    // Filter links based on user access
    const links = allLinks.filter(link => {
        if (!user || !user.access) return true; // Default to showing if access object is missing (e.g. during hiring)
        return user.access[link.accessKey] !== false;
    });

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div className={cn(
                "h-screen w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out z-50",
                "fixed inset-y-0 left-0 md:static md:translate-x-0",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <Link to="/dashboard" className="p-6 flex items-center space-x-3 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    {settings.logoUrl ? (
                        <img src={settings.logoUrl} alt="Logo" className="h-8 w-auto object-contain" />
                    ) : (
                        <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
                            {settings.siteTitle.charAt(0)}
                        </div>
                    )}
                    <span className="text-xl font-bold text-gray-800">{settings.siteTitle}</span>
                </Link>
                <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
                    {links.map((link) => (
                        <NavLink
                            key={link.name}
                            to={link.path}
                            onClick={() => window.innerWidth < 768 && onClose()}
                            className={({ isActive }) =>
                                cn(
                                    "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-indigo-50 text-indigo-600"
                                        : "text-gray-700 hover:bg-gray-100"
                                )
                            }
                        >
                            <link.icon className="mr-3 h-5 w-5" />
                            {link.name}
                        </NavLink>
                    ))}
                </nav>
                <div className="border-t p-4">
                    <button
                        onClick={logout}
                        className="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                        <LogOut className="mr-3 h-5 w-5" />
                        Logout
                    </button>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
