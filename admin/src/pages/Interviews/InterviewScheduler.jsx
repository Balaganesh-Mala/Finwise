import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Calendar, Users, User, Clock, Link as LinkIcon,
    CheckCircle, AlertCircle, Plus, Trash2,
    ArrowRight, ChevronRight, LayoutGrid, List,
    Search, Filter, Mail, Bell, Globe, Shield, FileText,
    History, UserX, ExternalLink, CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const InterviewScheduler = () => {
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [trainers, setTrainers] = useState([]);
    const [batches, setBatches] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [schedulingMode, setSchedulingMode] = useState('Individual'); // Individual, Batch
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [selectedBatchId, setSelectedBatchId] = useState('');
    const [selectedTrainerId, setSelectedTrainerId] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [batchFilter, setBatchFilter] = useState('All');

    // Queue Filter State
    const [qStatus, setQStatus] = useState('upcoming'); // upcoming, history
    const [qBatch, setQBatch] = useState('All');
    const [qSearch, setQSearch] = useState('');

    const [interviewData, setInterviewData] = useState({
        startDate: new Date().toISOString().split('T')[0],
        startTime: '10:00', // Still stored in 24h internally
        duration: 15,
        bufferTime: 5,
        meetingPlatform: 'Google Meet',
        meetingLink: '',
        instructions: 'Dear Candidate, Please join the session 10 minutes early and ensure a stable internet connection. Keep your camera on, microphone ready, and resume available. Attend from a quiet environment with professional attire. Stay confident, communicate clearly, and follow interviewer instructions throughout the session..',
        requiredDocs: ['Resume']
    });

    // Time Parts for 12h UI
    const [timeParts, setTimeParts] = useState({
        hour: '10',
        minute: '00',
        period: 'AM'
    });

    useEffect(() => {
        fetchData();
    }, []);

    // Sync 12h parts back to internal 24h startTime
    useEffect(() => {
        let h = parseInt(timeParts.hour);
        if (timeParts.period === 'PM' && h < 12) h += 12;
        if (timeParts.period === 'AM' && h === 12) h = 0;
        const time24 = `${h.toString().padStart(2, '0')}:${timeParts.minute}`;
        setInterviewData(prev => ({ ...prev, startTime: time24 }));
    }, [timeParts]);

    const fetchData = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const [stdRes, trnRes, bchRes, schRes] = await Promise.all([
                axios.get(`${API_URL}/api/students/list`),
                axios.get(`${API_URL}/api/admin/trainers/list`),
                axios.get(`${API_URL}/api/batches`),
                axios.get(`${API_URL}/api/interview-schedules/schedules`)
            ]);

            setStudents(stdRes.data);
            setTrainers(trnRes.data.filter(t => t.status === 'active'));
            setBatches(bchRes.data.batches || []);
            setSchedules(schRes.data.data || []);
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Failed to load scheduling data");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSchedules = async (e) => {
        e.preventDefault();

        if (schedulingMode === 'Individual' && selectedStudents.length === 0) {
            return toast.error("Please select at least one student");
        }
        if (schedulingMode === 'Batch' && !selectedBatchId) {
            return toast.error("Please select a batch");
        }
        if (!selectedTrainerId) return toast.error("Please select an interviewer");
        if (!interviewData.meetingLink) return toast.error("Meeting link is required");

        setSubmitting(true);
        const loadingToast = toast.loading("Generating schedule and notifying students...");

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const payload = {
                ...interviewData,
                studentIds: schedulingMode === 'Individual' ? selectedStudents : null,
                batchId: schedulingMode === 'Batch' ? selectedBatchId : null,
                interviewerId: selectedTrainerId
            };

            const res = await axios.post(`${API_URL}/api/interview-schedules/schedule`, payload);

            if (res.data.success) {
                toast.success(`Successfully scheduled ${res.data.count} interviews`, { id: loadingToast });
                setSchedulingMode('Individual');
                setSelectedStudents([]);
                setSelectedBatchId('');
                fetchData(); // Refresh list
            }
        } catch (error) {
            console.error("Error scheduling:", error);
            toast.error(error.response?.data?.message || "Failed to create schedules", { id: loadingToast });
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancelSchedule = async (id) => {
        if (!window.confirm("Are you sure you want to cancel this interview? It will be marked as Cancelled.")) return;
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            await axios.patch(`${API_URL}/api/interview-schedules/schedules/${id}`, {
                status: 'Cancelled'
            });
            toast.success("Interview marked as Cancelled");
            fetchData();
        } catch (error) {
            toast.error("Failed to cancel schedule");
        }
    };

    const handleMarkAbsent = async (id) => {
        if (!window.confirm("Mark this student as Absent? This will update their history.")) return;
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            await axios.patch(`${API_URL}/api/interview-schedules/schedules/${id}`, {
                attendance: 'Absent',
                status: 'Missed'
            });
            toast.success("Student marked as Absent");
            fetchData();
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const handleConductInterview = (item) => {
        // Find the batch object for this student
        const studentBatch = batches.find(b => b.name === (item.studentId?.batchName)) || {};

        // Navigate to feedback page with pre-filled state
        navigate('/admin/mock-conduct', {
            state: {
                studentId: item.studentId?._id,
                batchId: studentBatch?._id,
                interviewerName: item.interviewerId?.name,
                interviewDate: item.date?.split('T')[0]
            }
        });
    };

    const toggleStudentSelection = (id) => {
        setSelectedStudents(prev =>
            prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
        );
    };

    const filteredStudents = students.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes((searchTerm || '').toLowerCase()) ||
            s.email.toLowerCase().includes((searchTerm || '').toLowerCase());
        const matchesBatch = batchFilter === 'All' || s.batchName === batchFilter;
        return matchesSearch && matchesBatch;
    });

    const isSessionExpired = (date, endTimeStr) => {
        try {
            if (!date || !endTimeStr) return false;
            let timeClean = endTimeStr.toLowerCase();
            let [time, period] = timeClean.split(' ');
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

    const filteredQueue = schedules.filter(item => {
        // Status Filtering
        const isUpcoming = (item.status === 'Scheduled' || item.status === 'Rescheduled') && !isSessionExpired(item.date, item.endTime || '');
        const isPast = item.status === 'Completed' || item.status === 'Missed' || item.status === 'Cancelled' || item.attendance === 'Absent' || isSessionExpired(item.date, item.endTime || '');

        const statusMatch = qStatus === 'upcoming' ? isUpcoming : isPast;

        // Batch Filtering
        const batchName = item.studentId?.batchName || 'Unassigned';
        const batchMatch = qBatch === 'All' || batchName === qBatch;

        // Search Filtering
        const studentName = item.studentId?.name || '';
        const searchMatch = studentName.toLowerCase().includes((qSearch || '').toLowerCase());

        return statusMatch && batchMatch && searchMatch;
    });

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Interview Scheduler</h1>
                        <p className="text-slate-500 font-medium">Create automated sequences for mock interviews</p>
                    </div>
                    <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200">
                        <button
                            onClick={() => setSchedulingMode('Individual')}
                            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${schedulingMode === 'Individual' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                            Individual/Multi
                        </button>
                        <button
                            onClick={() => setSchedulingMode('Batch')}
                            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${schedulingMode === 'Batch' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                            Whole Batch
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Panel: Student Selection */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col lg:flex-col lg:items-center justify-between gap-4">
                                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 whitespace-nowrap overflow-hidden flex-shrink-0">
                                    <Users className="text-indigo-600 flex-shrink-0" size={24} />
                                    {schedulingMode === 'Individual' ? 'Select Students' : 'Select Batch'}
                                </h3>

                                {schedulingMode === 'Individual' && (
                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                                        <div className="relative w-full lg:w-64">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                            <input
                                                type="text"
                                                placeholder="Search student..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="pl-9 pr-4 py-2.5 bg-slate-100/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
                                            />
                                        </div>
                                        <div className="relative w-full sm:w-auto">
                                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 sm:hidden" size={16} />
                                            <select
                                                value={batchFilter}
                                                onChange={(e) => setBatchFilter(e.target.value)}
                                                className="bg-slate-100/50 border border-slate-200 rounded-xl pl-3 sm:pl-4 pr-10 py-2.5 text-sm font-bold text-slate-700 outline-none w-full sm:w-auto appearance-none"
                                                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1rem' }}
                                            >
                                                <option value="All">All Batches</option>
                                                {batches.map(b => <option key={b._id} value={b.name}>{b.name}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="p-0">
                                {schedulingMode === 'Individual' ? (
                                    <div className="max-h-[500px] overflow-y-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead className="bg-slate-50 sticky top-0 z-10">
                                                <tr>
                                                    <th className="p-4 w-12">
                                                        <input
                                                            type="checkbox"
                                                            onChange={(e) => {
                                                                if (e.target.checked) setSelectedStudents(filteredStudents.map(s => s._id));
                                                                else setSelectedStudents([]);
                                                            }}
                                                            checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                                                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                                        />
                                                    </th>
                                                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Student</th>
                                                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Batch</th>
                                                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {filteredStudents.map(student => (
                                                    <tr key={student._id} className={`hover:bg-slate-50 transition-colors ${selectedStudents.includes(student._id) ? 'bg-indigo-50/30' : ''}`}>
                                                        <td className="p-4">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedStudents.includes(student._id)}
                                                                onChange={() => toggleStudentSelection(student._id)}
                                                                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                                            />
                                                        </td>
                                                        <td className="p-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                                                                    {student.profilePicture ? (
                                                                        <img src={student.profilePicture} alt="" className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <User size={18} className="text-slate-400" />
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-bold text-slate-800">{student.name}</p>
                                                                    <p className="text-[10px] text-slate-500 font-medium">{student.email}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="p-4">
                                                            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">
                                                                {student.batchName || 'Unassigned'}
                                                            </span>
                                                        </td>
                                                        <td className="p-4">
                                                            <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-tighter ${student.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                                                                {student.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {filteredStudents.length === 0 && (
                                            <div className="p-12 text-center text-slate-400 font-medium">
                                                No students found matching your filters.
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="p-12 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {batches.map(batch => (
                                            <button
                                                key={batch._id}
                                                onClick={() => setSelectedBatchId(batch._id)}
                                                className={`p-6 rounded-2xl border-2 text-left transition-all group ${selectedBatchId === batch._id ? 'border-indigo-600 bg-indigo-50/50 shadow-md shadow-indigo-100' : 'border-slate-100 hover:border-indigo-300 hover:bg-slate-50'}`}
                                            >
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className={`p-3 rounded-xl ${selectedBatchId === batch._id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600'}`}>
                                                        <Users size={20} />
                                                    </div>
                                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedBatchId === batch._id ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'}`}>
                                                        {selectedBatchId === batch._id && <div className="w-2 h-2 rounded-full bg-white" />}
                                                    </div>
                                                </div>
                                                <h4 className="font-bold text-slate-800 mb-1">{batch.name}</h4>
                                                <p className="text-xs text-slate-500 font-medium">{batch.timing} Batch • {batch.courseName}</p>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Configuration */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <Calendar className="text-indigo-600" size={24} />
                                Setup Sequence
                            </h3>

                            <form onSubmit={handleCreateSchedules} className="space-y-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Interviewer</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <select
                                                value={selectedTrainerId}
                                                onChange={(e) => setSelectedTrainerId(e.target.value)}
                                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                                                required
                                            >
                                                <option value="">Select Interviewer</option>
                                                {trainers.map(t => <option key={t._id} value={t._id}>{t.name} ({t.specialization})</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Date</label>
                                            <input
                                                type="date"
                                                value={interviewData.startDate}
                                                onChange={(e) => setInterviewData({ ...interviewData, startDate: e.target.value })}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Start Time</label>
                                            <div className="grid grid-cols-3 gap-1">
                                                <select
                                                    value={timeParts.hour}
                                                    onChange={(e) => setTimeParts({ ...timeParts, hour: e.target.value })}
                                                    className="bg-slate-50 border border-slate-200 rounded-l-xl px-2 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                                                >
                                                    {[...Array(12)].map((_, i) => (
                                                        <option key={i + 1} value={(i + 1).toString().padStart(2, '0')}>{i + 1}</option>
                                                    ))}
                                                </select>
                                                <select
                                                    value={timeParts.minute}
                                                    onChange={(e) => setTimeParts({ ...timeParts, minute: e.target.value })}
                                                    className="bg-slate-50 border-x-0 border-slate-200 px-2 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                                                >
                                                    {['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'].map(m => (
                                                        <option key={m} value={m}>{m}</option>
                                                    ))}
                                                </select>
                                                <select
                                                    value={timeParts.period}
                                                    onChange={(e) => setTimeParts({ ...timeParts, period: e.target.value })}
                                                    className="bg-slate-50 border border-slate-200 rounded-r-xl px-2 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                                                >
                                                    <option value="AM">AM</option>
                                                    <option value="PM">PM</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Duration (min)</label>
                                            <div className="relative">
                                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                                <input
                                                    type="number"
                                                    value={interviewData.duration}
                                                    onChange={(e) => setInterviewData({ ...interviewData, duration: parseInt(e.target.value) || 0 })}
                                                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                                                    min="1"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Buffer (min)</label>
                                            <div className="relative">
                                                <Plus className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                                <input
                                                    type="number"
                                                    value={interviewData.bufferTime}
                                                    onChange={(e) => setInterviewData({ ...interviewData, bufferTime: parseInt(e.target.value) || 0 })}
                                                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                                                    min="0"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Meeting Details</label>
                                    <div className="space-y-4">
                                        <select
                                            value={interviewData.meetingPlatform}
                                            onChange={(e) => setInterviewData({ ...interviewData, meetingPlatform: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700"
                                        >
                                            <option value="Google Meet">Google Meet</option>
                                            <option value="Zoom">Zoom</option>
                                            <option value="Microsoft Teams">Microsoft Teams</option>
                                            <option value="Custom Link">Custom Link</option>
                                        </select>
                                        <div className="relative">
                                            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                            <input
                                                type="url"
                                                placeholder="Paste meeting link here..."
                                                value={interviewData.meetingLink}
                                                onChange={(e) => setInterviewData({ ...interviewData, meetingLink: e.target.value })}
                                                className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Instructions</label>
                                    <textarea
                                        rows="3"
                                        value={interviewData.instructions}
                                        onChange={(e) => setInterviewData({ ...interviewData, instructions: e.target.value })}
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500"
                                    ></textarea>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Required Documents</label>
                                    <div className="relative">
                                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text"
                                            placeholder="Resume, ID, etc. (Comma separated)"
                                            value={interviewData.requiredDocs.join(', ')}
                                            onChange={(e) => setInterviewData({
                                                ...interviewData,
                                                requiredDocs: e.target.value.split(',').map(d => d.trim())
                                            })}
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className={`w-full py-4 rounded-2xl font-bold text-white shadow-xl flex items-center justify-center gap-3 transition-all ${submitting ? 'bg-slate-400' : 'bg-indigo-600 hover:bg-slate-900 shadow-indigo-100 hover:shadow-none'}`}
                                >
                                    {submitting ? 'Creating Sequence...' : 'Create & Send Notifications'}
                                    {!submitting && <ArrowRight size={20} />}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Queue Header with Filters */}
                <div className="pt-8 border-t border-slate-200">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">Live Interview Queue</h2>
                            <div className="flex p-1 bg-white border border-slate-200 rounded-2xl w-fit">
                                <button
                                    onClick={() => setQStatus('upcoming')}
                                    className={`px-6 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${qStatus === 'upcoming' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50'}`}
                                >
                                    <Calendar size={14} /> Upcoming
                                </button>
                                <button
                                    onClick={() => setQStatus('history')}
                                    className={`px-6 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${qStatus === 'history' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50'}`}
                                >
                                    <History size={14} /> History
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                            <div className="relative flex-1 sm:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search in queue..."
                                    value={qSearch}
                                    onChange={(e) => setQSearch(e.target.value)}
                                    className="pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
                                />
                            </div>
                            <select
                                value={qBatch}
                                onChange={(e) => setQBatch(e.target.value)}
                                className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 outline-none"
                            >
                                <option value="All">All Batches</option>
                                {batches.map(b => <option key={b._id} value={b.name}>{b.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence mode="popLayout">
                            {filteredQueue.map((item, idx) => (
                                <motion.div
                                    key={item._id || idx}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 relative group overflow-hidden hover:border-indigo-100 transition-all"
                                >
                                    {/* Platform Indicator */}
                                    <div className="absolute top-0 right-0 p-3 bg-slate-50 rounded-bl-2xl border-l border-b border-slate-50 text-[10px] font-bold text-indigo-600 uppercase tracking-tighter flex items-center gap-1.5">
                                        <Globe size={11} />
                                        {item.meetingPlatform}
                                    </div>

                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center border border-slate-200 overflow-hidden">
                                            {item.studentId?.profilePicture ? (
                                                <img src={item.studentId.profilePicture} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="text-slate-400" size={24} />
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800 leading-tight">{item.studentId?.name || 'Unknown Student'}</h4>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mt-1">
                                                Batch: <span className="text-indigo-600">{item.studentId?.batchName || 'Unassigned'}</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mb-6">
                                        <div className="bg-slate-50 rounded-2xl p-3 border border-slate-50">
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Schedule</p>
                                            <p className="text-xs font-bold text-slate-700">{new Date(item.date).toLocaleDateString('en-GB')}</p>
                                        </div>
                                        <div className="bg-slate-50 rounded-2xl p-3 border border-slate-50">
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Time Slot</p>
                                            <p className="text-xs font-bold text-indigo-600">{item.startTime}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[10px] px-3 py-1.5 rounded-xl font-bold uppercase tracking-widest border ${item.attendance === 'Absent' ? 'bg-red-50 text-red-500 border-red-100' :
                                                item.status === 'Completed' ? 'bg-green-50 text-green-600 border-green-100' :
                                                    item.status === 'Missed' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                                        item.status === 'Cancelled' ? 'bg-slate-100 text-slate-400 border-slate-200' :
                                                            'bg-indigo-50 text-indigo-600 border-indigo-100'
                                                }`}>
                                                {item.attendance === 'Absent' ? 'Absent' : item.status}
                                            </span>
                                            <a
                                                href={item.meetingLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500"
                                            >
                                                <LinkIcon size={16} />
                                            </a>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {(item.status === 'Scheduled' || item.status === 'Rescheduled') && (
                                                <>
                                                    <button
                                                        onClick={() => handleConductInterview(item)}
                                                        className="p-2.5 rounded-xl bg-green-50 text-green-600 hover:bg-green-600 hover:text-white transition-all opacity-0 group-hover:opacity-100 shadow-sm shadow-green-100"
                                                        title="Conduct & Submit Feedback"
                                                    >
                                                        <CheckCircle2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleMarkAbsent(item._id)}
                                                        className="p-2.5 rounded-xl bg-orange-50 text-orange-500 hover:bg-orange-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 shadow-sm shadow-orange-100"
                                                        title="Mark Absent"
                                                    >
                                                        <UserX size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleCancelSchedule(item._id)}
                                                        className="p-2.5 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 shadow-sm shadow-slate-200"
                                                        title="Cancel Interview"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {filteredQueue.length === 0 && (
                            <div className="col-span-full py-20 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100">
                                <p className="text-slate-400 font-bold text-sm tracking-wide">No {qStatus} sessions matching your filters</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default InterviewScheduler;
