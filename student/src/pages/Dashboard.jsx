import React, { useEffect, useState, useRef, useCallback } from 'react';
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

const RankCardModal = ({ rank, points, user, stats, activitySummary, weeklyActivity, settings, onClose }) => {
    const exportRef = useRef(null); // Ref for the hidden export card
    const [isSharing, setIsSharing] = useState(false);
    const siteTitle = settings?.siteTitle || "Finwise";
    const logoUrl = settings?.logoUrl;

    const shareText = `I just achieved Rank #${rank} on the ${siteTitle} Leaderboard! 🏆\nI earned ${points} points this week. 🚀\nCheck my progress! \n#Learning #Achievement #JobReady`;

    // Calculate daily consistency
    const safeWeeklyActivity = Array.isArray(weeklyActivity) ? weeklyActivity : [];
    const activeDays = safeWeeklyActivity.filter(d => d.hours > 0).length;

    // Smart Share Function targeting the Hidden Export Card
    const handleSmartShare = async (platform) => {
        if (!exportRef.current) return;
        setIsSharing(true);
        const toastId = toast.loading("Creating High-Quality Image...");

        try {
            // Wait for images and layouts to settle
            await new Promise(resolve => setTimeout(resolve, 800));

            const canvas = await html2canvas(exportRef.current, {
                useCORS: true,
                allowTaint: true,
                backgroundColor: null,
                scale: 2,
                logging: false,
                imageTimeout: 15000,
                onclone: (clonedDoc) => {
                    const exportNode = clonedDoc.getElementById('export-card-content');
                    if (exportNode) {
                        exportNode.style.display = 'flex';
                        exportNode.style.opacity = '1';
                    }
                }
            });

            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png', 1.0));
            if (!blob) throw new Error("Canvas to Blob failed");

            const file = new File([blob], `Finwise-Rank-${rank}.png`, { type: 'image/png' });

            // Force Download if requested or if sharing is unavailable
            const forceDownload = platform === 'download';

            // Mobile Native Share (Only if not force download)
            if (!forceDownload && navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    title: 'My Rank Card',
                    text: shareText,
                    files: [file]
                });
                toast.success("Shared successfully!", { id: toastId });
            }
            // Desktop Fallback / Force Download
            else {
                const link = document.createElement('a');
                link.href = canvas.toDataURL('image/png', 1.0);
                link.download = `Finwise-Rank-${rank}.png`;
                link.click();

                // Open Platform if requested (and not just download)
                if (platform !== 'download') {
                    setTimeout(() => {
                        if (platform === 'whatsapp') {
                            window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
                        } else if (platform === 'linkedin') {
                            window.open(`https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(shareText)}`, '_blank');
                        }
                    }, 1000);
                }

                toast.success(forceDownload ? "Card Downloaded!" : "Image Downloaded!", { id: toastId });
            }
        } catch (err) {
            console.error("Sharing failed:", err);
            toast.error("Process failed. Please try again.", { id: toastId });
        } finally {
            setIsSharing(false);
            setTimeout(() => toast.dismiss(toastId), 3000);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in zoom-in duration-300">
            <Confetti />

            {/* --- HIDDEN EXPORT CARD (Optimized for HTML2Canvas) --- */}
            {/* Using opacity-0 and pointer-events-none but keeping it in the layout flow for reliable capture */}
            <div className="fixed inset-0 opacity-0 pointer-events-none flex items-center justify-center -z-50 overflow-hidden">
                <div
                    ref={exportRef}
                    id="export-card-content"
                    className="w-[1080px] h-[1350px] bg-gradient-to-br from-[#1a237e] via-[#523B8C] to-[#1a237e] flex flex-col items-center p-[60px] relative overflow-hidden shrink-0"
                >
                    {/* Subtle Grid Pattern */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff15_1px,transparent_1px),linear-gradient(to_bottom,#ffffff15_1px,transparent_1px)] bg-[size:80px_80px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

                    {/* Cinematic Blobs */}
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#A294F9]/20 rounded-full blur-[200px] -mr-[300px] -mt-[300px] pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-[150px] -ml-[150px] -mb-[150px] pointer-events-none" />

                    {/* Branding Header */}
                    <div className="w-full flex items-center justify-between mb-[72px] z-20 pt-[20px]">
                        <div className="flex items-center gap-8">
                            <h2 className="text-white font-black text-3xl tracking-[0.4em] uppercase opacity-60">Finwise</h2>
                            <div className="h-10 w-[3px] bg-white/20"></div>
                            <h2 className="text-white font-black text-3xl tracking-[0.4em] uppercase opacity-90">Career Solutions</h2>
                        </div>
                        <div className="flex items-center gap-4 text-white/40 text-lg font-bold uppercase tracking-widest">
                            Official Rank Card • Student Portal
                        </div>
                    </div>

                    {/* Profile Section */}
                    <div className="w-full flex items-center gap-14 bg-white/5 backdrop-blur-3xl p-14 rounded-[5rem] border border-white/10 shadow-3xl mb-[48px] min-h-[280px]">
                        <div className="relative shrink-0">
                            <div className="h-44 w-44 rounded-full border-[8px] border-yellow-400 p-2 overflow-hidden bg-slate-800 shadow-2xl">
                                {user?.profilePicture ? (
                                    <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" crossOrigin="anonymous" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-white text-6xl font-bold bg-indigo-600">
                                        {user?.name?.charAt(0)}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <h3 className="text-white font-bold text-8xl tracking-[0.02em] mb-10 leading-[1.2]">{user?.name}</h3>
                            <div className="bg-white/10 px-10 py-5 rounded-full inline-flex items-center gap-5 shadow-inner border border-white/5 self-start">
                                <div className="p-2.5 bg-purple-500 rounded-full shadow-md">
                                    <Star size={24} className="text-white fill-white" />
                                </div>
                                <span className="text-white text-3xl font-black tracking-tight uppercase">{(stats?.points || 0).toLocaleString()} Total Points</span>
                            </div>
                        </div>
                        <div className="shrink-0 flex items-center justify-center p-4">
                            <div className="p-8 bg-yellow-500/10 rounded-[3rem] border-4 border-yellow-500/20">
                                <Crown size={120} className="text-yellow-400 drop-shadow-2xl fill-yellow-400/10" strokeWidth={1.5} />
                            </div>
                        </div>
                    </div>

                    {/* Hero Card: Daily Goal */}
                    <div className="w-full bg-white rounded-[5rem] p-16 shadow-4xl relative overflow-hidden flex flex-col items-center border border-indigo-50 mb-[48px] min-h-[500px]">
                        <div className="w-full grid grid-cols-[260px_1fr_260px] items-center gap-10 mb-16">
                            {/* Target Illustration */}
                            <div className="relative h-64 w-64 justify-self-start">
                                <div className="absolute inset-0 bg-red-50 rounded-full scale-110"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-44 h-44 bg-red-100 rounded-full flex items-center justify-center shadow-inner">
                                        <div className="w-32 h-32 bg-red-500 rounded-full flex items-center justify-center border-[8px] border-white shadow-xl">
                                            <div className="w-12 h-12 bg-red-900 rounded-full"></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute top-0 right-0 text-yellow-500">
                                    <Sparkles size={48} fill="currentColor" />
                                </div>
                            </div>

                            {/* Achievement Text (Centered) */}
                            <div className="flex flex-col items-center justify-center text-center px-4 pt-4">
                                <h1 className="text-[#1a237e] text-6xl font-black mb-14 uppercase tracking-[0.3em] leading-tight">Daily Goal</h1>
                                {(stats?.dailyPoints || 0) >= (stats?.dailyGoal || 100) ? (
                                    <div className="bg-purple-600 text-white px-16 py-8 rounded-[2.5rem] font-black text-4xl shadow-[0_24px_50px_rgba(147,51,234,0.4)] uppercase tracking-widest whitespace-nowrap">
                                        Achieved
                                    </div>
                                ) : (
                                    <div className="bg-slate-100 text-slate-400 px-16 py-8 rounded-[2.5rem] font-black text-2xl uppercase tracking-[0.3em] whitespace-nowrap">
                                        In Progress
                                    </div>
                                )}
                            </div>

                            {/* Points Circle */}
                            <div className="relative h-60 w-60 justify-self-end">
                                <svg className="w-full h-full -rotate-90">
                                    <circle cx="120" cy="120" r="100" stroke="#f3e5f5" strokeWidth="18" fill="transparent" />
                                    <circle
                                        cx="120" cy="120" r="100" stroke="#7e57c2" strokeWidth="18" fill="transparent"
                                        strokeDasharray="628"
                                        strokeDashoffset={628 - (628 * Math.min(1, (stats?.dailyPoints || 0) / (stats?.dailyGoal || 100)))}
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <Star size={44} className="text-purple-600 mb-2 fill-purple-600" />
                                    <span className="text-[#1a237e] text-3xl font-black leading-none">
                                        {(stats?.dailyPoints || 0)}/{(stats?.dailyGoal || 100)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Daily Stats Grid */}
                        <div className="w-full grid grid-cols-2 gap-10 border-t border-slate-100 pt-12">
                            <div className="flex items-center gap-8 justify-center bg-slate-50/50 py-10 rounded-[3rem]">
                                <div className="p-6 bg-indigo-100 text-indigo-600 rounded-3xl shadow-sm">
                                    <Trophy size={48} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <p className="text-[#1a237e] font-black text-6xl leading-none mb-2">#{rank}</p>
                                    <p className="text-slate-400 text-xl font-black uppercase tracking-widest leading-none">Daily Rank</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-8 justify-center bg-slate-50/50 py-10 rounded-[3rem]">
                                <div className="p-6 bg-yellow-100 text-yellow-600 rounded-3xl shadow-sm">
                                    <Zap size={48} fill="currentColor" strokeWidth={2.5} />
                                </div>
                                <div>
                                    <p className="text-[#1a237e] font-black text-6xl leading-none mb-2">{stats?.points || 0}</p>
                                    <p className="text-slate-400 text-xl font-black uppercase tracking-widest leading-none">Total Points</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sub-Cards Row */}
                    <div className="w-full grid grid-cols-2 gap-10 flex-1">
                        <div className="bg-white rounded-[4rem] p-12 shadow-4xl flex flex-col h-full border border-slate-50">
                            <div className="flex items-center justify-between mb-10">
                                <h4 className="text-[#1a237e] font-black text-2xl uppercase tracking-widest">Course Progress</h4>
                                <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl shadow-sm">
                                    <BookOpen size={24} strokeWidth={3} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-8 mb-10 items-center">
                                <div>
                                    <p className="text-6xl font-black text-[#1a237e] leading-none mb-3">{stats?.batchProgress || 0}%</p>
                                    <p className="text-slate-400 text-xl font-black uppercase tracking-widest leading-none">Overall Progress</p>
                                </div>
                                <div>
                                    <p className="text-6xl font-black text-[#1a237e] leading-none mb-3">{stats?.enrolledCourses || 0}</p>
                                    <p className="text-slate-400 text-xl font-black uppercase tracking-widest leading-none">Enrolled</p>
                                </div>
                            </div>
                            <div className="mt-auto">
                                <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                    <div className="h-full bg-emerald-500 rounded-full shadow-md" style={{ width: `${stats?.batchProgress || 0}%` }} />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-[4rem] p-12 shadow-4xl flex flex-col h-full border border-slate-50">
                            <div className="flex items-center justify-between mb-10">
                                <h4 className="text-[#1a237e] font-black text-2xl uppercase tracking-widest">Weekly Goal</h4>
                                <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl shadow-sm">
                                    <Clock size={24} strokeWidth={3} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-8 mb-10 items-center">
                                <div>
                                    <p className="text-6xl font-black text-[#1a237e] leading-none mb-3">{activeDays}/7</p>
                                    <p className="text-slate-400 text-xl font-black uppercase tracking-widest leading-none">Active Days</p>
                                </div>
                                <div>
                                    <p className="text-6xl font-black text-[#1a237e] leading-none mb-3">{activitySummary?.topicCount || 0}</p>
                                    <p className="text-slate-400 text-xl font-black uppercase tracking-widest leading-none">Topics</p>
                                </div>
                            </div>
                            <div className="mt-auto">
                                <div className="flex gap-4 justify-between px-2">
                                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => {
                                        const isActive = safeWeeklyActivity[idx] && safeWeeklyActivity[idx].hours > 0;
                                        return (
                                            <div key={idx} className="flex flex-col items-center gap-4">
                                                <div className={`h-6 w-6 rounded-full shadow-md transition-all duration-300 ${isActive ? 'bg-indigo-500 scale-125' : 'bg-slate-200'}`} />
                                                <span className="text-xl font-black text-slate-400">{day}</span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Branding */}
                    <div className="w-full mt-10 pt-10 border-t border-white/10 flex justify-between items-center text-white/40 font-bold uppercase tracking-[0.3em] text-lg">
                        <span>Keep Learning, Keep Growing</span>
                        <span>finwise.tech</span>
                    </div>

                </div>
            </div>


            {/* --- VISIBLE UI (Interactive Card) --- */}
            {/* Glow Effect behind the card */}
            <div className="absolute w-full max-w-md h-[500px] bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none"></div>

            <div className="w-full max-w-md h-[650px] bg-gradient-to-br from-[#1a237e] via-[#523B8C] to-[#1a237e] rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden relative border border-white/20 ring-1 ring-white/10 flex flex-col">
                {/* Subtle Grid Pattern from Blogs Header */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff15_1px,transparent_1px),linear-gradient(to_bottom,#ffffff15_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

                {/* Cinematic Blobs */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-[#A294F9]/20 rounded-full blur-[100px] -mr-40 -mt-40 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-60 h-60 bg-white/10 rounded-full blur-[80px] -ml-20 -mb-20 pointer-events-none" />

                {/* Header Pattern overlay */}
                <div className="absolute top-0 w-full h-24 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 pointer-events-none"></div>

                {/* Top Navigation */}
                <div className="absolute top-0 w-full p-4 flex justify-between items-center z-40 bg-white/5 backdrop-blur-md border-b border-white/5">
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
                    <div className="flex items-center gap-4 bg-white/5 backdrop-blur-2xl p-5 rounded-[2.5rem] border border-white/10 shadow-2xl">
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
                        <div className="min-w-0 flex-1">
                            <h3 className="text-white font-black text-xl tracking-tight leading-none mb-2 truncate">{user?.name}</h3>
                            <div className="bg-white/10 px-3 py-1.5 rounded-full inline-flex items-center gap-2 shadow-inner border border-white/5">
                                <div className="p-1 bg-purple-500 rounded-full shadow-sm">
                                    <Star size={8} className="text-white fill-white" />
                                </div>
                                <span className="text-white text-[10px] font-black tracking-tight">{(stats?.points || 0).toLocaleString()} Total Points</span>
                            </div>
                        </div>
                        <div className="shrink-0 flex items-center justify-center">
                            <div className="p-3 bg-yellow-500/10 rounded-2xl border-2 border-yellow-500/20">
                                <Crown size={32} className="text-yellow-400 drop-shadow-xl fill-yellow-400/10" strokeWidth={1.5} />
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
                                <h1 className="text-[#1a237e] text-1xl font-black leading-none mb-3">Daily Goal</h1>
                                {(stats?.dailyPoints || 0) >= (stats?.dailyGoal || 100) ? (
                                    <div className="bg-purple-600 text-white px-5 py-2.5 rounded-2xl font-black text-base shadow-[0_8px_20px_rgba(147,51,234,0.3)] inline-block transform hover:scale-105 transition-transform cursor-default">
                                        Achieved
                                    </div>
                                ) : (
                                    <div className="bg-slate-100 text-slate-400 px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest inline-block">
                                        In Progress
                                    </div>
                                )}
                            </div>

                            {/* Points Circle */}
                            <div className="relative h-20 w-20 shrink-0">
                                <svg className="w-full h-full -rotate-90">
                                    <circle cx="40" cy="40" r="35" stroke="#f3e5f5" strokeWidth="6" fill="transparent" />
                                    <motion.circle
                                        cx="40" cy="40" r="35" stroke="#7e57c2" strokeWidth="6" fill="transparent"
                                        initial={{ strokeDasharray: "220", strokeDashoffset: "220" }}
                                        animate={{ strokeDashoffset: 220 - (220 * Math.min(1, (stats?.dailyPoints || 0) / (stats?.dailyGoal || 100))) }}
                                        transition={{ duration: 1.5, delay: 0.2 }}
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <Star size={12} className="text-purple-600 mb-0.5 fill-purple-600" />
                                    <span className="text-[#1a237e] text-[9px] font-black leading-none">
                                        {(stats?.dailyPoints || 0)}/{(stats?.dailyGoal || 100)}
                                    </span>
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
                                    <p className="text-[#1a237e] font-black text-xl leading-none mb-1">{stats?.points || 0}</p>
                                    <p className="text-slate-400 text-[8px] font-black uppercase tracking-widest leading-none">Total Points</p>
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
                                    <p className="text-lg font-black text-[#1a237e] leading-none mb-1">{activeDays}/7</p>
                                    <p className="text-slate-400 text-[7px] font-black uppercase tracking-widest leading-none">Active Days</p>
                                </div>
                                <div>
                                    <p className="text-lg font-black text-[#1a237e] leading-none mb-1">{activitySummary?.topicCount || 0}</p>
                                    <p className="text-slate-400 text-[7px] font-black uppercase tracking-widest leading-none">Topics</p>
                                </div>
                            </div>
                            <div className="mt-auto">
                                <div className="flex gap-1.5 justify-between px-1">
                                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => {
                                        const isActive = safeWeeklyActivity[idx] && safeWeeklyActivity[idx].hours > 0;
                                        return (
                                            <div key={idx} className="flex flex-col items-center gap-1.5">
                                                <div className={`h-2 w-2 rounded-full shadow-sm transition-all duration-300 ${isActive ? 'bg-indigo-500 scale-110 shadow-indigo-200' : 'bg-slate-200'}`} />
                                                <span className="text-[7px] font-black text-slate-400">{day}</span>
                                            </div>
                                        )
                                    })}
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
                            <button onClick={() => handleSmartShare('download')} className="bg-[#1a237e]/40 border border-white/10 hover:bg-white/10 h-14 rounded-2xl flex items-center justify-center transition-all group backdrop-blur-md">
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
    const [dailyLeaderboard, setDailyLeaderboard] = useState([]);
    const [weeklyLeaderboard, setWeeklyLeaderboard] = useState([]);
    const [leaderboardPeriod, setLeaderboardPeriod] = useState('weekly');
    const [loading, setLoading] = useState(true);
    const [showRankCard, setShowRankCard] = useState(false);
    const [settings, setSettings] = useState(null);

    // Time-range activity chart state
    const [activityRange, setActivityRange] = useState('week'); // 'week' | 'month' | 'year'
    const [activityChartData, setActivityChartData] = useState([]);
    const [activitySummary, setActivitySummary] = useState({ totalHours: 0, topicCount: 0, activeDays: 0 });
    const [activityLoading, setActivityLoading] = useState(false);
    const [mockHistory, setMockHistory] = useState([]);

    const fetchDashboardData = useCallback(async () => {
        try {
            const storedUser = localStorage.getItem('studentUser');
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);

                if (parsedUser._id) {
                    const results = await Promise.allSettled([
                        axios.get(`${import.meta.env.VITE_API_URL}/api/students/dashboard/${parsedUser._id}`),
                        axios.get(`${import.meta.env.VITE_API_URL}/api/students/leaderboard?studentId=${parsedUser._id}&period=weekly`),
                        axios.get(`${import.meta.env.VITE_API_URL}/api/students/leaderboard?studentId=${parsedUser._id}&period=daily`),
                        axios.get(`${import.meta.env.VITE_API_URL}/api/settings`),
                        axios.get(`${import.meta.env.VITE_API_URL}/api/mock-interviews/student/${parsedUser._id}`)
                    ]);

                    const dashboardRes = results[0].status === 'fulfilled' ? results[0].value : null;
                    const weeklyRes = results[1].status === 'fulfilled' ? results[1].value : null;
                    const dailyRes = results[2].status === 'fulfilled' ? results[2].value : null;
                    const settingsRes = results[3].status === 'fulfilled' ? results[3].value : null;
                    const mockRes = results[4].status === 'fulfilled' ? results[4].value : null;

                    if (dashboardRes && dashboardRes.data.success) {
                        setStats(dashboardRes.data.stats);
                        setRecentActivity(dashboardRes.data.recentActivity);
                        setWeeklyActivity(dashboardRes.data.weeklyActivity);
                    }

                    if (settingsRes) {
                        setSettings(settingsRes.data);
                    }

                    if (mockRes && mockRes.data.success) {
                        setMockHistory(mockRes.data.history);
                    }

                    if (weeklyRes && weeklyRes.data.success) {
                        setWeeklyLeaderboard(weeklyRes.data.leaderboard);
                        if (leaderboardPeriod === 'weekly') {
                            setLeaderboard(weeklyRes.data.leaderboard);
                        }

                        // Ranking Logic
                        const myRankIndex = weeklyRes.data.leaderboard.findIndex(s => s.id === parsedUser._id);
                        if (myRankIndex !== -1 && myRankIndex < 3) {
                            const todayStr = new Date().toDateString();
                            const lastShown = localStorage.getItem(`rankCardLastShown_${parsedUser._id}`);
                            if (lastShown !== todayStr) {
                                setShowRankCard(true);
                                localStorage.setItem(`rankCardLastShown_${parsedUser._id}`, todayStr);
                            }
                        }
                    }

                    if (dailyRes && dailyRes.data.success) {
                        setDailyLeaderboard(dailyRes.data.leaderboard);
                        if (leaderboardPeriod === 'daily') {
                            setLeaderboard(dailyRes.data.leaderboard);
                        }
                    }
                }
            }
        } catch (err) {
            console.error("Error loading dashboard:", err);
            // toast.error("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    }, [leaderboardPeriod]);

    useEffect(() => {
        fetchDashboardData();

        // Real-time synchronization event listener
        const handleSync = () => {
            fetchDashboardData();
        };
        window.addEventListener('finwise-activity-sync', handleSync);

        return () => {
            window.removeEventListener('finwise-activity-sync', handleSync);
        };
    }, [fetchDashboardData]);

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


    const statCards = [
        { label: 'Enrolled Courses', value: stats.enrolledCourses, icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50', trend: 'Active' },
        { label: 'Classes Attended', value: stats.attendance, icon: UserCheck, color: 'text-green-600', bg: 'bg-green-50', trend: 'Keep it up!' },
        { label: 'Points Earned', value: stats.points || 0, icon: Trophy, color: 'text-amber-600', bg: 'bg-amber-50', trend: 'Rewards' },
        { label: 'Batch Progress', value: `${stats.batchProgress}%`, icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50', trend: 'On Track' },
    ];

    // Helper to find user rank safely
    const getUserRank = (type = 'weekly') => {
        const targetLeaderboard = type === 'weekly' ? weeklyLeaderboard : dailyLeaderboard;
        if (!user || !targetLeaderboard || targetLeaderboard.length === 0) return null;
        const index = targetLeaderboard.findIndex(s => s.id === user._id);
        if (index !== -1) {
            return { rank: index + 1, points: targetLeaderboard[index].points };
        }
        return null;
    };

    const userRankInfo = getUserRank('weekly');
    const dailyRankInfo = getUserRank('daily');

    return (
        <div>
            {/* Rank Card Modal */}
            {showRankCard && userRankInfo && (
                <RankCardModal
                    rank={userRankInfo.rank}
                    points={userRankInfo.points}
                    user={user}
                    stats={stats}
                    activitySummary={activitySummary}
                    weeklyActivity={weeklyActivity}
                    settings={settings}
                    onClose={() => setShowRankCard(false)}
                />
            )}
            <div className="mb-6">
                {/* Date removed, moved to navbar */}
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


                {/* Leaderboard Widget - Executive Grid Refined v4.2 */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-xl flex flex-col h-full overflow-hidden">
                    <div className="p-4 pb-3 flex items-center justify-between bg-white border-b border-gray-50">
                        <div className="flex items-center gap-4">
                            <div>
                                <h2 className="text-lg font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                                    <Trophy className="text-amber-500" size={20} /> Top Learners
                                </h2>
                            </div>
                            {/* Period Toggle */}
                            <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl border border-gray-100">
                                <button
                                    onClick={() => { setLeaderboardPeriod('daily'); setLeaderboard(dailyLeaderboard); }}
                                    className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${leaderboardPeriod === 'daily' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    Day
                                </button>
                                <button
                                    onClick={() => { setLeaderboardPeriod('weekly'); setLeaderboard(weeklyLeaderboard); }}
                                    className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${leaderboardPeriod === 'weekly' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    Week
                                </button>
                            </div>
                        </div>
                        {userRankInfo && (
                            <button
                                onClick={() => setShowRankCard(true)}
                                className="text-[10px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-600 hover:text-white px-3 py-1.5 rounded-xl transition-all duration-300 border border-indigo-100/50"
                            >
                                Status
                            </button>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto px-4 pt-4 pb-6 custom-scrollbar">
                        {leaderboard.length > 0 ? (
                            <div className="space-y-4">
                                {/* TOP 3 ELITE TIER */}
                                <div className="space-y-3 p-3 bg-gray-50/50 rounded-2xl border border-gray-100/50 relative overflow-hidden">
                                    {/* RANK 1 */}
                                    {leaderboard[0] && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="bg-white border border-amber-100/50 rounded-xl p-2.5 flex items-center gap-3 shadow-sm"
                                        >
                                            <div className="relative shrink-0">
                                                <div className="w-12 h-12 rounded-xl overflow-hidden ring-2 ring-amber-50 shadow-inner">
                                                    {leaderboard[0].profilePicture ? (
                                                        <img 
                                                            src={leaderboard[0].profilePicture} 
                                                            className="w-full h-full object-cover pointer-events-none select-none" 
                                                            crossOrigin="anonymous" 
                                                            onContextMenu={(e) => e.preventDefault()}
                                                            draggable="false"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-amber-50 text-amber-600 text-lg font-black">
                                                            {leaderboard[0].name?.charAt(0)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-500 rounded-lg flex items-center justify-center text-[9px] font-black text-white shadow-lg border-2 border-white">1</div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-gray-900 font-extrabold text-sm truncate tracking-tight leading-none uppercase">{leaderboard[0].name}</h3>
                                                <div className="flex items-center gap-1.5 mt-1">
                                                    <Crown size={10} className="text-amber-500" />
                                                    <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest">{leaderboard[0].points} PTS • TOP OF BATCH</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* RANK 2 & 3 GRID */}
                                    <div className="grid grid-cols-2 gap-2">
                                        {[leaderboard[1], leaderboard[2]].map((student, i) => student && (
                                            <motion.div
                                                key={student.id}
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: 0.1 * (i + 1) }}
                                                className="bg-white border border-gray-100 rounded-xl p-2 flex items-center gap-2"
                                            >
                                                <div className="relative shrink-0">
                                                    <div className={`w-8 h-8 rounded-lg overflow-hidden border p-0.5 bg-white ${i === 0 ? 'border-gray-200' : 'border-orange-100'}`}>
                                                        {student.profilePicture ? (
                                                            <img 
                                                                src={student.profilePicture} 
                                                                className="w-full h-full object-cover rounded-md pointer-events-none select-none" 
                                                                crossOrigin="anonymous" 
                                                                onContextMenu={(e) => e.preventDefault()}
                                                                draggable="false"
                                                            />
                                                        ) : (
                                                            <div className={`w-full h-full flex items-center justify-center text-[10px] font-black ${i === 0 ? 'text-gray-400' : 'text-orange-500'}`}>
                                                                {student.name?.charAt(0)}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-md flex items-center justify-center text-[8px] font-black border border-white shadow-sm ${i === 0 ? 'bg-gray-200 text-gray-600' : 'bg-orange-100 text-orange-700'}`}>
                                                        {i + 2}
                                                    </div>
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-gray-900 font-bold text-[10px] truncate leading-none mb-0.5">{student.name.split(' ')[0]}</p>
                                                    <span className="text-gray-500 font-black text-[9px]">{student.points} <span className="text-[7px] font-bold">PTS</span></span>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>

                                {/* NORMAL LIST - RANK 4-10 */}
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 px-1 mb-2">
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Batch Top 10</span>
                                        <div className="h-[1px] flex-1 bg-gray-50"></div>
                                    </div>
                                    {leaderboard.slice(3, 10).map((student, idx) => (
                                        <motion.div
                                            key={student.id}
                                            initial={{ opacity: 0, x: -5 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.05 * idx }}
                                            className={`flex items-center justify-between p-2 rounded-xl transition-all duration-300 group/row h-10 ${user && user._id === student.id
                                                ? 'bg-indigo-50/50'
                                                : 'hover:bg-gray-50/50'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] font-black text-gray-300 w-4 text-center">{idx + 4}</span>
                                                <div className="h-7 w-7 rounded-full overflow-hidden bg-gray-100 shrink-0 border border-gray-100">
                                                    {student.profilePicture ? (
                                                        <img 
                                                            src={student.profilePicture} 
                                                            alt={student.name} 
                                                            className="w-full h-full object-cover pointer-events-none select-none" 
                                                            crossOrigin="anonymous" 
                                                            onContextMenu={(e) => e.preventDefault()}
                                                            draggable="false"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-white text-gray-400 text-[9px] font-black">
                                                            {student.name?.charAt(0)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className={`text-[11px] font-bold uppercase leading-none ${user && user._id === student.id ? 'text-indigo-900' : 'text-gray-700'}`}>
                                                        {student.name}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                                                <span className="text-[10px] font-black text-gray-500 uppercase">{student.points} <span className="text-[8px] font-bold opacity-60">PTS</span></span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center py-20 opacity-40">
                                <Target size={32} className="text-gray-300 mb-2" />
                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Loading Entries</p>
                            </div>
                        )}
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

                {/* Interview Performance Trends */}
                <div className="lg:col-span-1 bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-bold text-gray-800">Interview Readiness</h2>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Mock Trends</p>
                        </div>
                        <TrendingUp size={20} className="text-indigo-500" />
                    </div>

                    <div className="h-40 w-full mb-6">
                        {mockHistory.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={mockHistory.slice().reverse().slice(-5).map(h => ({
                                    date: new Date(h.interviewDate || h.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                                    score: h.overallScore
                                }))}>
                                    <XAxis dataKey="date" hide />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', fontSize: '10px' }}
                                    />
                                    <Bar dataKey="score" fill="#6366F1" radius={[4, 4, 0, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                                <Sparkles size={24} className="mb-2" />
                                <p className="text-[10px] font-bold uppercase">No Mocks Yet</p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-3">
                        {mockHistory.length > 0 ? (
                            mockHistory.slice(0, 3).map((h, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-transparent hover:border-gray-100 transition-all">
                                    <div>
                                        <p className="text-[11px] font-bold text-gray-900 leading-none mb-1">{h.interviewType}</p>
                                        <p className="text-[9px] text-gray-400 font-medium">{new Date(h.interviewDate || h.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">{h.overallScore}/10</span>
                                </div>
                            ))
                        ) : (
                            <button className="w-full py-2 bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase rounded-xl hover:bg-indigo-100 transition-all">
                                Schedule First Mock
                            </button>
                        )}
                    </div>
                </div>

            </div>
        </div>

    );
};

export default Dashboard;
