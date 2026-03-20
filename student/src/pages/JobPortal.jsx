import React, { useState, useEffect, useCallback } from 'react';
import { MapPin, IndianRupee, Clock, CalendarClock, ChevronRight, Info, CheckCircle, AlertCircle, ExternalLink, RefreshCw, Building } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const STATUS_META = {
    'Applied': { color: 'text-blue-600 bg-blue-50 border-blue-200', dot: 'bg-blue-500', label: 'Applied' },
    'Under Review': { color: 'text-amber-600 bg-amber-50 border-amber-200', dot: 'bg-amber-400', label: 'Under Review' },
    'Interview Scheduled': { color: 'text-violet-600 bg-violet-50 border-violet-200', dot: 'bg-violet-500', label: 'Interview Scheduled' },
    'Offer Received': { color: 'text-emerald-600 bg-emerald-50 border-emerald-200', dot: 'bg-emerald-500', label: 'Offer Received 🎉' },
    'Rejected': { color: 'text-red-600 bg-red-50 border-red-200', dot: 'bg-red-400', label: 'Rejected' },
};
const ALL_STATUSES = ['Applied', 'Under Review', 'Interview Scheduled', 'Offer Received', 'Rejected'];

const formatDeadline = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' });
};

// ─── Job Card (CCBP style) ──────────────────────────────────────────────────
function JobCard({ job, onOpen, eligible, index }) {
    const isApplied = !!job.appliedStatus;
    const sm = isApplied ? STATUS_META[job.appliedStatus] : null;

    const metaItems = [
        { icon: MapPin, label: 'LOCATION', value: job.location || '—' },
        { icon: IndianRupee, label: 'CTC', value: job.salary || '—' },
        { icon: CalendarClock, label: 'APPLY BY', value: formatDeadline(job.deadline) },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col gap-4 hover:shadow-md transition-shadow"
        >
            {/* Top: Company + Logo */}
            <div className="flex items-start justify-between gap-2">
                <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">{job.company}</p>
                    <h2 className="text-xl font-bold text-gray-900 leading-tight">{job.title}</h2>
                </div>
                {job.companyLogo && (
                    <img src={job.companyLogo} alt={job.company} className="w-10 h-10 rounded-lg object-cover border border-gray-100 flex-shrink-0" />
                )}
            </div>

            {/* Meta Row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3">
                {metaItems.map((m) => (
                    <div key={m.label}>
                        <div className="flex items-center gap-1 mb-0.5">
                            <m.icon size={11} className="text-gray-400" />
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{m.label}</span>
                        </div>
                        <p className="text-sm font-semibold text-gray-800 truncate">{m.value}</p>
                    </div>
                ))}
            </div>

            {/* Skills (Preview) */}
            {(job.skills || []).length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {job.skills.slice(0, 4).map(s => (
                        <span key={s} className="text-[10px] font-bold text-gray-500 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-md uppercase tracking-wider">
                            {s}
                        </span>
                    ))}
                    {job.skills.length > 4 && (
                        <span className="text-[10px] font-bold text-gray-400 px-1 py-0.5 ml-0.5">
                            +{job.skills.length - 4} More
                        </span>
                    )}
                </div>
            )}

            {/* Footer: Eligibility + CTA */}
            <div className="flex items-center justify-between pt-1">
                <div>
                    {isApplied && sm ? (
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${sm.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${sm.dot}`} />
                            {sm.label}
                        </span>
                    ) : eligible ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            You are Eligible
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 bg-gray-50 border border-gray-200 px-3 py-1 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                            Complete 75% to unlock
                        </span>
                    )}
                </div>
                <button
                    onClick={() => onOpen(job, index)}
                    className="flex items-center gap-1 px-4 py-2 rounded-lg bg-indigo-600 text-white text-[11px] font-bold uppercase tracking-wider hover:bg-indigo-700 transition-all active:scale-[0.98] shadow-sm shadow-indigo-100"
                >
                    {isApplied ? 'View Details' : eligible ? 'View Details' : 'Check Eligibility'}
                    <ChevronRight size={12} className="ml-1" />
                </button>
            </div>
        </motion.div>
    );
}

// ─── Modal ───────────────────────────────────────────────────────────────────
function JobModal({ job, index, onClose, onApplied, eligible }) {
    const [applying, setApplying] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState(job.appliedStatus || 'Applied');
    const [notes, setNotes] = useState('');
    const [appId, setAppId] = useState(job._appId || null);
    const isApplied = !!job.appliedStatus;
    const sm = isApplied ? STATUS_META[job.appliedStatus] : null;

    const markApplied = async () => {
        const user = JSON.parse(localStorage.getItem('studentUser') || '{}');
        if (!user._id) return toast.error('Please log in');
        setApplying(true);
        try {
            const res = await axios.post(`${API}/api/student-jobs/${job._id}/apply`, { studentId: user._id, notes });
            setAppId(res.data._id);
            toast.success('Marked as Applied!');
            onApplied(job._id, 'Applied', res.data._id);
        } catch (e) { toast.error(e.response?.data?.msg || 'Error'); }
        finally { setApplying(false); }
    };

    const updateStatus = async () => {
        if (!appId) return;
        setUpdatingStatus(true);
        try {
            await axios.patch(`${API}/api/student-jobs/applications/${appId}/status`, { status: selectedStatus, notes });
            toast.success('Status updated!');
            onApplied(job._id, selectedStatus, appId);
        } catch { toast.error('Error updating status'); }
        finally { setUpdatingStatus(false); }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={onClose}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div
                initial={{ scale: 0.97, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.97, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                className="relative bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl border border-gray-200 overflow-y-auto z-10"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-0.5">{job.company}</p>
                        <h2 className="text-lg font-black text-gray-900">{job.title}</h2>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 text-sm transition-colors">✕</button>
                </div>

                <div className="px-6 py-5 space-y-6">
                    {/* Status badge */}
                    {isApplied && sm && (
                        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-semibold ${sm.color}`}>
                            <span className={`w-2 h-2 rounded-full ${sm.dot}`} />Status: {sm.label}
                        </div>
                    )}

                    {/* Meta grid */}
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { icon: MapPin, label: 'LOCATION', value: job.location },
                            { icon: IndianRupee, label: 'CTC', value: job.salary },
                            { icon: CalendarClock, label: 'APPLY BY', value: formatDeadline(job.deadline) },
                        ].map(m => (
                            <div key={m.label} className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
                                <div className="flex items-center gap-1.5 mb-1">
                                    <m.icon size={11} className="text-gray-400" />
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{m.label}</span>
                                </div>
                                <p className="text-sm font-bold text-gray-800">{m.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Description */}
                    <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">About the Role</h4>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            <span className="font-bold text-gray-800 tracking-tight italic">Role Overview: </span>
                            {job.description}
                        </p>
                    </div>

                    {/* Skills */}
                    {(job.skills || []).length > 0 && (
                        <div>
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Skills Required</h4>
                            <div className="flex flex-wrap gap-2">
                                {job.skills.map(s => (
                                    <span key={s} className="text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-lg">{s}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Responsibilities */}
                    {(job.responsibilities || []).length > 0 && (
                        <div>
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Responsibilities</h4>
                            <ul className="space-y-1.5">
                                {job.responsibilities.map((r, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                                        <span className="w-1 h-1 rounded-full bg-indigo-400 mt-2 flex-shrink-0" />{r}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* About Company */}
                    {(job.companyWebsite || job.companyLinkedin) && (
                        <div>
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">About Company</h4>
                            <div className="space-y-2">
                                {job.companyWebsite && (
                                    <p className="text-sm text-gray-600">
                                        <span className="font-bold text-gray-800">Company Website Link: </span>
                                        <a href={job.companyWebsite} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline inline-flex items-center gap-1">
                                            {job.companyWebsite} <ExternalLink size={12} />
                                        </a>
                                    </p>
                                )}
                                {job.companyLinkedin && (
                                    <p className="text-sm text-gray-600">
                                        <span className="font-bold text-gray-800">Company Linkedin Page: </span>
                                        <a href={job.companyLinkedin} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline inline-flex items-center gap-1">
                                            {job.companyLinkedin} <ExternalLink size={12} />
                                        </a>
                                    </p>
                                )}
                            </div>
                        </div>
                    )}


                    {/* Action Panel */}
                    {eligible ? (
                        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 space-y-3">
                            {!isApplied ? (
                                <div className="space-y-6 py-2">
                                    {/* Step 1 */}
                                    <div className="relative pl-8 pb-2 border-l-2 border-indigo-100 last:border-0 border-dashed">
                                        <div className="absolute -left-[9px] top-0 w-4 h-4 bg-indigo-600 rounded-full border-4 border-indigo-50" />
                                        <h4 className="text-sm font-bold text-gray-800 mb-1">Step 1 — Open the official listing and apply</h4>
                                        <p className="text-xs text-gray-400 mb-3">Redirect to the company's official career portal to submit your application.</p>
                                        {job.applyLink && (
                                            <a href={job.applyLink} target="_blank" rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 transition-all active:scale-[0.98]">
                                                <ExternalLink size={14} /> Open Official Listing
                                            </a>
                                        )}
                                    </div>

                                    {/* Step 2 */}
                                    <div className="relative pl-8">
                                        <div className="absolute -left-[9px] top-0 w-4 h-4 bg-emerald-500 rounded-full border-4 border-emerald-50" />
                                        <h4 className="text-sm font-bold text-gray-800 mb-1">Step 2 — Mark yourself as applied</h4>
                                        <p className="text-xs text-gray-400 mb-4">Once you have successfully applied on their website, click below to track your progress here.</p>
                                        <button onClick={markApplied} disabled={applying}
                                            className="flex items-center justify-center gap-2 w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg transition-all disabled:opacity-50 active:scale-[0.98]">
                                            {applying ? <><RefreshCw size={14} className="animate-spin" />Saving...</> : <><CheckCircle size={15} />I Applied — Mark as Applied</>}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <p className="text-sm font-semibold text-gray-700">Update your application status</p>
                                    {job.applyLink && (
                                        <a href={job.applyLink} target="_blank" rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 text-xs text-indigo-600 hover:underline">
                                            <ExternalLink size={11} />View original listing
                                        </a>
                                    )}
                                    <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}
                                        className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-indigo-400 bg-white font-medium">
                                        {ALL_STATUSES.map(s => <option key={s}>{s}</option>)}
                                    </select>
                                    <textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)}
                                        placeholder="Notes (optional)..."
                                        className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-indigo-400 bg-white" />
                                    <button onClick={updateStatus} disabled={updatingStatus}
                                        className="flex items-center justify-center gap-2 w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg transition-all shadow-md shadow-indigo-100 disabled:opacity-50 active:scale-[0.98]">
                                        {updatingStatus ? <><RefreshCw size={14} className="animate-spin" />Saving...</> : 'Save Status Update'}
                                    </button>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
                            <AlertCircle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-bold text-amber-800">Complete 75% of your course to apply</p>
                                <p className="text-xs text-amber-600 mt-0.5">Apply features unlock once you hit the eligibility threshold.</p>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}

// ─── Main ────────────────────────────────────────────────────────────────────
export default function JobPortal() {
    const [tab, setTab] = useState('open');
    const [jobs, setJobs] = useState([]);
    const [myApps, setMyApps] = useState([]);
    const [missedJobs, setMissedJobs] = useState([]);
    const [stats, setStats] = useState({ totalApplied: 0, underReview: 0, interviews: 0, offers: 0 });
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(null);
    const [eligible, setEligible] = useState(false);

    const fetchAll = useCallback(async (studentId) => {
        try {
            const [jobsRes, appsRes, missedRes, statsRes] = await Promise.all([
                axios.get(`${API}/api/student-jobs?studentId=${studentId}`),
                axios.get(`${API}/api/student-jobs/my-applications?studentId=${studentId}`),
                axios.get(`${API}/api/student-jobs/missed?studentId=${studentId}`),
                axios.get(`${API}/api/student-jobs/stats?studentId=${studentId}`),
            ]);
            const appsMap = {};
            appsRes.data.forEach(a => { appsMap[String(a.jobId?._id || a.jobId)] = a._id; });
            setJobs(jobsRes.data.map(j => ({ ...j, _appId: appsMap[String(j._id)] || null })));
            setMyApps(appsRes.data);
            setMissedJobs(missedRes.data);
            setStats(statsRes.data);
        } catch { toast.error('Failed to load jobs'); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => {
        const u = JSON.parse(localStorage.getItem('studentUser') || 'null');
        if (u?._id) {
            axios.get(`${API}/api/student/progress/stats/${u._id}`)
                .then(r => setEligible((r.data.stats?.completionPercentage || 0) >= 75))
                .catch(() => { });
            fetchAll(u._id);
        } else setLoading(false);
    }, [fetchAll]);

    const handleApplied = (jobId, status, appId) => {
        setJobs(p => p.map(j => j._id === jobId ? { ...j, appliedStatus: status, _appId: appId } : j));
        setModal(p => p ? { ...p, job: { ...p.job, appliedStatus: status, _appId: appId } } : null);
        if (status === 'Applied') setStats(p => ({ ...p, totalApplied: p.totalApplied + 1 }));
    };

    const openJobs = jobs.filter(j => !j.appliedStatus);
    const appliedJobs = jobs.filter(j => j.appliedStatus);

    const TABS = [
        { id: 'open', label: 'Open To Apply', count: openJobs.length },
        { id: 'applied', label: 'Applied', count: appliedJobs.length },
        { id: 'hiring', label: 'Hiring Done', count: jobs.filter(j => j.appliedStatus === 'Offer Received').length },
        { id: 'previous', label: 'Previous Jobs', count: missedJobs.length, dot: missedJobs.length > 0 },
    ];

    const getCurrentList = () => {
        if (tab === 'open') return openJobs;
        if (tab === 'applied') return myApps.map(a => ({ ...(a.jobId || {}), appliedStatus: a.status, _appId: a._id }));
        if (tab === 'hiring') return myApps.filter(a => a.status === 'Offer Received').map(a => ({ ...(a.jobId || {}), appliedStatus: a.status, _appId: a._id }));
        if (tab === 'previous') return missedJobs;
        return [];
    };


    const currentList = getCurrentList();

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-gray-400">Loading jobs...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <div className="max-w-5xl mx-auto px-4 pt-8">



                {/* Tabs */}
                <div className="flex gap-0 border-b border-gray-200 mb-6">
                    {TABS.map(t => (
                        <button key={t.id} onClick={() => setTab(t.id)}
                            className={`relative flex items-center gap-1.5 px-6 py-3 text-sm font-bold transition-all ${tab === t.id
                                ? 'text-indigo-600 border-b-2 border-indigo-600'
                                : 'text-gray-400 hover:text-gray-600'
                                }`}>
                            {t.label}
                            {t.count > 0 && (
                                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${tab === t.id ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400'}`}>
                                    {t.count}
                                </span>
                            )}
                            {t.dot && <span className="w-1.5 h-1.5 rounded-full bg-red-500" />}
                        </button>
                    ))}
                </div>

                {/* Eligibility notice */}
                {!eligible && tab === 'open' && (
                    <div className="mb-5 flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                        <AlertCircle size={16} className="text-amber-500 flex-shrink-0" />
                        <p className="text-sm text-amber-700">Complete <strong>75%</strong> of your course to unlock apply features.</p>
                    </div>
                )}

                {/* Grid */}
                {currentList.length === 0 ? (
                    <div className="flex flex-col items-center py-20 text-gray-300">
                        <Building size={44} className="mb-3" />
                        <p className="font-bold text-gray-400 text-lg">
                            {tab === 'open' ? 'No open jobs right now' :
                                tab === 'applied' ? 'No applications yet' :
                                    tab === 'hiring' ? 'No offers received yet' :
                                        'No previous jobs'}
                        </p>
                        {tab === 'applied' && <p className="text-sm text-gray-300 mt-1">Apply to jobs and track them here</p>}
                        {tab === 'hiring' && <p className="text-sm text-gray-300 mt-1">Keep applying — your offer is on its way! 💪</p>}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {currentList.map((job, i) => (
                            <JobCard
                                key={job._id || i}
                                job={job}
                                onOpen={(j, idx) => setModal({ job: j, index: idx })}
                                eligible={eligible}
                                index={i}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {modal && (
                    <JobModal
                        job={modal.job}
                        index={modal.index}
                        onClose={() => setModal(null)}
                        onApplied={handleApplied}
                        eligible={eligible}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
