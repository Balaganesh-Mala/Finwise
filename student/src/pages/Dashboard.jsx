import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Award, Clock, TrendingUp, Calendar, CheckCircle, UserCheck, Trophy, Medal, Crown, Share2, Linkedin, MessageCircle, Star, X, Copy, Download, Check, Sparkles, Zap, Flame, Loader2, ArrowLeft, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import axios from 'axios';
import toast from 'react-hot-toast';
import html2canvas from 'html2canvas';

const Confetti = () => {
    const particles = Array.from({ length: 80 });
    const colors = ['#f43f5e', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#ffffff', '#fbbf24'];

    return (
        <div className="fixed inset-0 pointer-events-none z-[10] overflow-hidden">
            {particles.map((_, i) => {
                const angle = (Math.random() * 360) * (Math.PI / 180);
                const velocity = 300 + Math.random() * 600;
                const xDist = Math.cos(angle) * velocity;
                const yDist = Math.sin(angle) * velocity;

                return (
                    <motion.div
                        key={i}
                        initial={{
                            x: "50vw",
                            y: "50vh",
                            scale: 0,
                            rotate: 0,
                            opacity: 1
                        }}
                        animate={{
                            x: `calc(50vw + ${xDist}px)`,
                            y: `calc(50vh + ${yDist}px)`,
                            scale: [0, 1, 0.8, 0],
                            rotate: Math.random() * 720,
                            opacity: [0, 1, 1, 0]
                        }}
                        transition={{
                            duration: 3 + Math.random() * 2,
                            ease: [0.1, 0.5, 0.3, 1], // Decelerating burst
                            delay: Math.random() * 0.2
                        }}
                        className="absolute w-1.5 h-3 rounded-[1px]"
                        style={{
                            backgroundColor: colors[Math.floor(Math.random() * colors.length)],
                            boxShadow: '0 0 10px rgba(255, 255, 255, 0.3)'
                        }}
                    />
                );
            })}
        </div>
    );
};

const RankCardModal = ({ rank, hours, user, stats, activitySummary, weeklyActivity, settings, onClose }) => {
    const exportRef = useRef(null); // Ref for the hidden export card
    const [isSharing, setIsSharing] = useState(false);
    const siteTitle = settings?.siteTitle || "Finwise";
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
            <Confetti />

            {/* --- HIDDEN EXPORT CARD (Optimized for HTML2Canvas) --- */}
            {/* Positioned off-screen but rendered so it captures correctly */}
            <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
                <div
                    ref={exportRef}
                    id="export-card-content"
                    className="w-[1080px] h-[1350px] bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#020617] flex flex-col items-center justify-between p-16 relative overflow-hidden"
                >
                    {/* Background Graphics */}
                    <div className="absolute inset-0 bg-gradient-to-b from-[#1e40af] via-[#1d4ed8] to-[#1e40af]"></div>
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none"></div>
                    <div className="absolute top-0 right-0 w-[1200px] h-[1200px] bg-white/10 rounded-full blur-[150px] -mr-60 -mt-60 pointer-events-none"></div>
                    <div className="absolute bottom-[-200px] left-[-200px] w-[800px] h-[800px] bg-indigo-400/10 rounded-full blur-[150px]"></div>

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
                    <div className="z-10 pb-0 flex flex-col items-center">
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
            <div className="absolute w-full max-w-md h-[500px] bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none"></div>

            <div className="w-full max-w-md h-[650px] bg-gradient-to-b from-[#1e40af] via-[#1d4ed8] to-[#1e40af] rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden relative border border-white/20 ring-1 ring-white/10 flex flex-col">
                {/* Subtle Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0f_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0f_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

                {/* Cinematic Blobs */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-[100px] -mr-40 -mt-40 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-60 h-60 bg-indigo-400/10 rounded-full blur-[80px] -ml-20 -mb-20 pointer-events-none" />

                {/* Header Pattern */}
                <div className="absolute top-0 w-full h-24 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 pointer-events-none"></div>

                {/* Top Navigation */}
                <div className="absolute top-0 w-full p-4 flex justify-between items-center z-40 bg-[#1e40af]/80 backdrop-blur-md border-b border-white/10">
                    <button onClick={onClose} className="text-white hover:bg-white/10 p-2 rounded-full transition-colors">
                        <ArrowLeft size={18} />
                    </button>
                    <div className="flex items-center gap-3">
                        <h2 className="text-white font-black text-[10px] tracking-[0.3em] uppercase opacity-60">Finwise</h2>
                        <div className="h-3 w-px bg-white/20"></div>
                        <h2 className="text-white font-black text-[10px] tracking-[0.3em] uppercase opacity-90">Career Solutions</h2>
                    </div>
                    <button onClick={onClose} className="text-white hover:bg-white/10 p-2 rounded-full transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="relative z-10 w-full h-full overflow-y-auto px-4 pt-20 pb-0 flex flex-col gap-5">

                    {/* Profile Section */}
                    <div className="flex items-center gap-4 bg-[#1a237e]/60 p-5 rounded-[2.5rem] border border-white/10 backdrop-blur-xl shadow-xl">
                        <div className="relative shrink-0">
                            <div className="h-14 w-14 rounded-full border-[3px] border-yellow-400 p-0.5 overflow-hidden bg-slate-800 shadow-lg">
                                {user?.profilePicture ? (
                                    <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" crossOrigin="anonymous" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-white text-xl font-black bg-indigo-600">
                                        {user?.name?.charAt(0)}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-white font-black text-xl tracking-tight leading-none mb-2 truncate">{user?.name}</h3>
                            <div className="bg-[#0d47a1] px-3 py-1.5 rounded-full inline-flex items-center gap-2 shadow-inner">
                                <div className="p-1 bg-purple-500 rounded-full shadow-sm">
                                    <Star size={8} className="text-white fill-white" />
                                </div>
                                <span className="text-white text-[10px] font-black tracking-tight">{Math.floor(hours * 2345).toLocaleString()} Points</span>
                            </div>
                        </div>
                    </div>

                    {/* Hero Card: Daily Goal */}
                    <div className="bg-white rounded-[2.5rem] p-6 shadow-2xl relative overflow-hidden flex flex-col items-center border border-indigo-50/50">
                        <div className="w-full flex items-center justify-between gap-4 mb-6">
                            {/* Target Illustration */}
                            <div className="relative h-24 w-24 shrink-0">
                                <div className="absolute inset-0 bg-red-50 rounded-full scale-110"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center shadow-inner">
                                        <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center border-[3px] border-white shadow-md">
                                            <div className="w-4 h-4 bg-red-900 rounded-full"></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute top-0 right-0 text-yellow-500">
                                    <Sparkles size={16} fill="currentColor" />
                                </div>
                            </div>

                            {/* Achievement Text */}
                            <div className="flex-1 text-center py-2">
                                <h1 className="text-[#1a237e] text-2xl font-black leading-none mb-3">Daily Goal</h1>
                                <div className="bg-purple-600 text-white px-5 py-2.5 rounded-2xl font-black text-base shadow-[0_8px_20px_rgba(147,51,234,0.3)] inline-block transform hover:scale-105 transition-transform cursor-default">
                                    Achieved
                                </div>
                            </div>

                            {/* Points Circle */}
                            <div className="relative h-20 w-20 shrink-0">
                                <svg className="w-full h-full -rotate-90">
                                    <circle cx="40" cy="40" r="35" stroke="#f3e5f5" strokeWidth="6" fill="transparent" />
                                    <motion.circle
                                        cx="40" cy="40" r="35" stroke="#7e57c2" strokeWidth="6" fill="transparent"
                                        initial={{ strokeDasharray: "220", strokeDashoffset: "220" }}
                                        animate={{ strokeDashoffset: 220 - (220 * 0.25) }}
                                        transition={{ duration: 1.5, delay: 0.2 }}
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <Star size={12} className="text-purple-600 mb-0.5 fill-purple-600" />
                                    <span className="text-[#1a237e] text-[9px] font-black leading-none">1210/100</span>
                                </div>
                            </div>
                        </div>

                        {/* Daily Stats Grid */}
                        <div className="w-full grid grid-cols-2 gap-4 border-t border-slate-100 pt-5">
                            <div className="flex items-center gap-3 justify-center bg-slate-50/50 py-3 rounded-2xl transition-colors hover:bg-slate-100/50">
                                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl shadow-sm">
                                    <Trophy size={18} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <p className="text-[#1a237e] font-black text-xl leading-none mb-1">#{rank}</p>
                                    <p className="text-slate-400 text-[8px] font-black uppercase tracking-widest leading-none">Daily Rank</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 justify-center bg-slate-50/50 py-3 rounded-2xl transition-colors hover:bg-slate-100/50">
                                <div className="p-2 bg-yellow-100 text-yellow-600 rounded-xl shadow-sm">
                                    <Zap size={18} fill="currentColor" strokeWidth={2.5} />
                                </div>
                                <div>
                                    <p className="text-[#1a237e] font-black text-xl leading-none mb-1">50</p>
                                    <p className="text-slate-400 text-[8px] font-black uppercase tracking-widest leading-none">Coins Earned</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sub-Cards Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white rounded-[2rem] p-5 shadow-xl flex flex-col h-full border border-slate-50">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-[#1a237e] font-black text-[10px] uppercase tracking-tight">Course Progress</h4>
                                <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg shadow-sm">
                                    <BookOpen size={10} strokeWidth={3} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 mb-4 flex-1">
                                <div>
                                    <p className="text-lg font-black text-[#1a237e] leading-none mb-1">{stats?.batchProgress || 0}%</p>
                                    <p className="text-slate-400 text-[7px] font-black uppercase tracking-widest leading-none">Overall Progress</p>
                                </div>
                                <div>
                                    <p className="text-lg font-black text-[#1a237e] leading-none mb-1">{stats?.enrolledCourses || 0}</p>
                                    <p className="text-slate-400 text-[7px] font-black uppercase tracking-widest leading-none">Enrolled</p>
                                </div>
                            </div>
                            <div className="mt-auto">
                                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                    <motion.div initial={{ width: 0 }} animate={{ width: `${stats?.batchProgress || 0}%` }} className="h-full bg-emerald-500 rounded-full shadow-md" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-[2rem] p-5 shadow-xl flex flex-col h-full border border-slate-50">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-[#1a237e] font-black text-[10px] uppercase tracking-tight">Weekly Goal</h4>
                                <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg shadow-sm">
                                    <Clock size={10} strokeWidth={3} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 mb-4 flex-1">
                                <div>
                                    <p className="text-lg font-black text-[#1a237e] leading-none mb-1">{activitySummary?.activeDays || 0}/7</p>
                                    <p className="text-slate-400 text-[7px] font-black uppercase tracking-widest leading-none">Active Days</p>
                                </div>
                                <div>
                                    <p className="text-lg font-black text-[#1a237e] leading-none mb-1">{activitySummary?.topicCount || 0}</p>
                                    <p className="text-slate-400 text-[7px] font-black uppercase tracking-widest leading-none">Topics</p>
                                </div>
                            </div>
                            <div className="mt-auto">
                                <div className="flex gap-1.5 justify-between px-1">
                                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
                                        <div key={idx} className="flex flex-col items-center gap-1.5">
                                            <div className={`h-2 w-2 rounded-full shadow-sm transition-all duration-300 ${idx + 1 <= (activitySummary?.activeDays || 0) ? 'bg-indigo-500 scale-110 shadow-indigo-200' : 'bg-slate-200'}`} />
                                            <span className="text-[7px] font-black text-slate-400">{day}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Share Your Progress */}
                    <div className="mt-4 pb-2">
                        <h3 className="text-center text-white/60 font-black text-[10px] uppercase tracking-[0.4em] mb-5">Share Your Progress</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <button onClick={() => handleSmartShare('whatsapp')} className="bg-[#1a237e]/40 border border-white/10 hover:bg-white/10 h-14 rounded-2xl flex items-center justify-center transition-all group backdrop-blur-md">
                                <MessageCircle className="text-white/40 group-hover:text-white transition-colors" size={20} />
                            </button>
                            <button onClick={() => handleSmartShare('linkedin')} className="bg-[#1a237e]/40 border border-white/10 hover:bg-white/10 h-14 rounded-2xl flex items-center justify-center transition-all group backdrop-blur-md">
                                <Linkedin className="text-white/40 group-hover:text-white transition-colors" size={20} />
                            </button>
                            <button onClick={() => handleSmartShare('whatsapp')} className="bg-[#1a237e]/40 border border-white/10 hover:bg-white/10 h-14 rounded-2xl flex items-center justify-center transition-all group backdrop-blur-md">
                                <Download className="text-white/40 group-hover:text-white transition-colors" size={20} />
                            </button>
                        </div>
                    </div>
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
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showRankCard, setShowRankCard] = useState(false);
    const [settings, setSettings] = useState(null);

    // Time-range activity chart state
    const [activityRange, setActivityRange] = useState('week'); // 'week' | 'month' | 'year'
    const [activityChartData, setActivityChartData] = useState([]);
    const [activitySummary, setActivitySummary] = useState({ totalHours: 0, topicCount: 0, activeDays: 0 });
    const [activityLoading, setActivityLoading] = useState(false);

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

    // Fetch activity chart data when range tab changes
    const fetchActivity = async (range, studentId) => {
        if (!studentId) return;
        setActivityLoading(true);
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/students/activity/${studentId}?range=${range}`);
            if (res.data.success) {
                setActivityChartData(res.data.chartData);
                setActivitySummary(res.data.summary);
            }
        } catch (err) {
            console.error('Activity fetch error:', err);
        } finally {
            setActivityLoading(false);
        }
    };

    // Load activity whenever range changes
    useEffect(() => {
        const storedUser = localStorage.getItem('studentUser');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser._id) {
                fetchActivity(activityRange, parsedUser._id);
            }
        }
    }, [activityRange]);

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
                    stats={stats}
                    activitySummary={activitySummary}
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

                {/* Activity Chart with Time-Range Tabs */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    {/* Header: title + tabs */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                        <h2 className="text-lg font-bold text-gray-800">Learning Activity</h2>
                        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                            {[{ key: 'week', label: 'Week' }, { key: 'month', label: 'Month' }, { key: 'year', label: 'Year' }].map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActivityRange(tab.key)}
                                    className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-all ${activityRange === tab.key
                                        ? 'bg-white text-indigo-600 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Period Summary Row */}
                    <div className="flex items-center gap-4 mb-4 px-1">
                        <div className="flex items-center gap-1.5">
                            <Clock size={13} className="text-indigo-400" />
                            <span className="text-sm font-semibold text-gray-700">{activitySummary.totalHours}h</span>
                            <span className="text-xs text-gray-400">learned</span>
                        </div>
                        <span className="text-gray-200">|</span>
                        <div className="flex items-center gap-1.5">
                            <CheckCircle size={13} className="text-green-400" />
                            <span className="text-sm font-semibold text-gray-700">{activitySummary.topicCount}</span>
                            <span className="text-xs text-gray-400">topics</span>
                        </div>
                        <span className="text-gray-200">|</span>
                        <div className="flex items-center gap-1.5">
                            <Flame size={13} className="text-orange-400" />
                            <span className="text-sm font-semibold text-gray-700">{activitySummary.activeDays}</span>
                            <span className="text-xs text-gray-400">active days</span>
                        </div>
                    </div>

                    {/* Chart */}
                    <div style={{ width: '100%', height: 260 }} className="relative">
                        {activityLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/70 rounded-lg z-10">
                                <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                        )}
                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                            <BarChart data={activityChartData.length > 0 ? activityChartData : weeklyActivity}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9CA3AF', fontSize: activityRange === 'month' ? 10 : 12 }}
                                    dy={10}
                                    interval={activityRange === 'month' ? 4 : 0}
                                />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                                <Tooltip
                                    cursor={{ fill: '#F9FAFB' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    formatter={(val) => [`${val}h`, 'Hours']}
                                />
                                <Bar
                                    dataKey="hours"
                                    fill="#6366F1"
                                    radius={[4, 4, 0, 0]}
                                    barSize={activityRange === 'month' ? 8 : activityRange === 'year' ? 24 : 36}
                                />
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
