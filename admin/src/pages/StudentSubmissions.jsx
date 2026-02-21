import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    ClipboardList, ChevronDown, FileText, ExternalLink,
    User, Clock, BookOpen, Search, CheckCircle2, XCircle,
    BarChart3, Award, Layers, Tag, AlertCircle, Brain
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/* ── Helpers ── */
const fmt = (d) => d ? new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—';
const pct = (s, t) => (t > 0 ? Math.round((s / t) * 100) : 0);

const StudentSubmissions = () => {
    const [courses, setCourses] = useState([]);
    const [modules, setModules] = useState([]);
    const [topics, setTopics] = useState([]);

    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedModule, setSelectedModule] = useState('');
    const [selectedTopic, setSelectedTopic] = useState('');
    const [topicName, setTopicName] = useState('');

    const [taskSubs, setTaskSubs] = useState([]);
    const [assignmentSubs, setAssignmentSubs] = useState([]);
    const [mcqAttempts, setMcqAttempts] = useState([]);

    const [loading, setLoading] = useState(false);
    const [fetched, setFetched] = useState(false);
    const [activeTab, setActiveTab] = useState('mcq');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        axios.get(`${API_URL}/api/courses`)
            .then(res => setCourses(Array.isArray(res.data) ? res.data : res.data.courses || []))
            .catch(console.error);
    }, []);

    useEffect(() => {
        if (!selectedCourse) { setModules([]); setTopics([]); setSelectedModule(''); setSelectedTopic(''); return; }
        axios.get(`${API_URL}/api/modules/${selectedCourse}`)
            .then(res => setModules(res.data.modules || []))
            .catch(console.error);
        setSelectedModule(''); setSelectedTopic(''); setTopics([]);
    }, [selectedCourse]);

    useEffect(() => {
        if (!selectedModule) { setTopics([]); setSelectedTopic(''); return; }
        axios.get(`${API_URL}/api/topics/${selectedModule}`)
            .then(res => setTopics(res.data.topics || []))
            .catch(console.error);
        setSelectedTopic('');
    }, [selectedModule]);

    const fetchSubmissions = async (topicId) => {
        if (!topicId) return;
        setLoading(true); setFetched(false);
        try {
            const { data } = await axios.get(`${API_URL}/api/topic-content/${topicId}/all-submissions`);
            setTaskSubs(data.submissions.tasks || []);
            setAssignmentSubs(data.submissions.assignments || []);
            setMcqAttempts(data.submissions.mcq || []);
        } catch (err) {
            console.error(err);
            setTaskSubs([]); setAssignmentSubs([]); setMcqAttempts([]);
        } finally {
            setLoading(false); setFetched(true);
        }
    };

    const handleTopicChange = (e) => {
        const id = e.target.value;
        setSelectedTopic(id);
        const t = topics.find(t => t._id === id);
        setTopicName(t?.title || '');
        setActiveTab('mcq');
        setSearchQuery('');
        fetchSubmissions(id);
    };

    const filter = (arr) => arr.filter(s =>
        (s.studentId?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredTasks = filter(taskSubs);
    const filteredAssignments = filter(assignmentSubs);
    const filteredMCQ = filter(mcqAttempts);

    const passed = mcqAttempts.filter(a => pct(a.score, a.total) >= 75).length;
    const failed = mcqAttempts.length - passed;

    const tabs = [
        { id: 'mcq', label: 'MCQ Results', icon: Brain, count: mcqAttempts.length, color: 'violet' },
        { id: 'tasks', label: 'Task Submissions', icon: ClipboardList, count: taskSubs.length, color: 'indigo' },
        { id: 'assignments', label: 'Assignments', icon: FileText, count: assignmentSubs.length, color: 'blue' },
    ];

    const tabColor = {
        violet: { active: 'bg-violet-600 text-white shadow-md shadow-violet-200', badge: 'bg-violet-100 text-violet-700' },
        indigo: { active: 'bg-indigo-600 text-white shadow-md shadow-indigo-200', badge: 'bg-indigo-100 text-indigo-700' },
        blue: { active: 'bg-blue-600 text-white shadow-md shadow-blue-200', badge: 'bg-blue-100 text-blue-700' },
    };

    return (
        <div className="space-y-6">
            {/* ── Header ── */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                        <ClipboardList size={22} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Student Submissions</h1>
                        <p className="text-gray-500 text-sm">Review tasks, assignments &amp; MCQ results by topic</p>
                    </div>
                </div>
                {fetched && topicName && (
                    <div className="flex items-center gap-2 text-sm font-medium text-indigo-700 bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-full">
                        <Tag size={13} /> {topicName}
                    </div>
                )}
            </div>

            {/* ── Cascading Selectors ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-5">
                    <BookOpen size={17} className="text-indigo-500" />
                    <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Filter by Topic</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { label: 'Course', value: selectedCourse, onChange: e => setSelectedCourse(e.target.value), options: courses.map(c => ({ v: c._id, l: c.title })), disabled: false },
                        { label: 'Module', value: selectedModule, onChange: e => setSelectedModule(e.target.value), options: modules.map(m => ({ v: m._id, l: m.title })), disabled: !selectedCourse },
                        { label: 'Topic', value: selectedTopic, onChange: handleTopicChange, options: topics.map(t => ({ v: t._id, l: t.title })), disabled: !selectedModule },
                    ].map(({ label, value, onChange, options, disabled }) => (
                        <div key={label}>
                            <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">{label}</label>
                            <div className="relative">
                                <select
                                    value={value}
                                    onChange={onChange}
                                    disabled={disabled}
                                    className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm text-gray-700 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 outline-none transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <option value="">— Select {label} —</option>
                                    {options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                                </select>
                                <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Loading ── */}
            {loading && (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                    <p className="text-sm text-gray-400 font-medium">Fetching submissions…</p>
                </div>
            )}

            {/* ── Empty State ── */}
            {!loading && !fetched && (
                <div className="flex flex-col items-center justify-center py-28 text-gray-300 gap-4">
                    <Layers size={56} strokeWidth={1.2} />
                    <div className="text-center">
                        <p className="text-lg font-semibold text-gray-400">No topic selected</p>
                        <p className="text-sm text-gray-300 mt-1">Choose a course, module, and topic above to view submissions</p>
                    </div>
                </div>
            )}

            {/* ── Results ── */}
            {!loading && fetched && (
                <div className="space-y-5">
                    {/* Stats row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <StatCard icon={Brain} label="MCQ Attempts" value={mcqAttempts.length} color="violet" />
                        <StatCard icon={CheckCircle2} label="Passed (≥75%)" value={passed} color="green" />
                        <StatCard icon={XCircle} label="Failed (<75%)" value={failed} color="red" />
                        <StatCard icon={ClipboardList} label="Task Submissions" value={taskSubs.length} color="indigo" />
                    </div>

                    {/* Tabs + Search */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex gap-2 bg-gray-100 p-1 rounded-xl w-fit">
                            {tabs.map(tab => {
                                const isActive = activeTab === tab.id;
                                const c = tabColor[tab.color];
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive ? c.active : 'text-gray-500 hover:text-gray-700 hover:bg-white'}`}
                                    >
                                        <tab.icon size={15} />
                                        {tab.label}
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${isActive ? 'bg-white/25 text-white' : c.badge}`}>{tab.count}</span>
                                    </button>
                                );
                            })}
                        </div>
                        <div className="relative">
                            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Filter by student name…"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all w-64"
                            />
                        </div>
                    </div>

                    {/* Tab Content */}
                    {activeTab === 'mcq' && (
                        <MCQTable rows={filteredMCQ} />
                    )}
                    {activeTab === 'tasks' && (
                        <TaskTable rows={filteredTasks} />
                    )}
                    {activeTab === 'assignments' && (
                        <AssignmentTable rows={filteredAssignments} />
                    )}
                </div>
            )}
        </div>
    );
};

