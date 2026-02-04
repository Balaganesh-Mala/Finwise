import React, { useEffect, useState, useRef } from 'react';
import { BookOpen, Award, Clock, TrendingUp, Calendar, CheckCircle, UserCheck, Trophy, Medal, Crown, Share2, Linkedin, MessageCircle, Star, X, Copy, Download, Check, Sparkles, Zap, Flame, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import axios from 'axios';
import toast from 'react-hot-toast';
import html2canvas from 'html2canvas';

const RankCardModal = ({ rank, hours, user, weeklyActivity, settings, onClose }) => {
    const exportRef = useRef(null); // Ref for the hidden export card
    const [isSharing, setIsSharing] = useState(false);
    const siteTitle = settings?.siteTitle || "JOBREADY SKILLS";
    const logoUrl = settings?.logoUrl;

    const shareText = `I just achieved Rank #${rank} on the ${siteTitle} Leaderboard! 🏆\nI learned for ${hours} hours this week. 🚀\nCheck my progress! \n#Learning #Achievement #JobReady`;

    // Calculate daily consistency
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const safeWeeklyActivity = Array.isArray(weeklyActivity) ? weeklyActivity : [];
    const activeDays = safeWeeklyActivity.filter(d => d.hours > 0).length;

    // Smart Share Function targeting the Hidden Export Card
    const handleSmartShare = async (platform) => {
        if (!exportRef.current) return;
        setIsSharing(true);
        const toastId = toast.loading("Creating High-Quality Image...");

        try {
            // Wait a moment for images to be ready (if needed)
            await new Promise(resolve => setTimeout(resolve, 500));

            const canvas = await html2canvas(exportRef.current, {
                useCORS: true,
                backgroundColor: null,
                scale: 2, // Retina quality
                logging: false,
                onclone: (clonedDoc) => {
                    // Start CSS animations or force visibility if needed in clone
                    const exportNode = clonedDoc.getElementById('export-card-content');
                    if (exportNode) {
                        exportNode.style.display = 'flex'; // Ensure it's visible in the clone
                    }
                }
            });

            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
            const file = new File([blob], 'rank-card.png', { type: 'image/png' });

            // Mobile Native Share
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    title: 'My Rank Card',
                    text: shareText,
                    files: [file]
                });
                toast.success("Shared successfully!", { id: toastId });
            }
            // Desktop Fallback
            else {
                const link = document.createElement('a');
                link.href = canvas.toDataURL('image/png');
                link.download = `JobReady-Rank-${rank}.png`;
                link.click();

                // Open Platform if requested
                setTimeout(() => {
                    if (platform === 'whatsapp') {
                        window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
                    } else if (platform === 'linkedin') {
                        window.open(`https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(shareText)}`, '_blank');
                    }
                }, 1000);

                toast.success("Image Downloaded!", { id: toastId });
            }
        } catch (err) {
            console.error("Sharing failed:", err);
            toast.error("Share failed. Try again.", { id: toastId });
        } finally {
            setIsSharing(false);
            toast.dismiss(toastId);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in zoom-in duration-300">

            {/* --- HIDDEN EXPORT CARD (Optimized for HTML2Canvas) --- */}
            {/* Positioned off-screen but rendered so it captures correctly */}
            <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
                <div
                    ref={exportRef}
                    id="export-card-content"
                    className="w-[1080px] h-[1350px] bg-slate-900 flex flex-col items-center justify-between p-16 relative overflow-hidden"
                >
                    {/* Background Graphics */}
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                    <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-indigo-900/50 to-transparent"></div>
                    <div className="absolute bottom-[-200px] right-[-200px] w-[800px] h-[800px] bg-indigo-600/20 rounded-full blur-[150px]"></div>

                    {/* Logo Header */}
                    <div className="w-full flex justify-center z-10 pt-10">
                        {logoUrl ? (
                            <img src={logoUrl} alt="Logo" className="h-24 w-auto object-contain brightness-0 invert" crossOrigin="anonymous" />
                        ) : (
                            <h2 className="text-white text-4xl font-bold tracking-[0.3em] uppercase">{siteTitle}</h2>
                        )}
                    </div>

                    {/* Rank Hero */}
                    <div className="flex flex-col items-center z-10 mt-10">
                        <div className="relative">
                            <h1 className="text-[18rem] font-black leading-none text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-yellow-500 to-yellow-700 drop-shadow-2xl font-sans">
                                #{rank}
                            </h1>
                            <Crown size={180} className="absolute -top-20 -right-20 text-yellow-500 fill-yellow-500/20" strokeWidth={1.5} />
                        </div>
                        <p className="text-yellow-500 text-3xl font-bold tracking-[0.5em] uppercase mt-4">Current Rank</p>
                    </div>

                    {/* Profile & Stats */}
                    <div className="w-full bg-slate-800/80 rounded-[3rem] p-10 flex flex-col gap-10 border border-slate-700 z-10 mt-10">
                        <div className="flex items-center gap-8">
                            <div className="h-32 w-32 rounded-full border-4 border-slate-600 overflow-hidden bg-slate-700">
                                {user?.profilePicture ? (
                                    <img src={user.profilePicture} className="w-full h-full object-cover" crossOrigin="anonymous" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-white text-5xl font-bold">{user?.name?.charAt(0)}</div>
                                )}
                            </div>
                            <div>
                                <h2 className="text-white text-5xl font-bold">{user?.name}</h2>
                                <div className="flex items-center gap-3 mt-3">
                                    <span className={`w-4 h-4 rounded-full ${activeDays > 0 ? 'bg-green-500' : 'bg-slate-600'}`}></span>
                                    <span className="text-slate-400 text-2xl font-bold uppercase tracking-wider">{activeDays > 2 ? 'On Fire 🔥' : 'Active Learner'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="bg-slate-900/50 p-8 rounded-3xl border border-slate-700 flex flex-col items-center">
                                <Clock className="text-indigo-400 mb-4" size={48} />
                                <span className="text-6xl font-bold text-white mb-2">{hours}h</span>
                                <span className="text-slate-500 text-xl font-bold uppercase tracking-wider">Time Spent</span>
                            </div>
                            <div className="bg-slate-900/50 p-8 rounded-3xl border border-slate-700 flex flex-col items-center">
                                <Trophy className="text-yellow-500 mb-4" size={48} />
                                <span className="text-6xl font-bold text-white mb-2">{Math.floor(hours * 100)}</span>
                                <span className="text-slate-500 text-xl font-bold uppercase tracking-wider">Top Points</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="z-10 pb-10 flex flex-col items-center">
                        <div className="flex gap-4 mb-4">
                            {days.map((day, idx) => {
                                const isActive = safeWeeklyActivity[idx] && safeWeeklyActivity[idx].hours > 0;
                                return (
                                    <div key={day} className={`w-8 h-20 rounded-full ${isActive ? 'bg-green-500' : 'bg-slate-800'}`}></div>
                                )
                            })}
                        </div>
                        <p className="text-slate-500 text-xl font-medium tracking-wide">Keep Learning, Keep Growing.</p>
                    </div>

                </div>
            </div>


            {/* --- VISIBLE UI (Interactive Card) --- */}
            {/* Glow Effect behind the card */}
            <div className="absolute w-full max-w-sm h-[500px] bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none"></div>

            <div className="w-full max-w-sm bg-slate-900 rounded-3xl shadow-2xl overflow-hidden relative border border-slate-700/50 ring-1 ring-white/10">

                {/* Header Pattern */}
                <div className="absolute top-0 w-full h-32 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>

                {/* Close Button */}
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white hover:bg-white/10 p-2 rounded-full transition-all z-20">
                    <X size={20} />
                </button>

                {/* Company Branding */}
                <div className="absolute top-6 left-6 z-20">
                    {logoUrl ? (
                        <img src={logoUrl} alt="Logo" className="h-8 w-auto object-contain brightness-0 invert opacity-80" crossOrigin="anonymous" />
                    ) : (
                        <h2 className="text-white/80 font-bold text-[10px] tracking-[0.2em] uppercase">{siteTitle}</h2>
                    )}
                </div>

                {/* Main Content */}
                <div className="relative z-10 pt-20 pb-8 px-6 flex flex-col items-center">

                    {/* Rank Hero */}
                    <div className="relative mb-6">
                        <div className="absolute inset-0 bg-yellow-500 blur-3xl opacity-20 rounded-full"></div>
                        <div className="relative">
                            <h1 className="text-[6rem] font-black leading-none text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-yellow-500 to-yellow-700 drop-shadow-2xl">
                                #{rank}
                            </h1>
                            <div className="absolute -top-6 -right-8 animate-bounce">
                                <Crown size={40} className="text-yellow-400 fill-yellow-400/20 drop-shadow-lg" strokeWidth={1.5} />
                            </div>
                        </div>
                        <p className="text-center text-yellow-500/80 font-bold tracking-[0.3em] text-xs uppercase mt-2">Current Rank</p>
                    </div>

                    {/* User Profile Strip */}
                    <div className="w-full bg-slate-800/50 rounded-2xl p-2 pr-4 flex items-center gap-3 border border-slate-700/50 backdrop-blur-md mb-6">
                        <div className="h-10 w-10 rounded-xl bg-slate-700 overflow-hidden shrink-0">
                            {user?.profilePicture ? (
                                <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" crossOrigin="anonymous" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-lg">
                                    {user?.name?.charAt(0) || 'U'}
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-white font-bold text-sm truncate">{user?.name}</h3>
                            <div className="flex items-center gap-1.5">
                                <span className={`w-2 h-2 rounded-full ${activeDays > 0 ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-slate-600'}`}></span>
                                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">{activeDays > 2 ? 'On Fire 🔥' : 'Learning'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 w-full gap-3 mb-6">
                        <div className="bg-slate-800/30 p-4 rounded-2xl border border-slate-700/30 flex flex-col items-center justify-center relative overflow-hidden group">
                            <div className="absolute inset-0 bg-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <Clock className="text-indigo-400 mb-2" size={20} />
                            <span className="text-2xl font-bold text-white">{hours}h</span>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Time Spent</span>
                        </div>
                        <div className="bg-slate-800/30 p-4 rounded-2xl border border-slate-700/30 flex flex-col items-center justify-center relative overflow-hidden group">
                            <div className="absolute inset-0 bg-yellow-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <Trophy className="text-yellow-500 mb-2" size={20} />
                            <span className="text-2xl font-bold text-white">{Math.floor(hours * 100)}</span>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">XP Points</span>
                        </div>
                    </div>

                    {/* Streak Dots */}
                    <div className="w-full flex justify-between items-center px-2 mb-6 opacity-70">
                        {days.map((day, idx) => {
                            const isActive = safeWeeklyActivity[idx] && safeWeeklyActivity[idx].hours > 0;
                            return (
                                <div key={day} className="flex flex-col items-center gap-1.5">
                                    <div className={`w-1.5 h-6 rounded-full transition-all duration-300 ${isActive ? 'bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]' : 'bg-slate-700'}`}></div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Action Buttons */}
                    <div className="w-full grid grid-cols-2 gap-3">
                        <button
                            onClick={() => handleSmartShare('whatsapp')}
                            disabled={isSharing}
                            className="flex items-center justify-center gap-2 py-3.5 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-green-900/20 active:translate-y-0.5 disabled:opacity-50"
                        >
                            {isSharing ? <Loader2 size={18} className="animate-spin" /> : <MessageCircle size={18} />}
                            WhatsApp
                        </button>
                        <button
                            onClick={() => handleSmartShare('linkedin')}
                            disabled={isSharing}
                            className="flex items-center justify-center gap-2 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-900/20 active:translate-y-0.5 disabled:opacity-50"
                        >
                            {isSharing ? <Loader2 size={18} className="animate-spin" /> : <Linkedin size={18} />}
                            LinkedIn
                        </button>
                    </div>

                    {/* Copy Link Text */}
                    <button onClick={() => {
                        navigator.clipboard.writeText(shareText);
                        toast.success("Text copied!");
                    }} className="mt-4 flex items-center gap-2 text-slate-500 hover:text-white text-xs font-semibold transition-colors">
                        <Copy size={12} /> Copy Text Only
                    </button>

                </div>
            </div>
        </div>
    );
};

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({
        enrolledCourses: 0,
        hoursLearned: 0,
        attendance: 0,
        batchProgress: 0,
        certificates: 0
    });
    const [recentActivity, setRecentActivity] = useState([]);
    const [weeklyActivity, setWeeklyActivity] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]); // Leaderboard State
    const [loading, setLoading] = useState(true);
    const [showRankCard, setShowRankCard] = useState(false);
    const [settings, setSettings] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const storedUser = localStorage.getItem('studentUser');
                if (storedUser) {
                    const parsedUser = JSON.parse(storedUser);
                    setUser(parsedUser);

                    if (parsedUser._id) {
                        const results = await Promise.allSettled([
                            axios.get(`${import.meta.env.VITE_API_URL}/api/students/dashboard/${parsedUser._id}`),
                            axios.get(`${import.meta.env.VITE_API_URL}/api/students/leaderboard`),
                            axios.get(`${import.meta.env.VITE_API_URL}/api/settings`)
                        ]);

                        const dashboardRes = results[0].status === 'fulfilled' ? results[0].value : null;
                        const leaderboardRes = results[1].status === 'fulfilled' ? results[1].value : null;
                        const settingsRes = results[2].status === 'fulfilled' ? results[2].value : null;

                        if (dashboardRes && dashboardRes.data.success) {
                            setStats(dashboardRes.data.stats);
                            setRecentActivity(dashboardRes.data.recentActivity);
                            setWeeklyActivity(dashboardRes.data.weeklyActivity);
                        } else {
                            console.error("Dashboard fetch failed:", results[0].reason);
                        }

                        if (settingsRes) {
                            setSettings(settingsRes.data);
                        }

                        if (leaderboardRes && leaderboardRes.data.success) {
                            setLeaderboard(leaderboardRes.data.leaderboard);
                            // Check Rank and Auto-Show Card (Once Per Day)
                            const myRankIndex = leaderboardRes.data.leaderboard.findIndex(s => s.id === parsedUser._id);
                            if (myRankIndex !== -1 && myRankIndex < 3) {
                                const todayStr = new Date().toDateString();
                                const lastShown = localStorage.getItem(`rankCardLastShown_${parsedUser._id}`);

                                if (lastShown !== todayStr) {
                                    setShowRankCard(true);
                                    localStorage.setItem(`rankCardLastShown_${parsedUser._id}`, todayStr);
                                }
                            }
                        } else {
                            console.error("Leaderboard fetch failed:", results[1].reason);
                        }
                    }
                } // Close if (storedUser)
            } catch (err) {
                console.error("Error loading dashboard:", err);
                toast.error("Failed to load dashboard data");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // Mock Data for Charts (Keep until endpoint provides chart data)
    const progressData = [
        { name: 'Completed', value: stats.batchProgress, color: '#10B981' }, // Green
        { name: 'Remaining', value: 100 - stats.batchProgress, color: '#E5E7EB' }, // Gray
    ];

    const statCards = [
        { label: 'Enrolled Courses', value: stats.enrolledCourses, icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50', trend: 'Active' },
        { label: 'Classes Attended', value: stats.attendance, icon: UserCheck, color: 'text-green-600', bg: 'bg-green-50', trend: 'Keep it up!' },
        { label: 'Hours Learned', value: `${stats.hoursLearned}h`, icon: Clock, color: 'text-purple-600', bg: 'bg-purple-50', trend: 'Video Time' },
        { label: 'Batch Progress', value: `${stats.batchProgress}%`, icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50', trend: 'On Track' },
    ];

    // Helper to find user rank safely
    const getUserRank = () => {
        if (!user || !leaderboard || leaderboard.length === 0) return null;
        const index = leaderboard.findIndex(s => s.id === user._id);
        if (index !== -1 && index < 3) {
            return { rank: index + 1, hours: leaderboard[index].hours };
        }
        return null;
    };

    const userRankInfo = getUserRank();

    return (
        <div>
            {/* Rank Card Modal */}
            {showRankCard && userRankInfo && (
                <RankCardModal
                    rank={userRankInfo.rank}
                    hours={userRankInfo.hours}
                    user={user}
                    weeklyActivity={weeklyActivity}
                    settings={settings}
                    onClose={() => setShowRankCard(false)}
                />
            )}
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        Welcome back, {user?.name || 'Student'}! 👋
                    </h1>
                    <p className="text-gray-500 mt-1">Here is an overview of your learning progress.</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 bg-white px-4 py-2 rounded-lg border border-gray-200">
                    <Calendar size={16} />
                    <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statCards.map((stat, index) => (
                    <div key={index} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
                                <stat.icon size={24} />
                            </div>
                            <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">{stat.trend}</span>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium mb-1">{stat.label}</p>
                            <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">

                {/* Activity Chart (Restored) */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-800 mb-6">Weekly Learning Activity</h2>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                            <BarChart data={weeklyActivity.length > 0 ? weeklyActivity : []}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                                <Tooltip
                                    cursor={{ fill: '#F9FAFB' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Bar dataKey="hours" fill="#6366F1" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Progress Chart */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-800 mb-6">Batch Progress</h2>
                    <div style={{ width: '100%', height: 300, position: 'relative' }}>
                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                            <PieChart>
                                <Pie
                                    data={progressData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {progressData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Center Text */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-3xl font-bold text-gray-900">{stats.batchProgress}%</span>
                            <span className="text-xs text-gray-400 font-medium">Completed</span>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-gray-800">Recent Completed Topics</h2>
                    </div>

                    <div className="space-y-4">
                        {recentActivity.length > 0 ? (
                            recentActivity.map((activity) => (
                                <div key={activity.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold shrink-0">
                                        <CheckCircle size={18} />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-medium text-gray-900 text-sm">{activity.topic}</h4>
                                        <p className="text-xs text-gray-500 mt-0.5">{activity.course}</p>
                                    </div>
                                    <span className="text-xs text-gray-400">
                                        {new Date(activity.date).toLocaleDateString()}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-center py-8">No recent activity found. Start learning!</p>
                        )}
                    </div>
                </div>

                {/* Leaderboard Widget */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col h-full bg-gradient-to-b from-white to-gray-50">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <Trophy className="text-yellow-500 fill-yellow-100" size={20} /> Top Learners
                        </h2>
                        {userRankInfo && (
                            <button
                                onClick={() => setShowRankCard(true)}
                                className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded font-bold hover:bg-indigo-200 transition-colors"
                            >
                                View My Rank
                            </button>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto pr-1 space-y-3 min-h-[200px]">
                        {leaderboard.length > 0 ? (
                            leaderboard.map((student, idx) => (
                                <div
                                    key={student.id}
                                    className={`flex items-center justify-between p-3 rounded-xl transition-all ${user && user._id === student.id ? 'bg-indigo-50 border border-indigo-100 shadow-sm' : 'hover:bg-gray-100 border border-transparent'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`
                                            w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 shadow-sm
                                            ${idx === 0 ? 'bg-yellow-100 text-yellow-700 ring-2 ring-yellow-200' :
                                                idx === 1 ? 'bg-gray-100 text-gray-600 ring-2 ring-gray-200' :
                                                    idx === 2 ? 'bg-orange-100 text-orange-700 ring-2 ring-orange-200' :
                                                        'bg-white border border-gray-200 text-gray-500'}
                                        `}>
                                            {idx === 0 ? <Crown size={14} /> : idx + 1}
                                        </div>
                                        <div>
                                            <p className={`text-sm font-semibold line-clamp-1 ${user && user._id === student.id ? 'text-indigo-700' : 'text-gray-800'}`}>
                                                {student.name}
                                            </p>
                                            {user && user._id === student.id && (
                                                <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wide">You</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Clock size={12} className="text-gray-400" />
                                        <span className="text-sm font-bold text-gray-700">{student.hours}h</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 text-gray-400">
                                <Award size={32} className="mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No rankings yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>

    );
};

export default Dashboard;
