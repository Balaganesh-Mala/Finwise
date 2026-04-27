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
    ExternalLink,
    Briefcase,
    AlertCircle,
    CreditCard,
    Coins,
    BotIcon,
    Video
} from 'lucide-react';


import axios from 'axios';
import logoImg from '../assets/logo.jpeg';
import { subscribeToPush } from '../utils/pushNotifications';
import SpotlightModal from './SpotlightModal';
import LiveSupport from './LiveSupport';

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
    const [isMobileQROpen, setIsMobileQROpen] = useState(false);
    const [mobileQRData, setMobileQRData] = useState(null);
    const [mobileQRLoading, setMobileQRLoading] = useState(false);
    const [newJobsCount, setNewJobsCount] = useState(0);
    const [dailyRank, setDailyRank] = useState(null);
    const [weeklyRank, setWeeklyRank] = useState(null);
    const [wallet, setWallet] = useState({ totalPoints: 0, totalCoins: 0, level: 1 });

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
                        if (data.status !== 'Active') {
                            localStorage.removeItem('studentUser');
                            navigate('/login', { state: { error: 'Your account is inactive. Please contact support.' } });
                            return;
                        }

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

                        // Subscribe to push notifications globally
                        subscribeToPush(updatedUser._id);
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

    // NEW JOB DETECTION
    useEffect(() => {
        const checkNewJobs = async () => {
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                const { data } = await axios.get(`${API_URL}/api/student-jobs`);
                if (Array.isArray(data)) {
                    const twoDaysAgo = new Date();
                    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
                    const recentCount = data.filter(j => new Date(j.postedAt) > twoDaysAgo).length;
                    setNewJobsCount(recentCount);
                }
            } catch (err) { console.error(err); }
        };

        const fetchRanks = async () => {
            if (!user?._id) return;
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                const [weeklyRes, dailyRes] = await Promise.all([
                    axios.get(`${API_URL}/api/students/leaderboard?studentId=${user._id}&period=weekly`),
                    axios.get(`${API_URL}/api/students/leaderboard?studentId=${user._id}&period=daily`)
                ]);

                if (weeklyRes.data.success) {
                    const myInfo = weeklyRes.data.leaderboard.find(s => s.id === user._id);
                    if (myInfo) setWeeklyRank(myInfo);
                }
                if (dailyRes.data.success) {
                    const myInfo = dailyRes.data.leaderboard.find(s => s.id === user._id);
                    if (myInfo) setDailyRank(myInfo);
                }
            } catch (err) { console.error("Failed to fetch ranks:", err); }
        };

        const fetchWallet = async () => {
            if (!user?._id) return;
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                const { data } = await axios.get(`${API_URL}/api/rewards/wallet/${user._id}`);
                if (data.success) {
                    setWallet({
                        totalPoints: data.totalPoints,
                        totalCoins: data.totalCoins,
                        level: data.level
                    });
                }
            } catch (err) { console.error("Failed to fetch wallet:", err); }
        };

        checkNewJobs();
        fetchRanks();
        fetchWallet();

        // Real-time synchronization event listener
        const handleSync = () => {
            fetchRanks();
            fetchWallet();
        };
        window.addEventListener('finwise-activity-sync', handleSync);

        const interval = setInterval(() => {
            checkNewJobs();
            fetchRanks();
        }, 60000 * 5); // Check every 5 mins
        return () => {
            clearInterval(interval);
            window.removeEventListener('finwise-activity-sync', handleSync);
        };
    }, [user?._id]);

    const handleLogout = async () => {
        localStorage.removeItem('studentUser'); // Clear local session
        navigate('/login');
    };

    const allNavItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/', accessKey: 'dashboard', end: true },
        {
            icon: BookOpen,
            label: 'Learning',
            children: [
                { label: 'My Courses', path: '/courses', accessKey: 'myCourses' },
                { label: 'Study Materials', path: '/materials', accessKey: 'myCourses' },
                { label: 'Typing Practice', path: '/typing-practice', accessKey: 'typingPractice' }
            ]
        },
        {
            icon: Calendar,
            label: 'Attendance',
            children: [
                { label: 'My Attendance', path: '/my-attendance', accessKey: 'attendance' },
                { label: 'My QR', path: '/my-qr', accessKey: 'myQR' }
            ]
        },

        {
            icon: BotIcon,
            label: 'Interview Prep',
            children: [
                { label: 'My Interviews', path: '/my-interviews', accessKey: 'aiMockInterview' },
                { label: 'Mock Performance', path: '/mock-interview', accessKey: 'aiMockInterview' }
            ]
        },

        { icon: Briefcase, label: 'Jobs', path: '/jobs', accessKey: 'jobs' }, // Managed via Admin Feature Access
        { icon: CreditCard, label: 'Payments', path: '/payments', accessKey: 'payments' },
        { icon: Sparkles, label: 'Reward Store', path: '/reward-store', accessKey: 'dashboard' },
        { icon: User, label: 'Profile', path: '/profile', accessKey: 'profile' },
        { icon: Settings, label: 'Settings', path: '/settings', accessKey: 'settings' },
    ];

    // Filter items based on user access
    const navItems = allNavItems.map(item => {
        if (item.children) {
            return {
                ...item,
                children: item.children.filter(child => user?.access?.[child.accessKey])
            };
        }
        return item;
    }).filter(item => {
        if (!user || !user.access) return false;
        if (item.children) {
            return item.children.length > 0;
        }
        // Fallback for new features: if key is missing, default to true
        return user.access[item.accessKey] !== false;
    });

    const flatNavItems = allNavItems.flatMap(item => item.children ? item.children : [item]);

    const [collapsed, setCollapsed] = useState(false);
    const [openMenus, setOpenMenus] = useState({});

    const toggleMenu = (label) => {
        setOpenMenus(prev => ({ [label]: !prev[label] }));
    };

    const fetchMobileQR = async () => {
        if (!user?._id || mobileQRData) return;
        try {
            setMobileQRLoading(true);
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const res = await axios.get(`${API_URL}/api/qr/${user._id}`);
            setMobileQRData(res.data.qrImageURL);
        } catch (error) {
            console.error("Failed to fetch mobile QR:", error);
            // If not found, attempt generation
            if (error.response?.status === 404) {
                try {
                    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                    const genRes = await axios.post(`${API_URL}/api/qr/generate/${user._id}`);
                    if (genRes.data.success) {
                        setMobileQRData(genRes.data.qrImageURL);
                    }
                } catch (genErr) {
                    console.error("Failed to generate mobile QR:", genErr);
                }
            }
        } finally {
            setMobileQRLoading(false);
        }
    };

    const handleOpenMobileQR = () => {
        setIsMobileQROpen(true);
        fetchMobileQR();
    };

    // ... (existing hooks)

    return (
        <div className="h-screen w-full bg-gray-50 flex overflow-hidden">
            <SpotlightModal />
            <LiveSupport />
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <aside
                className={`fixed lg:static inset-y-0 left-0 z-50 bg-white/80 backdrop-blur-xl border-r border-slate-200/60 shadow-2xl shadow-indigo-500/5 lg:shadow-none transform transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                    } ${collapsed ? 'w-20' : 'w-72'}`}
            >
                {/* Logo Area */}
                <div className={`h-20 flex items-center ${collapsed ? 'justify-center px-3' : 'justify-between px-6'} border-b border-slate-100 relative shrink-0`}>
                    <div className="flex items-center gap-3">
                        <img
                            src={settings?.logoUrl || logoImg}
                            alt="Finwise Logo"
                            className="h-10 w-10 object-contain rounded-xl drop-shadow-sm shrink-0"
                        />
                        {!collapsed && (
                            <div className="transition-opacity duration-300 overflow-hidden">
                                <span className="block text-lg font-extrabold tracking-tight text-slate-800 leading-none bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600 whitespace-nowrap">
                                    {settings?.siteTitle || 'Finwise Career Solutions'}
                                </span>
                                <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-[0.2em] mt-0.5 block">Student Portal</span>
                            </div>
                        )}
                    </div>

                    {/* Desktop collapse toggle */}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white border border-slate-200 rounded-full items-center justify-center text-slate-400 hover:text-indigo-600 shadow-sm hover:shadow transition-colors z-50"
                    >
                        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                    </button>

                    {/* Mobile close */}
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden ml-auto p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-100 rounded-xl transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-5 px-3 space-y-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    {navItems.map((item) => (
                        item.children ? (
                            /* ---- Category / Dropdown group ---- */
                            <div
                                key={item.label}
                                className="space-y-1"
                            >
                                <button
                                    onClick={() => {
                                        if (collapsed) setCollapsed(false);
                                        else toggleMenu(item.label);
                                    }}
                                    title={collapsed ? item.label : ''}
                                    className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl transition-all duration-300 relative overflow-hidden group/catBtn ${openMenus[item.label]
                                        ? 'bg-indigo-50/50 shadow-sm ring-1 ring-indigo-100/30'
                                        : 'hover:bg-slate-50'
                                        }`}
                                >
                                    {/* Left accent bar when open */}
                                    {openMenus[item.label] && !collapsed && (
                                        <span className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-l-xl" />
                                    )}

                                    <div className={`flex items-center ${collapsed ? 'justify-center w-full' : 'gap-3'} relative z-10`}>
                                        <div className={`p-1.5 rounded-lg transition-all duration-300 ${openMenus[item.label]
                                            ? 'bg-indigo-100/80 text-indigo-600 shadow-inner'
                                            : 'bg-slate-100/50 text-slate-400 group-hover/catBtn:bg-white group-hover/catBtn:text-indigo-500 group-hover/catBtn:shadow-sm group-hover/catBtn:ring-1 group-hover/catBtn:ring-slate-200/50'
                                            }`}>
                                            <item.icon size={18} strokeWidth={openMenus[item.label] ? 2.5 : 2} className="transition-transform duration-300 group-hover/catBtn:scale-110" />
                                        </div>
                                        {!collapsed && (
                                            <span className={`text-[13px] font-bold tracking-wide transition-colors ${openMenus[item.label] ? 'text-indigo-700' : 'text-slate-600 group-hover/catBtn:text-slate-900'
                                                }`}>
                                                {item.label}
                                            </span>
                                        )}
                                    </div>

                                    {!collapsed && (
                                        <div className={`p-1 rounded-md transition-colors ${openMenus[item.label] ? 'bg-indigo-100 text-indigo-600' : 'bg-transparent text-slate-400 group-hover/catBtn:bg-slate-100'
                                            }`}>
                                            <ChevronDown size={14} className={`transition-transform duration-300 ${openMenus[item.label] ? 'rotate-180' : ''}`} />
                                        </div>
                                    )}
                                </button>

                                {/* Children with connecting line tree */}
                                {!collapsed && (
                                    <div className={`overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${openMenus[item.label] ? 'max-h-96 opacity-100 mt-1.5' : 'max-h-0 opacity-0'
                                        }`}>
                                        <div className="flex flex-col gap-0.5 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100 before:-z-10 pl-2 pr-1 pb-1">
                                            {item.children.map(child => (
                                                <NavLink
                                                    key={child.path}
                                                    to={child.path}
                                                    end={child.end}
                                                    onClick={() => setSidebarOpen(false)}
                                                    className={({ isActive }) =>
                                                        `group flex items-center justify-between pl-8 pr-4 py-2.5 rounded-xl transition-all duration-200 relative w-full ${isActive
                                                            ? 'bg-indigo-50/80 text-indigo-700 font-semibold shadow-sm ring-1 ring-indigo-500/10'
                                                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 font-medium'
                                                        }`
                                                    }
                                                >
                                                    {({ isActive }) => (
                                                        <>
                                                            {/* Horizontal connecting tick */}
                                                            <div className={`absolute left-[17px] w-3 h-[2px] rounded-r-full transition-colors ${isActive ? 'bg-indigo-500' : 'bg-transparent group-hover:bg-slate-300'
                                                                }`} />
                                                            <span className={`text-[13px] tracking-wide flex-1 relative z-10 transition-transform ${isActive ? 'translate-x-1' : 'group-hover:translate-x-1'
                                                                }`}>
                                                                {child.label}
                                                            </span>
                                                            {isActive && (
                                                                <div className="absolute inset-0 bg-gradient-to-r from-white/0 to-indigo-50/50 opacity-50 rounded-xl" />
                                                            )}
                                                        </>
                                                    )}
                                                </NavLink>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* ---- Single flat nav link ---- */
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.end}
                                onClick={() => setSidebarOpen(false)}
                                title={collapsed ? item.label : ''}
                                className={({ isActive }) =>
                                    `group flex items-center px-3.5 py-3 rounded-xl transition-all duration-300 relative overflow-hidden ${isActive
                                        ? 'active-nav bg-indigo-50 text-indigo-700 font-semibold shadow-sm ring-1 ring-indigo-100/50'
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 font-medium'
                                    }`
                                }
                            >
                                {/* Left glow bar — visible only when active (via .active-nav parent) */}
                                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0 h-8 bg-indigo-600 rounded-r-full shadow-[0_0_8px_rgba(79,70,229,0.5)] opacity-0 group-[.active-nav]:w-1 group-[.active-nav]:opacity-100 transition-all duration-300" />

                                <div className={`flex items-center ${collapsed ? 'justify-center w-full' : 'gap-3.5'} relative z-10 w-full`}>
                                    <div className="p-1.5 rounded-lg transition-all duration-300 bg-slate-100 text-slate-400 group-hover:bg-white group-hover:text-indigo-500 group-hover:shadow-sm group-[.active-nav]:bg-indigo-100 group-[.active-nav]:text-indigo-600 group-[.active-nav]:shadow-inner relative">
                                        <item.icon size={18} className="transition-transform duration-300 group-hover:scale-110" />
                                        {item.label === 'Jobs' && newJobsCount > 0 && (
                                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse shadow-sm shadow-red-200"></span>
                                        )}
                                    </div>
                                    {!collapsed && (
                                        <div className="flex-1 flex items-center justify-between">
                                            <span className="text-sm tracking-wide">{item.label}</span>
                                            {item.label === 'Jobs' && newJobsCount > 0 && (
                                                <span className="min-w-[18px] h-[18px] flex items-center justify-center text-[10px] bg-red-500 text-white font-black px-1 rounded-full animate-pulse shadow-sm shadow-red-100">
                                                    {newJobsCount}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Subtle gradient overlay when active */}
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/50 to-transparent opacity-0 group-[.active-nav]:opacity-50 transition-opacity duration-300 rounded-xl pointer-events-none" />
                            </NavLink>
                        )
                    ))}
                </nav>

                {/* Sidebar Footer — REMOVED AS REQUESTED */}
            </aside>

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col min-w-0 h-full relative">

                {/* Navbar (Top Header) */}
                <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-30">


                    {/* Left Side: Mobile Menu Toggle & Title/Date */}
                    <div className="flex items-center gap-6">
                        <button
                            className="lg:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu size={24} />
                        </button>
                        <div className="flex flex-col">
                            <h2 className="hidden md:block text-xl font-semibold text-gray-800 leading-tight">
                                {flatNavItems.find(i => i.path === location.pathname)?.label || 'Dashboard'}
                            </h2>
                            <div className="hidden md:flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] mt-0.5">
                                <Calendar size={10} className="text-indigo-400" />
                                <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Search & Ranking & Profile */}
                    <div className="flex items-center gap-3 md:gap-8">
                        {/* Ranking Section - Fitted Horizontal Design */}
                        <div className="hidden lg:flex items-center gap-4">
                            {/* Today Ranking */}
                            <div className="flex flex-col items-center">

                                <div className="flex items-center gap-3 bg-white border border-gray-100 pl-3 pr-4 py-2 rounded-xl shadow-sm hover:shadow-md transition-all cursor-default group relative overflow-hidden">
                                    <div className="flex flex-col items-start">
                                        <span className="text-[9px] font-bold text-gray-400 uppercase leading-none mb-1">Today</span>
                                        <span className="text-[13px] font-black text-gray-900 leading-none">#{dailyRank?.rank || '-'}</span>
                                    </div>
                                    <div className="h-6 w-px bg-gray-100"></div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[12px] font-black text-indigo-600 leading-none">{dailyRank?.points || 0}</span>
                                        <span className="text-[9px] font-bold text-gray-400 uppercase leading-none">Pts</span>
                                    </div>
                                    <Trophy size={14} className="text-yellow-400 opacity-20 group-hover:opacity-100 transition-opacity ml-1" />
                                </div>
                            </div>
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
                                    <div className="fixed left-1/2 -translate-x-1/2 top-16 w-[calc(100vw-32px)] sm:w-80 md:absolute md:left-auto md:translate-x-0 md:right-0 md:top-full md:mt-2 md:w-80 bg-white rounded-xl shadow-xl border border-gray-100 p-2 z-20 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
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

                        {/* Wallet / Coins Summary (Sticky Navbar View) */}
                        <div
                            onClick={() => navigate('/reward-store')}
                            className="flex items-center gap-1.5 md:gap-2 bg-amber-50 border border-amber-100 px-2 md:px-3 py-1 md:py-1.5 rounded-full cursor-pointer hover:bg-amber-100 transition-colors group"
                        >
                            <div className="bg-amber-400 p-0.5 md:p-1 rounded-full text-white group-hover:scale-110 transition-transform">
                                <Coins size={10} className="md:w-3 md:h-3" strokeWidth={3} />
                            </div>
                            <span className="text-[11px] md:text-xs font-black text-amber-700">{wallet.totalCoins}</span>
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
                                            <div className="bg-emerald-50 rounded-xl p-3 text-center border border-emerald-100">
                                                <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Points</p>
                                                <p className="text-lg font-black text-emerald-700">{wallet.totalPoints || user?.points || 0}</p>
                                            </div>
                                            <div className="bg-amber-50 rounded-xl p-3 text-center border border-amber-100">
                                                <p className="text-[10px] text-amber-600 font-bold uppercase tracking-widest">Coins</p>
                                                <p className="text-lg font-black text-amber-700">{wallet.totalCoins}</p>
                                            </div>
                                            <div className="bg-indigo-50 rounded-xl p-3 text-center border border-indigo-100">
                                                <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest">Type Level</p>
                                                <p className="text-lg font-black text-indigo-700">{user?.typingLevel || 1}</p>
                                            </div>
                                            <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Attendance</p>
                                                <p className="text-lg font-bold text-gray-900">{attendanceCount} Days</p>
                                            </div>
                                            <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Tasks Done</p>
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

            {/* Mobile QR Floating Action Button */}
            <button
                onClick={handleOpenMobileQR}
                className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center justify-center p-4 bg-indigo-600 text-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] shadow-indigo-500/50 hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all z-40 border-4 border-white"
            >
                <QrCode size={28} />
            </button>

            {/* Mobile QR Modal */}
            {isMobileQROpen && (
                <div className="fixed inset-0 z-50 flex flex-col justify-end">
                    {/* Dark/Blur Backdrop */}
                    <div
                        className="absolute inset-0 bg-gray-900/60 backdrop-blur-md transition-opacity"
                        onClick={() => setIsMobileQROpen(false)}
                    ></div>

                    {/* Bottom Sheet Container */}
                    <div className="relative w-full bg-white rounded-t-[2.5rem] pt-44 pb-8 px-6 shadow-[0_-10px_40px_rgba(0,0,0,0.15)] animate-in slide-in-from-bottom duration-300">

                        {/* The QR Code container floating above the edge */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                            {mobileQRLoading ? (
                                <div className="w-56 h-56 md:w-64 md:h-64 bg-white rounded-3xl shadow-2xl border-4 border-indigo-100 flex flex-col items-center justify-center">
                                    <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                                    <p className="text-sm text-gray-400 font-medium">Scanning...</p>
                                </div>
                            ) : mobileQRData ? (
                                <div className="bg-white p-0 relative group">
                                    <img
                                        src={mobileQRData}
                                        alt="My QR Code"
                                        className="w-64 h-64 sm:w-72 sm:h-72 object-contain rounded-xl"
                                    />
                                </div>
                            ) : (
                                <div className="w-64 h-64 sm:w-72 sm:h-72 bg-white rounded-3xl shadow-2xl border-4 border-rose-50 flex flex-col items-center justify-center p-4 text-center text-rose-500">
                                    <AlertCircle size={40} className="mb-2 opacity-80" />
                                    <p className="font-bold">QR Not Found</p>
                                </div>
                            )}
                        </div>

                        {/* Content inside the white sheet */}
                        <div className="text-center mt-[-20px]">
                            <h3 className="text-gray-900 text-2xl font-bold tracking-tight">My Attendance</h3>
                            <p className="text-gray-500 text-sm mt-3 mb-8 max-w-[280px] mx-auto leading-relaxed">
                                Show this code at the scanner to mark your attendance for today.
                            </p>

                            {/* Close Button at the bottom */}
                            <button
                                onClick={() => setIsMobileQROpen(false)}
                                className="mx-auto flex flex-col gap-1 items-center justify-center w-12 h-12 bg-gray-100 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-full transition-all active:scale-95"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Layout;