/* ── Stat Card ── */
const colors = {
    violet: { bg: 'bg-violet-50', icon: 'bg-violet-100 text-violet-600', text: 'text-violet-700' },
    green: { bg: 'bg-green-50', icon: 'bg-green-100 text-green-600', text: 'text-green-700' },
    red: { bg: 'bg-red-50', icon: 'bg-red-100 text-red-500', text: 'text-red-600' },
    indigo: { bg: 'bg-indigo-50', icon: 'bg-indigo-100 text-indigo-600', text: 'text-indigo-700' },
};
const StatCard = ({ icon: Icon, label, value, color }) => {
    const c = colors[color];
    return (
        <div className={`${c.bg} rounded-2xl p-4 border border-white`}>
            <div className={`w-9 h-9 rounded-xl ${c.icon} flex items-center justify-center mb-3`}>
                <Icon size={18} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className={`text-xs font-medium mt-0.5 ${c.text}`}>{label}</p>
        </div>
    );
};

/* ── Student Avatar Cell ── */
const AvatarCell = ({ name, email }) => (
    <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
            {name?.charAt(0)?.toUpperCase() || <User size={14} />}
        </div>
        <div>
            <p className="font-semibold text-gray-800 text-sm leading-tight">{name || 'Unknown'}</p>
            <p className="text-xs text-gray-400">{email || ''}</p>
        </div>
    </div>
);

/* ── Date Cell ── */
const TimeCell = ({ date }) => (
    <div className="flex items-center gap-1.5 text-gray-400 text-xs whitespace-nowrap">
        <Clock size={11} />
        {fmt(date)}
    </div>
);

