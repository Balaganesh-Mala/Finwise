import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Search, Loader2, Filter, Eye, X, User, Star, CheckSquare, Award, Trash2, Edit2, Save, Sparkles, Youtube } from 'lucide-react';
import Swal from 'sweetalert2';

const MockInterviewHistory = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFeedback, setSelectedFeedback] = useState(null);

    // Filter States
    const [batches, setBatches] = useState([]);
    const [enrollments, setEnrollments] = useState([]);
    const [selectedBatch, setSelectedBatch] = useState('All');
    const [selectedType, setSelectedType] = useState('All');
    const [selectedInterviewer, setSelectedInterviewer] = useState('All');
    const [selectedStatus, setSelectedStatus] = useState('All');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [sortOrder, setSortOrder] = useState('Newest');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        fetchHistory();
        fetchBatches();
        fetchEnrollments();
    }, []);

    const fetchBatches = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const { data } = await axios.get(`${API_URL}/api/batches`);
            if (data.success) setBatches(data.batches);
        } catch (error) {
            console.error("Error fetching batches:", error);
        }
    };

    const fetchEnrollments = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const { data } = await axios.get(`${API_URL}/api/batches/enrollments/all`);
            if (data.success) setEnrollments(data.data);
        } catch (error) {
            console.error("Error fetching enrollments:", error);
        }
    };

    const calculateOverallScore = (skills, topics) => {
        let sum = 0;
        let count = 0;
        const skillKeys = ['communicationScore', 'technicalScore', 'confidenceScore', 'problemSolvingScore', 'bodyLanguageScore', 'practicalScore'];
        skillKeys.forEach(k => {
            sum += parseFloat(skills[k] || 0);
            count++;
        });

        topics.forEach(t => {
            if (t.topic && t.topic.trim() !== '') {
                sum += parseFloat(t.score || 0);
                count++;
            }
        });

        return count > 0 ? Number((sum / count).toFixed(1)) : 0;
    };

    const fetchHistory = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const { data } = await axios.get(`${API_URL}/api/mock-interviews/all`);
            if (data.success) {
                setHistory(data.data);
            }
        } catch (error) {
            console.error("Error fetching history:", error);
            toast.error("Failed to load interview history");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        const result = await Swal.fire({
            title: 'DANGER: Delete Interview?',
            text: 'This will permanently erase the record AND immediately deduct the exact Points and Coins the student earned from this evaluation. Their Rank Level may drop. This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, DELETE it'
        });

        if (!result.isConfirmed) return;
        
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const token = localStorage.getItem('adminToken');
            const { data } = await axios.delete(`${API_URL}/api/mock-interviews/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                toast.success('Interview deleted. Gamification wallet re-balanced.');
                setHistory(prev => prev.filter(h => h._id !== id));
            }
        } catch (error) {
            toast.error("Failed to delete interview.");
        }
    };

    const filteredHistory = history.filter(h => {
        const matchesSearch = 
            h.studentId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            h.studentId?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            h.interviewerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (h.status || h.performanceStatus || '').toLowerCase().includes(searchTerm.toLowerCase());

        const matchesType = selectedType === 'All' || h.interviewType === selectedType;
        const matchesInterviewer = selectedInterviewer === 'All' || h.interviewerName === selectedInterviewer;
        const matchesStatus = selectedStatus === 'All' || (h.status || h.performanceStatus) === selectedStatus;

        let matchesBatch = true;
        if (selectedBatch !== 'All') {
            const studentEnrollment = enrollments.find(e => 
                e.studentId?.toString() === h.studentId?._id?.toString() && 
                e.batchId?._id?.toString() === selectedBatch
            );
            matchesBatch = !!studentEnrollment;
        }

        let matchesDate = true;
        if (startDate || endDate) {
            const interviewDate = new Date(h.interviewDate || h.createdAt);
            interviewDate.setHours(0, 0, 0, 0);
            
            if (startDate) {
                const start = new Date(startDate);
                start.setHours(0, 0, 0, 0);
                if (interviewDate < start) matchesDate = false;
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(0, 0, 0, 0);
                if (interviewDate > end) matchesDate = false;
            }
        }

        return matchesSearch && matchesType && matchesInterviewer && matchesStatus && matchesBatch && matchesDate;
    }).sort((a, b) => {
        if (sortOrder === 'Score: High to Low') return b.overallScore - a.overallScore;
        if (sortOrder === 'Score: Low to High') return a.overallScore - b.overallScore;
        if (sortOrder === 'Oldest') return new Date(a.interviewDate || a.createdAt) - new Date(b.interviewDate || b.createdAt);
        // Default: Newest
        return new Date(b.interviewDate || b.createdAt) - new Date(a.interviewDate || a.createdAt);
    });

    // Derive unique filter options
    const uniqueTypes = [...new Set(history.map(h => h.interviewType))].filter(Boolean).sort();
    const uniqueInterviewers = [...new Set(history.map(h => h.interviewerName))].filter(Boolean).sort();
    const statuses = ['Job Ready', 'Highly Capable', 'Capable', 'Needs Improvement', 'Critical Risk'];

    const FeedbackModal = ({ feedback, onClose }) => {
        const [isEditing, setIsEditing] = useState(false);
        const [edited, setEdited] = useState(JSON.parse(JSON.stringify(feedback)));
        const [saving, setSaving] = useState(false);

        if (!feedback) return null;

        const handleSave = async () => {
            setSaving(true);
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                const token = localStorage.getItem('adminToken');
                const { data } = await axios.put(`${API_URL}/api/mock-interviews/${edited._id}`, {
                    interviewerName: edited.interviewerName,
                    performanceStatus: edited.status || edited.performanceStatus,
                    strengths: edited.strengths,
                    weaknesses: edited.weaknesses,
                    suggestions: edited.suggestions,
                    skillRemarks: edited.skillRemarks,
                    topicScores: edited.topicScores,
                    improvementPlan: edited.improvementPlan,
                    improvementPlanText: edited.improvementPlanText,
                    overallRemark: edited.overallRemark,
                    interviewDate: edited.interviewDate,
                    interviewType: edited.interviewType,
                    recordingUrl: edited.recordingUrl,
                    overallScore: edited.overallScore,
                    communicationScore: edited.communicationScore,
                    technicalScore: edited.technicalScore,
                    confidenceScore: edited.confidenceScore,
                    problemSolvingScore: edited.problemSolvingScore,
                    bodyLanguageScore: edited.bodyLanguageScore,
                    practicalScore: edited.practicalScore
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                if (data.success) {
                    toast.success('Feedback qualitative details updated successfully');
                    setHistory(prev => prev.map(h => h._id === edited._id ? { ...h, ...data.data } : h));
                    setIsEditing(false);
                }
            } catch (error) {
                toast.error("Failed to update feedback");
            } finally {
                setSaving(false);
            }
        };

        const toggleImprovementCheck = (idx) => {
            if(!isEditing) return;
            const newPlan = [...edited.improvementPlan];
            newPlan[idx].completed = !newPlan[idx].completed;
            setEdited({ ...edited, improvementPlan: newPlan });
        };

        const handleTopicScoreChange = (idx, val) => {
            const newTopics = [...edited.topicScores];
            newTopics[idx].score = parseFloat(val) || 0;
            const overall = calculateOverallScore(edited, newTopics);
            setEdited({ ...edited, topicScores: newTopics, overallScore: overall });
        };

        const handleRatingChange = (field, val) => {
            const updated = { ...edited, [field]: parseFloat(val) || 0 };
            const overall = calculateOverallScore(updated, updated.topicScores);
            setEdited({ ...updated, overallScore: overall });
        };

        const handleTopicNameChange = (idx, val) => {
            const newTopics = [...edited.topicScores];
            newTopics[idx].topic = val;
            const overall = calculateOverallScore(edited, newTopics);
            setEdited({ ...edited, topicScores: newTopics, overallScore: overall });
        };

        return (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
                        <div className="flex items-center gap-4">
                            {feedback.studentId?.profilePicture ? (
                                <img src={feedback.studentId.profilePicture} alt="Student" className="w-12 h-12 rounded-full border border-slate-200 object-cover" />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-semibold text-lg border border-indigo-200">
                                    {feedback.studentId?.name?.charAt(0) || '?'}
                                </div>
                            )}
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 tracking-tight">{feedback.studentId?.name || 'Unknown Student'}</h3>
                                {isEditing ? (
                                    <select 
                                        value={edited.interviewType} 
                                        onChange={(e) => setEdited({...edited, interviewType: e.target.value})}
                                        className="text-xs font-bold text-indigo-600 bg-indigo-50 border-none outline-none rounded p-1"
                                    >
                                        <option value="HR">HR Interview</option>
                                        <option value="Technical">Technical Interview</option>
                                        <option value="Mixed">Mixed Interview</option>
                                        <option value="Finance">Finance Interview</option>
                                    </select>
                                ) : (
                                    <p className="text-xs font-medium text-slate-500">{feedback.interviewType} Interview</p>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {isEditing ? (
                                <button onClick={handleSave} disabled={saving} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-indigo-700 disabled:opacity-50">
                                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save Changes
                                </button>
                            ) : (
                                <button onClick={() => setIsEditing(true)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors font-medium flex items-center gap-2 px-3 text-sm">
                                    <Edit2 size={16} /> Edit Details
                                </button>
                            )}
                            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors ml-2">
                                <X size={24} />
                            </button>
                        </div>
                    </div>

                    <div className="p-6 overflow-y-auto flex-1 space-y-6">
                        <div className="flex flex-wrap gap-4">
                            <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl flex-1 min-w-[120px]">
                                <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Calculated Score</p>
                                <p className="text-2xl font-bold text-indigo-700">{isEditing ? edited.overallScore : feedback.overallScore}/10</p>
                            </div>
                            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex-1 min-w-[120px]">
                                <p className="text-xs font-bold text-slate-500 uppercase">Status</p>
                                {isEditing ? (
                                    <select 
                                        value={edited.status || edited.performanceStatus} 
                                        onChange={(e) => setEdited({...edited, status: e.target.value})}
                                        className="mt-1 w-full bg-white border border-slate-300 rounded-lg p-1 font-bold text-slate-700"
                                    >
                                        <option value="Job Ready">Job Ready</option>
                                        <option value="Highly Capable">Highly Capable</option>
                                        <option value="Capable">Capable</option>
                                        <option value="Needs Improvement">Needs Improvement</option>
                                        <option value="Critical Risk">Critical Risk</option>
                                    </select>
                                ) : (
                                    <p className={`text-lg font-bold mt-1 ${
                                        (feedback.status || feedback.performanceStatus) === 'Job Ready' ? 'text-emerald-600' :
                                        (feedback.status || feedback.performanceStatus) === 'Highly Capable' ? 'text-blue-600' :
                                        (feedback.status || feedback.performanceStatus) === 'Needs Improvement' ? 'text-rose-500' : 'text-amber-500'
                                    }`}>{feedback.status || feedback.performanceStatus || 'Evaluated'}</p>
                                )}
                            </div>
                            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex-1 min-w-[120px]">
                                <p className="text-xs font-bold text-slate-500 uppercase">Interviewer</p>
                                {isEditing ? (
                                    <input 
                                        type="text" 
                                        value={edited.interviewerName} 
                                        onChange={(e) => setEdited({...edited, interviewerName: e.target.value})}
                                        className="mt-1 w-full bg-white border border-slate-300 rounded-lg p-1 font-bold text-slate-700"
                                    />
                                ) : (
                                    <p className="text-lg font-bold text-slate-800 mt-1">{feedback.interviewerName}</p>
                                )}
                            </div>
                            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex-1 min-w-[120px]">
                                <p className="text-xs font-bold text-slate-500 uppercase">Interview Date</p>
                                {isEditing ? (
                                    <input 
                                        type="date" 
                                        value={edited.interviewDate ? new Date(edited.interviewDate).toISOString().split('T')[0] : ''} 
                                        onChange={(e) => setEdited({...edited, interviewDate: e.target.value})}
                                        className="mt-1 w-full bg-white border border-slate-300 rounded-lg p-1 font-bold text-slate-700"
                                    />
                                ) : (
                                    <p className="text-lg font-bold text-slate-800 mt-1">
                                        {new Date(feedback.interviewDate || feedback.createdAt).toLocaleDateString('en-GB')}
                                    </p>
                                )}
                            </div>
                            
                            {isEditing ? (
                                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex-[2] min-w-[200px]">
                                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">Video Recording URL</p>
                                    <input 
                                        type="text" 
                                        value={edited.recordingUrl || ''} 
                                        onChange={(e) => setEdited({...edited, recordingUrl: e.target.value})}
                                        placeholder="https://youtube.com/..."
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white outline-none focus:ring-1 focus:ring-red-500"
                                    />
                                </div>
                            ) : feedback.recordingUrl && (
                                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex-1 min-w-[120px] flex items-center justify-center">
                                    <a href={feedback.recordingUrl} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-1 group">
                                        <Youtube size={24} className="text-red-500 group-hover:scale-110 transition-transform" />
                                        <span className="text-[10px] font-bold text-white uppercase tracking-wider">Watch Recording</span>
                                    </a>
                                </div>
                            )}
                        </div>

                        <div>
                            <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                                <Award size={16} className="text-indigo-500" /> Topic Performance & Remarks
                            </h4>
                            <div className="space-y-3">
                                {edited.topicScores?.map((t, idx) => (
                                    <div key={idx} className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 flex flex-col gap-2">
                                        <div className="flex justify-between items-center text-sm">
                                            {isEditing ? (
                                                <div className="flex items-center gap-2 w-full">
                                                    <input 
                                                        value={t.topic} 
                                                        onChange={(e) => handleTopicNameChange(idx, e.target.value)}
                                                        className="bg-white border border-slate-200 outline-none px-2 py-1 rounded font-bold text-slate-700 flex-1"
                                                    />
                                                    <div className="flex items-center gap-1">
                                                        <input 
                                                            type="number" 
                                                            min="0" max="10" step="0.5"
                                                            value={t.score} 
                                                            onChange={(e) => handleTopicScoreChange(idx, e.target.value)}
                                                            className="w-12 bg-white border border-slate-200 rounded px-1 py-1 text-center font-bold text-indigo-600 outline-none"
                                                        />
                                                        <span className="text-[10px] font-bold text-slate-400">/10</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <span className="font-bold text-slate-700">{t.topic || 'Untitled'}</span>
                                                    <span className="font-bold text-indigo-600 bg-indigo-100 px-2.5 py-1 rounded-lg text-xs">{t.score}/10</span>
                                                </>
                                            )}
                                        </div>
                                        {isEditing ? (
                                            <div className="flex items-center gap-2">
                                                <input 
                                                    value={t.remark || ''} 
                                                    onChange={(e) => {
                                                        const newTopics = [...edited.topicScores];
                                                        newTopics[idx].remark = e.target.value;
                                                        setEdited({ ...edited, topicScores: newTopics });
                                                    }}
                                                    className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2 py-1.5 outline-none focus:ring-1 focus:ring-indigo-500"
                                                    placeholder="Specific remark for this topic..."
                                                />
                                                <button onClick={() => {
                                                    const newTopics = edited.topicScores.filter((_, i) => i !== idx);
                                                    setEdited({...edited, topicScores: newTopics, overallScore: calculateOverallScore(edited, newTopics)});
                                                }} className="text-rose-500 p-1 hover:bg-rose-50 rounded">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        ) : t.remark && (
                                            <p className="text-[10px] text-slate-500 italic font-medium bg-white/50 p-2 rounded-lg">{t.remark}</p>
                                        )}
                                    </div>
                                ))}
                                {isEditing && (
                                    <button 
                                        onClick={() => {
                                            const newTopics = [...(edited.topicScores || []), { topic: '', score: 0, remark: '' }];
                                            setEdited({...edited, topicScores: newTopics});
                                        }}
                                        className="text-xs font-bold text-indigo-600 py-2 border border-dashed border-indigo-200 rounded-xl hover:bg-indigo-50 transition-colors"
                                    >
                                        + Add Custom Topic
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Skill Remarks */}
                        <div>
                            <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                                <Star size={16} className="text-amber-500" /> Skill-Specific Remarks
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {[
                                    { key: 'communication', label: 'Communication Score', scoreKey: 'communicationScore' },
                                    { key: 'technical', label: 'Subject Knowledge', scoreKey: 'technicalScore' },
                                    { key: 'confidence', label: 'Confidence', scoreKey: 'confidenceScore' },
                                    { key: 'problemSolving', label: 'Problem Solving', scoreKey: 'problemSolvingScore' },
                                    { key: 'bodyLanguage', label: 'Body Language', scoreKey: 'bodyLanguageScore' },
                                    { key: 'practical', label: 'Practical Skills', scoreKey: 'practicalScore' },
                                ].map(skill => (
                                    <div key={skill.key} className="bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-[9px] font-bold text-indigo-600 uppercase block">{skill.label}</span>
                                            {isEditing ? (
                                                <input 
                                                    type="number" min="0" max="10" step="1"
                                                    value={edited[skill.scoreKey]}
                                                    onChange={(e) => handleRatingChange(skill.scoreKey, e.target.value)}
                                                    className="w-10 text-xs font-bold text-indigo-700 bg-white border border-slate-200 rounded text-center"
                                                />
                                            ) : (
                                                <span className="text-[10px] font-bold text-indigo-700">{feedback[skill.scoreKey]}/10</span>
                                            )}
                                        </div>
                                        {isEditing ? (
                                            <div className="space-y-2">
                                                <input 
                                                    type="range" min="0" max="10" step="1"
                                                    value={edited[skill.scoreKey]}
                                                    onChange={(e) => handleRatingChange(skill.scoreKey, e.target.value)}
                                                    className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                                />
                                                <input 
                                                    value={edited.skillRemarks?.[skill.key] || ''}
                                                    onChange={(e) => {
                                                        setEdited({
                                                            ...edited,
                                                            skillRemarks: { ...edited.skillRemarks, [skill.key]: e.target.value }
                                                        });
                                                    }}
                                                    className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2 py-1 outline-none"
                                                    placeholder={`Remark for ${skill.key}...`}
                                                />
                                            </div>
                                        ) : (
                                            <p className="text-xs text-slate-600 leading-relaxed font-medium">
                                                {feedback.skillRemarks?.[skill.key] || 'No remark'}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className={`p-4 rounded-2xl ${isEditing ? 'bg-white border-2 border-emerald-200' : 'bg-emerald-50/50 border border-emerald-100'}`}>
                                <h4 className="text-xs font-bold text-emerald-600 uppercase mb-2">Strengths</h4>
                                {isEditing ? (
                                    <textarea 
                                        value={edited.strengths} 
                                        onChange={e => setEdited({...edited, strengths: e.target.value})}
                                        className="w-full h-32 bg-transparent border-none outline-none resize-none text-sm text-emerald-900 font-medium leading-relaxed"
                                        placeholder="Add strengths..."
                                    />
                                ) : (
                                    <p className="text-sm text-emerald-900 leading-relaxed font-medium whitespace-pre-wrap">{feedback.strengths || 'None recorded'}</p>
                                )}
                            </div>
                            
                            <div className={`p-4 rounded-2xl ${isEditing ? 'bg-white border-2 border-rose-200' : 'bg-rose-50/50 border border-rose-100'}`}>
                                <h4 className="text-xs font-bold text-rose-600 uppercase mb-2">Weaknesses</h4>
                                {isEditing ? (
                                    <textarea 
                                        value={edited.weaknesses} 
                                        onChange={e => setEdited({...edited, weaknesses: e.target.value})}
                                        className="w-full h-32 bg-transparent border-none outline-none resize-none text-sm text-rose-900 font-medium leading-relaxed"
                                        placeholder="Add weaknesses..."
                                    />
                                ) : (
                                    <p className="text-sm text-rose-900 leading-relaxed font-medium whitespace-pre-wrap">{feedback.weaknesses || 'None recorded'}</p>
                                )}
                            </div>

                            <div className={`p-4 rounded-2xl md:col-span-2 ${isEditing ? 'bg-white border-2 border-indigo-200' : 'bg-indigo-50/30 border border-indigo-100'}`}>
                                <h4 className="text-xs font-bold text-indigo-600 uppercase mb-2">Suggestions</h4>
                                {isEditing ? (
                                    <textarea 
                                        value={edited.suggestions} 
                                        onChange={e => setEdited({...edited, suggestions: e.target.value})}
                                        className="w-full h-32 bg-transparent border-none outline-none resize-none text-sm text-indigo-900 font-medium leading-relaxed"
                                        placeholder="Add suggestions..."
                                    />
                                ) : (
                                    <p className="text-sm text-indigo-900 leading-relaxed font-medium whitespace-pre-wrap">{feedback.suggestions || 'None recorded'}</p>
                                )}
                            </div>
                        </div>

                        {/* Overall Remark */}
                        <div className={`p-4 rounded-2xl ${isEditing ? 'bg-white border-2 border-amber-200' : 'bg-amber-50/30 border border-amber-100'}`}>
                            <h4 className="text-xs font-bold text-amber-600 uppercase mb-2">Overall Remark</h4>
                            {isEditing ? (
                                <textarea 
                                    value={edited.overallRemark} 
                                    onChange={e => setEdited({...edited, overallRemark: e.target.value})}
                                    className="w-full h-24 bg-transparent border-none outline-none resize-none text-sm text-amber-900 font-bold leading-relaxed"
                                    placeholder="Final summary remark..."
                                />
                            ) : (
                                <p className="text-sm text-amber-900 leading-relaxed font-bold italic whitespace-pre-wrap">{feedback.overallRemark || 'None recorded'}</p>
                            )}
                        </div>

                        {/* Formatted Improvement Plan Text */}
                        <div>
                            <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                                <Sparkles size={16} className="text-indigo-500" /> Structured Improvement Roadmap
                            </h4>
                            {isEditing ? (
                                <textarea 
                                    value={edited.improvementPlanText} 
                                    onChange={e => setEdited({...edited, improvementPlanText: e.target.value})}
                                    className="w-full h-48 bg-slate-900 text-slate-300 font-mono text-xs p-4 rounded-2xl outline-none resize-none leading-relaxed"
                                    placeholder="Paste structured plan here..."
                                />
                            ) : (
                                feedback.improvementPlanText && (
                                    <div className="bg-slate-900 p-4 rounded-2xl font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed shadow-inner">
                                        {feedback.improvementPlanText}
                                    </div>
                                )
                            )}
                        </div>

                        {edited.improvementPlan && edited.improvementPlan.length > 0 && (
                            <div>
                                <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                                    <CheckSquare size={16} className="text-blue-500" /> Action Checklist
                                </h4>
                                <div className="space-y-2">
                                    {edited.improvementPlan.map((plan, idx) => (
                                        <div 
                                            key={idx} 
                                            onClick={() => toggleImprovementCheck(idx)}
                                            className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                                                isEditing ? 'cursor-pointer hover:border-indigo-300' : 'cursor-default'
                                            } ${plan.completed ? 'bg-indigo-50/50 border-indigo-100' : 'bg-slate-50 border-slate-100'}`}
                                        >
                                            <input type="checkbox" checked={plan.completed} readOnly className="mt-1 accent-indigo-600" />
                                            {isEditing ? (
                                                <input 
                                                    value={plan.task} 
                                                    onChange={e => {
                                                        const newPlan = [...edited.improvementPlan];
                                                        newPlan[idx].task = e.target.value;
                                                        setEdited({...edited, improvementPlan: newPlan});
                                                    }}
                                                    className="w-full bg-transparent border-none outline-none text-sm font-medium text-slate-700" 
                                                />
                                            ) : (
                                                <span className={`text-sm font-medium ${plan.completed ? 'text-indigo-800' : 'text-slate-700'}`}>{plan.task}</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {isEditing && (
                            <button
                                onClick={() => setEdited({...edited, improvementPlan: [...edited.improvementPlan, { task: 'New Action Item', completed: false }]})}
                                className="w-full py-2 bg-slate-50 text-indigo-600 font-bold text-sm rounded-xl border border-dashed border-indigo-200 hover:bg-slate-100"
                            >
                                + Add Another Plan Item
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Mock Interview History</h1>
                    <p className="text-slate-500 text-sm mt-1">Review all global feedback and student performance reports.</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-2xl border transition-all ${
                            showFilters || selectedBatch !== 'All' || selectedType !== 'All' || selectedInterviewer !== 'All' || selectedStatus !== 'All' || startDate || endDate || sortOrder !== 'Newest'
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                        <Filter size={18} />
                        <span className="text-sm font-bold">Filters</span>
                        {(selectedBatch !== 'All' || selectedType !== 'All' || selectedInterviewer !== 'All' || selectedStatus !== 'All' || startDate || endDate || sortOrder !== 'Newest') && (
                            <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                        )}
                    </button>

                    <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm shadow-slate-100">
                        <Search className="text-slate-400 ml-2" size={20} />
                        <input
                            type="text"
                            placeholder="Search student or interviewer..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-transparent border-none outline-none text-sm font-medium text-slate-700 w-64 px-2 py-1 placeholder:text-slate-400"
                        />
                    </div>
                </div>
            </div>

            {/* Filter Panel */}
            {showFilters && (
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm animate-in slide-in-from-top-2 duration-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Start Date</label>
                            <input 
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">End Date</label>
                            <input 
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sort Order</label>
                            <select 
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20"
                            >
                                <option value="Newest">Newest First</option>
                                <option value="Oldest">Oldest First</option>
                                <option value="Score: High to Low">Score: High to Low</option>
                                <option value="Score: Low to High">Score: Low to High</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Batch</label>
                            <select 
                                value={selectedBatch}
                                onChange={(e) => setSelectedBatch(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20"
                            >
                                <option value="All">All Batches</option>
                                {batches.map(b => (
                                    <option key={b._id} value={b._id}>{b.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Interview Type</label>
                            <select 
                                value={selectedType}
                                onChange={(e) => setSelectedType(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20"
                            >
                                <option value="All">All Types</option>
                                {uniqueTypes.map(t => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Interviewer</label>
                            <select 
                                value={selectedInterviewer}
                                onChange={(e) => setSelectedInterviewer(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20"
                            >
                                <option value="All">All Interviewers</option>
                                {uniqueInterviewers.map(interviewer => (
                                    <option key={interviewer} value={interviewer}>{interviewer}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
                            <select 
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20"
                            >
                                <option value="All">All Statuses</option>
                                {statuses.map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
                        <p className="text-xs font-medium text-slate-400">
                            Showing <span className="font-bold text-slate-900">{filteredHistory.length}</span> results
                        </p>
                        <button 
                            onClick={() => {
                                setSelectedBatch('All');
                                setSelectedType('All');
                                setSelectedInterviewer('All');
                                setSelectedStatus('All');
                                setStartDate('');
                                setEndDate('');
                                setSortOrder('Newest');
                                setSearchTerm('');
                            }}
                            className="text-xs font-bold text-rose-500 hover:text-rose-600 flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-all"
                        >
                            <X size={14} /> Reset All Filters
                        </button>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="flex flex-col items-center justify-center p-20 gap-4">
                    <Loader2 className="animate-spin text-indigo-500" size={40} />
                    <p className="text-slate-400 font-bold animate-pulse">Loading global history...</p>
                </div>
            ) : filteredHistory.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-16 text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                        <Award className="text-slate-300" size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-700 mb-2">No History Found</h3>
                    <p className="text-slate-500">No mock interview feedback has been submitted yet.</p>
                </div>
            ) : (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Student</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Type & Interviewer</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Score</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredHistory.map((h) => (
                                    <tr key={h._id} className="hover:bg-indigo-50/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {h.studentId?.profilePicture ? (
                                                    <img src={h.studentId.profilePicture} alt="" className="w-9 h-9 rounded-full object-cover border border-slate-200" />
                                                ) : (
                                                    <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs ring-2 ring-white">
                                                        {h.studentId?.name?.charAt(0) || '?'}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800">{h.studentId?.name || 'Deleted User'}</p>
                                                    <p className="text-xs font-medium text-slate-400">{h.studentId?.email || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-semibold text-slate-600">
                                            {new Date(h.interviewDate || h.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-bold text-slate-800">{h.interviewType}</p>
                                            <p className="text-xs font-medium text-slate-500">by {h.interviewerName}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-xs font-bold">
                                                <Star size={12} className="fill-indigo-600" /> {h.overallScore}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                                                (h.status || h.performanceStatus) === 'Job Ready' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                (h.status || h.performanceStatus) === 'Highly Capable' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                (h.status || h.performanceStatus) === 'Needs Improvement' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                                            }`}>
                                                {h.status || h.performanceStatus || 'Evaluated'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button 
                                                    onClick={() => setSelectedFeedback(h)}
                                                    className="p-2 text-indigo-600/70 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button 
                                                    onClick={(e) => handleDelete(h._id, e)}
                                                    className="p-2 text-rose-500/70 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {selectedFeedback && <FeedbackModal feedback={selectedFeedback} onClose={() => setSelectedFeedback(null)} />}
        </div>
    );
};

export default MockInterviewHistory;
