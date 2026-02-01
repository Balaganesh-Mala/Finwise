import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Send, Play, RotateCcw, AlertCircle, CheckCircle, ChevronLeft } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import * as interviewService from '../services/interviewService';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const MockInterview = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [step, setStep] = useState('setup'); // setup, interview, result

    // Setup State
    const [interviewType, setInterviewType] = useState('HR');
    const [mode, setMode] = useState('text'); // 'text' or 'voice'

    // Interview State
    const [sessionId, setSessionId] = useState(null);
    const [messages, setMessages] = useState([]); // { sender: 'ai'|'user', text: '', evaluation?: {} }
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(false);
    const [questionCount, setQuestionCount] = useState(0);
    const MAX_QUESTIONS = 5;

    // Voice State
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef(null);

    // Result State
    const [finalResult, setFinalResult] = useState(null);

    const baseTextRef = useRef('');
    const isProcessingRef = useRef(false);

    const speakText = (text) => {
        if (!('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        // Optional: Select a specific voice if desired, or let browser default
        window.speechSynthesis.speak(utterance);
    };

    // Auto-speak new AI messages in voice mode
    useEffect(() => {
        if (messages.length > 0) {
            const lastMsg = messages[messages.length - 1];
            if (lastMsg.sender === 'ai' && mode === 'voice') {
                speakText(lastMsg.text);
            }
        }
    }, [messages, mode]);

    // --- Init ---
    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        getUser();

        // Speech Recognition Setup
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event) => {
                if (isProcessingRef.current) return;
                let transcript = '';
                for (let i = 0; i < event.results.length; ++i) {
                    transcript += event.results[i][0].transcript;
                }
                setInputText(baseTextRef.current + transcript);
            };

            recognitionRef.current.onerror = (event) => {
                // Ignore 'aborted' error as it happens when we manually cancel
                if (event.error === 'aborted') return;

                console.error("Speech Error:", event.error);
                toast.error("Microphone error. Using text mode.");
                setIsListening(false);
            };
        }

        return () => {
            // Cleanup speech synthesis on unmount
            window.speechSynthesis.cancel();
        };
    }, []);

    // --- Actions ---

    const handleStart = async () => {
        if (!user) return toast.error("Please log in first.");
        setLoading(true);
        try {
            const data = await interviewService.startInterview(user.id, interviewType, mode);
            setSessionId(data.sessionId);
            setMessages([{ sender: 'ai', text: data.question }]);
            setStep('interview');
            setQuestionCount(1);
        } catch (err) {
            toast.error("Failed to start interview");
        }
        setLoading(false);
    };

    const handleSendMessage = async () => {
        if (!inputText.trim()) return;

        isProcessingRef.current = true; // Block any late transcriptions
        const answer = inputText;
        setInputText('');
        baseTextRef.current = '';
        setIsListening(false);
        if (recognitionRef.current) recognitionRef.current.abort(); // Abort immediately, don't wait for final result

        // 1. Add User Message
        const newMessages = [...messages, { sender: 'user', text: answer }];
        setMessages(newMessages);
        setLoading(true);

        try {
            // 2. Evaluate Answer
            const evalData = await interviewService.submitAnswer(sessionId, answer);

            // Show brief feedback (Toast)
            if (evalData.feedback) {
                toast(evalData.feedback, { icon: '🤖' });
            }

            // 3. Check for completion or Next Question
            if (questionCount >= MAX_QUESTIONS) {
                await finishInterview();
            } else {
                const nextQ = await interviewService.getNextQuestion(sessionId);
                setMessages(prev => [...prev, { sender: 'ai', text: nextQ.question }]);
                setQuestionCount(prev => prev + 1);
            }

        } catch (err) {
            toast.error("Error processing answer");
        }
        setLoading(false);
    };

    const finishInterview = async () => {
        setLoading(true);
        try {
            const data = await interviewService.saveInterview(sessionId);
            setFinalResult(data);
            setStep('result');
            toast.success("Interview Completed!");
        } catch (err) {
            toast.error("Failed to save results");
        }
        setLoading(false);
    };

    const toggleMic = () => {
        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            // Add space if there is text and it doesn't end with a space
            const prefix = inputText + (inputText && !inputText.endsWith(' ') ? ' ' : '');
            baseTextRef.current = prefix;
            setInputText(prefix);
            isProcessingRef.current = false;
            recognitionRef.current.start();
            setIsListening(true);
        }
    };

    // --- Renderers ---

    // --- Renderers ---
    if (step === 'setup') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-white max-w-lg w-full rounded-2xl shadow-xl p-8"
                >
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">AI Mock Interview</h1>
                    <p className="text-gray-500 mb-8">Practice your skills with our advanced AI interviewer.</p>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Interview Type</label>
                            <select
                                value={interviewType}
                                onChange={(e) => setInterviewType(e.target.value)}
                                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                                {['HR', 'Web Development', 'Communication', 'MS Office', 'Data Entry'].map(t => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Mode</label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setMode('text')}
                                    className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${mode === 'text' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 hover:bg-gray-50'}`}
                                >
                                    <span className="text-xl">💬</span>
                                    <span className="font-medium">Text Chat</span>
                                </button>
                                <button
                                    onClick={() => setMode('voice')}
                                    className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${mode === 'voice' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 hover:bg-gray-50'}`}
                                >
                                    <span className="text-xl">🎙️</span>
                                    <span className="font-medium">Voice Mode</span>
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={handleStart}
                            disabled={loading}
                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 transition-all disabled:opacity-70"
                        >
                            {loading ? 'Starting...' : 'Start Interview'}
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    if (step === 'result') {
        const { finalScore, feedback } = finalResult || {};
        return (
            <div className="min-h-screen bg-gray-50 p-6 flex justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    className="bg-white max-w-4xl w-full rounded-3xl shadow-xl overflow-hidden"
                >
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-10 text-white text-center">
                        <div className="w-24 h-24 mx-auto bg-white/20 backdrop-blur rounded-full flex items-center justify-center mb-4">
                            <span className="text-4xl font-black">{finalScore?.total}</span>
                        </div>
                        <h2 className="text-3xl font-bold">Interview Completed</h2>
                        <p className="opacity-90 mt-2">Here is your performance report</p>
                    </div>

                    <div className="p-8 grid md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Score Breakdown</h3>
                            <div className="space-y-4">
                                <ScoreBar label="Communication" score={finalScore?.communication} color="bg-blue-500" />
                                <ScoreBar label="Technical Knowledge" score={finalScore?.technical} color="bg-green-500" />
                                <ScoreBar label="Confidence" score={finalScore?.confidence} color="bg-orange-500" />
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-gray-800 mb-4">AI Feedback</h3>
                            <div className="space-y-4">
                                <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                                    <p className="text-sm font-bold text-green-800 mb-1">Strengths</p>
                                    <ul className="list-disc list-inside text-sm text-green-700">
                                        {feedback?.strengths?.map((s, i) => <li key={i}>{s}</li>)}
                                    </ul>
                                </div>
                                <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                                    <p className="text-sm font-bold text-red-800 mb-1">Improvements</p>
                                    <ul className="list-disc list-inside text-sm text-red-700">
                                        {feedback?.weaknesses?.map((s, i) => <li key={i}>{s}</li>)}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 bg-gray-50 border-t flex justify-center gap-4">
                        <button onClick={() => navigate('/my-interview-history')} className="px-6 py-3 text-indigo-600 font-bold hover:bg-indigo-50 rounded-xl transition-colors">
                            View History
                        </button>
                        <button onClick={() => setStep('setup')} className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-colors">
                            Start New Interview
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    // --- Voice Mode UI ---
    if (mode === 'voice') {
        const lastMsg = messages.length > 0 ? messages[messages.length - 1] : null;
        return (
            <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
                <Toaster position="top-right" />

                {/* Background Blobs */}
                <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

                {/* Header */}
                <div className="absolute top-6 left-6 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-300">🎙️</div>
                    <div>
                        <h2 className="font-bold text-lg">Voice Interview</h2>
                        <p className="text-xs text-indigo-300">{interviewType} • Q{questionCount}/{MAX_QUESTIONS}</p>
                    </div>
                </div>

                {/* Main Visual */}
                <div className="flex flex-col items-center gap-12 z-10 w-full max-w-2xl">

                    {/* AI Avatar */}
                    <motion.div
                        animate={loading ? { scale: [1, 1.1, 1] } : {}}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="relative"
                    >
                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-500/30 border-4 border-indigo-400/30">
                            <span className="text-5xl">🤖</span>
                        </div>
                        {loading && (
                            <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                                <span className="text-sm font-medium text-indigo-300 animate-pulse">AI is thinking...</span>
                            </div>
                        )}
                    </motion.div>

                    {/* Captions / Subtitles */}
                    <div className="h-32 w-full flex items-center justify-center text-center px-4">
                        <AnimatePresence mode='wait'>
                            {lastMsg && (
                                <motion.p
                                    key={messages.length} // Force re-render on new message
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className={`text-xl font-medium leading-relaxed ${lastMsg.sender === 'ai' ? 'text-white' : 'text-indigo-300'}`}
                                >
                                    "{lastMsg.text}"
                                </motion.p>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* User Mic Control */}
                    <div className="relative">
                        <button
                            onClick={toggleMic}
                            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${isListening
                                    ? 'bg-red-500 shadow-lg shadow-red-500/50 scale-110'
                                    : 'bg-white/10 hover:bg-white/20 border border-white/20'
                                }`}
                        >
                            {isListening ? <Mic size={40} className="text-white" /> : <MicOff size={40} className="opacity-50" />}
                        </button>
                        {isListening && (
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 whitespace-nowrap"
                            >
                                <p className="text-red-400 text-sm font-bold tracking-wider uppercase animate-pulse">Detailed Listening</p>
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* Hidden Text Input (Still needed for logic) */}
                <div className="absolute bottom-6 w-full max-w-lg px-4 opacity-50 hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md p-2 rounded-full border border-white/10">
                        <input
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder={isListening ? "Listening..." : "Type if voice fails..."}
                            className="flex-1 bg-transparent border-0 focus:ring-0 text-sm text-white placeholder-white/30 px-4"
                            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                        />
                        <button
                            onClick={handleSendMessage}
                            disabled={!inputText.trim() || loading}
                            className="p-2 bg-indigo-600 rounded-full disabled:opacity-50"
                        >
                            <Send size={16} />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // --- Text Mode UI (Default) ---
    return (
        <div className="h-[calc(100vh-80px)] bg-gray-100 flex flex-col max-w-5xl mx-auto rounded-xl overflow-hidden shadow-sm my-4 border border-gray-200">
            <Toaster position="top-right" />

            {/* Header */}
            <div className="bg-white p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xl">🤖</div>
                    <div>
                        <h2 className="font-bold text-gray-800">AI Interviewer</h2>
                        <p className="text-xs text-green-500 flex items-center gap-1">● Online • {interviewType}</p>
                    </div>
                </div>
                <div className="text-sm font-medium text-gray-500">
                    Question {questionCount} / {MAX_QUESTIONS}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                {messages.map((msg, idx) => (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        key={idx}
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`max-w-[75%] p-4 rounded-2xl ${msg.sender === 'user'
                            ? 'bg-indigo-600 text-white rounded-br-none'
                            : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
                            }`}>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                        </div>
                    </motion.div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-200 p-3 rounded-2xl rounded-bl-none animate-pulse text-gray-500 text-xs">
                            AI is thinking...
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="bg-white p-4 border-t">
                <div className="flex items-end gap-2 bg-gray-100 p-2 rounded-2xl">
                    <button
                        onClick={toggleMic}
                        className={`p-3 rounded-full transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-white text-gray-500 hover:text-indigo-600 shadow-sm'}`}
                    >
                        {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                    </button>

                    <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder={isListening ? "Listening..." : "Type your answer here..."}
                        className="flex-1 bg-transparent border-0 focus:ring-0 resize-none py-3 text-sm max-h-32"
                        rows={1}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                    />

                    <button
                        onClick={handleSendMessage}
                        disabled={!inputText.trim() || loading}
                        className="p-3 bg-indigo-600 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 transition-colors shadow-sm"
                    >
                        <Send size={20} />
                    </button>
                </div>
                {isListening && <p className="text-xs text-center text-red-500 mt-2">Recording... Click mic to stop or just send.</p>}
            </div>
        </div>
    );
};

const ScoreBar = ({ label, score, color }) => (
    <div>
        <div className="flex justify-between text-sm mb-1">
            <span className="font-medium text-gray-700">{label}</span>
            <span className="font-bold text-gray-900">{score}/10</span>
        </div>
        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <motion.div
                initial={{ width: 0 }} animate={{ width: `${score * 10}%` }}
                className={`h-full ${color}`}
            />
        </div>
    </div>
);

export default MockInterview;