/* ── Empty Table Message ── */
const EmptyRow = ({ cols, message }) => (
    <tr>
        <td colSpan={cols} className="py-14 text-center">
            <div className="flex flex-col items-center gap-2 text-gray-300">
                <AlertCircle size={32} strokeWidth={1.2} />
                <p className="text-sm font-medium text-gray-400">{message}</p>
            </div>
        </td>
    </tr>
);

/* ── Table Wrapper ── */
const TableWrap = ({ children, columns }) => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                        {columns.map(col => (
                            <th key={col} className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{col}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">{children}</tbody>
            </table>
        </div>
    </div>
);

/* ── MCQ Results Table ── */
const MCQTable = ({ rows }) => (
    <TableWrap columns={['Student', 'Score', 'Result', 'Percentage', 'Attempted At']}>
        {rows.length === 0
            ? <EmptyRow cols={5} message="No MCQ attempts for this topic yet." />
            : rows.map((a, i) => {
                const p = pct(a.score, a.total);
                const passed = p >= 75;
                return (
                    <tr key={i} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-5 py-4"><AvatarCell name={a.studentId?.name} email={a.studentId?.email} /></td>
                        <td className="px-5 py-4">
                            <span className="font-bold text-gray-800">{a.score}</span>
                            <span className="text-gray-400 font-normal"> / {a.total}</span>
                        </td>
                        <td className="px-5 py-4">
                            {passed
                                ? <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-100 text-xs font-bold px-3 py-1.5 rounded-full"><CheckCircle2 size={13} />Passed</span>
                                : <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-600 border border-red-100 text-xs font-bold px-3 py-1.5 rounded-full"><XCircle size={13} />Failed</span>
                            }
                        </td>
                        <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                                <div className="w-24 h-2 rounded-full bg-gray-100 overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all ${passed ? 'bg-green-500' : 'bg-red-400'}`}
                                        style={{ width: `${p}%` }}
                                    />
                                </div>
                                <span className={`text-xs font-bold ${passed ? 'text-green-600' : 'text-red-500'}`}>{p}%</span>
                            </div>
                        </td>
                        <td className="px-5 py-4"><TimeCell date={a.attemptedAt} /></td>
                    </tr>
                );
            })}
    </TableWrap>
);

/* ── Task Submissions Table ── */
const TaskTable = ({ rows }) => (
    <TableWrap columns={['Student', 'Task #', 'Answer', 'File', 'Submitted At']}>
        {rows.length === 0
            ? <EmptyRow cols={5} message="No task submissions for this topic yet." />
            : rows.map((s, i) => (
                <tr key={i} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-4"><AvatarCell name={s.studentId?.name} email={s.studentId?.email} /></td>
                    <td className="px-5 py-4">
                        <span className="font-mono text-xs bg-indigo-50 text-indigo-600 border border-indigo-100 px-2.5 py-1 rounded-lg font-bold">
                            #{(s.taskIndex ?? 0) + 1}
                        </span>
                    </td>
                    <td className="px-5 py-4 max-w-xs">
                        {s.answerText
                            ? <p className="text-gray-600 text-sm line-clamp-2">{s.answerText}</p>
                            : <span className="text-gray-300 text-xs italic">No text</span>}
                    </td>
                    <td className="px-5 py-4">
                        {s.fileUrl
                            ? <a href={s.fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 text-xs font-semibold bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 transition-colors"><ExternalLink size={12} />View File</a>
                            : <span className="text-gray-300 text-xs">—</span>}
                    </td>
                    <td className="px-5 py-4"><TimeCell date={s.submittedAt} /></td>
                </tr>
            ))}
    </TableWrap>
);

/* ── Assignment Submissions Table ── */
const AssignmentTable = ({ rows }) => (
    <TableWrap columns={['Student', 'Assignment #', 'Uploaded File', 'Submitted At']}>
        {rows.length === 0
            ? <EmptyRow cols={4} message="No assignment submissions for this topic yet." />
            : rows.map((s, i) => (
                <tr key={i} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-4"><AvatarCell name={s.studentId?.name} email={s.studentId?.email} /></td>
                    <td className="px-5 py-4">
                        <span className="font-mono text-xs bg-blue-50 text-blue-600 border border-blue-100 px-2.5 py-1 rounded-lg font-bold">
                            #{(s.assignmentIndex ?? 0) + 1}
                        </span>
                    </td>
                    <td className="px-5 py-4">
                        <a href={s.fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 text-xs font-semibold bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 transition-colors">
                            <FileText size={12} />Open PDF
                        </a>
                    </td>
                    <td className="px-5 py-4"><TimeCell date={s.submittedAt} /></td>
                </tr>
            ))}
    </TableWrap>
);

export default StudentSubmissions;
