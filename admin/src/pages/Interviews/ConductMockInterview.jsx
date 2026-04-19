import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
    User, Star, BookOpen, MessageSquare, 
    Plus, Trash2, CheckSquare, Save, Loader2, Sparkles, X, Copy 
} from 'lucide-react';

const MockInterviewForm = () => {
    const location = useLocation();
    const [students, setStudents] = useState([]);
    const [batches, setBatches] = useState([]);
    const [selectedBatch, setSelectedBatch] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [search, setSearch] = useState('');
    const [dbSettings, setDbSettings] = useState({ topics: [], improvementPlans: [] });
    const [customTopicInput, setCustomTopicInput] = useState({});
    const [showAiModal, setShowAiModal] = useState(false);
    const [aiJsonInput, setAiJsonInput] = useState('');
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
        skillRemarks: {
            communication: '',
            technical: '',
            confidence: '',
            problemSolving: '',
            bodyLanguage: '',
            practical: ''
        },
        topicScores: [{ topic: '', score: 0, remark: '' }],
        strengths: '',
        weaknesses: '',
        suggestions: '',
        improvementPlan: [], // Loaded from DB
        improvementPlanText: '', // For formatted textarea input
        overallRemark: '',
        recordingUrl: '',
        interviewDate: new Date().toISOString().split('T')[0]
    });

    const categories = ['KYC', 'AML', 'Excel', 'Trade Life Cycle', 'Corporate Actions', 'Reconciliation', 'Financial Statements', 'Journal Entries'];

    useEffect(() => {
        fetchBatches();
        fetchDbSettings();

        // Pre-fill from navigation state (Interview Queue Shortcut)
        if (location.state) {
            const { studentId, batchId, interviewerName, interviewDate } = location.state;
            if (batchId) {
                setSelectedBatch(batchId);
                fetchStudents(batchId);
            }
            setFormData(prev => ({
                ...prev,
                studentId: studentId || prev.studentId,
                interviewerName: interviewerName || prev.interviewerName,
                interviewDate: interviewDate || prev.interviewDate
            }));
        }
    }, [location.state]);

    const fetchBatches = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const { data } = await axios.get(`${API_URL}/api/batches`);
            if (data.success) {
                setBatches(data.batches || []);
            }
        } catch (error) {
            console.error("Error fetching batches:", error);
        }
    };

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

    const fetchStudents = async (batchId) => {
        if (!batchId) {
            setStudents([]);
            return;
        }
        setLoading(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const token = localStorage.getItem('adminToken');
            const { data } = await axios.get(`${API_URL}/api/batches/${batchId}/students`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                setStudents(data.students.map(s => s.studentId).filter(Boolean));
            }
        } catch (error) {
            console.error("Error fetching students:", error);
            toast.error("Failed to load students for this batch");
        } finally {
            setLoading(false);
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

    const handleCopyPrompt = () => {
        const promptText = `Act as an expert technical interviewer and HR manager. I am conducting a mock interview with a student.
Please read my shorthand notes below about their performance, specific topics we covered, and general skills. 
Based solely on my notes, generate a comprehensive feedback report formatted EXACTLY as the JSON structure below. 
Do not output anything except the JSON string.

{
  "skills": {
    "communicationScore": 8,
    "technicalScore": 7,
    "confidenceScore": 8,
    "problemSolvingScore": 6,
    "bodyLanguageScore": 7,
    "practicalScore": 8,
    "remarks": {
      "communication": "Good verbal clarity and structured answers",
      "technical": "Solid technical foundation with minor gaps",
      "confidence": "Confident while answering most questions",
      "problemSolving": "Needs improvement in logical approach",
      "bodyLanguage": "Good posture and eye contact",
      "practical": "Strong hands-on understanding"
    }
  },
  "topics": [
    {
      "topic": "React Hooks",
      "score": 8,
      "remark": "Excellent understanding of useState and useEffect"
    },
    {
      "topic": "JavaScript ES6",
      "score": 7,
      "remark": "Good knowledge of promises, arrow functions, and destructuring"
    }
  ],
  "strengths": [
    "Strong React fundamentals",
    "Good communication skills"
  ],
  "weaknesses": [
    "Needs work on testing frameworks",
    "Problem solving speed can improve"
  ],
  "suggestions": [
    "Practice Jest and React Testing Library",
    "Solve coding problems daily"
  ],
  "improvementPlanText": "1. Study Jest for 1 hour daily\n2. Practice coding daily",
  "overallRemark": "Good effort with strong frontend skills. Candidate has good potential.",
  "recommendedRole": "Frontend Developer / React Developer",
  "interviewResult": "Selected for next round"
}

My Interview Notes:
[PASTE YOUR NOTES HERE]`;

        navigator.clipboard.writeText(promptText);
        toast.success("AI Prompt Template copied to clipboard!");
    };

    const handleJsonImport = () => {
        try {
            const data = JSON.parse(aiJsonInput);
            setFormData(prev => {
                const newState = { ...prev };
                if (data.skills) {
                    newState.communicationScore = data.skills.communicationScore || prev.communicationScore;
                    newState.technicalScore = data.skills.technicalScore || prev.technicalScore;
                    newState.confidenceScore = data.skills.confidenceScore || prev.confidenceScore;
                    newState.problemSolvingScore = data.skills.problemSolvingScore || prev.problemSolvingScore;
                    newState.bodyLanguageScore = data.skills.bodyLanguageScore || prev.bodyLanguageScore;
                    newState.practicalScore = data.skills.practicalScore || prev.practicalScore;
                    if (data.skills.remarks || data.skills.skillRemarks) {
                        const rem = data.skills.remarks || data.skills.skillRemarks;
                        newState.skillRemarks = { ...prev.skillRemarks, ...rem };
                    }
                }
                if (data.topics && Array.isArray(data.topics)) {
                    const newCustomTopicInput = {};
                    newState.topicScores = data.topics.map((t, index) => {
                        if (dbSettings && dbSettings.topics && !dbSettings.topics.includes(t.topic)) {
                            newCustomTopicInput[index] = true;
                        }
                        return {
                            topic: t.topic || '',
                            score: t.score || 0,
                            remark: t.remark || ''
                        };
                    });
                    // Queue state update for custom inputs
                    setTimeout(() => setCustomTopicInput(newCustomTopicInput), 0);
                }
                if (data.strengths) newState.strengths = Array.isArray(data.strengths) ? data.strengths.join('\n') : data.strengths;
                if (data.weaknesses) newState.weaknesses = Array.isArray(data.weaknesses) ? data.weaknesses.join('\n') : data.weaknesses;
                if (data.suggestions) newState.suggestions = Array.isArray(data.suggestions) ? data.suggestions.join('\n') : data.suggestions;
                if (data.improvementPlanText) newState.improvementPlanText = data.improvementPlanText;
                if (data.overallRemark) newState.overallRemark = data.overallRemark;
                
                newState.overallScore = calculateOverallScore(newState, newState.topicScores);
                return newState;
            });
            toast.success("AI Feedback applied successfully");
            setShowAiModal(false);
            setAiJsonInput('');
        } catch (e) {
            toast.error("Invalid JSON format");
            console.error(e);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRatingChange = (name, value) => {
        setFormData(prev => {
            const updated = { ...prev, [name]: parseFloat(value) };
            
            // Auto-calculate overallScore
            if (['communicationScore', 'technicalScore', 'confidenceScore', 'problemSolvingScore', 'bodyLanguageScore', 'practicalScore'].includes(name)) {
                updated.overallScore = calculateOverallScore(updated, updated.topicScores);
            }
            return updated;
        });
    };

    const handleTopicChange = (index, field, value) => {
        const newTopics = [...formData.topicScores];
        newTopics[index][field] = field === 'score' ? parseFloat(value) : value;
        setFormData(prev => {
            const updated = { ...prev, topicScores: newTopics };
            updated.overallScore = calculateOverallScore(updated, newTopics);
            return updated;
        });
    };

    const handleSkillRemarkChange = (skillKey, value) => {
        setFormData(prev => ({
            ...prev,
            skillRemarks: {
                ...prev.skillRemarks,
                [skillKey]: value
            }
        }));
    };

    const addTopic = () => {
        setFormData(prev => {
            const newTopics = [...prev.topicScores, { topic: '', score: 0, remark: '' }];
            return {
                ...prev,
                topicScores: newTopics,
                overallScore: calculateOverallScore(prev, newTopics)
            };
        });
    };

    const removeTopic = (index) => {
        setFormData(prev => {
            const newTopics = prev.topicScores.filter((_, i) => i !== index);
            return { 
                ...prev, 
                topicScores: newTopics,
                overallScore: calculateOverallScore(prev, newTopics)
            };
        });
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
                
                // Reset form completely
                setSelectedBatch("");
                setFormData(prev => ({
                    ...prev,
                    studentId: '',
                    overallScore: 0,
                    communicationScore: 0,
                    technicalScore: 0,
                    confidenceScore: 0,
                    problemSolvingScore: 0,
                    bodyLanguageScore: 0,
                    practicalScore: 0,
                    skillRemarks: {
                        communication: '',
                        technical: '',
                        confidence: '',
                        problemSolving: '',
                        bodyLanguage: '',
                        practical: ''
                    },
                    topicScores: [{ topic: '', score: 0, remark: '' }],
                    strengths: '',
                    weaknesses: '',
                    suggestions: '',
                    improvementPlanText: '',
                    overallRemark: '',
                    recordingUrl: '',
                    improvementPlan: dbSettings.improvementPlans.map(task => ({ task, completed: false }))
                }));
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
                <button
                    type="button"
                    onClick={() => setShowAiModal(true)}
                    className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg hover:bg-slate-800 transition-all hover:-translate-y-0.5"
                >
                    <Sparkles size={16} className="text-amber-400" />
                    Autofill via AI
                </button>
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
                            <label className="text-sm font-semibold text-slate-700">Select Batch</label>
                            <select
                                value={selectedBatch}
                                onChange={(e) => {
                                    setSelectedBatch(e.target.value);
                                    fetchStudents(e.target.value);
                                }}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                                <option value="">-- Select Batch First --</option>
                                {batches.map(b => (
                                    <option key={b._id} value={b._id}>{b.name} ({b.courseId?.title})</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-slate-700">Select Student</label>
                            <div className="relative">
                                <select
                                    name="studentId"
                                    value={formData.studentId}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                    required
                                    disabled={!selectedBatch || loading}
                                >
                                    <option value="">{loading ? 'Loading students...' : !selectedBatch ? 'Select Batch First' : '-- Select Student --'}</option>
                                    {students.map(s => (
                                        <option key={s._id} value={s._id}>{s.name} ({s.email})</option>
                                    ))}
                                </select>
                                {loading && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        <Loader2 size={16} className="animate-spin text-indigo-500" />
                                    </div>
                                )}
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
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-slate-700">Interview Date</label>
                            <input
                                type="date"
                                name="interviewDate"
                                value={formData.interviewDate}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                required
                            />
                        </div>
                        <div className="space-y-1 col-span-1 md:col-span-2">
                            <label className="text-sm font-semibold text-slate-700">Video Recording URL (YouTube/Drive)</label>
                            <input
                                type="url"
                                name="recordingUrl"
                                value={formData.recordingUrl}
                                onChange={handleInputChange}
                                placeholder="https://"
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    {[
                        { label: dbSettings.skillLabels?.[0] || 'Communication Skills', name: 'communicationScore', key: 'communication' },
                        { label: dbSettings.skillLabels?.[1] || 'Technical Knowledge', name: 'technicalScore', key: 'technical' },
                        { label: dbSettings.skillLabels?.[2] || 'Confidence', name: 'confidenceScore', key: 'confidence' },
                        { label: dbSettings.skillLabels?.[3] || 'Problem Solving', name: 'problemSolvingScore', key: 'problemSolving' },
                        { label: dbSettings.skillLabels?.[4] || 'Body Language', name: 'bodyLanguageScore', key: 'bodyLanguage' },
                        { label: dbSettings.skillLabels?.[5] || 'Domain / Practical Skills', name: 'practicalScore', key: 'practical' },
                    ].map(skill => (
                        <div key={skill.name} className="space-y-3 p-4 bg-slate-50/50 rounded-2xl border border-slate-50">
                            <div className="space-y-1">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{skill.label}</label>
                                    <span className="text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-lg">{formData[skill.name]}</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="10"
                                    step="1"
                                    value={formData[skill.name]}
                                    onChange={(e) => handleRatingChange(skill.name, e.target.value)}
                                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Remark for {skill.label.split(' ')[0]}</label>
                                <input
                                    type="text"
                                    value={formData.skillRemarks[skill.key]}
                                    onChange={(e) => handleSkillRemarkChange(skill.key, e.target.value)}
                                    placeholder={`Remark for ${skill.label.toLowerCase()}...`}
                                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
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
                    <div className="space-y-3">
                        {formData.topicScores.map((ts, index) => (
                            <div key={index} className="flex flex-col md:flex-row items-start md:items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <div className="w-full md:flex-1 flex flex-col gap-2">
                                    <div className="flex gap-2">
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
                                            className="flex-1 bg-transparent font-bold text-slate-700 outline-none p-1 border-b border-indigo-100 focus:border-indigo-500 transition-colors"
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
                                                className="flex-1 bg-white border border-indigo-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                                autoFocus
                                            />
                                        )}
                                        <div className="w-24">
                                            <input
                                                type="number"
                                                min="0"
                                                max="10"
                                                value={ts.score}
                                                onChange={(e) => handleTopicChange(index, 'score', e.target.value)}
                                                placeholder="Score"
                                                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-center font-bold text-indigo-600 focus:ring-2 focus:ring-indigo-500 outline-none"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeTopic(index)}
                                            className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                    <input
                                        type="text"
                                        value={ts.remark}
                                        onChange={(e) => handleTopicChange(index, 'remark', e.target.value)}
                                        placeholder="Specific remark for this topic (optional)..."
                                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 text-indigo-600 font-bold mb-2">
                        <MessageSquare size={20} />
                        Feedback Summary
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-emerald-600 flex items-center gap-2">
                                <Plus size={16} /> Strengths
                            </label>
                            <textarea
                                name="strengths"
                                value={formData.strengths}
                                onChange={handleInputChange}
                                rows="6"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-sm font-medium leading-relaxed"
                                placeholder="Highlight the candidate's key strengths..."
                            ></textarea>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-rose-500 flex items-center gap-2">
                                <Trash2 size={16} /> Weaknesses
                            </label>
                            <textarea
                                name="weaknesses"
                                value={formData.weaknesses}
                                onChange={handleInputChange}
                                rows="6"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-sm font-medium leading-relaxed"
                                placeholder="Identify core areas for improvement..."
                            ></textarea>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-indigo-500 flex items-center gap-2">
                                <BookOpen size={16} /> Tips & Suggestions
                            </label>
                            <textarea
                                name="suggestions"
                                value={formData.suggestions}
                                onChange={handleInputChange}
                                rows="6"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-sm font-medium leading-relaxed"
                                placeholder="Give actionable advice..."
                            ></textarea>
                        </div>
                    </div>
                </div>

                {/* Improvement Plan */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
                    <div className="flex items-center gap-2 text-indigo-600 font-bold">
                        <CheckSquare size={20} />
                        Recommended Improvement Plan
                    </div>
                    
                    {/* Checkbox Plan */}
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

                    {/* Formatted Textarea Plan */}
                    <div className="space-y-3 pt-4 border-t border-slate-100">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-bold text-slate-700">Detailed Roadmap & Structured Plan</label>
                            <span className="text-[10px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Paste Plan from Notes</span>
                        </div>
                        <textarea
                            name="improvementPlanText"
                            value={formData.improvementPlanText}
                            onChange={handleInputChange}
                            rows="12"
                            className="w-full px-5 py-4 bg-slate-900 text-slate-300 font-mono text-sm border border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none leading-relaxed"
                            placeholder="🚀 Recommended Improvement Plan&#10;1. Communication Improvement (Daily)..."
                        ></textarea>
                    </div>

                    {/* Overall Remark */}
                    <div className="space-y-3 pt-4 border-t border-slate-100">
                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <Star size={16} className="text-amber-500 fill-amber-500" /> Final Remark & Conclusion
                        </label>
                        <textarea
                            name="overallRemark"
                            value={formData.overallRemark}
                            onChange={handleInputChange}
                            rows="3"
                            className="w-full px-4 py-3 bg-indigo-50/30 border border-indigo-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-sm font-medium"
                            placeholder="Final thoughts on the interview performance..."
                        ></textarea>
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
                            placeholder="Add individual custom action item..."
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
                            + Quick Add
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

            {showAiModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h2 className="font-bold text-slate-800 flex items-center gap-2">
                                <Sparkles size={18} className="text-indigo-600" />
                                Paste AI Generated JSON
                            </h2>
                            <button type="button" onClick={() => setShowAiModal(false)} className="text-slate-400 hover:text-slate-700"><X size={20}/></button>
                        </div>
                        <div className="p-6 flex-1 overflow-y-auto">
                            <div className="mb-4 flex items-center justify-between bg-indigo-50 border border-indigo-100 p-3 rounded-xl">
                                <p className="text-xs text-indigo-800 font-medium leading-relaxed max-w-[70%]">
                                    To get perfectly formatted results, click the button to copy our optimized ChatGPT prompt template.
                                </p>
                                <button type="button" onClick={handleCopyPrompt} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm">
                                    <Copy size={14}/> Copy AI Prompt
                                </button>
                            </div>
                            <textarea
                                value={aiJsonInput}
                                onChange={(e) => setAiJsonInput(e.target.value)}
                                className="w-full h-64 bg-slate-900 text-emerald-400 p-4 rounded-xl font-mono text-xs outline-none resize-none focus:ring-2 focus:ring-indigo-500"
                                placeholder={`{\n  "skills": {\n    "communicationScore": 8,\n    "technicalScore": 7\n  }\n}`}
                            ></textarea>
                            <p className="text-xs text-slate-500 mt-2">Paste the exact JSON object you received from ChatGPT to instantly populate this form.</p>
                        </div>
                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                            <button type="button" onClick={() => setShowAiModal(false)} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-lg">Cancel</button>
                            <button type="button" onClick={handleJsonImport} className="px-6 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-md shadow-indigo-100">Parse & Apply</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MockInterviewForm;
