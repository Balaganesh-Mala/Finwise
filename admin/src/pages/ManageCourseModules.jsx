import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Plus, ArrowLeft, Trash2, Edit2, ChevronDown, ChevronRight,
    Video, FileText, Save, X, Calendar, GripVertical, Check
} from 'lucide-react';
import toast from 'react-hot-toast';

const ManageCourseModules = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);

    // Module Form State
    const [isAddModuleOpen, setIsAddModuleOpen] = useState(false);
    const [newModuleTitle, setNewModuleTitle] = useState('');
    const [editingModuleId, setEditingModuleId] = useState(null);
    const [editModuleTitle, setEditModuleTitle] = useState('');

    // Topic State (Map of moduleId -> topics array)
    const [topics, setTopics] = useState({});
    const [expandedModules, setExpandedModules] = useState({});
    const [loadingTopics, setLoadingTopics] = useState({}); // moduleId -> boolean

    // Topic Form State
    const [activeModuleForTopic, setActiveModuleForTopic] = useState(null); // moduleId
    const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
    const [editingTopic, setEditingTopic] = useState(null);
    const initialTopicState = {
        title: '',
        description: '',
        duration: '', // minutes
        classDate: '',
        video: null,
        notes: []
    };
    const [topicForm, setTopicForm] = useState(initialTopicState);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchCourseDetails();
        fetchModules();
    }, [courseId]);

    const fetchCourseDetails = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/courses/${courseId}`);
            setCourse(res.data);
        } catch (err) {
            console.error('Error fetching course:', err);
            toast.error('Failed to load course details');
        }
    };

    const fetchModules = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/modules/${courseId}`);
            setModules(res.data.modules);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching modules:', err);
            toast.error('Failed to load modules');
            setLoading(false);
        }
    };

    const fetchTopics = async (moduleId) => {
        if (topics[moduleId]) return; // Already loaded

        setLoadingTopics(prev => ({ ...prev, [moduleId]: true }));
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/topics/${moduleId}`);
            setTopics(prev => ({ ...prev, [moduleId]: res.data.topics }));
        } catch (err) {
            console.error(`Error fetching topics for ${moduleId}:`, err);
            toast.error('Failed to load topics');
        } finally {
            setLoadingTopics(prev => ({ ...prev, [moduleId]: false }));
        }
    };

    const toggleModule = (moduleId) => {
        setExpandedModules(prev => {
            const isExpanded = !prev[moduleId];
            if (isExpanded) {
                fetchTopics(moduleId);
            }
            return { ...prev, [moduleId]: isExpanded };
        });
    };

    // --- Module Handlers ---

    const handleCreateModule = async (e) => {
        e.preventDefault();
        if (!newModuleTitle.trim()) return;

        try {
            const order = modules.length + 1;
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/module/create`, {
                courseId,
                title: newModuleTitle,
                order
            });
            setModules([...modules, res.data.module]);
            setNewModuleTitle('');
            setIsAddModuleOpen(false);
            toast.success('Module created');
        } catch (err) {
            console.error(err);
            toast.error('Failed to create module');
        }
    };

    const handleDeleteModule = async (moduleId) => {
        if (!window.confirm('Delete this module and ALL its topics?')) return;
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/admin/module/${moduleId}`);
            setModules(modules.filter(m => m._id !== moduleId));
            const newTopics = { ...topics };
            delete newTopics[moduleId];
            setTopics(newTopics);
            toast.success('Module deleted');
        } catch (err) {
            console.error(err);
            toast.error('Failed to delete module');
        }
    };

    const startEditModule = (module) => {
        setEditingModuleId(module._id);
        setEditModuleTitle(module.title);
    };

    const saveEditModule = async (moduleId) => {
        try {
            const res = await axios.put(`${import.meta.env.VITE_API_URL}/api/admin/module/${moduleId}`, {
                title: editModuleTitle
            });
            setModules(modules.map(m => m._id === moduleId ? res.data.module : m));
            setEditingModuleId(null);
            toast.success('Module updated');
        } catch (err) {
            console.error(err);
            toast.error('Failed to update module');
        }
    };

    // --- Topic Handlers ---

    const openTopicModal = (moduleId, topic = null) => {
        setActiveModuleForTopic(moduleId);
        if (topic) {
            setEditingTopic(topic);
            setTopicForm({
                title: topic.title,
                description: topic.description || '',
                duration: topic.duration || '',
                classDate: topic.classDate ? topic.classDate.split('T')[0] : '',
                video: null,
                notes: []
            });
        } else {
            setEditingTopic(null);
            setTopicForm(initialTopicState);
        }
        setIsTopicModalOpen(true);
    };

    const handleTopicSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);
        const toastId = toast.loading(editingTopic ? 'Updating topic...' : 'Creating topic...');

        try {
            const formData = new FormData();
            formData.append('moduleId', activeModuleForTopic);
            formData.append('title', topicForm.title);
            formData.append('description', topicForm.description);
            formData.append('duration', topicForm.duration || 0);
            formData.append('classDate', topicForm.classDate);

            // Order calculation for new topic
            if (!editingTopic) {
                const currentTopics = topics[activeModuleForTopic] || [];
                formData.append('order', currentTopics.length + 1);
            }

            if (topicForm.video) {
                formData.append('video', topicForm.video);
            }

            if (topicForm.notes && topicForm.notes.length > 0) {
                Array.from(topicForm.notes).forEach((file) => {
                    formData.append('notes', file);
                });
            }

            let res;
            if (editingTopic) {
                res = await axios.put(`${import.meta.env.VITE_API_URL}/api/admin/topic/${editingTopic._id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                // Update local state
                setTopics(prev => ({
                    ...prev,
                    [activeModuleForTopic]: prev[activeModuleForTopic].map(t => t._id === editingTopic._id ? res.data.topic : t)
                }));
                toast.success('Topic updated', { id: toastId });
            } else {
                res = await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/topic/create`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                setTopics(prev => ({
                    ...prev,
                    [activeModuleForTopic]: [...(prev[activeModuleForTopic] || []), res.data.topic]
                }));
                toast.success('Topic added', { id: toastId });
            }

            setIsTopicModalOpen(false);
        } catch (err) {
            console.error(err);
            toast.error('Failed to save topic', { id: toastId });
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteTopic = async (moduleId, topicId) => {
        if (!window.confirm('Delete this topic?')) return;
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/admin/topic/${topicId}`);
            setTopics(prev => ({
                ...prev,
                [moduleId]: prev[moduleId].filter(t => t._id !== topicId)
            }));
            toast.success('Topic deleted');
        } catch (err) {
            console.error(err);
            toast.error('Failed to delete topic');
        }
    };

    if (loading) return <div className="p-8 text-center">Loading course content...</div>;

    return (
        <div className="p-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => navigate('/courses')} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">{course?.title || 'Manage Course Content'}</h1>
                    <p className="text-gray-500">Manage modules, video lessons, and notes.</p>
                </div>
            </div>

            {/* Modules List */}
            <div className="space-y-4">
                {modules.map((module) => (
                    <div key={module._id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                        {/* Module Header */}
                        <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-100">
                            <div className="flex items-center gap-3 flex-1">
                                <button
                                    onClick={() => toggleModule(module._id)}
                                    className="text-gray-400 hover:text-indigo-600 transition-colors"
                                >
                                    {expandedModules[module._id] ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                                </button>

                                {editingModuleId === module._id ? (
                                    <div className="flex items-center gap-2 flex-1 max-w-md">
                                        <input
                                            type="text"
                                            value={editModuleTitle}
                                            onChange={(e) => setEditModuleTitle(e.target.value)}
                                            className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:border-indigo-500 outline-none"
                                            autoFocus
                                        />
                                        <button onClick={() => saveEditModule(module._id)} className="p-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700">
                                            <Check size={16} />
                                        </button>
                                        <button onClick={() => setEditingModuleId(null)} className="p-1.5 text-gray-500 hover:bg-gray-200 rounded">
                                            <X size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <h3
                                        className="font-semibold text-gray-800 cursor-pointer select-none"
                                        onClick={() => toggleModule(module._id)}
                                    >
                                        {module.title}
                                    </h3>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded">
                                    {topics[module._id] ? topics[module._id].length : '?'} Topics
                                </span>
                                <button
                                    onClick={() => startEditModule(module)}
                                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                                >
                                    <Edit2 size={18} />
                                </button>
                                <button
                                    onClick={() => handleDeleteModule(module._id)}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Topics List (Collapsible) */}
                        {expandedModules[module._id] && (
                            <div className="p-4 bg-white">
                                {loadingTopics[module._id] ? (
                                    <div className="text-center py-4 text-gray-400 text-sm">Loading topics...</div>
                                ) : (
                                    <div className="space-y-3">
                                        {(topics[module._id] || []).map((topic) => (
                                            <div key={topic._id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:border-indigo-100 hover:bg-indigo-50/30 transition-all group">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                                        {topic.videoUrl ? <Video size={16} /> : <FileText size={16} />}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-800 text-sm">{topic.title}</p>
                                                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                                                            <span>{topic.duration} mins</span>
                                                            {topic.classDate && (
                                                                <span className="flex items-center gap-1">
                                                                    <Calendar size={12} /> {new Date(topic.classDate).toLocaleDateString()}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => openTopicModal(module._id, topic)}
                                                        className="p-1.5 text-gray-400 hover:text-indigo-600 rounded"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteTopic(module._id, topic._id)}
                                                        className="p-1.5 text-gray-400 hover:text-red-600 rounded"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}

                                        <button
                                            onClick={() => openTopicModal(module._id)}
                                            className="w-full py-3 border-2 border-dashed border-gray-200 rounded-lg text-gray-500 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 text-sm font-medium mt-2"
                                        >
                                            <Plus size={18} /> Add Topic
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Add Module Button */}
            {!isAddModuleOpen ? (
                <button
                    onClick={() => setIsAddModuleOpen(true)}
                    className="mt-6 w-full py-4 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-indigo-500 hover:text-indigo-600 transition-all flex items-center justify-center gap-2 font-medium"
                >
                    <Plus size={20} /> Add New Module
                </button>
            ) : (
                <form onSubmit={handleCreateModule} className="mt-6 bg-white p-6 rounded-xl border border-indigo-100 shadow-sm animate-in fade-in slide-in-from-top-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">New Module Title</label>
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={newModuleTitle}
                            onChange={(e) => setNewModuleTitle(e.target.value)}
                            placeholder="e.g. Advanced React Patterns"
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:border-indigo-500 outline-none"
                            autoFocus
                        />
                        <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium whitespace-nowrap">
                            Create Module
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsAddModuleOpen(false)}
                            className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {/* Topic Modal */}
            {isTopicModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white">
                            <h2 className="text-xl font-bold text-gray-800">
                                {editingTopic ? 'Edit Topic' : 'Add New Topic'}
                            </h2>
                            <button onClick={() => setIsTopicModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleTopicSubmit} className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Topic Title</label>
                                <input
                                    type="text"
                                    value={topicForm.title}
                                    onChange={(e) => setTopicForm({ ...topicForm, title: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-indigo-500 outline-none"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration (mins)</label>
                                    <input
                                        type="number"
                                        value={topicForm.duration}
                                        onChange={(e) => setTopicForm({ ...topicForm, duration: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-indigo-500 outline-none"
                                        placeholder="e.g. 45"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Class Date</label>
                                    <input
                                        type="date"
                                        value={topicForm.classDate}
                                        onChange={(e) => setTopicForm({ ...topicForm, classDate: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-indigo-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={topicForm.description}
                                    onChange={(e) => setTopicForm({ ...topicForm, description: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-indigo-500 outline-none"
                                    rows="3"
                                />
                            </div>

                            {/* Using simple file inputs for now */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Video Lesson (MP4)</label>
                                <input
                                    type="file"
                                    accept="video/*"
                                    onChange={(e) => setTopicForm({ ...topicForm, video: e.target.files[0] })}
                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                />
                                {editingTopic?.videoUrl && !topicForm.video && (
                                    <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
                                        <Check size={12} /> Current video: <a href={editingTopic.videoUrl} target="_blank" rel="noreferrer" className="underline">View</a>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Class Notes (PDFs/Images)</label>
                                <input
                                    type="file"
                                    accept="application/pdf,image/*"
                                    multiple
                                    onChange={(e) => setTopicForm({ ...topicForm, notes: e.target.files })}
                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                />
                                {editingTopic?.notes?.length > 0 && (
                                    <div className="mt-2 space-y-1">
                                        <p className="text-xs text-gray-500 font-medium">Current Notes:</p>
                                        {editingTopic.notes.map((note, idx) => (
                                            <div key={idx} className="flex items-center gap-2 text-xs text-gray-600">
                                                <FileText size={12} /> {note.name || `Note ${idx + 1}`}
                                                {/* Delete note logic could go here */}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setIsTopicModalOpen(false)}
                                    className="px-5 py-2.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                                    disabled={uploading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="px-5 py-2.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg font-medium transition-colors shadow-lg shadow-indigo-200 flex items-center gap-2"
                                >
                                    {uploading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={18} /> {editingTopic ? 'Save Changes' : 'Create Topic'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageCourseModules;
