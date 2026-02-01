import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    RefreshCw,
    Play,
    RotateCcw,
    Settings,
    Keyboard,
    Trophy,
    Target,
    Clock,
    Zap,
    Volume2,
    VolumeX,
    Type,
    ChevronDown,
    Timer
} from 'lucide-react';
import { typingLessons } from '../data/typingLessons';
import axios from 'axios';
import { supabase } from '../lib/supabaseClient';

// --- Sound Effects (Optional) ---
// You can replace these with actual sound file URLs or generated beeps
const playSound = (type) => {
    // Placeholder for sound logic
    // if (type === 'correct') new Audio('/sounds/click.mp3').play();
    // if (type === 'error') new Audio('/sounds/error.mp3').play();
};

const TypingPractice = () => {
    // --- State Management ---
    const [category, setCategory] = useState('beginner');
    const [lessonIndex, setLessonIndex] = useState(0);
    const [duration, setDuration] = useState(60); // 15, 30, 60, 120
    const [mode, setMode] = useState('time'); // 'time', 'words', 'quote' actually 'paragraph'? content is static
    const [theme, setTheme] = useState('light'); // light, dark, etc. handled by tailwind mostly or custom wrapper

    const [text, setText] = useState('');
    const [input, setInput] = useState('');
    const [startTime, setStartTime] = useState(null);
    const [timeLeft, setTimeLeft] = useState(duration);
    const [isActive, setIsActive] = useState(false);
    const [isFinished, setIsFinished] = useState(false);

    const [stats, setStats] = useState({
        wpm: 0,
        accuracy: 100,
        correctChars: 0,
        incorrectChars: 0,
        missedChars: 0,
        extraChars: 0,
    });

    const [soundEnabled, setSoundEnabled] = useState(true);
    const inputRef = useRef(null);
    const textContainerRef = useRef(null);

    // --- Initialization ---
    useEffect(() => {
        loadLesson();
        inputRef.current?.focus();
    }, [category, lessonIndex]);

    useEffect(() => {
        setTimeLeft(duration);
    }, [duration]);

    const loadLesson = () => {
        const lessons = typingLessons[category];
        const lesson = lessons[lessonIndex % lessons.length];
        setText(lesson.content);
        resetTest();
    };

    const resetTest = () => {
        setInput('');
        setStartTime(null);
        setIsActive(false);
        setIsFinished(false);
        setTimeLeft(mode === 'time' ? duration : 0);
        setStats({
            wpm: 0,
            accuracy: 100,
            correctChars: 0,
            incorrectChars: 0,
            missedChars: 0,
            extraChars: 0,
        });
        inputRef.current?.focus();
    };

    // --- Timer Logic ---
    useEffect(() => {
        let interval = null;
        if (isActive && !isFinished) {
            if (mode === 'time') {
                interval = setInterval(() => {
                    setTimeLeft((prev) => {
                        if (prev <= 1) {
                            finishTest();
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);
            } else {
                // Count up for other modes if needed, or just track time diff
                interval = setInterval(() => {
                    // just to update WPM live if we wanted count-up
                }, 1000);
            }
        }
        return () => clearInterval(interval);
    }, [isActive, isFinished, mode]);

    // --- Typing Handler ---
    const handleInput = (e) => {
        if (isFinished) return;

        const value = e.target.value;

        if (!isActive) {
            setIsActive(true);
            setStartTime(Date.now());
        }

        // Sound effects
        if (soundEnabled) {
            const isCorrect = value.length > input.length && value.slice(-1) === text[value.length - 1];
            if (value.length > input.length) {
                playSound(isCorrect ? 'correct' : 'error');
            }
        }

        setInput(value);

        // Calculate stats live
        calculateStats(value);

        // Check completion (if text fully typed)
        if (value.length >= text.length) {
            finishTest();
        }
    };

    const calculateStats = (currentInput) => {
        const elapsedMin = (Date.now() - startTime) / 60000 || 0.0001; // Avoid divide by zero

        let correct = 0;
        let incorrect = 0;

        for (let i = 0; i < currentInput.length; i++) {
            if (currentInput[i] === text[i]) correct++;
            else incorrect++;
        }

        // WPM = (correct chars / 5) / time in minutes
        // But for live WPM, it's often better to approximate or smoothen
        const wpm = Math.round((correct / 5) / elapsedMin);
        const accuracy = Math.round((correct / (correct + incorrect)) * 100) || 100;

        setStats(prev => ({
            ...prev,
            correctChars: correct,
            incorrectChars: incorrect,
            wpm: wpm < 0 ? 0 : wpm, // Safety
            accuracy
        }));
    };

    const finishTest = async () => {
        setIsActive(false);
        setIsFinished(true);

        // Final Calculation ensure 
        const endTime = Date.now();
        const durationInMinutes = (endTime - (startTime || endTime)) / 60000;

        // If time mode, usage duration is fixed to test time mostly, but let's use actual elapsed for precision
        // Re-calc final perfectly
        let correct = 0;
        for (let i = 0; i < input.length; i++) {
            if (input[i] === text[i]) correct++;
        }
        const finalWpm = Math.round((correct / 5) / (durationInMinutes || (1 / 60))); // fallback if very fast
        const finalAcc = Math.round((correct / input.length) * 100) || 100;

        const finalStats = { ...stats, wpm: finalWpm, accuracy: finalAcc, time: durationInMinutes * 60 };
        setStats(finalStats);

        // Save to Backend
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                await axios.post(`${API_URL}/api/typing/save`, {
                    studentId: user.id, // Using Supabase ID as studentId
                    wpm: finalWpm,
                    accuracy: finalAcc,
                    errors: stats.incorrectChars,
                    mode: mode,
                    lesson: typingLessons[category][lessonIndex]?.title || 'Unknown',
                    time: Math.round(durationInMinutes * 60)
                });
                console.log("Progress saved!");
            }
        } catch (err) {
            console.error("Failed to save progress", err);
        }
    };

    // --- Render Helpers ---
    const renderText = () => {
        return text.split('').map((char, index) => {
            let className = "text-2xl font-mono transition-colors duration-75 ";
            const inputChar = input[index];

            if (index === input.length) {
                className += "border-l-2 border-indigo-500 animate-pulse text-gray-800 bg-gray-200 "; // Active cursor
            }

            if (inputChar == null) {
                className += "text-gray-400"; // Untyped
            } else if (inputChar === char) {
                className += "text-green-600"; // Correct
            } else {
                className += "text-red-500 bg-red-100 rounded"; // Incorrect
            }

            return (
                <span key={index} className={className}>
                    {char}
                </span>
            );
        });
    };

    return (
        <div className={`min-h-[calc(100vh-80px)] w-full flex flex-col items-center bg-gray-50 text-gray-800 p-6 font-sans transition-colors duration-300`}>

            {/* --- Top Bar: Controls --- */}
            <div className="w-full max-w-5xl flex flex-wrap items-center justify-between bg-white p-4 rounded-xl shadow-sm mb-8 gap-4">

                {/* Lesson Selector */}
                <div className="flex items-center gap-2">
                    <span className="text-gray-500 text-sm font-medium uppercase tracking-wider">Lesson</span>
                    <div className="relative group">
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-semibold transition-colors">
                            {category.charAt(0).toUpperCase() + category.slice(1)} <ChevronDown size={14} />
                        </button>
                        <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 hidden group-hover:block z-20 overflow-hidden">
                            {Object.keys(typingLessons).map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => { setCategory(cat); setLessonIndex(0); inputRef.current?.focus(); }}
                                    className={`w-full text-left px-4 py-3 text-sm hover:bg-indigo-50 hover:text-indigo-600 ${category === cat ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600'}`}
                                >
                                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={() => setLessonIndex((prev) => (prev + 1) % typingLessons[category].length)}
                        className="p-1.5 text-gray-400 hover:text-indigo-600 transition-colors"
                        title="Next Lesson"
                    >
                        <StepForwardIcon size={18} />
                    </button>
                </div>

                {/* Middle Controls */}
                <div className="flex items-center gap-6 bg-gray-100/50 px-4 py-1.5 rounded-full">

                    {/* Mode */}
                    <div className="flex items-center gap-2">
                        <Type size={16} className="text-gray-400" />
                        {['time', 'words'].map(m => (
                            <button
                                key={m}
                                onClick={() => setMode(m)}
                                className={`text-xs font-bold px-2 py-1 rounded ${mode === m ? 'text-indigo-600 bg-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                {m.charAt(0).toUpperCase() + m.slice(1)}
                            </button>
                        ))}
                    </div>

                    <div className="w-px h-4 bg-gray-300"></div>

                    {/* Duration */}
                    <div className="flex items-center gap-2">
                        <Timer size={16} className="text-gray-400" />
                        {[15, 30, 60, 120].map(s => (
                            <button
                                key={s}
                                onClick={() => { setDuration(s); if (mode === 'time') setTimeLeft(s); }}
                                className={`text-xs font-bold px-2 py-1 rounded ${duration === s ? 'text-indigo-600 bg-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                {s}s
                            </button>
                        ))}
                    </div>

                </div>

                {/* Right Controls */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setSoundEnabled(!soundEnabled)}
                        className={`p-2 rounded-lg transition-colors ${soundEnabled ? 'text-gray-600 hover:bg-gray-100' : 'text-gray-400 hover:bg-gray-100'}`}
                        title="Toggle Sound"
                    >
                        {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                    </button>
                    {/* Restart */}
                    <button
                        onClick={resetTest}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-sm shadow-indigo-200"
                    >
                        <RotateCcw size={16} />
                        <span>Reset</span>
                    </button>
                </div>
            </div>

            {/* --- Main Stats (Live) --- */}
            <div className="w-full max-w-5xl grid grid-cols-4 gap-4 mb-8">
                <StatCard label="Words / Min" value={stats.wpm} icon={Zap} color="text-yellow-600" />
                <StatCard label="Accuracy" value={`${stats.accuracy}%`} icon={Target} color="text-green-600" />
                <StatCard label="Errors" value={stats.incorrectChars} icon={Settings} color="text-red-500" /> {/* Using Settings icon as placeholder for AlertCircle if missing */}
                <StatCard label="Time Left" value={mode === 'time' ? `${timeLeft}s` : '∞'} icon={Clock} color="text-blue-500" />
            </div>

            {/* --- Typing Area --- */}
            <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-sm border border-gray-100 p-8 min-h-[300px] flex flex-col justify-center cursor-text" onClick={() => inputRef.current?.focus()}>

                <div className="absolute top-4 left-6 text-xs font-bold text-gray-300 uppercase tracking-widest pointer-events-none">
                    {isActive ? 'Typing...' : 'Click to Focus'}
                </div>

                {/* Hidden Input */}
                <input
                    ref={inputRef}
                    type="text"
                    className="absolute opacity-0 top-0 left-0 h-full w-full cursor-default"
                    value={input}
                    onChange={handleInput}
                    onBlur={() => !isFinished && setIsActive(false)} // Pause effect?
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                />

                {/* Visual Text */}
                <div
                    ref={textContainerRef}
                    className="font-mono text-2xl leading-relaxed text-gray-400 select-none break-words whitespace-pre-wrap max-h-[400px] overflow-hidden relative"
                    style={{ lineHeight: '1.8' }}
                >
                    {renderText()}
                </div>

                {/* Overlay Check */}
                {!isActive && !isFinished && input.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[1px] rounded-2xl">
                        <div className="flex flex-col items-center gap-3 text-gray-400 animate-pulse">
                            <Keyboard size={48} />
                            <span className="text-lg font-medium">Start typing to begin</span>
                        </div>
                    </div>
                )}
            </div>

            {/* --- Progress Bar --- */}
            {mode === 'time' && (
                <div className="w-full max-w-5xl mt-8 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-indigo-500"
                        initial={{ width: '100%' }}
                        animate={{ width: `${(timeLeft / duration) * 100}%` }}
                        transition={{ duration: 1, ease: 'linear' }}
                    />
                </div>
            )}


            {/* --- Results Modal --- */}
            <AnimatePresence>
                {isFinished && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden"
                        >
                            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white text-center">
                                <Trophy size={64} className="mx-auto mb-4 text-yellow-300 drop-shadow-lg" />
                                <h2 className="text-3xl font-bold">Excellent Work!</h2>
                                <p className="text-indigo-100 mt-2">You completed the {typingLessons[category][lessonIndex].title} lesson.</p>
                            </div>

                            <div className="p-8">
                                <div className="grid grid-cols-3 gap-8 mb-10">
                                    <ResultStat label="WPM" value={stats.wpm} subtext="Words per min" />
                                    <ResultStat label="Accuracy" value={`${stats.accuracy}%`} subtext={`${stats.incorrectChars} errors`} />
                                    <ResultStat label="Time" value={`${Math.round(stats.time || duration)}s`} subtext="Duration" />
                                </div>

                                <div className="flex gap-4 justify-center">
                                    <button
                                        onClick={resetTest}
                                        className="flex items-center gap-2 px-8 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-all text-lg"
                                    >
                                        <RotateCcw size={20} />
                                        Retry
                                    </button>
                                    <button
                                        onClick={() => { setLessonIndex((prev) => (prev + 1) % typingLessons[category].length); resetTest(); }}
                                        className="flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all text-lg transform hover:-translate-y-1"
                                    >
                                        <Play size={20} />
                                        Next Lesson
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
};


// Helper Components
const StatCard = ({ label, value, icon: Icon, color }) => (
    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
        <div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">{label}</p>
            <p className="text-2xl font-black text-gray-800">{value}</p>
        </div>
        <div className={`p-3 rounded-lg bg-opacity-10 ${color.replace('text-', 'bg-')}`}>
            <Icon size={24} className={color} />
        </div>
    </div>
);

const ResultStat = ({ label, value, subtext }) => (
    <div className="text-center">
        <p className="text-5xl font-black text-gray-800 mb-2">{value}</p>
        <p className="text-gray-500 font-bold uppercase text-sm">{label}</p>
        <p className="text-gray-400 text-xs mt-1">{subtext}</p>
    </div>
);

// Fallback icon
const StepForwardIcon = ({ size }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 4 15 12 5 20 5 4"></polygon><line x1="19" y1="5" x2="19" y2="19"></line></svg>
)

export default TypingPractice;
