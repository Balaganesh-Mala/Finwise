import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Vapi from '@vapi-ai/web';
import { Mic, MicOff, PhoneOff, Loader2 } from 'lucide-react';
import * as interviewService from '../services/interviewService';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

// Initialize Vapi with Public Key (Env variable recommended)
const vapi = new Vapi(import.meta.env.VITE_VAPI_PUBLIC_KEY || 'a8800263-1250-482f-abe5-a130f9c2d765'); // Initial placeholder, user should update

const MockInterview = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [status, setStatus] = useState('idle'); // idle, connecting, active, ending, completed
    const [isMuted, setIsMuted] = useState(false);
    const [volumeLevel, setVolumeLevel] = useState(0); // For visualizing voice
    const [messages, setMessages] = useState([]); // Transcript log
    const [activeSpeaker, setActiveSpeaker] = useState('none'); // 'user', 'ai', 'none'

    useEffect(() => {
        const storedUser = localStorage.getItem('studentUser');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        } else {
            toast.error("Please log in.");
            navigate('/login');
        }

        // Vapi Event Listeners
        vapi.on('call-start', () => {
            setStatus('active');
            toast.success("Call Connected!");
        });

        vapi.on('call-end', () => {
            setStatus('completed');
            toast.success("Interview Completed. Processing results...");
            setTimeout(() => navigate('/my-interview-history'), 2000);
        });

        vapi.on('speech-start', () => setActiveSpeaker('user'));
        vapi.on('speech-end', () => setActiveSpeaker('none'));

        vapi.on('message', (message) => {
            // Handle transcripts
            if (message.type === 'transcript' && message.transcriptType === 'final') {
                setMessages(prev => [...prev, {
                    sender: message.role === 'assistant' ? 'AI' : 'You',
                    text: message.transcript
                }]);
            }
            // Handle volume level for visualizer if available (Vapi might send this via audio-level event)
            if (message.type === 'volume-level') {
                setVolumeLevel(message.level || 0);
            }
        });

        vapi.on('error', (e) => {
            console.error("Vapi Error:", e);
            setStatus('error');
            toast.error("Connection Error: " + e.message);
        });

        return () => {
            vapi.stop(); // Cleanup
        };
    }, [navigate]);


    const startInterview = async () => {
        if (!user) return;
        setStatus('connecting');
        try {
            // Get Config/Agent ID (We can just use the public agent ID directly too)
            // But we created an endpoint to check rate limits first
            const data = await interviewService.startInterview(user._id, user.name);

            if (data.success) {
                if (!data.agentId) {
                    toast.error("Vapi Agent ID not configured.");
                    setStatus('idle');
                    return;
                }
                // Connect to Vapi
                // Pass studentId in metadata so webhook knows who it is
                await vapi.start(data.agentId, {
                    metadata: {
                        studentId: user._id,
                        studentName: user.name
                    }
                });
            } else {
                toast.error(data.message || "Failed to start.");
                setStatus('idle');
            }

        } catch (err) {
            console.error(err);
            if (err.response?.status === 429) {
                toast.error("Daily limit reached! Try again tomorrow.");
            } else {
                toast.error("Failed to initialize interview.");
            }
            setStatus('idle');
        }
    };

    const stopInterview = () => {
        setStatus('ending');
        vapi.stop();
    };

    const toggleMute = () => {
        const newMuted = !isMuted;
        vapi.setMuted(newMuted);
        setIsMuted(newMuted);
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col relative overflow-hidden">
            <Toaster position="top-center" />

            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>

            {/* Header */}
            <div className="p-6 flex justify-between items-center z-10 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                        <Mic size={20} />
                    </div>
                    <div>
                        <h1 className="font-bold text-xl">AI Interview Coach</h1>
                        <p className="text-xs text-indigo-300 flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></span>
                            {status === 'active' ? 'Live Session' : status === 'connecting' ? 'Connecting...' : 'Ready to Start'}
                        </p>
                    </div>
                </div>
                {status === 'active' && (
                    <button
                        onClick={stopInterview}
                        className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
                    >
                        <PhoneOff size={16} /> End Call
                    </button>
                )}
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 z-10">

                {status === 'idle' && (
                    <div className="text-center max-w-md">
                        <div className="w-24 h-24 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-full mx-auto mb-6 flex items-center justify-center shadow-2xl shadow-indigo-500/30">
                            <Mic size={40} className="text-white" />
                        </div>
                        <h2 className="text-3xl font-bold mb-3">Ready to Practice?</h2>
                        <p className="text-gray-400 mb-8">
                            Your AI interviewer will ask you questions based on industry standards.
                            Speak clearly and take your time. You'll receive detailed feedback afterwards.
                        </p>
                        <button
                            onClick={startInterview}
                            className="w-full py-4 bg-white text-gray-900 rounded-xl font-bold text-lg hover:bg-gray-100 transition-transform transform hover:scale-105 shadow-xl"
                        >
                            Start Interview
                        </button>
                        <p className="text-xs text-gray-500 mt-4">Microphone access required • 3 sessions/day limit</p>
                    </div>
                )}

                {(status === 'connecting' || status === 'active' || status === 'ending') && (
                    <div className="relative w-full max-w-2xl flex flex-col items-center">

                        {/* Visualizer Circle */}
                        <motion.div
                            animate={{
                                scale: activeSpeaker === 'ai' ? [1, 1.1, 1] : 1,
                                boxShadow: activeSpeaker === 'ai'
                                    ? "0 0 30px rgba(99, 102, 241, 0.6)"
                                    : "0 0 0px rgba(99, 102, 241, 0)"
                            }}
                            className="w-48 h-48 rounded-full bg-gradient-to-b from-indigo-500 to-indigo-700 flex items-center justify-center relative mb-12"
                        >
                            <div className="absolute inset-0 rounded-full border-4 border-indigo-400/30 animate-ping opacity-20"></div>
                            {activeSpeaker === 'ai' ? (
                                <div className="space-x-1 flex items-center h-8">
                                    {[1, 2, 3, 4].map(i => (
                                        <motion.div
                                            key={i}
                                            animate={{ height: [10, 30, 10] }}
                                            transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                                            className="w-1.5 bg-white rounded-full"
                                        />
                                    ))}
                                </div>
                            ) : (
                                <Mic size={48} className="text-white/80" />
                            )}
                        </motion.div>

                        {/* Status Text */}
                        <div className="text-center mb-8 h-12">
                            {status === 'connecting' && <p className="text-indigo-300 animate-pulse">Establishing secure connection...</p>}
                            {activeSpeaker === 'ai' && <p className="text-white font-medium text-lg">AI is speaking...</p>}
                            {activeSpeaker === 'user' && <p className="text-green-400 font-medium text-lg">Listening to you...</p>}
                            {activeSpeaker === 'none' && status === 'active' && <p className="text-gray-400">Unmuted</p>}
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-6">
                            <button
                                onClick={toggleMute}
                                className={`p-4 rounded-full transition-all ${isMuted ? 'bg-red-500 text-white' : 'bg-white/10 hover:bg-white/20'}`}
                            >
                                {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                            </button>
                            <button
                                onClick={stopInterview}
                                className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold shadow-lg shadow-red-600/30 transition-all"
                            >
                                Finish Interview
                            </button>
                        </div>
                    </div>
                )}

                {status === 'completed' && (
                    <div className="text-center">
                        <Loader2 size={48} className="animate-spin text-indigo-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold">Processing Analysis...</h2>
                        <p className="text-gray-400 mt-2">Redirecting to your results shortly.</p>
                    </div>
                )}

            </div>

            {/* Live Transcript Overlay (Optional) */}
            {messages.length > 0 && status === 'active' && (
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-900 to-transparent p-6 flex items-end justify-center">
                    <p className="text-center text-gray-300 max-w-2xl font-medium animate-in slide-in-from-bottom-2">
                        <span className="opacity-50 text-xs uppercase tracking-wide mb-1 block">{messages[messages.length - 1].sender}</span>
                        "{messages[messages.length - 1].text}"
                    </p>
                </div>
            )}
        </div>
    );
};

export default MockInterview;
