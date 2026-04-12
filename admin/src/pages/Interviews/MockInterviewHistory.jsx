import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Search, Loader2, Filter, Eye, X, User, Star, CheckSquare, Award, Trash2, Edit2, Save } from 'lucide-react';
import Swal from 'sweetalert2';

const MockInterviewHistory = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFeedback, setSelectedFeedback] = useState(null);

    useEffect(() => {
        fetchHistory();
    }, []);

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

    const filteredHistory = history.filter(h => 
        h.studentId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.studentId?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.interviewerName.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                    performanceStatus: edited.performanceStatus,
                    strengths: edited.strengths,
                    weaknesses: edited.weaknesses,
                    topicScores: edited.topicScores,
                    improvementPlan: edited.improvementPlan
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

        const handleTopicNameChange = (idx, val) => {
            const newTopics = [...edited.topicScores];
            newTopics[idx].topic = val;
            setEdited({ ...edited, topicScores: newTopics });
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
                                <p className="text-xs font-medium text-slate-500">{feedback.interviewType} Interview</p>
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
                                <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Overall Score</p>
                                <p className="text-2xl font-bold text-indigo-700">{feedback.overallScore}/10</p>
                            </div>
                            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex-1 min-w-[120px]">
                                <p className="text-xs font-bold text-slate-500 uppercase">Status</p>
                                {isEditing ? (
                                    <select 
                                        value={edited.performanceStatus} 
                                        onChange={(e) => setEdited({...edited, performanceStatus: e.target.value})}
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
                                        feedback.performanceStatus === 'Job Ready' ? 'text-emerald-600' :
                                        feedback.performanceStatus === 'Highly Capable' ? 'text-blue-600' :
                                        feedback.performanceStatus === 'Needs Improvement' ? 'text-rose-500' : 'text-amber-500'
                                    }`}>{feedback.performanceStatus || 'Evaluated'}</p>
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
                        </div>

                        <div>
                            <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                                <Star size={16} className="text-amber-500" /> Topic Highlights
                            </h4>
                            <div className="grid grid-cols-2 gap-3">
                                {edited.topicScores?.map((t, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-sm p-3 bg-slate-50 rounded-xl border border-slate-100">
                                        {isEditing ? (
                                            <input 
                                                value={t.topic} 
                                                onChange={(e) => handleTopicNameChange(idx, e.target.value)}
                                                className="bg-white border border-slate-200 outline-none px-2 py-1 rounded w-2/3"
                                            />
                                        ) : (
                                            <span className="font-medium text-slate-600">{t.topic || 'Untitled'}</span>
                                        )}
                                        <span className="font-bold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-md text-xs">{t.score}</span>
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
                                        className="w-full h-24 bg-transparent border-none outline-none resize-none text-sm text-emerald-900 font-medium"
                                        placeholder="Add strengths..."
                                    />
                                ) : (
                                    <p className="text-sm text-emerald-900 leading-relaxed font-medium">{feedback.strengths || 'None recorded'}</p>
                                )}
                            </div>
                            
                            <div className={`p-4 rounded-2xl ${isEditing ? 'bg-white border-2 border-rose-200' : 'bg-rose-50/50 border border-rose-100'}`}>
                                <h4 className="text-xs font-bold text-rose-600 uppercase mb-2">Weaknesses</h4>
                                {isEditing ? (
                                    <textarea 
                                        value={edited.weaknesses} 
                                        onChange={e => setEdited({...edited, weaknesses: e.target.value})}
                                        className="w-full h-24 bg-transparent border-none outline-none resize-none text-sm text-rose-900 font-medium"
                                        placeholder="Add weaknesses..."
                                    />
                                ) : (
                                    <p className="text-sm text-rose-900 leading-relaxed font-medium">{feedback.weaknesses || 'None recorded'}</p>
                                )}
                            </div>
                        </div>

                        {edited.improvementPlan && edited.improvementPlan.length > 0 && (
                            <div>
                                <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                                    <CheckSquare size={16} className="text-blue-500" /> Prescribed Action Plan
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
                                            {new Date(h.date || h.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
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
                                                h.performanceStatus === 'Job Ready' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                h.performanceStatus === 'Highly Capable' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                h.performanceStatus === 'Needs Improvement' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                                            }`}>
                                                {h.performanceStatus || 'Evaluated'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
