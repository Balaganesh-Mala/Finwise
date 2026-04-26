import React, { useState, useEffect } from 'react';
import { 
    Calendar, Clock, User, Video, 
    ArrowRight, Globe, AlertCircle, 
    CheckCircle, XCircle, Info, FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const InterviewSchedules = () => {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('upcoming'); // upcoming, past
    const [authError, setAuthError] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchSchedules();
    }, []);

    const fetchSchedules = async () => {
        try {
            const userStr = localStorage.getItem('studentUser');
            if (!userStr) {
                setAuthError(true);
                setLoading(false);
                return;
            }

            const user = JSON.parse(userStr);
            const token = localStorage.getItem('studentToken');
            
            if (!token || token === 'null' || token === 'undefined') {
                setAuthError(true);
                setLoading(false);
                return;
            }

            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const res = await axios.get(`${API_URL}/api/interview-schedules/schedules?studentId=${user._id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            if (res.data.success) {
                setSchedules(res.data.data);
            }
        } catch (error) {
            console.error("Error fetching schedules:", error);
            if (error.response?.status === 401) {
                setAuthError(true);
            } else {
                toast.error("Failed to load interview schedules");
            }
        } finally {
            setLoading(false);
        }
    };

    const isSessionExpired = (date, endTimeStr) => {
        try {
            if (!date || !endTimeStr) return false;
            const [time, period] = endTimeStr.toLowerCase().split(' ');
            let [hours, minutes] = time.split(':').map(Number);
            if (period === 'pm' && hours < 12) hours += 12;
            if (period === 'am' && hours === 12) hours = 0;
            const sessionEnd = new Date(date);
            sessionEnd.setHours(hours, minutes, 0, 0);
            return new Date() > sessionEnd;
        } catch (e) {
            return false;
        }
    };

    const stats = {
        total: schedules.length,
        completed: schedules.filter(s => s.status === 'Completed').length,
        absent: schedules.filter(s => s.attendance === 'Absent').length,
        cancelled: schedules.filter(s => s.status === 'Cancelled').length
    };

    const upcoming = schedules.filter(s => 
        (s.status === 'Scheduled' || s.status === 'Rescheduled') && !isSessionExpired(s.date, s.endTime)
    );
    
    const past = schedules.filter(s => 
        s.status === 'Completed' || 
        s.status === 'Missed' || 
        s.status === 'Cancelled' || 
        s.attendance === 'Absent' ||
        isSessionExpired(s.date, s.endTime)
    );

    const displaySchedules = filter === 'upcoming' ? upcoming : past;

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-10 h-10 border-2 border-slate-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                <p className="text-slate-400 text-sm font-medium">Loading your sessions...</p>
            </div>
        );
    }

    if (authError) {
        return (
            <div className="min-h-[50vh] flex flex-col items-center justify-center text-center px-4">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                    <AlertCircle size={32} />
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-2">Login Required</h2>
                <p className="text-slate-500 mb-6 text-sm max-w-xs">Please refresh your session by logging in again to view your interviews.</p>
                <button 
                    onClick={() => { localStorage.clear(); navigate('/login'); }}
                    className="px-6 py-2 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-all"
                >
                    Return to Login
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-20 max-w-6xl mx-auto px-4">
            {/* Clean Header */}
            <div className="pt-12 pb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-1">Manage Your Sessions</h1>
                    <div className="flex items-center gap-2 text-slate-400 text-sm font-semibold uppercase tracking-wider">
                        <span>{stats.total} Total</span>
                        <span className="w-1 h-1 bg-slate-300 rounded-full" />
                        <span>{stats.completed} Completed</span>
                        <span className="w-1 h-1 bg-slate-300 rounded-full" />
                        <span className="text-red-500">{stats.absent} Absents</span>
                        <span className="w-1 h-1 bg-slate-300 rounded-full" />
                        <span className="text-orange-500">{stats.cancelled} Cancelled</span>
                    </div>
                </div>

                <div className="flex gap-4 border-b md:border-none border-slate-100">
                    <button 
                        onClick={() => setFilter('upcoming')}
                        className={`pb-2 md:pb-0 md:px-4 md:py-2 text-sm font-bold transition-all relative ${filter === 'upcoming' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Upcoming Sessions
                        {filter === 'upcoming' && <motion.div layoutId="underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />}
                    </button>
                    <button 
                        onClick={() => setFilter('past')}
                        className={`pb-2 md:pb-0 md:px-4 md:py-2 text-sm font-bold transition-all relative ${filter === 'past' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Past History
                        {filter === 'past' && <motion.div layoutId="underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />}
                    </button>
                </div>
            </div>

            {/* List Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnimatePresence mode="wait">
                    {displaySchedules.length > 0 ? (
                        displaySchedules.map((item, idx) => {
                            const isExpired = isSessionExpired(item.date, item.endTime);
                            const isAbsent = item.attendance === 'Absent';
                            
                            return (
                                <motion.div
                                    key={item._id || idx}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="bg-white border border-slate-100 rounded-3xl p-6 transition-all hover:border-indigo-100 hover:shadow-sm"
                                >
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden">
                                                {item.interviewerId?.photo ? (
                                                    <img src={item.interviewerId.photo} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-300"><User size={24} /></div>
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="text-base font-bold text-slate-800">{item.interviewerId?.name || 'Assigned Trainer'}</h3>
                                                <p className="text-xs text-slate-400 font-semibold tracking-wide uppercase">Expert Interviewer</p>
                                            </div>
                                        </div>
                                        <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                                            isAbsent ? 'bg-red-50 text-red-500' :
                                            item.status === 'Completed' ? 'bg-green-50 text-green-600' :
                                            'bg-slate-50 text-slate-500'
                                        }`}>
                                            {isAbsent ? 'Absent' : (item.status === 'Scheduled' && isExpired ? 'Passed' : item.status)}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4 mb-6 pt-6 border-t border-slate-50">
                                        <div>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Date</p>
                                            <p className="text-xs font-bold text-slate-700">{new Date(item.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Time Slot</p>
                                            <p className="text-xs font-bold text-slate-700 whitespace-nowrap">{item.startTime}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Platform</p>
                                            <p className="text-xs font-bold text-indigo-600">{item.meetingPlatform || 'TBD'}</p>
                                        </div>
                                    </div>

                                    {/* Preparation Section: Instructions & Docs */}
                                    {(item.instructions || (item.requiredDocs && item.requiredDocs.length > 0)) && (
                                        <div className="mb-6 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                                            {item.instructions && (
                                                <div className="mb-3 last:mb-0">
                                                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase mb-1">
                                                        <Info size={12} /> Instructions
                                                    </div>
                                                    <p className="text-xs text-slate-600 font-medium leading-relaxed">{item.instructions}</p>
                                                </div>
                                            )}
                                            {item.requiredDocs && item.requiredDocs.length > 0 && (
                                                <div>
                                                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase mb-1">
                                                        <FileText size={12} /> Bring Items
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {item.requiredDocs.map((doc, dIdx) => (
                                                            <span key={dIdx} className="text-[10px] font-bold text-slate-500">{doc}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between gap-4">
                                        {item.status === 'Scheduled' && !isExpired ? (
                                            <a 
                                                href={item.meetingLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-full py-3 bg-slate-900 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all"
                                            >
                                                Join Now <ArrowRight size={14} />
                                            </a>
                                        ) : (
                                            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
                                                {isAbsent ? <XCircle size={14} className="text-red-400" /> : <CheckCircle size={14} className="text-green-400" />}
                                                <span>{isAbsent ? 'Absence Recorded' : item.status === 'Completed' ? 'Session Completed' : 'Link Expired'}</span>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })
                    ) : (
                        <div className="col-span-full py-20 flex flex-col items-center justify-center bg-slate-50/50 rounded-[2.5rem] border-2 border-dashed border-slate-100">
                            <span className="text-slate-400 font-bold text-sm tracking-wide">No {filter} found</span>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default InterviewSchedules;
