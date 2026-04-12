import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    TrendingUp, Award, Star,
    CheckCircle, Target,
    Shield, ArrowRight, History,
    LayoutGrid, List, Calendar, UserCheck,
    Zap, Clock, AlertCircle, Sparkles, BookOpen,
    Info, X, Trophy, Megaphone, Check, Wallet, Rocket
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Radar, RadarChart,
    PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import axios from 'axios';
import toast from 'react-hot-toast';

const MockInterviewDashboard = () => {
    const [performance, setPerformance] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState('All');
    const [dateFilter, setDateFilter] = useState('All Time');
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [dbSettings, setDbSettings] = useState({ topics: [], improvementPlans: [], interviewTypes: [] });
    const [activeTab, setActiveTab] = useState('overview');
    const [showRewardGuide, setShowRewardGuide] = useState(false);
    const [customDate, setCustomDate] = useState('');

    useEffect(() => {
        fetchPerformance();
        fetchDbSettings();
    }, []);

    const fetchDbSettings = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const { data } = await axios.get(`${API_URL}/api/mock-interview-settings`);
            if (data.success && data.data) {
                setDbSettings(data.data);
            }
        } catch (error) {
            console.error("Error fetching mock settings", error);
        }
    };

    const fetchPerformance = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('studentUser'));
            if (!user) return;

            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const res = await axios.get(`${API_URL}/api/mock-interviews/student/${user._id}`);

            if (res.data.success) {
                setPerformance(res.data);
                if (res.data.history.length > 0) {
                    setSelectedFeedback(res.data.history[0]);
                }
            }
        } catch (error) {
            console.error("Error fetching performance:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[70vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-400 text-sm font-medium">Loading Performance...</p>
                </div>
            </div>
        );
    }

    if (!performance || performance.history.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4 max-w-lg mx-auto">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mb-6">
                    <History size={32} />
                </div>
                <h1 className="text-2xl font-semibold text-slate-900 mb-2">Start Your Journey</h1>
                <p className="text-slate-500 mb-8">
                    Your performance insights and rewards will appear here after your first mock interview.
                </p>
                <button className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-indigo-100">
                    Prepare for Mock
                </button>
            </div>
        );
    }

    const historyChartData = performance.history.map(h => ({
        date: new Date(h.interviewDate || h.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        score: h.overallScore
    })).reverse();

    const filteredHistory = performance.history.filter(h => {
        const matchesType = filterType === 'All' || h.interviewType === filterType;

        if (dateFilter === 'All Time') return matchesType;

        const dateToCompare = h.interviewDate || h.createdAt;
        const interviewDateObj = new Date(dateToCompare);
        const now = new Date();
        const diffDays = (now - interviewDateObj) / (1000 * 60 * 60 * 24);

        if (dateFilter === 'Last 30 Days') return matchesType && diffDays <= 30;
        if (dateFilter === 'Last 7 Days') return matchesType && diffDays <= 7;

        if (dateFilter === 'Particular Date' && customDate) {
            // Use string comparison (YYYY-MM-DD) to be timezone-agnostic
            const interviewDateStr = new Date(dateToCompare).toISOString().split('T')[0];
            return matchesType && interviewDateStr === customDate;
        }

        return matchesType;
    });

    const target = selectedFeedback && filteredHistory.find(h => h._id === selectedFeedback._id)
        ? selectedFeedback
        : filteredHistory[0];

    // If no interviews in this category, target might be undefined
    const skillData = target ? [
        { subject: 'Communication Skills', A: (target.communicationScore || 0) * 10 },
        { subject: 'Subject Knowledge', A: (target.technicalScore || 0) * 10 },
        { subject: 'Confidence', A: (target.confidenceScore || 0) * 10 },
        { subject: 'Problem Solving', A: (target.problemSolvingScore || 0) * 10 },
        { subject: 'Body Language', A: (target.bodyLanguageScore || 0) * 10 },
        { subject: 'Practical Skills', A: (target.practicalScore || 0) * 10 },
    ] : [];

    // Category Stats
    const getCategoryAvg = () => {
        if (filteredHistory.length === 0) return 0;
        const sum = filteredHistory.reduce((acc, curr) => acc + curr.overallScore, 0);
        return (sum / filteredHistory.length).toFixed(1);
    };

    const getStatusInfo = (statusStr) => {
        const s = (statusStr || '').toLowerCase();
        if (s.includes('ready')) return { label: 'Job Ready', color: 'bg-emerald-500', text: 'text-emerald-500', icon: Trophy, tint: 'bg-emerald-50' };
        if (s.includes('highly')) return { label: 'Highly Capable', color: 'bg-blue-500', text: 'text-blue-500', icon: Medal, tint: 'bg-blue-50' };
        if (s.includes('capable')) return { label: 'Capable', color: 'bg-indigo-500', text: 'text-indigo-500', icon: Award, tint: 'bg-indigo-50' };
        if (s.includes('critical')) return { label: 'Critical Risk', color: 'bg-rose-500', text: 'text-rose-500', icon: AlertCircle, tint: 'bg-rose-50' };
        return { label: 'Needs Improvement', color: 'bg-amber-500', text: 'text-amber-500', icon: Zap, tint: 'bg-amber-50' };
    };

    const statusObj = target ? getStatusInfo(target.status) : null;
    const wallet = performance.wallet;

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-16">
            {/* Minimal Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-slate-50">
                <div className="relative">
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        Performance Overview
                        <Sparkles className="text-amber-400" size={20} />
                        
                        {/* Blinking Info Icon */}
                        <button 
                            onClick={() => setShowRewardGuide(true)}
                            className="relative flex items-center justify-center ml-1 p-1 hover:bg-slate-100 rounded-full transition-colors group"
                        >
                            <span className="animate-ping absolute inline-flex h-4 w-4 rounded-full bg-rose-400 opacity-75"></span>
                            <Info size={18} className="text-rose-500 relative z-10" />
                            
                            {/* Hover Tooltip */}
                            <span className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">
                                View Reward Updates
                            </span>
                        </button>
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Track your growth and career readiness status.</p>
                </div>

                <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold">
                        Lvl {wallet.level}
                    </div>
                    <div className="pr-4">
                        <div className="flex items-center gap-4 text-sm font-semibold text-slate-700">
                            <span className="flex items-center gap-1.5"><Star size={14} className="text-indigo-500 fill-indigo-500" /> {wallet.totalPoints}</span>
                            <span className="flex items-center gap-1.5">🪙 {wallet.totalCoins}</span>
                        </div>
                        <div className="w-24 bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(wallet.totalPoints % 250) / 2.5}%` }}
                                className="h-full bg-indigo-500 rounded-full"
                            />
                        </div>
                    </div>
                </div>
            </div>


            {/* Reward Guide Modal - Simple UI */}
            <AnimatePresence>
                {showRewardGuide && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowRewardGuide(false)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200"
                        >
                            {/* Simple Header */}
                            <div className="p-6 border-b border-slate-100 flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-2 text-indigo-600 font-bold text-[10px] uppercase tracking-widest mb-1">
                                        <Sparkles size={12} className="text-amber-500" /> New Reward Structure
                                    </div>
                                    <h3 className="text-lg font-extrabold text-slate-900">More Achievements, Bigger Rewards!</h3>
                                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                        Our updated algorithm recognizes your hard work and daily consistency.
                                    </p>
                                </div>
                                <button 
                                    onClick={() => setShowRewardGuide(false)}
                                    className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Section 1 */}
                                <div className="space-y-3">
                                    <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Daily Attendance</div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-700 font-medium">QR Presence Reward</span>
                                        <span className="font-bold text-indigo-600">+10 Coins</span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 italic">*Automatically added to your 50 Points reward.</p>
                                </div>

                                {/* Section 2 */}
                                <div className="space-y-3 pt-2">
                                    <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Mock Interviews</div>
                                    <div className="space-y-2">
                                        {[
                                            { label: 'Elite Achievement (8+)', val: '50🪙' },
                                            { label: 'Good Progress (6+)', val: '30🪙' },
                                            { label: 'Improvement Bonus', val: '+25🪙' },
                                            { label: 'First Interview', val: '+100🪙' }
                                        ].map((item, i) => (
                                            <div key={i} className="flex justify-between items-center text-sm py-1 border-b border-slate-50 last:border-0">
                                                <span className="text-slate-700 font-medium">{item.label}</span>
                                                <span className="font-bold text-indigo-600">{item.val}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Simple Footer */}
                                <div className="pt-4 mt-2 border-t border-slate-100 flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                                    <Check size={12} className="text-emerald-500" /> Wallet Transaction Synced
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Category Filter Pills */}
            {/* Filtering Controls */}
            <div className="space-y-4 bg-white/50 p-4 rounded-3xl border border-slate-100">
                <div className="flex flex-wrap items-center gap-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest min-w-[80px]">By Path:</span>
                    {['All', ...(dbSettings.interviewTypes || ['HR', 'Technical', 'Finance', 'Mixed'])].map(type => (
                        <button
                            key={type}
                            onClick={() => { setFilterType(type); setSelectedFeedback(null); }}
                            className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all border ${filterType === type
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100'
                                : 'bg-white text-slate-500 border-slate-100 hover:border-slate-300'
                                }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest min-w-[80px]">By Time:</span>
                    {['All Time', 'Last 30 Days', 'Last 7 Days', 'Particular Date'].map(period => (
                        <button
                            key={period}
                            onClick={() => { setDateFilter(period); setSelectedFeedback(null); }}
                            className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all border flex items-center gap-2 ${dateFilter === period
                                ? 'bg-slate-800 text-white border-slate-800 shadow-md'
                                : 'bg-white text-slate-500 border-slate-100 hover:border-slate-300'
                                }`}
                        >
                            <Clock size={12} />
                            {period}
                        </button>
                    ))}

                    {dateFilter === 'Particular Date' && (
                        <input
                            type="date"
                            value={customDate}
                            onChange={(e) => setCustomDate(e.target.value)}
                            className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-indigo-200 outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-700"
                        />
                    )}

                    {(filterType !== 'All' || dateFilter !== 'All Time') && (
                        <button
                            onClick={() => { setFilterType('All'); setDateFilter('All Time'); setCustomDate(''); }}
                            className="text-[10px] font-bold text-indigo-600 uppercase tracking-tight ml-auto hover:underline"
                        >
                            Reset Filters
                        </button>
                    )}
                </div>
            </div>

            {filteredHistory.length > 0 ? (
                <>
                    {/* Performance Trend Bar Chart */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between mb-6 px-2">
                            <div>
                                <h3 className="text-sm font-bold text-slate-800">Performance Trends</h3>
                                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tight">Overall Score History</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <TrendingUp size={14} className="text-indigo-500" />
                                <span className="text-xs font-bold text-indigo-600">Growth View</span>
                            </div>
                        </div>
                        <div className="h-40 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={filteredHistory.slice().reverse().map(h => ({
                                    date: new Date(h.interviewDate || h.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                                    score: h.overallScore
                                }))}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="date"
                                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                                        axisLine={false}
                                        tickLine={false}
                                        dy={10}
                                    />
                                    <YAxis
                                        domain={[0, 10]}
                                        hide
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                                        cursor={{ fill: '#f8fafc' }}
                                    />
                                    <Bar
                                        dataKey="score"
                                        fill="#4f46e5"
                                        radius={[4, 4, 0, 0]}
                                        barSize={30}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                        {/* Score Column */}
                        <div className="lg:col-span-4 space-y-6">
                            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm text-center">
                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
                                    {filterType === 'All' && dateFilter === 'All Time' ? 'Latest Overall Score' : `Latest Match Score`}
                                </span>
                                <div className="flex items-baseline justify-center gap-1 mb-4">
                                    <span className="text-6xl font-bold text-slate-900">{target.overallScore}</span>
                                    <span className="text-lg text-slate-300 font-medium">/ 10</span>
                                </div>
                                <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold ${statusObj.tint} ${statusObj.text}`}>
                                    <statusObj.icon size={14} />
                                    {statusObj.label}
                                </div>

                                {filterType !== 'All' && (
                                    <div className="mt-4 pt-4 border-t border-slate-50">
                                        <p className="text-xs font-bold text-slate-400 uppercase leading-relaxed">Path Average</p>
                                        <p className="text-lg font-bold text-indigo-600">{getCategoryAvg()}/10</p>
                                    </div>
                                )}

                                <div className="mt-8 pt-6 border-t border-slate-50 grid grid-cols-2 gap-2 text-sm">
                                    <div className="text-center">
                                        <p className="text-slate-400 text-xs mb-1">Type</p>
                                        <p className="text-slate-700 font-medium">{target.interviewType}</p>
                                    </div>
                                    <div className="text-center border-l border-slate-50">
                                        <p className="text-slate-400 text-xs mb-1">Date</p>
                                        <p className="text-slate-700 font-medium">{new Date(target.interviewDate || target.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                                <h3 className="text-sm font-bold text-slate-800 mb-6 px-2">Skill Geometry</h3>
                                <div className="h-60 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={skillData}>
                                            <PolarGrid stroke="#f1f5f9" />
                                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} />
                                            <Radar
                                                name="Level"
                                                dataKey="A"
                                                stroke="#4f46e5"
                                                fill="#4f46e5"
                                                fillOpacity={0.1}
                                            />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Content Column */}
                        <div className="lg:col-span-8 space-y-6">
                            {/* Simplified Rewards */}
                            <div className="grid grid-cols-3 gap-4">
                                {[
                                    { label: 'Evaluation Points', value: `+${target.pointsEarned}`, icon: Star, color: 'text-indigo-600', tint: 'bg-indigo-50' },
                                    { label: 'Vault Coins', value: `+${target.coinsEarned + (target.bonusCoins || 0) + (target.firstInterviewCoinsBonus || 0)}`, icon: Wallet, color: 'text-amber-500', tint: 'bg-amber-50' },
                                    { label: 'Bonuses', value: `+${target.bonusPoints + (target.firstInterviewBonus || 0)}`, icon: TrendingUp, color: 'text-emerald-500', tint: 'bg-emerald-50' },
                                ].map((card, i) => (
                                    <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl ${card.tint} ${card.color} flex items-center justify-center`}>
                                            <card.icon size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase leading-tight">{card.label}</p>
                                            <p className={`text-lg font-bold ${card.color}`}>{card.value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Tabs */}
                            <div className="space-y-6">
                                <div className="flex gap-1 p-1 bg-slate-100/50 rounded-xl w-fit">
                                    {[
                                        { id: 'overview', label: 'Analysis', icon: LayoutGrid },
                                        { id: 'topics', label: 'Topics', icon: List },
                                        { id: 'history', label: 'History', icon: History },
                                    ].map(tab => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === tab.id
                                                ? 'bg-white text-indigo-600 shadow-sm'
                                                : 'text-slate-400 hover:text-slate-600'
                                                }`}
                                        >
                                            <tab.icon size={15} />
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>

                                <AnimatePresence mode="wait">
                                    {activeTab === 'overview' && (
                                        <motion.div
                                            key="overview"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="grid grid-cols-1 md:grid-cols-2 gap-6"
                                        >
                                            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                                                <div>
                                                    <h4 className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                                        <CheckCircle size={12} /> Key Strengths
                                                    </h4>
                                                    <p className="text-slate-600 text-sm leading-relaxed">
                                                        {target.strengths || 'Professional delivery and interaction.'}
                                                    </p>
                                                </div>
                                                <div className="pt-6 border-t border-slate-50">
                                                    <h4 className="text-[10px] font-bold text-rose-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                                        <AlertCircle size={12} /> Improvement Areas
                                                    </h4>
                                                    <p className="text-slate-600 text-sm leading-relaxed mb-3">
                                                        {target.weaknesses || 'Continue practices for consistency.'}
                                                    </p>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {(target.weakAreas || []).map((area, i) => (
                                                            <span key={i} className="px-2 py-0.5 bg-slate-50 text-slate-400 rounded text-[9px] font-bold uppercase">
                                                                {area}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="pt-6 border-t border-slate-50">
                                                    <h4 className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                                        <Sparkles size={12} /> Trainer's Suggestions
                                                    </h4>
                                                    <p className="text-slate-600 text-sm leading-relaxed">
                                                        {target.suggestions || 'Maintain your performance and keep practicing.'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden">
                                                <div className="flex items-center justify-between mb-8">
                                                    <div>
                                                        <h4 className="text-[10px] font-medium text-indigo-500 uppercase tracking-[0.2em] mb-1 flex items-center gap-2">
                                                            <Target size={12} /> Milestone Roadmap
                                                        </h4>
                                                        <h3 className="text-xl font-semibold text-slate-800 tracking-tight">Recommended Improvement Plan</h3>
                                                    </div>
                                                    <div className="bg-indigo-50 p-3 rounded-2xl">
                                                        <Shield className="text-indigo-600" size={20} />
                                                    </div>
                                                </div>

                                                <div className="space-y-6 relative ml-1">
                                                    {/* Connecting Roadmap Line */}
                                                    <div className="absolute left-[11px] top-8 bottom-8 w-[2px] bg-slate-100" />

                                                    {((target.improvementPlan && target.improvementPlan.length > 0) ? target.improvementPlan : [
                                                        { task: 'Revise KYC & AML frameworks', completed: false },
                                                        { task: 'Practice advanced Excel functions', completed: false },
                                                        { task: 'Improve Corporate Actions knowledge', completed: false },
                                                        { task: 'Improve Journal entries', completed: false }
                                                    ]).map((step, idx) => (
                                                        <motion.div
                                                            key={idx}
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: 0.1 * idx }}
                                                            className="relative pl-10"
                                                        >
                                                            {/* Roadmap Marker */}
                                                            <div className={`absolute left-0 top-1.5 w-6 h-6 rounded-full border-4 flex items-center justify-center z-10 transition-all duration-300 ${step.completed
                                                                ? 'bg-emerald-100 border-white shadow-[0_0_0_2px_#10b981]'
                                                                : 'bg-white border-slate-100 shadow-sm'
                                                                }`}>
                                                                {step.completed && <Check size={10} className="text-emerald-600 font-medium" />}
                                                            </div>

                                                            <div className={`p-4 rounded-2xl border transition-all ${step.completed
                                                                ? 'bg-slate-50/50 border-slate-100 opacity-60'
                                                                : 'bg-white border-slate-100 hover:border-indigo-200 hover:shadow-md hover:-translate-y-0.5'
                                                                }`}>
                                                                <div className="flex items-center justify-between">
                                                                    <span className={`text-sm font-medium ${step.completed ? 'text-slate-400' : 'text-slate-700'}`}>
                                                                        {step.task}
                                                                    </span>
                                                                    {!step.completed && idx === 0 && (
                                                                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[9px] font-medium uppercase rounded-full">Next Step</span>
                                                                    )}
                                                                </div>
                                                                {!step.completed && (
                                                                    <div className="mt-2 flex items-center gap-1.5">
                                                                        <div className="w-full h-1 bg-slate-50 rounded-full overflow-hidden">
                                                                            <div className="w-1/3 h-full bg-indigo-200 animate-pulse" />
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </motion.div>
                                                    ))}
                                                </div>

                                                <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                                                            <TrendingUp size={16} className="text-emerald-600" />
                                                        </div>
                                                        <div>
                                                            <div className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Mastery Level</div>
                                                            <div className="text-xs font-semibold text-slate-700">Level 2 Career Candidate</div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-[20px] font-semibold text-indigo-600 leading-none">
                                                            {Math.round(((target.improvementPlan || []).filter(s => s.completed).length / (target.improvementPlan?.length || 4)) * 100)}%
                                                        </div>
                                                        <div className="text-[9px] text-slate-400 font-medium uppercase">Plan Velocity</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {activeTab === 'topics' && (
                                        <motion.div
                                            key="topics"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm"
                                        >
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                {target.topicScores.map((topic, idx) => (
                                                    <div key={idx} className="p-4 bg-slate-50 rounded-2xl">
                                                        <div className="flex justify-between items-center mb-3">
                                                            <span className="font-bold text-slate-700 text-xs">{topic.topic}</span>
                                                            <span className="text-sm font-bold text-indigo-600">{topic.score}</span>
                                                        </div>
                                                        <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                                                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${topic.score * 10}%` }}></div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}

                                    {activeTab === 'history' && (
                                        <motion.div
                                            key="history"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="space-y-3"
                                        >
                                            {filteredHistory.map((h) => (
                                                <div
                                                    key={h._id}
                                                    onClick={() => { setSelectedFeedback(h); setActiveTab('overview'); }}
                                                    className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:border-indigo-200 transition-all cursor-pointer"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="text-lg font-bold text-slate-400">
                                                            {h.overallScore}
                                                        </div>
                                                        <div>
                                                            <h4 className="text-sm font-bold text-slate-800">{h.interviewType}</h4>
                                                            <p className="text-[10px] font-medium text-slate-400 uppercase">{new Date(h.interviewDate || h.createdAt).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                    <ArrowRight size={16} className="text-slate-300" />
                                                </div>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="bg-white p-20 rounded-[2.5rem] border border-slate-100 shadow-sm text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mx-auto mb-6">
                        <Rocket size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">No {filterType} Interviews Yet</h3>
                    <p className="text-slate-500 max-w-sm mx-auto">
                        Attend your first {filterType} mock interview to unlock detailed path analysis.
                    </p>
                    <button onClick={() => setFilterType('All')} className="mt-6 text-indigo-600 font-bold text-sm hover:underline">
                        View Overall History
                    </button>
                </div>
            )}
        </div>
    );
};

export default MockInterviewDashboard;
