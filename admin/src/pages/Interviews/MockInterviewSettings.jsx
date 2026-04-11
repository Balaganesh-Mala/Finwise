import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Settings, Plus, Trash2, Edit2, Check, X, Save, Loader2 } from 'lucide-react';

const MockInterviewSettings = () => {
    const [settings, setSettings] = useState({ 
        topics: ['KYC', 'AML', 'Excel', 'Trade Life Cycle', 'Corporate Actions', 'Reconciliation', 'Financial Statements', 'Journal Entries'], 
        improvementPlans: [
            'Revise KYC & AML frameworks',
            'Practice advanced Excel functions',
            'Improve Corporate Actions knowledge',
            'Improve Journal entries'
        ], 
        skillLabels: ['Communication Skills', 'Technical Knowledge', 'Confidence', 'Problem Solving', 'Body Language', 'Domain / Practical Skills'] 
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Temp states for new additions
    const [newTopic, setNewTopic] = useState('');
    const [newPlan, setNewPlan] = useState('');
    const [newType, setNewType] = useState('');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const { data } = await axios.get(`${API_URL}/api/mock-interview-settings`);
            if (data.success) {
                setSettings(data.data);
            }
        } catch (error) {
            toast.error("Failed to fetch settings");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (updatedSettings) => {
        setSaving(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const token = localStorage.getItem('adminToken');
            const { data } = await axios.put(`${API_URL}/api/mock-interview-settings`, updatedSettings, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                setSettings(data.data);
                toast.success('Settings updated successfully');
            }
        } catch (error) {
            toast.error("Failed to update settings");
        } finally {
            setSaving(false);
        }
    };

    const addTopic = () => {
        if (!newTopic.trim()) return;
        const updated = { ...settings, topics: [...settings.topics, newTopic.trim()] };
        handleSave(updated);
        setNewTopic('');
    };

    const removeTopic = (indexToRemove) => {
        const updated = { ...settings, topics: settings.topics.filter((_, i) => i !== indexToRemove) };
        handleSave(updated);
    };

    const addPlan = () => {
        if (!newPlan.trim()) return;
        const updated = { ...settings, improvementPlans: [...settings.improvementPlans, newPlan.trim()] };
        handleSave(updated);
        setNewPlan('');
    };

    const removePlan = (indexToRemove) => {
        const updated = { ...settings, improvementPlans: settings.improvementPlans.filter((_, i) => i !== indexToRemove) };
        handleSave(updated);
    };

    const addType = () => {
        if (!newType.trim()) return;
        const updated = { ...settings, interviewTypes: [...(settings.interviewTypes || ['HR', 'Technical', 'Finance', 'Mixed']), newType.trim()] };
        handleSave(updated);
        setNewType('');
    };

    const removeType = (indexToRemove) => {
        const updated = { ...settings, interviewTypes: settings.interviewTypes.filter((_, i) => i !== indexToRemove) };
        handleSave(updated);
    };

    const updateSkillLabel = (index, newValue) => {
        const newLabels = [...(settings.skillLabels || ['Communication Skills', 'Technical Knowledge', 'Confidence', 'Problem Solving', 'Body Language', 'Domain / Practical Skills'])];
        newLabels[index] = newValue;
        setSettings({ ...settings, skillLabels: newLabels });
    };

    const saveSkillLabels = () => {
        handleSave(settings);
    };

    if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-indigo-600" size={32} /></div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            <div className="flex items-center gap-3 border-b pb-4">
                <Settings className="text-indigo-600" size={32} />
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Mock Interview Settings</h1>
                    <p className="text-slate-500 text-sm">Configure global defaults for topics and improvement plans.</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
                <div>
                    <h2 className="text-lg font-bold text-slate-800 mb-4 tracking-wide">Manage Topics Database</h2>
                    <div className="flex items-center gap-2 mb-4">
                        <input
                            type="text"
                            value={newTopic}
                            onChange={(e) => setNewTopic(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addTopic()}
                            placeholder="Enter a new topic (e.g., Reconciliation)"
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                            onClick={addTopic}
                            disabled={saving || !newTopic.trim()}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-semibold disabled:opacity-50"
                        >
                            <Plus size={18} /> Add
                        </button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                        {settings.topics.map((t, idx) => (
                            <div key={idx} className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg text-sm font-semibold">
                                {t}
                                <button onClick={() => removeTopic(idx)} className="text-indigo-400 hover:text-rose-500" disabled={saving}>
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
                <div>
                    <h2 className="text-lg font-bold text-slate-800 mb-4 tracking-wide">Manage Interview Categories</h2>
                    <div className="flex gap-2 mb-4">
                        <input
                            type="text"
                            value={newType}
                            onChange={(e) => setNewType(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addType()}
                            placeholder="Add new category (e.g. Operations)"
                            className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                        />
                        <button
                            onClick={addType}
                            disabled={saving || !newType.trim()}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-semibold disabled:opacity-50"
                        >
                            <Plus size={18} /> Add
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {(settings.interviewTypes || ['HR', 'Technical', 'Finance', 'Mixed']).map((type, idx) => (
                            <div key={idx} className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg border border-indigo-100 group">
                                <span className="text-sm font-bold uppercase tracking-tight">{type}</span>
                                <button
                                    onClick={() => removeType(idx)}
                                    className="text-indigo-400 hover:text-rose-500 transition-colors"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
                <div>
                    <h2 className="text-lg font-bold text-slate-800 mb-4 tracking-wide">Manage Default Improvement Actions</h2>
                    <div className="flex items-center gap-2 mb-4">
                        <input
                            type="text"
                            value={newPlan}
                            onChange={(e) => setNewPlan(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addPlan()}
                            placeholder="Enter a default action (e.g., Practice Excel macros)"
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                            onClick={addPlan}
                            disabled={saving || !newPlan.trim()}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-semibold disabled:opacity-50"
                        >
                            <Plus size={18} /> Add
                        </button>
                    </div>
                    
                    <div className="space-y-2">
                        {settings.improvementPlans.map((plan, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-slate-50 border border-slate-100 p-3 rounded-xl group hover:border-slate-300">
                                <span className="font-medium text-slate-700 text-sm">{plan}</span>
                                <button onClick={() => removePlan(idx)} className="text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity" disabled={saving}>
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-slate-800 tracking-wide">6 Core Skill Labels</h2>
                    <button
                        onClick={saveSkillLabels}
                        disabled={saving}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-semibold disabled:opacity-50 text-sm"
                    >
                        <Save size={16} /> Save Labels
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(settings.skillLabels && settings.skillLabels.length === 6 ? settings.skillLabels : ['Communication Skills', 'Technical Knowledge', 'Confidence', 'Problem Solving', 'Body Language', 'Domain / Practical Skills']).map((label, idx) => (
                        <div key={idx} className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Skill {idx + 1}</label>
                            <input
                                type="text"
                                value={label}
                                onChange={(e) => updateSkillLabel(idx, e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    ))}
                </div>
                <p className="text-xs text-rose-500 font-medium">Warning: Altering these labels will immediately change how they appear on the Mock Interview forms and Student Dashboards, but the backend calculations remain intact.</p>
            </div>
            
            <p className="text-sm text-slate-400 text-center font-medium">Changes here apply globally to all new Mock Interview forms.</p>
        </div>
    );
};

export default MockInterviewSettings;
