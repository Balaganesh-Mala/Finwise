import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard, Users, Calendar, BookOpen,
    MessageSquare, User, TrendingUp, LogOut, QrCode
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '@/lib/utils';

const Sidebar = () => {
    const { logout } = useAuth();
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

    const links = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        { name: 'Classes', icon: Calendar, path: '/classes' },
        { name: 'Students', icon: Users, path: '/students' },
        { name: 'Attendance', icon: Users, path: '/attendance' },
        { name: 'Materials', icon: BookOpen, path: '/materials' },
        { name: 'Comments', icon: MessageSquare, path: '/comments' },
        { name: 'Analytics', icon: TrendingUp, path: '/analytics' },
        { name: 'My QR', icon: QrCode, path: '/my-qr' },
        { name: 'Profile', icon: User, path: '/profile' },
    ];

    return (
        <div className="h-screen w-64 bg-white border-r border-gray-200 flex flex-col">
            <div className="p-6 flex items-center space-x-3 border-b border-gray-100">
                {settings.logoUrl ? (
                    <img src={settings.logoUrl} alt="Logo" className="h-8 w-auto object-contain" />
                ) : (
                    <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
                        {settings.siteTitle.charAt(0)}
                    </div>
                )}
                <span className="text-xl font-bold text-gray-800">{settings.siteTitle}</span>
            </div>
            <nav className="flex-1 space-y-1 px-3 py-4">
                {links.map((link) => (
                    <NavLink
                        key={link.name}
                        to={link.path}
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
    );
};

export default Sidebar;
