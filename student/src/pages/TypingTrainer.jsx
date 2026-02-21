import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Keyboard, Trophy, Target, Clock, Zap, Volume2, VolumeX,
    ChevronDown, RotateCcw, TrendingUp, RefreshCw, Play, History,
    Hand as HandIcon, BarChart2, Award, ChevronRight
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

// ─── Built-in lesson library ──────────────────────────────────────────────────
const LESSONS = {
    beginner: [
        { title: 'Home Row — Left', content: 'asdf asdf asdf fads fdsa afsd asfd fads asdf sfda afds asfd dafa sasa fdfd asas dfdf' },
        { title: 'Home Row — Right', content: 'jkl; jkl; ;lkj ;lkj lkjl jlkj kljl ljkl jkl; ;lkj jkl; ;kll jkjk lljj ;lkj' },
        { title: 'Home Row — Both', content: 'asdf jkl; asdf jkl; fjdk slak fjas djsl askf jdsl fjak slfd jsak dlas fksl asdfjkl;' },
        { title: 'All Fingers', content: 'qwer asdf zxcv tyui jkl; bnm qwerty asdfgh zxcvbn yuiop hjkl; nm qwer tyui asdf jkl;' },
        { title: 'Simple Words', content: 'ask sad dad fall class all hall flask glad last grass flask sad hall all dad flash' },
    ],
    intermediate: [
        { title: 'Common Words', content: 'the and for are but not you all can she was use one her his had from say each did' },
        { title: 'Short Sentences', content: 'she was glad to help. the cup fell off the desk. he ran down the path fast. go left.' },
        { title: 'Tech Words', content: 'data code file sort find array push pull merge build serve route update class type list' },
        { title: 'Finance Words', content: 'audit debit credit profit margin account ledger budget capital revenue expense balance equity' },
        { title: 'Mixed Practice', content: 'about which their there first would these things think could people other how then she was' },
    ],
    advanced: [
        { title: 'Quick Paragraph', content: 'The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. How vexingly quick daft zebras jump.' },
        { title: 'Finance Concepts', content: 'Financial accounting records and summarizes transactions. The balance sheet, income statement, and cash flow statement are the three primary financial statements used by analysts.' },
        { title: 'Technology', content: 'React is a JavaScript library for building user interfaces. Developers create reusable components and efficiently update the DOM when data changes through a virtual DOM reconciliation process.' },
        { title: 'Professional', content: 'Effective communication is essential in professional environments. Clear and concise writing helps convey ideas accurately. Proper punctuation and grammar contribute to readable documents.' },
        { title: 'Speed Challenge', content: 'To be or not to be that is the question whether tis nobler in the mind to suffer the slings and arrows of outrageous fortune or to take arms against a sea of troubles.' },
    ],
};

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

    const inputRef = useRef(null);
    const containerRef = useRef(null);

    // Derived
    const nextChar = text[input.length] || '';
    const progress = calcProgress(input.length, text.length);
    const handsVis = showHands && category === 'beginner';
    const keyboardVis = showKeyboard && category !== 'advanced';

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
            const data = await getHistory(id, { limit: 30 });
            setHistory(data.sessions || []);
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
                await submitResult({
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
                toast.success(`✅ Result saved! ${finalWpm} WPM — ${finalAcc}% accuracy`);
                if (user._id) loadHistory(user._id);
            } catch { toast.error('Could not save result'); }
            finally { setSaving(false); }
        }
    }, [isFinished, text, input, startTime, user, category, lessonIdx, duration, mode, errorMap]);

    // ── Keyboard Handler ──────────────────────────────────────────────────────
    const handleKeyDown = useCallback((e) => {
        if (isFinished) return;

        const key = e.key;
        if (key === 'Tab') { e.preventDefault(); return; }

        if (!isActive) { setIsActive(true); setStartTime(Date.now()); }

        if (key === 'Backspace') {
            setInput(prev => prev.slice(0, -1));
            return;
        }

        if (key.length !== 1) return;

        const expected = text[input.length];
        if (!expected) return;

        const isCorrect = key === expected;
        if (soundOn) playBeep(isCorrect ? 'click' : 'error');

        if (!isCorrect) {
            setErrorMap(prev => recordError(prev, expected));
            setErrorKey(expected);
            setTimeout(() => setErrorKey(''), 350);
        }

        const nextInput = input + key;
        setInput(nextInput);

        // Word mode: end when all text is typed
        if (mode === 'words' && nextInput.length >= text.length) {
            finishTest();
        }
    }, [isFinished, isActive, text, input, soundOn, mode, finishTest]);

    // ── Render chars ──────────────────────────────────────────────────────────
    const renderChars = () =>
        text.split('').map((char, i) => {
            let cls = 'text-gray-300 ';
            if (i === input.length) cls = 'text-gray-700 bg-indigo-100 rounded px-px animate-pulse ';
            else if (i < input.length) cls = input[i] === char ? 'text-green-600 ' : 'text-red-500 bg-red-50 rounded ';
            return <span key={i} className={cls}>{char}</span>;
        });

    // ── History chart data ────────────────────────────────────────────────────
    const chartData = [...history].reverse().slice(-15).map((h, i) => ({
        session: i + 1,
        wpm: h.wpm,
        accuracy: h.accuracy,
    }));

    // ── Results modal ─────────────────────────────────────────────────────────
    const ResultsModal = () => (
        <AnimatePresence>
            {showResults && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                >
                    <motion.div
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
                        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5 text-white">
                            <div className="flex items-center gap-3 mb-1">
                                <Trophy size={24} />
                                <h2 className="text-xl font-bold">Session Complete!</h2>
                                {saving && <span className="ml-auto text-xs opacity-75 animate-pulse">Saving…</span>}
                            </div>
                            <p className="text-indigo-100 text-sm">
                                {LESSONS[category][lessonIdx % LESSONS[category].length].title} — {category}
                            </p>
                        </div>

                        <div className="p-6 space-y-5">
                            {/* Stats grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <StatCard icon={Zap} label="WPM" value={stats.wpm} color="text-indigo-600" bg="bg-indigo-50" />
                                <StatCard icon={Target} label="Accuracy" value={`${stats.accuracy}%`} color="text-green-600" bg="bg-green-50" />
                                <StatCard icon={Trophy} label="Correct" value={stats.correct} color="text-blue-600" bg="bg-blue-50" />
                                <StatCard icon={Clock} label="Errors" value={stats.incorrect} color="text-red-600" bg="bg-red-50" />
                            </div>

                            {/* Heatmap */}
                            {Object.keys(errorMap).length > 0 && (
                                <div>
                                    <p className="text-sm font-semibold text-gray-600 mb-2 flex items-center gap-2">
                                        <BarChart2 size={15} /> Error Heatmap
                                    </p>
                                    <TypingHeatmap errorMap={errorMap} />
                                </div>
                            )}

                            {/* Top missed keys */}
                            {topErrors(errorMap).length > 0 && (
                                <div>
                                    <p className="text-sm font-semibold text-gray-600 mb-2">Most Missed Keys</p>
                                    <div className="flex gap-2 flex-wrap">
                                        {topErrors(errorMap, 8).map(([k, v]) => (
                                            <span key={k} className="px-3 py-1 rounded-lg bg-red-50 text-red-600 font-mono font-bold text-sm">
                                                "{k.toUpperCase()}" × {v}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => { setShowResults(false); resetTest(); }}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors"
                                >
                                    <RotateCcw size={18} /> Try Again
                                </button>
                                <button
                                    onClick={() => {
                                        setLessonIdx(p => (p + 1) % LESSONS[category].length);
                                        setShowResults(false);
                                    }}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border-2 border-indigo-600 text-indigo-600 font-bold rounded-xl transition-colors hover:bg-indigo-50"
                                >
                                    Next Lesson <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    // ── JSX ───────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-[calc(100vh-80px)] w-full flex flex-col items-center bg-gray-50 p-3 md:p-6 font-sans">
            <Toaster position="top-center" />
            <ResultsModal />

            {/* ── Top Bar ────────────────────────────────────────────────────── */}
            <div className="w-full max-w-5xl bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">

                {/* Category tabs */}
                <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
                    {Object.keys(LESSONS).map(cat => (
                        <button
                            key={cat}
                            onClick={() => { setCategory(cat); setLessonIdx(0); }}
                            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${category === cat
                                ? 'bg-white shadow text-indigo-600'
                                : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Mode + Duration */}
                <div className="flex flex-wrap items-center gap-3 text-sm">
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

                    {/* Lesson picker */}
                    <div className="relative group">
                        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-lg text-gray-600 font-medium text-xs hover:bg-gray-200 transition-colors">
                            <Play size={12} />
                            {LESSONS[category][lessonIdx % LESSONS[category].length].title}
                            <ChevronDown size={12} />
                        </button>
                        <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-xl shadow-xl border border-gray-100 hidden group-hover:block z-20 overflow-hidden">
                            {LESSONS[category].map((l, i) => (
                                <button key={i}
                                    onClick={() => setLessonIdx(i)}
                                    className={`w-full text-left px-4 py-2.5 text-xs hover:bg-indigo-50 hover:text-indigo-600 ${lessonIdx % LESSONS[category].length === i ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-gray-600'
                                        }`}
                                >{l.title}</button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2">
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
                        ><HandGuideIcon size={18} /></button>
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
                    onChange={() => { }}
                    onKeyDown={handleKeyDown}
                    className="opacity-0 absolute w-0 h-0"
                    autoFocus
                    spellCheck={false}
                    autoComplete="off"
                />
                {!isActive && (
                    <p className="text-center text-gray-300 text-sm mt-4">
                        Start typing to begin — <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-400 text-xs font-mono">Backspace</kbd> to correct
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
        </div>
    );
};

export default TypingTrainer;
