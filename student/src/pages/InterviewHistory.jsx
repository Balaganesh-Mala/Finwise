import React, { useState, useEffect } from 'react';
import * as interviewService from '../services/interviewService';
import { Calendar, ChevronRight, Clock, Star, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const InterviewHistory = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedInterview, setSelectedInterview] = useState(null);

    useEffect(() => {
        const loadHistory = async () => {
            const storedUser = localStorage.getItem('studentUser');
            if (storedUser) {
                const user = JSON.parse(storedUser);
                try {
                    const data = await interviewService.getHistory(user._id);
                    setHistory(data.data || []); // API returns { success: true, data: [] }
                } catch (err) {
                    console.error("Failed to load history", err);
                }
            }
            setLoading(false);
        };
        loadHistory();
    }, []);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 p-6 lg:p-10">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Interview History</h1>
                <p className="text-gray-500 mb-8">Review your past performance and AI feedback.</p>

                <div className="grid lg:grid-cols-3 gap-8">

                    {/* List Section */}
                    <div className="lg:col-span-1 space-y-4">
                        {history.length === 0 && (
                            <div className="bg-white p-6 rounded-2xl shadow-sm text-center text-gray-400">
                                <p>No interviews yet.</p>
                            </div>
                        )}
                        {history.map((session) => (
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                key={session._id}
                                onClick={() => setSelectedInterview(session)}
                                className={`bg-white p-5 rounded-2xl shadow-sm border cursor-pointer transition-all ${selectedInterview?._id === session._id ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-gray-100 hover:border-indigo-300'}`}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-sm">
                                            {session.score || '?'}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">Mock Interview</p>
                                            <p className="text-xs text-gray-400">{new Date(session.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    {session.status === 'completed' ? (
                                        <span className="px-2 py-1 bg-green-50 text-green-600 text-xs font-bold rounded-md">Done</span>
                                    ) : (
                                        <span className="px-2 py-1 bg-yellow-50 text-yellow-600 text-xs font-bold rounded-md">{session.status}</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                    <span className="flex items-center gap-1"><Clock size={12} /> {session.duration ? Math.round(session.duration / 60) + ' min' : 'N/A'}</span>
                                    {/* <span className="flex items-center gap-1"><Star size={12} /> {session.score}/10</span> */}
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Detail Section */}
                    <div className="lg:col-span-2">
                        <AnimatePresence mode='wait'>
                            {selectedInterview ? (
                                <motion.div
                                    key={selectedInterview._id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden"
                                >
                                    <div className="bg-indigo-600 text-white p-8">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h2 className="text-2xl font-bold mb-1">Interview Analysis</h2>
                                                <p className="opacity-80 text-sm">ID: {selectedInterview.callId}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm opacity-80 uppercase tracking-widest font-medium">Score</p>
                                                <p className="text-4xl font-black">{selectedInterview.score || 0}<span className="text-xl opacity-60">/10</span></p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-8 space-y-8">

                                        {/* Feedback */}
                                        <div>
                                            <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-4">
                                                <Star className="text-yellow-500" /> AI Feedback
                                            </h3>
                                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 text-gray-700 leading-relaxed whitespace-pre-wrap">
                                                {selectedInterview.feedback || "No feedback available."}
                                            </div>
                                        </div>

                                        {/* Summary */}
                                        {selectedInterview.summary && (
                                            <div>
                                                <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-4">
                                                    <FileText className="text-indigo-500" /> Summary
                                                </h3>
                                                <p className="text-gray-600 leading-relaxed">
                                                    {selectedInterview.summary}
                                                </p>
                                            </div>
                                        )}

                                        {/* Transcript */}
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 mb-4">Transcript</h3>
                                            <div className="max-h-64 overflow-y-auto bg-gray-50 p-4 rounded-xl text-sm text-gray-600 border border-gray-200">
                                                {selectedInterview.transcript || "No transcript available."}
                                            </div>
                                        </div>

                                    </div>

                                </motion.div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400 p-12 border-2 border-dashed border-gray-200 rounded-3xl">
                                    <Star size={48} className="mb-4 opacity-20" />
                                    <p className="text-lg font-medium">Select an interview to view details</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default InterviewHistory;
