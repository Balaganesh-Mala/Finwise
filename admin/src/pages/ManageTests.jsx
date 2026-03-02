import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { Plus, Trash2, CheckSquare, Square, Video, FileText, List, Pencil, Download, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = [
    'All', 'Accounting', 'Taxation', 'Financial Management',
    'Auditing', 'Economics for Finance', 'Business Law',
    'CA Foundation', 'CA Intermediate', 'CA Final'
];
const DIFFICULTIES = ['All', 'Basic', 'Moderate', 'Advanced'];

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

    // Import from Question Bank State
    const [showImportModal, setShowImportModal] = useState(false);
    const [bankQuestions, setBankQuestions] = useState([]);
    const [loadingBank, setLoadingBank] = useState(false);
    const [importMode, setImportMode] = useState('select'); // 'select' or 'auto'
    const [selectedQIds, setSelectedQIds] = useState([]);
    const [bankSearch, setBankSearch] = useState('');
    const [autoParams, setAutoParams] = useState({
        category: 'All',
        difficulty: 'All',
        count: 10
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

    // --- Question Bank Integration ---
    const fetchBankQuestions = async () => {
        try {
            setLoadingBank(true);
            const queryParams = new URLSearchParams();
            if (autoParams.category !== 'All') queryParams.append('category', autoParams.category);
            if (autoParams.difficulty !== 'All') queryParams.append('difficulty', autoParams.difficulty);
            if (bankSearch) queryParams.append('search', bankSearch);

            const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/interview/questions?${queryParams.toString()}`);
            setBankQuestions(res.data);
        } catch {
            toast.error('Failed to load question bank');
        } finally {
            setLoadingBank(false);
        }
    };

    // Re-fetch bank questions if filters change while modal is open
    useEffect(() => {
        if (showImportModal) {
            fetchBankQuestions();
        }
    }, [autoParams.category, autoParams.difficulty, bankSearch]);

    const toggleQuestionSelection = (qId) => {
        setSelectedQIds(prev =>
            prev.includes(qId) ? prev.filter(id => id !== qId) : [...prev, qId]
        );
    };

    const handleImportSelected = () => {
        const selected = bankQuestions.filter(q => selectedQIds.includes(q._id));

        // Map to local format
        const importedQuestions = selected.map(q => ({
            questionText: q.question,
            options: [q.options.A, q.options.B, q.options.C, q.options.D],
            correctAnswers: [q.options[q.correctAnswer]], // Array format for HiringTest
            isMultiple: false // Assuming QB MCQs are single-choice by default currently
        }));

        setNewTest(prev => ({
            ...prev,
            questions: [...prev.questions, ...importedQuestions]
        }));

        toast.success(`Imported ${importedQuestions.length} questions`);
        setShowImportModal(false);
        setSelectedQIds([]);
    };

    const handleAutoGenerate = () => {
        const matchingQuestions = [...bankQuestions];
        // Shuffle and slice
        const shuffled = matchingQuestions.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, autoParams.count);

        if (selected.length === 0) {
            toast.error('No matching questions found in bank');
            return;
        }

        const generatedQuestions = selected.map(q => ({
            questionText: q.question,
            options: [q.options.A, q.options.B, q.options.C, q.options.D],
            correctAnswers: [q.options[q.correctAnswer]],
            isMultiple: false
        }));

        setNewTest(prev => ({
            ...prev,
            questions: [...prev.questions, ...generatedQuestions]
        }));

        toast.success(`Auto-generated ${generatedQuestions.length} questions`);
        setShowImportModal(false);
        setSelectedQIds([]);
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
        } catch {
            toast.error('Error saving test');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/tests/${id}`);
            toast.success('Deleted');
            fetchTests();
        } catch {
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
                                    <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border">
                                        <h3 className="font-semibold text-gray-700">Questions ({newTest.questions.length})</h3>
                                        <div className="flex gap-3">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowImportModal(true);
                                                    fetchBankQuestions();
                                                }}
                                                className="text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-md text-sm font-semibold hover:bg-indigo-100 flex items-center gap-1.5 transition-colors"
                                            >
                                                <Download size={16} /> Import from Bank
                                            </button>
                                            <button
                                                type="button"
                                                onClick={addQuestion}
                                                className="text-gray-600 bg-white border border-gray-200 shadow-sm px-3 py-1.5 rounded-md text-sm font-semibold hover:bg-gray-50 flex items-center gap-1.5 transition-colors"
                                            >
                                                <Plus size={16} /> Add Manual Question
                                            </button>
                                        </div>
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
                </div >
            )}

            {/* Import Question Bank Modal */}
            {
                showImportModal && createPortal(
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl md:h-[85vh] h-[95vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
                            {/* Header */}
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center shrink-0">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                        <Download className="text-indigo-600" /> Import from Question Bank
                                    </h2>
                                    <p className="text-sm text-gray-500 mt-1">Select existing finance questions or auto-generate a test</p>
                                </div>
                                <button onClick={() => setShowImportModal(false)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors">
                                    <span className="text-2xl leading-none">&times;</span>
                                </button>
                            </div>

                            {/* Mode Toggle */}
                            <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-center shrink-0">
                                <div className="flex bg-gray-200/50 p-1 rounded-lg w-full max-w-md">
                                    <button
                                        onClick={() => setImportMode('select')}
                                        className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-all ${importMode === 'select' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        Manual Selection
                                    </button>
                                    <button
                                        onClick={() => setImportMode('auto')}
                                        className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-all ${importMode === 'auto' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        Auto-Generate Random
                                    </button>
                                </div>
                            </div>

                            {/* Filters (Shared) */}
                            <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3 items-center shrink-0 bg-white">
                                <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                                    <Filter size={16} className="text-gray-400" />
                                    <select
                                        value={autoParams.category}
                                        onChange={(e) => setAutoParams({ ...autoParams, category: e.target.value })}
                                        className="bg-gray-50 border border-gray-200 text-sm py-2 px-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none w-full"
                                    >
                                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="flex-1 min-w-[200px]">
                                    <select
                                        value={autoParams.difficulty}
                                        onChange={(e) => setAutoParams({ ...autoParams, difficulty: e.target.value })}
                                        className="bg-gray-50 border border-gray-200 text-sm py-2 px-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none w-full"
                                    >
                                        {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                                {importMode === 'select' && (
                                    <div className="relative flex-1 min-w-[250px]">
                                        <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search questions..."
                                            value={bankSearch}
                                            onChange={(e) => setBankSearch(e.target.value)}
                                            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                )}
                                {importMode === 'auto' && (
                                    <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                                        <span className="text-sm font-medium text-gray-700">Question Count:</span>
                                        <input
                                            type="number"
                                            min="1" max="50"
                                            value={autoParams.count}
                                            onChange={(e) => setAutoParams({ ...autoParams, count: parseInt(e.target.value) || 10 })}
                                            className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Content Area */}
                            <div className="flex-1 overflow-y-auto bg-gray-50/50 p-6">
                                {loadingBank ? (
                                    <div className="h-full flex items-center justify-center text-gray-500">Loading Question Bank...</div>
                                ) : importMode === 'auto' ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto">
                                        <div className="bg-indigo-50 w-20 h-20 rounded-full flex items-center justify-center mb-6 border-4 border-indigo-100">
                                            <List className="text-indigo-600" size={32} />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-800 mb-2">Auto-Generate Test</h3>
                                        <p className="text-gray-500 text-sm mb-6">
                                            The system will randomly select <strong>{Math.min(autoParams.count, bankQuestions.length)}</strong> unique questions matching your specified category and difficulty from the <strong>{bankQuestions.length}</strong> available matches.
                                        </p>
                                        <button
                                            onClick={handleAutoGenerate}
                                            disabled={bankQuestions.length === 0}
                                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-sm transition-colors"
                                        >
                                            Auto-Generate & Import
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center px-2 mb-2">
                                            <span className="text-sm font-medium text-gray-500">{bankQuestions.length} Questions Found</span>
                                            <button
                                                onClick={() => setSelectedQIds(bankQuestions.length === selectedQIds.length ? [] : bankQuestions.map(q => q._id))}
                                                className="text-sm text-indigo-600 hover:text-indigo-800 font-semibold"
                                            >
                                                {bankQuestions.length === selectedQIds.length ? 'Deselect All' : 'Select All'}
                                            </button>
                                        </div>

                                        {bankQuestions.map(q => (
                                            <label key={q._id} className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-colors ${selectedQIds.includes(q._id) ? 'bg-indigo-50/50 border-indigo-200' : 'bg-white border-gray-200 hover:border-indigo-300'}`}>
                                                <div className="mt-1">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedQIds.includes(q._id)}
                                                        onChange={() => toggleQuestionSelection(q._id)}
                                                        className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-gray-800 text-sm mb-1">{q.question}</h4>
                                                    <div className="flex gap-2 text-[10px] font-bold">
                                                        <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded">{q.category}</span>
                                                        <span className={`px-2 py-0.5 rounded ${q.difficulty === 'Advanced' ? 'bg-red-50 text-red-600' : q.difficulty === 'Moderate' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                                            {q.difficulty}
                                                        </span>
                                                    </div>
                                                </div>
                                            </label>
                                        ))}

                                        {bankQuestions.length === 0 && (
                                            <div className="text-center py-10 text-gray-500">No questions found matching these filters.</div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Footer (Select Mode Only) */}
                            {importMode === 'select' && (
                                <div className="p-5 border-t border-gray-100 bg-white shrink-0 flex justify-between items-center rounded-b-2xl">
                                    <span className="text-sm font-semibold text-gray-600">
                                        {selectedQIds.length} Selected
                                    </span>
                                    <div className="flex gap-3">
                                        <button onClick={() => setShowImportModal(false)} className="px-5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                                        <button
                                            onClick={handleImportSelected}
                                            disabled={selectedQIds.length === 0}
                                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm font-bold"
                                        >
                                            Import Selected
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>,
                    document.body
                )
            }
        </div >
    );
};

export default ManageTests;
