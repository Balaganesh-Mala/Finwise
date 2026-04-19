import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Keyboard, Trophy, Target, Clock, Zap, Volume2, VolumeX,
    ChevronDown, RotateCcw, TrendingUp, RefreshCw, Play, History,
    Hand as HandIcon, BarChart2, Award, ChevronRight, Monitor
} from 'lucide-react';
import TypingKeyboard from '../components/Keyboard/TypingKeyboard';
import TypingHeatmap from '../components/TypingHeatmap';
import {
    calcWpm, calcAccuracy, compareText,
    recordError, formatTime, calcProgress, topErrors
} from '../components/TypingEngine';
import { submitResult, getHistory, getLastResult } from '../api/typingApi';
import toast, { Toaster } from 'react-hot-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { typingLessons as LESSONS } from '../data/typingLessons';

// Lesson data now imported from ../data/typingLessons.js

// ─── Audio ────────────────────────────────────────────────────────────────────
let _ctx = null;
const getAudio = () => {
    if (!_ctx) {
        try { _ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch { return null; }
    }
    return _ctx;
};
const playBeep = (type = 'click') => {
    const ctx = getAudio();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    if (type === 'error') {
        osc.type = 'sawtooth'; osc.frequency.setValueAtTime(160, ctx.currentTime);
        gain.gain.setValueAtTime(0.09, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        osc.start(); osc.stop(ctx.currentTime + 0.1);
    } else {
        osc.type = 'sine'; osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        osc.start(); osc.stop(ctx.currentTime + 0.05);
    }
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color = 'text-indigo-600', bg = 'bg-indigo-50' }) => (
    <div className={`flex items-center gap-3 ${bg} rounded-xl px-4 py-3 min-w-[110px]`}>
        <div className={`${color}`}><Icon size={20} /></div>
        <div>
            <div className={`text-lg font-extrabold leading-none ${color}`}>{value}</div>
            <div className="text-[11px] text-gray-400 mt-0.5">{label}</div>
        </div>
    </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const TypingTrainer = () => {
    // ── State ──────────────────────────────────────────────────────────────────
    const [category, setCategory] = useState('beginner');
    const [lessonIdx, setLessonIdx] = useState(0);
    const [duration, setDuration] = useState(60);
    const [mode, setMode] = useState('time');    // 'time' | 'words'
    const [text, setText] = useState('');
    const [input, setInput] = useState('');
    const [startTime, setStartTime] = useState(null);
    const [timeLeft, setTimeLeft] = useState(60);
    const [isActive, setIsActive] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [stats, setStats] = useState({ wpm: 0, accuracy: 100, correct: 0, incorrect: 0 });
    const [errorMap, setErrorMap] = useState({});
    const [errorKey, setErrorKey] = useState('');     // red flash on keyboard
    const [showKeyboard, setShowKeyboard] = useState(true);
    const [showHands, setShowHands] = useState(true);
    const [soundOn, setSoundOn] = useState(true);
    const [history, setHistory] = useState([]);
    const [lastResult, setLastResult] = useState(null);
    const [showHistory, setShowHistory] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [user, setUser] = useState(null);
    const [saving, setSaving] = useState(false);
    const [lastSubmissionResult, setLastSubmissionResult] = useState(null);
    const [completedLessons, setCompletedLessons] = useState(new Set());
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1024);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const inputRef = useRef(null);
    const containerRef = useRef(null);

    // Derived
    const nextChar = text[input.length] || '';
    const progress = calcProgress(input.length, text.length);
    const handsVis = showHands && category === 'beginner' && !isMobile;
    const keyboardVis = showKeyboard && category !== 'advanced' && !isMobile;

    // ── Init ──────────────────────────────────────────────────────────────────
    useEffect(() => {
        const u = JSON.parse(localStorage.getItem('studentUser') || 'null');
        setUser(u);
        if (u?._id) loadHistory(u._id);
    }, []);

    useEffect(() => { loadLesson(); }, [category, lessonIdx]);
    useEffect(() => { setTimeLeft(duration); }, [duration]);

    const loadLesson = () => {
        const lessons = LESSONS[category] || LESSONS.beginner;
        const l = lessons[lessonIdx % lessons.length];
        setText(l.content);
        resetTest();
    };

    const loadHistory = async (id) => {
        try {
            const data = await getHistory(id, { limit: 100 });
            setHistory(data.sessions || []);
            
            // Extract completed lessons (accuracy >= 95 AND wpm >= 35)
            const completed = new Set();
            (data.sessions || []).forEach(s => {
                if (s.accuracy >= 95 && s.wpm >= 35) {
                    completed.add(`${s.mode}-${s.lessonTitle}`);
                }
            });
            setCompletedLessons(completed);
        } catch { /* silent */ }
    };

    // ── Timer ──────────────────────────────────────────────────────────────────
    useEffect(() => {
        let timer;
        if (isActive && !isFinished && mode === 'time') {
            timer = setInterval(() => {
                setTimeLeft(t => {
                    if (t <= 1) { finishTest(); return 0; }
                    return t - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [isActive, isFinished, mode]);

    // ── Live Stats ─────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!isActive || !startTime) return;
        const { chars, correct, incorrect } = compareText(text, input);
        const elapsed = Date.now() - startTime;
        setStats({
            wpm: calcWpm(correct, elapsed),
            accuracy: calcAccuracy(correct, correct + incorrect),
            correct,
            incorrect,
        });
    }, [input, isActive, startTime, text]);

    // ── Reset ──────────────────────────────────────────────────────────────────
    const resetTest = useCallback(() => {
        setInput(''); setStartTime(null); setIsActive(false);
        setIsFinished(false); setShowResults(false);
        setTimeLeft(mode === 'time' ? duration : 0);
        setStats({ wpm: 0, accuracy: 100, correct: 0, incorrect: 0 });
        setErrorMap({}); setErrorKey('');
        setTimeout(() => inputRef.current?.focus(), 50);
    }, [mode, duration]);

    // ── Finish ────────────────────────────────────────────────────────────────
    const finishTest = useCallback(async () => {
        if (isFinished) return;
        setIsActive(false); setIsFinished(true); setShowResults(true);

        // Final stats snapshot
        const { correct, incorrect } = compareText(text, input);
        const elapsed = Date.now() - (startTime || Date.now());
        const finalWpm = calcWpm(correct, elapsed);
        const finalAcc = calcAccuracy(correct, correct + incorrect);

        // Save to backend
        if (user?._id) {
            setSaving(true);
            try {
                const response = await submitResult({
                    studentId: user._id,
                    mode: category,
                    lessonTitle: LESSONS[category][lessonIdx % LESSONS[category].length].title,
                    wpm: finalWpm,
                    accuracy: finalAcc,
                    duration: mode === 'time' ? duration : Math.round(elapsed / 1000),
                    correctChars: correct,
                    incorrectChars: incorrect,
                    errors: errorMap,
                });
                
                setLastSubmissionResult(response);
                
                if (response.pointsAwarded > 0) {
                    toast.success(`🎉 +${response.pointsAwarded} Points Earned!`, { duration: 4000 });
                } else if (response.accuracyThresholdMet && !response.isFirstCompletion) {
                    toast.success(`✅ Lesson Refined! ${finalWpm} WPM`, { icon: '👏' });
                } else if (response.accuracyThresholdMet) {
                   toast.success('✅ Target Accuracy Met!');
                }

                if (user._id) loadHistory(user._id);
            } catch { toast.error('Could not save result'); }
            finally { setSaving(false); }
        }
    }, [isFinished, text, input, startTime, user, category, lessonIdx, duration, mode, errorMap]);

    // ── Keyboard Handler (Refactored for Mobile Compatibility) ──
    const handleInputChange = (e) => {
        if (isFinished) return;
        const val = e.target.value;
        const prevLen = input.length;
        const newLen = val.length;

        if (!isActive) { setIsActive(true); setStartTime(Date.now()); }

        // Backspace handling
        if (newLen < prevLen) {
            setInput(val);
            return;
        }

        // New character entry
        const diff = val.length - prevLen;
        if (diff <= 0) return;

        // Process each new character (usually just one)
        let updatedInput = input;
        for (let i = 0; i < diff; i++) {
            const char = val[prevLen + i];
            const expected = text[updatedInput.length];
            if (!expected) break;

            const isCorrect = char === expected;
            if (soundOn) playBeep(isCorrect ? 'click' : 'error');

            if (!isCorrect) {
                setErrorMap(prev => recordError(prev, expected));
                setErrorKey(expected);
                setTimeout(() => setErrorKey(''), 350);
            }
            updatedInput += char;
        }

        setInput(updatedInput);

        // Word mode: end when all text is typed
        if (mode === 'words' && updatedInput.length >= text.length) {
            finishTest();
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Tab') e.preventDefault();
        if (e.key === 'Enter' && !isActive && !isFinished) resetTest();
    };

    // ── Render chars ──────────────────────────────────────────────────────────
    const renderChars = () =>
        text.split('').map((char, i) => {
            let cls = 'text-gray-300 ';
            if (i === input.length) cls = 'text-gray-700 bg-indigo-100 rounded px-px animate-pulse ';
            else if (i < input.length) cls = input[i] === char ? 'text-green-600 ' : 'text-red-500 bg-red-50 rounded ';
            return <span key={i} className={`${cls} ${isMobile ? 'text-lg' : 'text-xl'}`}>{char}</span>;
        });

    // ── History chart data ────────────────────────────────────────────────────
    const chartData = [...history].reverse().slice(-15).map((h, i) => ({
        session: i + 1,
        wpm: h.wpm,
        accuracy: h.accuracy,
    }));

    // ── Results modal ─────────────────────────────────────────────────────────
    const ResultsModal = () => {
        const accuracyColor = stats.accuracy >= 95 ? '#10b981' : stats.accuracy >= 90 ? '#f59e0b' : '#ef4444';
        const strokeDasharray = 2 * Math.PI * 55; // radius 55
        const strokeDashoffset = strokeDasharray * ((100 - stats.accuracy) / 100);

        return (
            <AnimatePresence>
                {showResults && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/10 backdrop-blur-md px-4"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden p-8 relative border border-slate-100"
                            initial={{ scale: 0.98, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }}
                        >
                            {/* Header */}
                            <div className="flex items-center gap-4 mb-6 border-b border-slate-50 pb-4">
                                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                                    <Activity size={16} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-slate-900 leading-tight">Session Summary</h2>
                                </div>
                                <div className="ml-auto text-right">
                                    <span className="text-[9px] font-black text-indigo-500 uppercase tracking-[0.2em] bg-indigo-50 px-2 py-1 rounded-md">{category} Level</span>
                                </div>
                            </div>

                            {/* Hero Performance Section */}
                            <div className="flex flex-col md:flex-row items-center justify-around gap-8 mb-8">
                                {/* Accuracy Circle */}
                                <div className="relative w-32 h-32 flex items-center justify-center">
                                    <svg className="w-full h-full -rotate-90">
                                        <circle cx="64" cy="64" r="55" fill="none" stroke="#f1f5f9" strokeWidth="5" />
                                        <motion.circle 
                                            cx="64" cy="64" r="55" fill="none" stroke={accuracyColor} strokeWidth="5" strokeLinecap="round" 
                                            initial={{ strokeDashoffset: strokeDasharray }}
                                            animate={{ strokeDashoffset }}
                                            style={{ strokeDasharray }}
                                            transition={{ duration: 1.5, ease: 'easeOut', delay: 0.2 }}
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-3xl font-bold text-slate-800 tracking-tighter">{stats.accuracy}%</span>
                                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Accuracy</span>
                                    </div>
                                </div>

                                {/* Speed + Time Info */}
                                <div className="flex flex-col md:flex-row gap-4 flex-1">
                                    <div className="flex-1">
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1 text-center md:text-left">Net Speed</p>
                                        <div className="bg-slate-50 p-3 rounded-xl flex items-baseline justify-center md:justify-start gap-2 border border-slate-100/50">
                                            <span className="text-3xl font-mono font-semibold text-slate-800 leading-none">{stats.wpm}</span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">WPM</span>
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1 text-center md:text-left">Duration</p>
                                        <div className="bg-slate-50 p-3 rounded-xl flex items-baseline justify-center md:justify-start gap-2 border border-slate-100/50">
                                            <span className="text-3xl font-mono font-semibold text-slate-800 leading-none">
                                                {mode === 'time' ? duration : Math.round((Date.now() - (startTime || Date.now())) / 1000)}
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">SEC</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Analysis Section */}
                            <div className="mb-8">
                                <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full" /> Performance Profile
                                </h4>
                                <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm overflow-x-auto">
                                    <TypingHeatmap errorMap={errorMap} hideHeader hideMissedKeys />
                                </div>
                            </div>

                            {/* Action Strip */}
                            <div className="flex gap-3 items-center">
                                <button
                                    onClick={() => { setShowResults(false); resetTest(); }}
                                    className="px-6 py-3.5 bg-slate-50 hover:bg-slate-100 text-slate-600 font-semibold text-xs rounded-xl transition-all flex items-center gap-2 active:scale-95"
                                >
                                    <RotateCcw size={16} /> Retry
                                </button>
                                <button
                                    onClick={() => {
                                        setLessonIdx(p => (p + 1) % LESSONS[category].length);
                                        setShowResults(false);
                                    }}
                                    className="flex-1 py-3.5 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2 active:scale-95"
                                >
                                    Continue to Next Round <ChevronRight size={16} />
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        );
    };

    // ── JSX ───────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-[calc(100vh-80px)] w-full flex flex-col items-center bg-gray-50 p-3 md:p-6 font-sans">
            <Toaster position="top-center" />
            <ResultsModal />

            {isMobile ? (
                <div className="flex-1 w-full max-w-2xl flex flex-col items-center justify-center text-center p-6 animate-in fade-in zoom-in duration-500">
                    <div className="w-24 h-24 bg-white rounded-[2.5rem] shadow-xl shadow-indigo-100 flex items-center justify-center mb-8 border border-slate-100">
                        <Monitor size={48} className="text-indigo-600" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none mb-4">Desktop Recommended</h2>
                    <p className="text-slate-500 font-medium mb-8 max-w-md">
                        The Typing Trainer is designed for professional skill development using a physical keyboard. 
                        For the best learning experience, please log in from a computer.
                    </p>
                    <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100/50">
                        <Keyboard size={12} /> Optimized for Physical Keyboards
                    </div>
                </div>
            ) : (
                <>
                    {/* ── Top Bar ────────────────────────────────────────────────────── */}
            <div className="w-full max-w-5xl bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">

                {/* Category tabs */}
                <div className="flex gap-1 bg-gray-100 rounded-xl p-1 overflow-x-auto no-scrollbar">
                    {Object.keys(LESSONS).map(cat => (
                        <button
                            key={cat}
                            onClick={() => { setCategory(cat); setLessonIdx(0); }}
                            className={`px-4 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${category === cat
                                ? 'bg-white shadow text-indigo-600'
                                : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </button>
                    ))}
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    {/* Mode + Duration */}
                    <div className="flex items-center gap-3 text-sm">
                        {/* Time / Words */}
                        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                            {['time', 'words'].map(m => (
                                <button key={m}
                                    onClick={() => setMode(m)}
                                    className={`px-3 py-1 rounded-md font-semibold transition-all ${mode === m ? 'bg-white shadow text-indigo-600' : 'text-gray-400'
                                        }`}
                                >{m.charAt(0).toUpperCase() + m.slice(1)}</button>
                            ))}
                        </div>

                        {/* Duration (time mode) */}
                        {mode === 'time' && (
                            <div className="flex gap-1">
                                {[15, 30, 60, 120].map(s => (
                                    <button key={s}
                                        onClick={() => { setDuration(s); setTimeLeft(s); }}
                                        className={`px-2 py-1 rounded-lg font-bold text-xs transition-all ${duration === s ? 'bg-indigo-600 text-white shadow-sm' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                            }`}
                                    >{s}s</button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-2 border-l pl-3 border-gray-100">
                        {category !== 'advanced' && (
                            <button onClick={() => setShowKeyboard(!showKeyboard)}
                                title="Toggle Keyboard"
                                className={`p-2 rounded-lg transition-colors ${showKeyboard ? 'text-indigo-600 bg-indigo-50' : 'text-gray-400 hover:bg-gray-100'}`}
                            ><Keyboard size={18} /></button>
                        )}
                        {category === 'beginner' && (
                            <button onClick={() => setShowHands(!showHands)}
                                title="Toggle Hands"
                                className={`p-2 rounded-lg transition-colors ${showHands ? 'text-purple-600 bg-purple-50' : 'text-gray-400 hover:bg-gray-100'}`}
                            ><HandIcon size={18} /></button>
                        )}
                        <button onClick={() => setSoundOn(!soundOn)}
                            className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
                        >{soundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}</button>
                        <button onClick={() => setShowHistory(!showHistory)}
                            className={`p-2 rounded-lg transition-colors ${showHistory ? 'text-indigo-600 bg-indigo-50' : 'text-gray-400 hover:bg-gray-100'}`}
                        ><History size={18} /></button>
                        <button onClick={resetTest}
                            className="p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                        ><RotateCcw size={18} /></button>
                    </div>
                </div>
            </div>

            {/* ── Micro Round Navigation ────────────────────────────────────── */}
            <div className="w-full max-w-5xl mb-4 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex flex-wrap gap-2">
                    {LESSONS[category].map((l, i) => {
                        const isSelected = lessonIdx % LESSONS[category].length === i;
                        const isDone = completedLessons.has(`${category}-${l.title}`);
                        return (
                            <button
                                key={i}
                                onClick={() => setLessonIdx(i)}
                                title={l.title}
                                className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black transition-all relative ${
                                    isSelected 
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 scale-110 z-10' 
                                        : isDone 
                                            ? 'bg-green-500 text-white shadow-sm' 
                                            : 'bg-gray-50 text-gray-400 hover:bg-gray-100 border border-gray-100'
                                }`}
                            >
                                {i + 1}
                                {isDone && !isSelected && (
                                    <div className="absolute -top-1 -right-1">
                                        <div className="h-3 w-3 bg-white rounded-full flex items-center justify-center shadow-sm">
                                            <Award size={8} className="text-green-600" />
                                        </div>
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── Live Stats ─────────────────────────────────────────────────── */}
            <div className="w-full max-w-5xl flex gap-3 mb-4 flex-wrap">
                {/* Timer */}
                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-extrabold text-lg ${timeLeft < 10 && mode === 'time' ? 'bg-red-50 text-red-600' : 'bg-indigo-50 text-indigo-700'
                    }`}>
                    <Clock size={18} />
                    {mode === 'time' ? formatTime(timeLeft) : formatTime(Math.round((Date.now() - (startTime || Date.now())) / 1000))}
                </div>
                <StatCard icon={Zap} label="WPM" value={stats.wpm} color="text-indigo-600" bg="bg-white border border-gray-100" />
                <StatCard icon={Target} label="Accuracy" value={`${stats.accuracy}%`} color="text-green-600" bg="bg-white border border-gray-100" />
                <StatCard icon={Trophy} label="Correct" value={stats.correct} color="text-blue-600" bg="bg-white border border-gray-100" />

                {/* Progress bar */}
                <div className="flex-1 flex items-center gap-2 min-w-[160px]">
                    <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                            style={{ width: `${progress}%` }}
                            transition={{ ease: 'linear', duration: 0.1 }}
                        />
                    </div>
                    <span className="text-xs text-gray-400 font-mono w-8">{progress}%</span>
                </div>
            </div>

            {/* ── Text Area ──────────────────────────────────────────────────── */}
            <div
                ref={containerRef}
                className="w-full max-w-5xl bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4 cursor-text"
                onClick={() => inputRef.current?.focus()}
            >
                <p className="font-mono text-xl leading-relaxed tracking-wider select-none flex flex-wrap gap-0.5">
                    {renderChars()}
                </p>
                <input
                    ref={inputRef}
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    className="opacity-0 absolute w-0 h-0"
                    autoFocus
                    spellCheck={false}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    inputMode="text"
                    enterKeyHint="done"
                />
                {!isActive && (
                    <p className="text-center text-gray-400 text-xs mt-4 uppercase tracking-widest font-bold">
                        {isMobile ? 'Tap here to start — Focus on accuracy' : 'Start typing to begin — Backspace to correct'}
                    </p>
                )}
            </div>

            {/* ── Keyboard + Hands ───────────────────────────────────────────── */}
            {keyboardVis && !isFinished && (
                <div className="w-full max-w-5xl bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
                    <TypingKeyboard
                        nextKey={nextChar}
                        errorKey={errorKey}
                        showHands={handsVis}
                    />
                </div>
            )}

            {/* ── History Panel ──────────────────────────────────────────────── */}
            <AnimatePresence>
                {showHistory && (
                    <motion.div
                        className="w-full max-w-5xl bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4"
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp size={18} className="text-indigo-600" />
                            <h3 className="font-bold text-gray-700">Progress History</h3>
                            <span className="ml-auto text-xs text-gray-400">{history.length} sessions</span>
                        </div>

                        {chartData.length > 1 ? (
                            <div className="mb-4" style={{ height: 160 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient id="wpmGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="session" tick={{ fontSize: 11 }} />
                                        <YAxis tick={{ fontSize: 11 }} />
                                        <Tooltip />
                                        <Area type="monotone" dataKey="wpm" stroke="#6366f1" fill="url(#wpmGrad)" strokeWidth={2} dot={false} />
                                        <Line type="monotone" dataKey="accuracy" stroke="#10b981" strokeWidth={2} dot={false} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <p className="text-gray-400 text-sm text-center py-4">Complete more sessions to see your progress chart.</p>
                        )}

                        {/* Recent sessions */}
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {history.slice(0, 10).map((h, i) => (
                                <div key={i} className="flex items-center gap-3 text-sm py-1.5 px-3 rounded-lg hover:bg-gray-50">
                                    <span className="text-gray-300 text-xs font-mono w-5">{i + 1}</span>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${h.mode === 'beginner' ? 'bg-green-100 text-green-700' :
                                        h.mode === 'intermediate' ? 'bg-blue-100 text-blue-700' :
                                            'bg-purple-100 text-purple-700'
                                        }`}>{h.mode}</span>
                                    <span className="font-bold text-indigo-600">{h.wpm} WPM</span>
                                    <span className="text-gray-400">{h.accuracy}%</span>
                                    <span className="ml-auto text-gray-300 text-xs">{new Date(h.createdAt).toLocaleDateString()}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
                </>
            )}
        </div>
    );
};

export default TypingTrainer;
