import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, CheckSquare, Square, Video, FileText, List, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';

const ManageTests = () => {
    const [activeTab, setActiveTab] = useState('mcq'); // mcq, video, assignment
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

    // Form State
    const [newTest, setNewTest] = useState({
        title: '',
        type: 'mcq', // default
        instructions: '',
        prompt: '', // for video/assignment
        questions: [] // for mcq
    });

    useEffect(() => {
        fetchTests();
    }, [activeTab]);

    const fetchTests = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/tests?type=${activeTab}`);
            setTests(res.data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load tests');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (test) => {
        setIsEditing(true);
        setEditId(test._id);
        setNewTest({
            title: test.title,
            type: test.type,
            instructions: test.instructions || '',
            prompt: test.prompt || '',
            questions: test.questions || []
        });
        setShowCreate(true);
    };

    // --- MCQ Builder Logic ---
    const addQuestion = () => {
        setNewTest(prev => ({
            ...prev,
            questions: [...prev.questions, {
                questionText: '',
                options: ['', '', '', ''],
                correctAnswers: [],
                isMultiple: false
            }]
        }));
    };

    const updateQuestion = (index, field, value) => {
        const qs = [...newTest.questions];
        qs[index][field] = value;
        setNewTest(prev => ({ ...prev, questions: qs }));
    };

    const updateOption = (qIndex, oIndex, value) => {
        const qs = [...newTest.questions];
        qs[qIndex].options[oIndex] = value;
        setNewTest(prev => ({ ...prev, questions: qs }));
    };

    const toggleCorrectAnswer = (qIndex, optionValue) => {
        const qs = [...newTest.questions];
        const q = qs[qIndex];

        let newCorrect = [...q.correctAnswers];
        if (q.isMultiple) {
            // Checkbox logic
            if (newCorrect.includes(optionValue)) {
                newCorrect = newCorrect.filter(c => c !== optionValue);
            } else {
                newCorrect.push(optionValue);
            }
        } else {
            // Radio logic (single)
            newCorrect = [optionValue];
        }

        qs[qIndex].correctAnswers = newCorrect;
        setNewTest(prev => ({ ...prev, questions: qs }));
    };

    // --- Submit ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = isEditing
                ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/tests/${editId}`
                : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/tests/create`;

            const method = isEditing ? axios.put : axios.post;

            await method(url, {
                ...newTest,
                type: activeTab
            });

            toast.success(isEditing ? 'Test updated!' : 'Test created!');
            setShowCreate(false);
            setNewTest({ title: '', type: activeTab, instructions: '', prompt: '', questions: [] });
            setIsEditing(false);
            setEditId(null);
            fetchTests();
        } catch (error) {
            toast.error('Error saving test');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/tests/${id}`);
            toast.success('Deleted');
            fetchTests();
        } catch (error) {
            toast.error('Error deleting');
        }
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Manage Hiring Tests</h1>
                <button
                    onClick={() => {
                        setShowCreate(true);
                        setIsEditing(false);
                        setEditId(null);
                        setNewTest(prev => ({ ...prev, type: activeTab, questions: [] }));
                    }}
                    className="bg-indigo-600 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 hover:bg-indigo-700"
                >
                    <Plus size={20} /> Create New {activeTab.toUpperCase()} Test
                </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
                {[
                    { id: 'mcq', label: 'MCQ Tests', icon: List },
                    { id: 'video', label: 'Video Rounds', icon: Video },
                    { id: 'assignment', label: 'Assignments', icon: FileText },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium transition-colors ${activeTab === tab.id
                            ? 'border-indigo-600 text-indigo-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Grid */}
            {loading ? <p>Loading...</p> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tests.map(test => (
                        <div key={test._id} className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                            <h3 className="font-bold text-lg mb-2">{test.title}</h3>
                            <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                                {test.instructions || test.prompt || (test.questions?.length + ' Questions')}
                            </p>
                            <div className="flex justify-between items-center text-xs text-gray-400">
                                <span>Created: {new Date(test.createdAt).toLocaleDateString()}</span>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => handleEdit(test)} className="text-blue-500 hover:bg-blue-50 p-1 rounded">
                                        <Pencil size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(test._id)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {tests.length === 0 && <p className="text-gray-500 col-span-3 text-center py-10">No tests found for this category.</p>}
                </div>
            )}

            {/* Create Modal */}
            {showCreate && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b sticky top-0 bg-white z-10 flex justify-between items-center">
                            <h2 className="text-xl font-bold">{isEditing ? 'Edit' : 'Create'} {activeTab.toUpperCase()} Test</h2>
                            <button onClick={() => { setShowCreate(false); setIsEditing(false); }} className="text-gray-500 hover:text-gray-700">✕</button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-medium mb-1">Test Title</label>
                                <input
                                    required
                                    className="w-full border rounded-lg p-2.5"
                                    placeholder="e.g. React Frontend Assessment"
                                    value={newTest.title}
                                    onChange={e => setNewTest({ ...newTest, title: e.target.value })}
                                />
                            </div>

                            {activeTab !== 'mcq' && (
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        {activeTab === 'video' ? 'Video Prompt / Question' : 'Assignment Task'}
                                    </label>
                                    <textarea
                                        required
                                        className="w-full border rounded-lg p-2.5"
                                        rows="4"
                                        placeholder="Detailed instructions..."
                                        value={newTest.prompt || newTest.instructions}
                                        onChange={e => setNewTest({ ...newTest, prompt: e.target.value, instructions: e.target.value })}
                                    />
                                </div>
                            )}

                            {activeTab === 'mcq' && (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-semibold text-gray-700">Questions</h3>
                                        <button type="button" onClick={addQuestion} className="text-indigo-600 text-sm font-medium hover:underline">+ Add Question</button>
                                    </div>

                                    {newTest.questions.map((q, qIdx) => (
                                        <div key={qIdx} className="bg-gray-50 p-4 rounded-lg border relative">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const qs = [...newTest.questions];
                                                    qs.splice(qIdx, 1);
                                                    setNewTest({ ...newTest, questions: qs });
                                                }}
                                                className="absolute top-3 right-3 text-red-400 hover:text-red-600"
                                            >
                                                <Trash2 size={16} />
                                            </button>

                                            <div className="mb-3 pr-8">
                                                <input
                                                    className="w-full border rounded p-2 text-sm"
                                                    placeholder={`Question ${qIdx + 1}`}
                                                    value={q.questionText}
                                                    onChange={e => updateQuestion(qIdx, 'questionText', e.target.value)}
                                                />
                                            </div>

                                            <div className="flex items-center gap-2 mb-3">
                                                <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={q.isMultiple}
                                                        onChange={e => updateQuestion(qIdx, 'isMultiple', e.target.checked)}
                                                    />
                                                    Allow Multiple Correct Answers (Checkbox)
                                                </label>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {q.options.map((opt, oIdx) => (
                                                    <div key={oIdx} className="flex items-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleCorrectAnswer(qIdx, opt)}
                                                            disabled={!opt}
                                                            className={`p-1 rounded ${q.correctAnswers.includes(opt) && opt
                                                                ? 'text-green-600 bg-green-50'
                                                                : 'text-gray-300 hover:text-gray-400'
                                                                }`}
                                                        >
                                                            {q.isMultiple
                                                                ? (q.correctAnswers.includes(opt) && opt ? <CheckSquare size={18} /> : <Square size={18} />)
                                                                : (q.correctAnswers.includes(opt) && opt ? <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-green-500" /> : <div className="w-4 h-4 rounded-full border-2 border-gray-300" />)
                                                            }
                                                        </button>
                                                        <input
                                                            className="flex-1 border rounded p-1.5 text-sm"
                                                            placeholder={`Option ${oIdx + 1}`}
                                                            value={opt}
                                                            onChange={e => updateOption(qIdx, oIdx, e.target.value)}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                            {q.correctAnswers.length === 0 && q.options.some(o => o) && <p className="text-[10px] text-red-400 mt-2">* Select at least one correct answer</p>}
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="pt-4 border-t flex justify-end gap-3">
                                <button type="button" onClick={() => { setShowCreate(false); setIsEditing(false); }} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                                    {isEditing ? 'Update Test' : 'Create Test'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageTests;
