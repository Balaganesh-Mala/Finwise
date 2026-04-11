import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
    User, Star, BookOpen, MessageSquare, 
    Plus, Trash2, CheckSquare, Save, Loader2 
} from 'lucide-react';

const MockInterviewForm = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [search, setSearch] = useState('');
    const [dbSettings, setDbSettings] = useState({ topics: [], improvementPlans: [] });
    const [customTopicInput, setCustomTopicInput] = useState({});
    const [newCustomPlan, setNewCustomPlan] = useState('');

    const [formData, setFormData] = useState({
        studentId: '',
        interviewerName: '',
        interviewType: 'Technical',
        overallScore: 0,
        communicationScore: 0,
        technicalScore: 0,
        confidenceScore: 0,
        problemSolvingScore: 0,
        bodyLanguageScore: 0,
        practicalScore: 0,
        topicScores: [{ topic: '', score: 0 }],
        strengths: '',
        weaknesses: '',
        suggestions: '',
        improvementPlan: [], // Loaded from DB
        recordingUrl: ''
    });

    const categories = ['KYC', 'AML', 'Excel', 'Trade Life Cycle', 'Corporate Actions', 'Reconciliation', 'Financial Statements', 'Journal Entries'];

    useEffect(() => {
        fetchStudents();
        fetchDbSettings();
    }, []);

    const fetchDbSettings = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const { data } = await axios.get(`${API_URL}/api/mock-interview-settings`);
            if (data.success && data.data) {
                setDbSettings(data.data);
                // Initialize default improvement plan dynamically
                setFormData(prev => ({
                    ...prev,
                    improvementPlan: data.data.improvementPlans.map(task => ({ task, completed: false }))
                }));
            }
        } catch (error) {
            console.error("Error fetching mock settings", error);
        }
    };

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const token = localStorage.getItem('adminToken');
            const { data } = await axios.get(`${API_URL}/api/students/list`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStudents(data || []);
        } catch (error) {
            console.error("Error fetching students:", error);
            toast.error("Failed to load students");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRatingChange = (name, value) => {
        setFormData(prev => {
            const updated = { ...prev, [name]: parseFloat(value) };
            
            // Auto-calculate overallScore when a skill changes
            if (['communicationScore', 'technicalScore', 'confidenceScore', 'problemSolvingScore', 'bodyLanguageScore', 'practicalScore'].includes(name)) {
                const total = updated.communicationScore + updated.technicalScore + updated.confidenceScore + 
                              updated.problemSolvingScore + updated.bodyLanguageScore + updated.practicalScore;
                updated.overallScore = Number((total / 6).toFixed(1));
            }
            return updated;
        });
    };

    const handleTopicChange = (index, field, value) => {
        const newTopics = [...formData.topicScores];
        newTopics[index][field] = field === 'score' ? parseFloat(value) : value;
        setFormData(prev => ({ ...prev, topicScores: newTopics }));
    };

    const addTopic = () => {
        setFormData(prev => ({
            ...prev,
            topicScores: [...prev.topicScores, { topic: '', score: 0 }]
        }));
    };

    const removeTopic = (index) => {
        const newTopics = formData.topicScores.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, topicScores: newTopics }));
    };

    const handleImprovementToggle = (index) => {
        const newPlan = [...formData.improvementPlan];
        newPlan[index].completed = !newPlan[index].completed;
        setFormData(prev => ({ ...prev, improvementPlan: newPlan }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.studentId) return toast.error("Please select a student");
        if (formData.overallScore <= 0) return toast.error("Overall score must be greater than 0");

        setSubmitting(true);
        const submissionData = {
            ...formData,
            topicScores: formData.topicScores.filter(ts => ts.topic && ts.topic.trim() !== '')
        };

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const token = localStorage.getItem('adminToken');
            const res = await axios.post(`${API_URL}/api/mock-interviews/submit`, submissionData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                toast.success("Feedback submitted successfully!");
                // Show rewards
                const { points, coins, newLevel } = res.data.walletUpdates;
                toast(`Earned: +${points} Points, +${coins} 🪙`, { icon: '🎁' });
                
                // Reset form optionally or redirect
                setFormData({
                    ...formData,
                    studentId: '',
                    overallScore: 0,
                    topicScores: [{ topic: '', score: 0 }],
                    strengths: '',
                    weaknesses: '',
                    suggestions: ''
                });
            }
        } catch (error) {
            console.error("Error submitting feedback:", error);
            toast.error(error.response?.data?.message || "Submission failed");
        } finally {
            setSubmitting(false);
        }
    };

    const filteredStudents = students.filter(s => 
        s.name.toLowerCase().includes(search.toLowerCase()) || 
        s.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Mock Interview Feedback</h1>
                    <p className="text-slate-500 text-sm">Provide structured feedback and award points to students.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Details */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 text-indigo-600 font-semibold mb-2">
                        <User size={18} />
                        Basic Details
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-slate-700">Select Student</label>
                            <div className="relative">
                                <select
                                    name="studentId"
                                    value={formData.studentId}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                    required
                                >
                                    <option value="">-- Select Student --</option>
                                    {filteredStudents.map(s => (
                                        <option key={s._id} value={s._id}>{s.name} ({s.email})</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-slate-700">Interview Type</label>
                            <select
                                name="interviewType"
                                value={formData.interviewType}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                                {(dbSettings.interviewTypes || ['HR', 'Technical', 'Finance', 'Mixed']).map(type => (
                                    <option key={type} value={type}>{type} Interview</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-slate-700">Interviewer Name</label>
                            <input
                                type="text"
                                name="interviewerName"
                                value={formData.interviewerName}
                                onChange={handleInputChange}
                                placeholder="Enter trainer name"
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                required
                            />
                        </div>
                        <div className="space-y-1 text-center md:text-left">
                            <label className="text-sm font-semibold text-slate-700">Calculated Overall Score (0-10)</label>
                            <div className="flex items-center gap-4">
                                <div className="flex-1 bg-slate-100 h-2.5 rounded-full overflow-hidden shadow-inner">
                                    <div 
                                        className="h-full bg-indigo-500 transition-all duration-300"
                                        style={{ width: `${(formData.overallScore / 10) * 100}%` }}
                                    ></div>
                                </div>
                                <span className="bg-indigo-600 text-white w-10 h-10 flex items-center justify-center rounded-lg font-bold">
                                    {formData.overallScore}
                                </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-2 font-medium">Automatic average of all skill ratings.</p>
                        </div>
                    </div>
                </div>

                {/* Skill Ratings */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 text-indigo-600 font-bold mb-2">
                        <Star size={20} />
                        Skill-Based Ratings (out of 10)
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { label: dbSettings.skillLabels?.[0] || 'Communication Skills', name: 'communicationScore' },
                            { label: dbSettings.skillLabels?.[1] || 'Technical Knowledge', name: 'technicalScore' },
                            { label: dbSettings.skillLabels?.[2] || 'Confidence', name: 'confidenceScore' },
                            { label: dbSettings.skillLabels?.[3] || 'Problem Solving', name: 'problemSolvingScore' },
                            { label: dbSettings.skillLabels?.[4] || 'Body Language', name: 'bodyLanguageScore' },
                            { label: dbSettings.skillLabels?.[5] || 'Domain / Practical Skills', name: 'practicalScore' },
                        ].map(skill => (
                            <div key={skill.name} className="space-y-1">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{skill.label}</label>
                                    <span className="text-indigo-600 font-bold">{formData[skill.name]}</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="10"
                                    step="1"
                                    value={formData[skill.name]}
                                    onChange={(e) => handleRatingChange(skill.name, e.target.value)}
                                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Topic Wise Performance */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-indigo-600 font-bold">
                            <BookOpen size={20} />
                            Topic-Wise Performance
                        </div>
                        <button
                            type="button"
                            onClick={addTopic}
                            className="text-xs font-bold px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
                        >
                            + Add Topic
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {formData.topicScores.map((ts, index) => (
                            <div key={index} className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <div className="flex-1 flex gap-2">
                                    <select
                                        value={customTopicInput[index] ? 'Custom' : ts.topic}
                                        onChange={(e) => {
                                            if (e.target.value === 'Custom') {
                                                setCustomTopicInput(prev => ({ ...prev, [index]: true }));
                                                handleTopicChange(index, 'topic', '');
                                            } else {
                                                setCustomTopicInput(prev => ({ ...prev, [index]: false }));
                                                handleTopicChange(index, 'topic', e.target.value);
                                            }
                                        }}
                                        className="w-full bg-transparent font-semibold text-slate-700 outline-none p-1 border-b border-transparent focus:border-indigo-300 transition-colors"
                                    >
                                        <option value="">Select Topic</option>
                                        {dbSettings.topics.map(c => <option key={c} value={c}>{c}</option>)}
                                        <option value="Custom">+ Add Custom Topic</option>
                                    </select>
                                    {customTopicInput[index] && (
                                        <input
                                            type="text"
                                            value={ts.topic}
                                            onChange={(e) => handleTopicChange(index, 'topic', e.target.value)}
                                            placeholder="Type custom topic label..."
                                            className="w-full bg-white border border-indigo-200 rounded-lg px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                            autoFocus
                                        />
                                    )}
                                </div>
                                <div className="w-20">
                                    <input
                                        type="number"
                                        min="0"
                                        max="10"
                                        value={ts.score}
                                        onChange={(e) => handleTopicChange(index, 'score', e.target.value)}
                                        placeholder="Score"
                                        className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-center font-bold text-indigo-600"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeTopic(index)}
                                    className="text-red-400 hover:text-red-600"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Detailed Feedback */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 text-indigo-600 font-bold mb-2">
                        <MessageSquare size={20} />
                        Feedback Summary
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-slate-700">Strengths</label>
                            <textarea
                                name="strengths"
                                value={formData.strengths}
                                onChange={handleInputChange}
                                rows="4"
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                                placeholder="What went well?"
                            ></textarea>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-slate-700">Weaknesses</label>
                            <textarea
                                name="weaknesses"
                                value={formData.weaknesses}
                                onChange={handleInputChange}
                                rows="4"
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                                placeholder="Areas of improvement"
                            ></textarea>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-slate-700">Suggestions</label>
                            <textarea
                                name="suggestions"
                                value={formData.suggestions}
                                onChange={handleInputChange}
                                rows="4"
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                                placeholder="Actionable tips"
                            ></textarea>
                        </div>
                    </div>
                </div>

                {/* Improvement Plan */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 text-indigo-600 font-bold mb-2">
                        <CheckSquare size={20} />
                        Recommended Improvement Plan
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {formData.improvementPlan.map((item, index) => (
                            <div 
                                key={index} 
                                onClick={() => handleImprovementToggle(index)}
                                className={`cursor-pointer group flex items-start gap-3 p-3 rounded-xl border transition-all ${
                                    item.completed 
                                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                                    : 'bg-slate-50 border-slate-100 text-slate-600 hover:border-slate-300'
                                }`}
                            >
                                <div className={`mt-1 h-5 w-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                                    item.completed ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 group-hover:border-slate-400'
                                }`}>
                                    {item.completed && <Plus size={14} className="text-white rotate-45" />}
                                </div>
                                <span className="text-sm font-medium leading-tight">{item.task}</span>
                            </div>
                        ))}
                    </div>
                    {/* Add Custom Action Line */}
                    <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2 w-full md:w-2/3 lg:w-1/2">
                        <input
                            type="text"
                            value={newCustomPlan}
                            onChange={(e) => setNewCustomPlan(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    if(newCustomPlan.trim()) {
                                        setFormData(prev => ({
                                            ...prev, improvementPlan: [...prev.improvementPlan, { task: newCustomPlan.trim(), completed: true }]
                                        }));
                                        setNewCustomPlan('');
                                    }
                                }
                            }}
                            placeholder="Type an unsaved custom action for this student..."
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                            type="button"
                            onClick={() => {
                                if(newCustomPlan.trim()) {
                                    setFormData(prev => ({
                                        ...prev, improvementPlan: [...prev.improvementPlan, { task: newCustomPlan.trim(), completed: true }]
                                    }));
                                    setNewCustomPlan('');
                                }
                            }}
                            className="bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 px-4 py-2 rounded-xl text-sm font-bold transition-colors whitespace-nowrap"
                        >
                            + Add Custom Note
                        </button>
                    </div>
                </div>

                {/* Submit Section */}
                <div className="flex items-center justify-end gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm sticky bottom-4 z-10">
                    <div className="flex-1 flex flex-col">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Calculated Rewards</span>
                        <div className="flex items-center gap-4 text-slate-600 font-bold">
                            <span>Points: +{formData.overallScore * 10}</span>
                            <span>Coins: +{formData.overallScore >= 8 ? 50 : formData.overallScore >= 6 ? 30 : 15}</span>
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50"
                    >
                        {submitting ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                        Submit Feedback
                    </button>
                </div>
            </form>
        </div>
    );
};

export default MockInterviewForm;
