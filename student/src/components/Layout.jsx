import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    BookOpen,
    User,
    LogOut,
    Menu,
    X,
    GraduationCap,
    Bell,
    Search,
    ChevronDown,
    Settings,
    Code2,
    ChevronLeft,
    ChevronRight,
    QrCode,
    Calendar, // Import Calendar
    Keyboard,
    Bot,
    Trophy,
    Sparkles,
    Shield,
    ExternalLink
} from 'lucide-react';


import axios from 'axios';

const Layout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [settings, setSettings] = useState(null);
    const [profileOpen, setProfileOpen] = useState(false);
    const [attendanceCount, setAttendanceCount] = useState(0);
    const [completedTasks, setCompletedTasks] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const navigate = useNavigate();
    const location = useLocation();

    // Fetch Notifications
    const fetchNotifications = async () => {
        if (!user?._id) return;
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const { data } = await axios.get(`${API_URL}/api/notifications?studentId=${user._id}`);
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
                // Update local state to reflect read status instantly
                setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
                setUnreadCount(prev => Math.max(0, prev - 1));
            } catch (error) {
                console.error(error);
            }
        }
        if (notif.link) navigate(notif.link);
        setShowNotifications(false);
    };

    useEffect(() => {
        // Fetch user from Local Storage
        const storedUserString = localStorage.getItem('studentUser');
        if (storedUserString) {
            const storedUser = JSON.parse(storedUserString);
            setUser(storedUser);

            // Fetch fresh user data to update permissions
            const fetchLatestUser = async () => {
                try {
                    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                    const { data } = await axios.get(`${API_URL}/api/students/${storedUser._id}`);

                    // Preserve the token if it exists in the stored object (though current login response structure doesn't seem to show a separate token field, assuming 'user' object is stored)
                    // Based on login route: res.json({ success:true, user: {...} })
                    // So localStorage likely just holds the user object.

                    if (data) {
                        // Merge or replace. The login response returns { user: ... }. 
                        // The get/:id route returns the student object directly: res.json(student)

                        // We need to make sure we format it consistently. 
                        // Login response: { _id, name, email, access, courseName }
                        // Get response: full student object.

                        const updatedUser = {
                            _id: data._id,
                            name: data.name,
                            email: data.email,
                            access: data.access,
                            courseName: data.courseName,
                            // Keep other fields if needed
                            ...data
                        };

                        setUser(updatedUser);
                        localStorage.setItem('studentUser', JSON.stringify(updatedUser));
                    }
                } catch (error) {
                    console.error("Failed to refresh user data:", error);
                    // If 404, maybe user deleted? handleLogout();
                }
            };
            fetchLatestUser();

        } else {
            navigate('/login');
        }

        // Fetch company settings
        const fetchSettings = async () => {
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                const { data } = await axios.get(`${API_URL}/api/settings`);
                setSettings(data);
            } catch (error) {
                console.error("Failed to fetch settings:", error);
            }
        };
        fetchSettings();
    }, [navigate]);

    // Fetch Stats when user is set
    useEffect(() => {
        if (!user || !user._id) return;

        const fetchStats = async () => {
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

                // 1. Fetch Attendance
                // Assuming /api/attendance/history exists and returns array
                const attRes = await axios.get(`${API_URL}/api/attendance/history?studentId=${user._id}`);
                // Filter distinct days if needed, but assuming api returns daily records
                if (Array.isArray(attRes.data)) {
                    // Count present
                    const present = attRes.data.filter(r => r.status === 'present').length;
                    setAttendanceCount(present);
                }

                // 2. Fetch Progress
                // We need courseId first.
                if (user.courseName) {
                    const coursesRes = await axios.get(`${API_URL}/api/courses`);
                    const course = coursesRes.data.find(c => c.title === user.courseName);

                    if (course) {
                        const progressRes = await axios.get(`${API_URL}/api/student/progress/${course._id}/${user._id}`);
                        if (progressRes.data && progressRes.data.progress) {
                            const completed = progressRes.data.progress.filter(p => p.completed).length;
                            setCompletedTasks(completed);
                        }
                    }
                }

            } catch (err) {
                console.error("Failed to fetch stats:", err);
            }
        };

        fetchStats();
    }, [user?._id, user?.courseName]);

    const handleLogout = async () => {
        localStorage.removeItem('studentUser'); // Clear local session
        navigate('/login');
    };

    const allNavItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/', accessKey: 'dashboard' },
        { icon: BookOpen, label: 'My Courses', path: '/courses', accessKey: 'myCourses' },
        { icon: QrCode, label: 'My QR', path: '/my-qr', accessKey: 'myQR' },
        { icon: Calendar, label: 'My Attendance', path: '/my-attendance', accessKey: 'attendance' },
        { icon: Code2, label: 'Playground', path: '/playground', accessKey: 'playground' },
        { icon: Keyboard, label: 'Typing Practice', path: '/typing-practice', accessKey: 'typingPractice' },
        { icon: Bot, label: 'AI Mock Interview', path: '/mock-interview', accessKey: 'aiMockInterview' },
        { icon: User, label: 'Profile', path: '/profile', accessKey: 'profile' },
        { icon: Settings, label: 'Settings', path: '/settings', accessKey: 'settings' },
    ];

    // Filter items based on user access
    const navItems = allNavItems.filter(item => {
        if (!user || !user.access) return false; // Safety check
        // If accessKey is present, check user.access[accessKey]
        // If not present (default), assume true or handle otherwise. Here we added accessKey to all.
        return user.access[item.accessKey];
    });

    const [collapsed, setCollapsed] = useState(false);

    // ... (existing hooks)

    return (
        <div className="h-screen w-full bg-gray-50 flex overflow-hidden">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <aside
                className={`fixed lg:static inset-y-0 left-0 z-50 bg-white border-r border-gray-200 shadow-xl lg:shadow-none transform transition-all duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                    } ${collapsed ? 'w-20' : 'w-72'}`}
            >
                {/* Logo Area */}
                <div className={`h-20 flex items-center ${collapsed ? 'justify-center' : 'justify-between px-8'} border-b border-gray-100 relative`}>
                    <div className="flex items-center gap-3">
                        {settings?.logoUrl ? (
                            <img
                                src={settings.logoUrl}
                                alt="Logo"
                                className="w-10 h-10 rounded-lg object-cover shrink-0"
                            />
                        ) : (
                            <div className="bg-indigo-600 p-2 rounded-lg shrink-0">
                                <GraduationCap className="text-white" size={24} />
                            </div>
                        )}

                        {!collapsed && (
                            <div className="transition-opacity duration-300">
                                <span className="block text-lg font-bold text-gray-900 leading-tight">
                                    {settings?.siteTitle || 'Wonew Skill Up Academy'}
                                </span>
                                <span className="block text-xs text-indigo-600 font-semibold tracking-wide">STUDENT PORTAL</span>
                            </div>
                        )}
                    </div>

                    {/* Desktop Toggle Button */}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className={`hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white border border-gray-200 rounded-full items-center justify-center text-gray-500 hover:text-indigo-600 shadow-sm hover:shadow transition-colors z-50`}
                    >
                        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                    </button>

                    {/* Close button for mobile */}
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden text-gray-400 hover:text-gray-600"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Navigation Links */}
                <nav className="p-4 space-y-2">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => setSidebarOpen(false)}
                            className={({ isActive }) =>
                                `flex items-center ${collapsed ? 'justify-center px-2' : 'gap-4 px-4'} py-3.5 rounded-xl transition-all duration-200 group relative ${isActive
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                }`
                            }
                            title={collapsed ? item.label : ''}
                        >
                            <item.icon size={22} className={`shrink-0 ${location.pathname === item.path ? 'text-white' : 'text-gray-400 group-hover:text-indigo-600'}`} />
                            {!collapsed && <span className="font-medium whitespace-nowrap">{item.label}</span>}
                        </NavLink>
                    ))}
                </nav>

                {/* Bottom Section */}
                <div className={`absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-gray-50/50`}>
                    <button
                        onClick={handleLogout}
                        className={`flex items-center ${collapsed ? 'justify-center' : 'justify-center gap-3 w-full'} px-4 py-3 text-red-600 bg-white border border-red-100 hover:bg-red-50 rounded-xl transition-all font-medium shadow-sm hover:shadow`}
                        title={collapsed ? "Sign Out" : ""}
                    >
                        <LogOut size={20} />
                        {!collapsed && <span>Sign Out</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col min-w-0 h-full relative">

                {/* Navbar (Top Header) */}
                <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-30">

                    {/* Left Side: Mobile Menu Toggle & Title/Breadcrumb */}
                    <div className="flex items-center gap-4">
                        <button
                            className="lg:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu size={24} />
                        </button>
                        <h2 className="hidden md:block text-xl font-semibold text-gray-800">
                            {navItems.find(i => i.path === location.pathname)?.label || 'Dashboard'}
                        </h2>
                    </div>

                    {/* Right Side: Search & Profile */}
                    <div className="flex items-center gap-6">

                        {/* Search Bar (Desktop) */}
                        <div className="hidden md:flex items-center bg-gray-100 rounded-full px-4 py-2.5 w-64 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                            <Search size={18} className="text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search courses..."
                                className="bg-transparent border-none outline-none text-sm ml-2 w-full text-gray-700 placeholder-gray-400"
                            />
                        </div>

                        {/* Notification Bell */}
                        <div className="relative">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <Bell size={22} />
                                {unreadCount > 0 && (
                                    <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
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

                        <div className="h-8 w-px bg-gray-200 mx-2 hidden md:block"></div>

                        <div className="relative">
                            <button
                                onClick={() => setProfileOpen(!profileOpen)}
                                className="flex items-center gap-3 pl-2 cursor-pointer hover:bg-gray-50 py-1.5 px-2 rounded-lg transition-colors border border-transparent hover:border-gray-200 focus:outline-none"
                            >
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 p-[2px] shadow-sm">
                                    <div className="w-full h-full bg-white rounded-full p-[2px] overflow-hidden">
                                        {user?.profilePicture ? (
                                            <img
                                                src={user.profilePicture}
                                                alt="User"
                                                className="w-full h-full rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500 font-bold">
                                                {user?.name?.charAt(0) || 'U'}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="hidden md:block text-left">
                                    <p className="text-sm font-bold text-gray-700 leading-none">{user?.name || 'Student'}</p>
                                    <p className="text-xs text-gray-400 mt-1 truncate max-w-[100px]">{user?.email}</p>
                                </div>
                                <ChevronDown size={16} className={`text-gray-400 hidden md:block transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Profile Dropdown */}
                            {profileOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)}></div>
                                    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                                        <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-50">
                                            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 p-[3px] shadow-md">
                                                <div className="w-full h-full bg-white rounded-full p-[2px] overflow-hidden">
                                                    {user?.profilePicture ? (
                                                        <img
                                                            src={user.profilePicture}
                                                            alt="User"
                                                            className="w-full h-full rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500 font-bold text-2xl">
                                                            {user?.name?.charAt(0) || 'U'}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 text-lg">{user?.name}</h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold border border-indigo-100 flex items-center gap-1">
                                                        <Trophy size={10} /> Novice
                                                    </span>
                                                    <span className="text-xs text-gray-400">Level 1</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 mb-4">
                                            <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                                                <p className="text-xs text-gray-500 font-medium">Attendance</p>
                                                <p className="text-lg font-bold text-gray-900">{attendanceCount} Days</p>
                                            </div>
                                            <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                                                <p className="text-xs text-gray-500 font-medium">Tasks Done</p>
                                                <p className="text-lg font-bold text-gray-900">{completedTasks}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <button
                                                onClick={() => { navigate('/profile'); setProfileOpen(false); }}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 text-gray-600 hover:text-indigo-600 transition-colors text-sm font-medium"
                                            >
                                                <User size={18} /> My Profile
                                            </button>
                                            <button
                                                onClick={() => { navigate('/settings'); setProfileOpen(false); }}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 text-gray-600 hover:text-indigo-600 transition-colors text-sm font-medium"
                                            >
                                                <Settings size={18} /> Settings
                                            </button>
                                        </div>

                                        <div className="mt-4 pt-3 border-t border-gray-100">
                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 text-red-600 transition-colors text-sm font-medium"
                                            >
                                                <LogOut size={18} /> Sign Out
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page Content (Scrollable Area) */}
                <main className={`flex-1 scroll-smooth ${location.pathname.includes('/playground') ? 'p-0 overflow-hidden' : 'p-6 lg:p-10 overflow-y-auto'}`}>
                    <div className={location.pathname.includes('/playground') ? 'w-full h-full' : 'max-w-7xl mx-auto'}>
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;
