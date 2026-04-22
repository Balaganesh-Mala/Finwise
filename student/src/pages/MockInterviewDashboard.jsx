import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    TrendingUp, Award, Star,
    CheckCircle, Target,
    Shield, ArrowRight, History,
    LayoutGrid, List, Calendar, UserCheck,
    Zap, Clock, AlertCircle, Sparkles, BookOpen,
    Info, X, Trophy, Megaphone, Check, Wallet, Rocket, Youtube, Video,
    ArrowLeft, Pause, Play, Volume2, VolumeX, Maximize2, Medal,
    FileDown, Download
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Radar, RadarChart,
    PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import axios from 'axios';
import toast from 'react-hot-toast';
import { subscribeToPush } from '../utils/pushNotifications';

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
    const [selectedAttempt, setSelectedAttempt] = useState(null);
    const [upcomingInterviews, setUpcomingInterviews] = useState([]);

    // YouTube Custom Player State
    const [ytReady, setYtReady] = useState(false);
    const [ytPlaying, setYtPlaying] = useState(false);
    const [ytCurrentTime, setYtCurrentTime] = useState(0);
    const [ytDuration, setYtDuration] = useState(0);
    const [ytVolume, setYtVolume] = useState(80);
    const [ytMuted, setYtMuted] = useState(false);
    const ytPlayerRef = useRef(null);
    const ytPollRef = useRef(null);
    const playerWrapRef = useRef(null);

    useEffect(() => {
        fetchPerformance();
        fetchDbSettings();

        const user = JSON.parse(localStorage.getItem('studentUser'));
        if (user) {
            fetchUpcomingInterviews(user._id);
        }
    }, []);

    const fetchUpcomingInterviews = async (studentId) => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const token = localStorage.getItem('studentToken');

            const res = await axios.get(`${API_URL}/api/interview-schedules/schedules?studentId=${studentId}&status=Scheduled`, {
                headers: token ? {
                    Authorization: `Bearer ${token}`
                } : {}
            });
            if (res.data.success) {
                setUpcomingInterviews(res.data.data);
            }
        } catch (error) {
            console.error("Error fetching schedules:", error);
        }
    };

    const handleDownloadReport = async (attempt) => {
        const loadingToast = toast.loading("Generating professional report...");
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const token = localStorage.getItem('studentToken');

            const response = await axios({
                url: `${API_URL}/api/mock-interviews/download/${attempt._id}`,
                method: 'GET',
                responseType: 'blob'
            });

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Interview_Report_${attempt.interviewType}_${new Date(attempt.interviewDate || attempt.createdAt).toLocaleDateString('en-GB')}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            toast.success("Professional report downloaded!", { id: loadingToast });
        } catch (error) {
            console.error("PDF Download Error:", error);
            toast.error("Failed to generate report. Please try again.", { id: loadingToast });
        }
    };

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

    // YouTube IFrame API scripts
    useEffect(() => {
        if (!document.getElementById('yt-api-script')) {
            const s = document.createElement('script');
            s.id = 'yt-api-script';
            s.src = 'https://www.youtube.com/iframe_api';
            document.head.appendChild(s);
        }
    }, []);

    const getYouTubeVideoId = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const destroyYtPlayer = useCallback(() => {
        clearInterval(ytPollRef.current);
        if (ytPlayerRef.current) {
            try { ytPlayerRef.current.destroy(); } catch (_) { }
            ytPlayerRef.current = null;
        }
        setYtReady(false);
        setYtPlaying(false);
        setYtCurrentTime(0);
        setYtDuration(0);
    }, []);

    useEffect(() => {
        const videoUrl = selectedAttempt?.recordingUrl;
        if (!videoUrl) return;
        const isYT = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');
        if (!isYT) return;

        destroyYtPlayer();
        let attemptsCount = 0;

        const tryInit = () => {
            const container = document.getElementById('yt-player-container');
            if (!container || !window.YT?.Player) {
                if (attemptsCount++ < 30) setTimeout(tryInit, 300);
                return;
            }
            const videoId = getYouTubeVideoId(videoUrl);
            if (!videoId) return;

            ytPlayerRef.current = new window.YT.Player('yt-player-container', {
                width: '100%',
                height: '100%',
                videoId,
                playerVars: {
                    controls: 0,
                    modestbranding: 1,
                    rel: 0,
                    playsinline: 1,
                    iv_load_policy: 3,
                    origin: window.location.origin,
                },
                events: {
                    onReady: (e) => {
                        setYtReady(true);
                        setYtDuration(e.target.getDuration());
                    },
                    onStateChange: (e) => {
                        const playing = e.data === window.YT?.PlayerState?.PLAYING;
                        setYtPlaying(playing);
                        const d = e.target.getDuration?.() || 0;
                        if (d > 0) setYtDuration(d);
                    },
                },
            });
        };

        const t = setTimeout(tryInit, 400);
        return () => {
            clearTimeout(t);
            destroyYtPlayer();
        };
    }, [selectedAttempt?._id, destroyYtPlayer]);

    useEffect(() => {
        if (ytPlaying) {
            ytPollRef.current = setInterval(() => {
                const ct = ytPlayerRef.current?.getCurrentTime?.();
                if (ct !== undefined) setYtCurrentTime(ct);
            }, 1000);
        } else {
            clearInterval(ytPollRef.current);
        }
        return () => clearInterval(ytPollRef.current);
    }, [ytPlaying]);

    const ytFormatTime = (s) => {
        if (!s || isNaN(s)) return '0:00';
        const m = Math.floor(s / 60);
        const sec = Math.floor(s % 60);
        return `${m}:${sec.toString().padStart(2, '0')}`;
    };

    const ytTogglePlay = () => {
        if (!ytPlayerRef.current) return;
        if (ytPlaying) ytPlayerRef.current.pauseVideo();
        else ytPlayerRef.current.playVideo();
    };

    const ytSeek = (e) => {
        const v = parseFloat(e.target.value);
        setYtCurrentTime(v);
        ytPlayerRef.current?.seekTo(v, true);
    };

    const ytToggleMute = () => {
        if (ytMuted) {
            ytPlayerRef.current?.unMute();
            ytPlayerRef.current?.setVolume(ytVolume || 80);
            setYtMuted(false);
        } else {
            ytPlayerRef.current?.mute();
            setYtMuted(true);
        }
    };

    const ytFullscreen = () => {
        const el = playerWrapRef.current;
        if (!el) return;
        if (document.fullscreenElement) document.exitFullscreen();
        else el.requestFullscreen?.();
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
            const interviewDateStr = new Date(dateToCompare).toISOString().split('T')[0];
            return matchesType && interviewDateStr === customDate;
        }

        return matchesType;
    });

    const target = selectedFeedback && filteredHistory.find(h => h._id === selectedFeedback._id)
        ? selectedFeedback
        : filteredHistory[0];

    const getStatusInfo = (statusStr) => {
        const s = (statusStr || '').toLowerCase();
        if (s.includes('ready')) return { label: 'Job Ready', color: 'bg-emerald-500', text: 'text-emerald-500', icon: Trophy, tint: 'bg-emerald-50' };
        if (s.includes('highly')) return { label: 'Highly Capable', color: 'bg-blue-500', text: 'text-blue-500', icon: Medal, tint: 'bg-blue-50' };
        if (s.includes('capable')) return { label: 'Capable', color: 'bg-indigo-500', text: 'text-indigo-500', icon: Award, tint: 'bg-indigo-50' };
        if (s.includes('critical')) return { label: 'Critical Risk', color: 'bg-rose-500', text: 'text-rose-500', icon: AlertCircle, tint: 'bg-rose-50' };
        return { label: 'Needs Improvement', color: 'bg-amber-500', text: 'text-amber-500', icon: Zap, tint: 'bg-amber-50' };
    };

    const wallet = performance.wallet;

    if (selectedAttempt) {
        // --- ATTEMPT DETAIL VIEW ---
        const sObj = getStatusInfo(selectedAttempt.status);
        const sData = [
            { subject: 'Comm', A: (selectedAttempt.communicationScore || 0) * 10 },
            { subject: 'Tech', A: (selectedAttempt.technicalScore || 0) * 10 },
            { subject: 'Conf', A: (selectedAttempt.confidenceScore || 0) * 10 },
            { subject: 'Logic', A: (selectedAttempt.problemSolvingScore || 0) * 10 },
            { subject: 'Body', A: (selectedAttempt.bodyLanguageScore || 0) * 10 },
            { subject: 'Prac', A: (selectedAttempt.practicalScore || 0) * 10 },
        ];

        return (
            <div className="max-w-5xl mx-auto px-4 pb-12 md:pb-20 animate-in fade-in slide-in-from-bottom-2 duration-400">
                {/* Responsive Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 md:mb-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSelectedAttempt(null)}
                            className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold text-sm transition-all w-fit group"
                        >
                            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                            Back to Attempts
                        </button>
                        <button
                            onClick={() => handleDownloadReport(selectedAttempt)}
                            className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-indigo-600 hover:text-white transition-all shadow-sm shadow-indigo-100"
                        >
                            <FileDown size={14} />
                            Download Report
                        </button>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-100 p-1 pr-3 rounded-full w-fit">
                        <div className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${sObj.tint} ${sObj.text}`}>
                            {selectedAttempt.interviewType}
                        </div>
                        <span className="text-[11px] font-bold text-slate-500">
                            {new Date(selectedAttempt.interviewDate || selectedAttempt.createdAt).toLocaleDateString('en-GB')}
                        </span>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1 space-y-6 overflow-hidden">
                        {/* Video Player (No border in fullscreen + Progress Fill) */}
                        <div
                            ref={playerWrapRef}
                            className="bg-black rounded-3xl overflow-hidden shadow-lg border border-slate-200 aspect-video relative group 
                                       [&:-webkit-full-screen]:rounded-none [&:-webkit-full-screen]:border-none 
                                       [&:fullscreen]:rounded-none [&:fullscreen]:border-none"
                        >
                            {selectedAttempt.recordingUrl && (selectedAttempt.recordingUrl.includes('youtube.com') || selectedAttempt.recordingUrl.includes('youtu.be')) ? (
                                <>
                                    <div className="absolute top-1/2 left-0 w-full h-[300%] -translate-y-1/2 pointer-events-none z-0">
                                        <div id="yt-player-container" className="w-full h-full" />
                                    </div>
                                    <div className="absolute inset-0 z-10 cursor-pointer" onClick={ytTogglePlay} />
                                    {!ytPlaying && (
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 bg-black/10 transition-opacity">
                                            <div className="absolute w-28 h-28 rounded-full bg-orange-500/20 animate-ping"></div>
                                            <div className="w-20 h-20 rounded-full bg-orange-500 flex items-center justify-center shadow-[0_15px_40px_rgba(249,115,22,0.4)] transition-all group-hover:scale-110">
                                                <Play size={32} className="text-white ml-1 fill-white" />
                                            </div>
                                        </div>
                                    )}
                                    <div className="absolute bottom-0 left-0 right-0 z-20 bg-slate-900/80 backdrop-blur-sm p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="flex items-center gap-5">
                                            <button onClick={ytTogglePlay} className="text-white"><Play size={16} /></button>
                                            <div className="flex-1 flex items-center">
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max={ytDuration || 100}
                                                    value={ytCurrentTime}
                                                    onChange={ytSeek}
                                                    style={{
                                                        background: `linear-gradient(to right, #6366f1 ${(ytCurrentTime / (ytDuration || 100)) * 100}%, #334155 ${(ytCurrentTime / (ytDuration || 100)) * 100}%)`
                                                    }}
                                                    className="w-full h-1 rounded-full appearance-none cursor-pointer accent-white"
                                                />
                                            </div>
                                            <button onClick={ytFullscreen} className="text-white"><Maximize2 size={16} /></button>
                                        </div>
                                    </div>
                                </>
                            ) : selectedAttempt.recordingUrl ? (
                                <video src={selectedAttempt.recordingUrl} controls className="w-full h-full" />
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 gap-2 bg-slate-50">
                                    <Youtube size={32} className="opacity-20" />
                                    <span className="text-[10px] uppercase font-bold tracking-widest opacity-40">Recording Unavailable</span>
                                </div>
                            )}
                        </div>

                        {/* Analysis Card */}
                        <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
                            <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                                <h3 className="text-sm md:text-base font-bold text-slate-800">Performance Feedback</h3>
                                <div className="text-xl md:text-2xl font-black text-indigo-600">{selectedAttempt.overallScore}<span className="text-xs text-slate-400 font-bold ml-1">/10</span></div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1 block">Strengths</label>
                                        <p className="text-xs text-slate-600 leading-relaxed font-medium">{selectedAttempt.strengths}</p>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1 block">Improvement Areas</label>
                                        <p className="text-xs text-slate-600 leading-relaxed font-medium">{selectedAttempt.weaknesses}</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 italic">
                                        <label className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1 block not-italic">Verdict</label>
                                        <p className="text-xs text-slate-700 font-bold">"{selectedAttempt.overallRemark}"</p>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Trainer Note</label>
                                        <p className="text-xs text-slate-600 font-medium italic">{selectedAttempt.suggestions || 'Keep up the good work.'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Topic Analysis (Clean 2-Column Grid) */}
                        {(selectedAttempt.topicScores || selectedAttempt.topics) && (selectedAttempt.topicScores || selectedAttempt.topics).length > 0 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-600">
                                <div className="flex items-center gap-2 px-2">
                                    <h3 className="text-[10px] md:text-xs font-semibold text-slate-400 uppercase tracking-[0.2em]">Subject Proficiency</h3>
                                    <div className="h-px flex-1 bg-slate-100" />
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5">
                                    {(selectedAttempt.topicScores || selectedAttempt.topics).map((t, idx) => {
                                        const scoreValue = parseFloat(t.score) || 0;
                                        return (
                                            <div key={idx} className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col gap-4">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs md:text-sm font-semibold text-slate-700 tracking-tight">{t.topic}</span>
                                                    <div className="px-2.5 py-1 bg-orange-50/50 border border-orange-100 rounded-full text-[10px] md:text-[11px] font-medium text-orange-600">
                                                        <span>{scoreValue}</span><span className="text-orange-300 ml-0.5">/10</span>
                                                    </div>
                                                </div>
                                                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                                    <div className="h-full bg-orange-500 transition-all duration-1000" style={{ width: `${(scoreValue / 10) * 100}%` }} />
                                                </div>
                                                {t.remark && (
                                                    <div className="mt-1 p-3 md:p-4 bg-slate-50/50 rounded-xl border border-slate-50">
                                                        <p className="text-[10px] md:text-[11px] text-slate-500 font-normal italic leading-relaxed text-center">"{t.remark}"</p>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar Stats */}
                    <div className="lg:w-80 space-y-6">
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Skill Profile</h4>
                            <div className="h-48 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={sData}>
                                        <PolarGrid stroke="#f1f5f9" />
                                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 700 }} />
                                        <Radar name="Score" dataKey="A" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.15} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-slate-900 p-6 rounded-2xl shadow-xl space-y-4">
                            <h4 className="flex items-center gap-2 text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                                <Target size={14} /> Improvement Plan
                            </h4>
                            <div className="space-y-3">
                                {selectedAttempt.improvementPlanText ? (
                                    <div className="text-[12px] text-slate-300 leading-relaxed whitespace-pre-wrap font-medium">
                                        {selectedAttempt.improvementPlanText}
                                    </div>
                                ) : (selectedAttempt.improvementPlan || []).map((step, idx) => (
                                    <div key={idx} className="flex items-center gap-3 p-2 bg-white/5 rounded-lg">
                                        <div className="w-5 h-5 rounded-md bg-indigo-500 text-[10px] font-black text-white flex items-center justify-center">{idx + 1}</div>
                                        <span className="text-xs font-bold text-slate-200">{step.task}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="pt-4 mt-4 border-t border-white/10 flex justify-between items-end">
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">XP Earned</p>
                                    <p className="text-xl font-black text-white">+{selectedAttempt.pointsEarned}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-indigo-400 leading-none">Status</p>
                                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mt-1">Completed</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 space-y-6 md:space-y-8 pb-20 md:pb-24 animate-in fade-in duration-500">

            {/* Overview Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 pb-3 md:pb-4 border-b border-slate-100">
                <div className="space-y-1">
                    <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                        Mock Performance <Sparkles className="text-indigo-600" size={18} />
                    </h1>
                    <p className="text-slate-500 text-[10px] md:text-xs font-medium">Track your growth and career readiness status.</p>
                </div>
                <div className="flex items-center gap-2 md:gap-3 bg-white p-1.5 md:p-2 rounded-xl md:rounded-2xl border border-slate-100 shadow-sm w-fit">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-indigo-600 rounded-lg md:rounded-xl flex items-center justify-center text-white font-black text-xs md:text-sm">
                        {wallet.level}
                    </div>
                    <div className="pr-1 md:pr-2">
                        <div className="flex gap-2.5 text-[10px] md:text-xs font-black text-slate-700 uppercase tracking-tighter">
                            <span>{wallet.totalPoints} pts</span><span className="text-amber-500">🪙 {wallet.totalCoins}</span>
                        </div>
                        <div className="w-16 md:w-20 bg-slate-100 h-0.5 md:h-1 rounded-full mt-1 overflow-hidden">
                            <div className="h-full bg-indigo-600" style={{ width: `${(wallet.totalPoints % 250) / 2.5}%` }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2 -mx-4 px-4 no-scrollbar">
                {['All', ...(dbSettings.interviewTypes || ['HR', 'Tech', 'Mixed'])].map(type => (
                    <button
                        key={type}
                        onClick={() => { setFilterType(type); setSelectedFeedback(null); }}
                        className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider flex-shrink-0 transition-all border ${filterType === type
                            ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                            : 'bg-white text-slate-500 border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                    >
                        {type}
                    </button>
                ))}
            </div>

            {filteredHistory.length > 0 ? (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Growth Trend</h3>
                                <TrendingUp size={16} className="text-indigo-500" />
                            </div>
                            <div className="h-40 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={filteredHistory.slice().reverse().map(h => ({
                                        date: new Date(h.interviewDate || h.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                                        score: h.overallScore
                                    }))}>
                                        <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 700 }} axisLine={false} tickLine={false} />
                                        <Bar dataKey="score" fill="#4f46e5" radius={[4, 4, 4, 4]} barSize={20} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <div className="bg-slate-900 p-6 rounded-2xl shadow-xl flex flex-col items-center justify-center text-center">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Latest Score</p>
                            <div className="text-6xl font-black text-white leading-tight">{target.overallScore}</div>
                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-1">{getStatusInfo(target.status).label}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                        {filteredHistory.map((h, idx) => {
                            const attemptNum = filteredHistory.length - idx;
                            const d = new Date(h.interviewDate || h.createdAt);
                            return (
                                <button
                                    key={h._id}
                                    onClick={() => setSelectedAttempt(h)}
                                    className="group relative bg-white rounded-2xl border border-slate-100 p-5 md:p-6 text-left transition-all hover:border-indigo-600 hover:shadow-lg hover:shadow-indigo-500/5"
                                >
                                    <div className="flex justify-between items-start mb-3 md:mb-4">
                                        <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                            <History size={16} />
                                        </div>
                                        <div className="text-lg md:text-xl font-black text-slate-800 group-hover:text-indigo-600">{h.overallScore}<span className="text-[10px] text-slate-300 ml-0.5">/10</span></div>
                                    </div>
                                    <h3 className="text-sm md:text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                                        {attemptNum === 1 ? '1st' : attemptNum === 2 ? '2nd' : attemptNum === 3 ? '3rd' : `${attemptNum}th`} Attempt
                                    </h3>
                                    <div className="mt-2.5 md:mt-3 flex items-center gap-3 text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        <span className="flex items-center gap-1.5"><Calendar size={11} /> {d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                                        <span className="flex items-center gap-1.5"><Clock size={11} /> {h.interviewType}</span>
                                    </div>
                                    <div className="absolute top-5 right-5 md:top-6 md:right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ArrowRight size={16} className="text-indigo-600" />
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div className="bg-slate-50/50 p-20 rounded-[3rem] border border-dashed border-slate-200 text-center">
                    <Rocket size={40} className="mx-auto text-slate-200 mb-6" />
                    <h3 className="font-bold text-slate-800 mb-1">No sessions found</h3>
                    <p className="text-slate-500 text-xs">Start your interview prep to see detailed analysis.</p>
                </div>
            )}

            <AnimatePresence>
                {showRewardGuide && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowRewardGuide(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-xl bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-200">
                            <div className="p-10">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Reward Structure</h3>
                                    <button onClick={() => setShowRewardGuide(false)} className="p-3 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors"><X size={20} /></button>
                                </div>
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-6 bg-indigo-50 border border-indigo-100 rounded-3xl group transition-all">
                                            <Star className="text-indigo-600 mb-4 group-hover:rotate-12" />
                                            <p className="text-[10px] font-black text-indigo-400 uppercase mb-1">Pass Score (6+)</p>
                                            <p className="text-xl font-bold text-indigo-900">+30 Coins</p>
                                        </div>
                                        <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-3xl group transition-all">
                                            <Award className="text-emerald-600 mb-4 group-hover:scale-110" />
                                            <p className="text-[10px] font-black text-emerald-400 uppercase mb-1">Elite Score (8+)</p>
                                            <p className="text-xl font-bold text-indigo-900">+50 Coins</p>
                                        </div>
                                    </div>
                                    <div className="p-6 bg-amber-50 border border-amber-100 rounded-3xl flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] font-black text-amber-500 uppercase mb-1">Consistency Bonus</p>
                                            <p className="text-sm font-bold text-amber-900">Improved over last session</p>
                                        </div>
                                        <p className="text-xl font-bold text-amber-900">+25🪙</p>
                                    </div>
                                    <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-4 opacity-50">Rewards are auto-calculated on submission</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MockInterviewDashboard;
