import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Plus, Filter, Trash2, Edit, ChevronDown, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = [
    'All',
    'Accounting',
    'Taxation',
    'Financial Management',
    'Auditing',
    'Economics for Finance',
    'Business Law',
    'CA Foundation',
    'CA Intermediate',
    'CA Final'
];

const TYPES = ['MCQ', 'Practical Problem', 'Case Study'];
const DIFFICULTIES = ['Basic', 'Moderate', 'Advanced'];

const QuestionBank = () => {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ category: 'All', difficulty: 'All', search: '' });

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [inputMode, setInputMode] = useState('manual'); // 'manual' or 'json'
    const [jsonInput, setJsonInput] = useState('');
    const [questionsList, setQuestionsList] = useState([{
        question: '',
        category: 'Accounting',
        type: 'MCQ',
        difficulty: 'Moderate',
        options: { A: '', B: '', C: '', D: '' },
        correctAnswer: 'A',
        explanation: '',
        formula: ''
    }]);

    useEffect(() => {
        fetchQuestions();
    }, [filters]);

    const fetchQuestions = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams();
            if (filters.category !== 'All') queryParams.append('category', filters.category);
            if (filters.difficulty !== 'All') queryParams.append('difficulty', filters.difficulty);
            if (filters.search) queryParams.append('search', filters.search);

            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const res = await axios.get(`${apiUrl}/api/interview/questions?${queryParams.toString()}`);
            setQuestions(res.data);
        } catch (error) {
            toast.error('Failed to load questions');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (index, e) => {
        const { name, value } = e.target;
        const newList = [...questionsList];
        if (name.startsWith('opt_')) {
            const opt = name.split('_')[1];
            newList[index].options = { ...newList[index].options, [opt]: value };
        } else {
            newList[index] = { ...newList[index], [name]: value };
        }
        setQuestionsList(newList);
    };

    const addAnotherQuestion = () => {
        setQuestionsList([...questionsList, {
            question: '', category: 'Accounting', type: 'MCQ', difficulty: 'Moderate',
            options: { A: '', B: '', C: '', D: '' }, correctAnswer: 'A', explanation: '', formula: ''
        }]);
    };

    const removeQuestion = (index) => {
        if (questionsList.length > 1) {
            const newList = questionsList.filter((_, i) => i !== index);
            setQuestionsList(newList);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

            let payload;

            if (inputMode === 'json') {
                try {
                    payload = JSON.parse(jsonInput);
                    if (!Array.isArray(payload)) {
                        toast.error('JSON must be an array of question objects.');
                        return;
                    }
                } catch {
                    toast.error('Invalid JSON format. Please check your syntax.');
                    return;
                }
            } else {
                // Manual Entry - Array
                payload = questionsList.map(q => {
                    const cleanQ = { ...q };
                    if (cleanQ.type !== 'MCQ') {
                        cleanQ.options = { A: '', B: '', C: '', D: '' };
                    }
                    return cleanQ;
                });
            }

            const res = await axios.post(`${apiUrl}/api/interview/questions`, payload);

            if (res.data.count) {
                toast.success(res.data.message);
            } else {
                toast.success('Questions added successfully!');
            }

            setShowModal(false);
            setJsonInput('');
            setQuestionsList([{
                question: '', category: 'Accounting', type: 'MCQ', difficulty: 'Moderate',
                options: { A: '', B: '', C: '', D: '' }, correctAnswer: 'A', explanation: '', formula: ''
            }]);
            fetchQuestions();
        } catch {
            toast.error('Failed to add question');
        }
    };

    const deleteQuestion = async (id) => {
        if (!window.confirm('Are you sure you want to delete this specific question?')) return;
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            await axios.delete(`${apiUrl}/api/interview/questions/${id}`);
            toast.success('Question deleted');
            fetchQuestions();
        } catch {
            toast.error('Failed to delete question');
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto font-sans">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        <BookOpen className="text-indigo-600" /> Question Bank
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Manage technical and accounting interview questions.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm flex items-center gap-2"
                >
                    <Plus size={18} /> Add New Question
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto text-sm">
                    <Filter size={18} className="text-gray-400" />
                    <select
                        value={filters.category}
                        onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                        className="bg-gray-50 border border-gray-200 text-gray-700 py-2 px-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>

                    <select
                        value={filters.difficulty}
                        onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
                        className="bg-gray-50 border border-gray-200 text-gray-700 py-2 px-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                        <option value="All">All Difficulties</option>
                        {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>

                <div className="relative w-full md:w-72">
                    <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search questions..."
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-gray-50"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
                                <th className="px-6 py-4 font-semibold">Question Details</th>
                                <th className="px-6 py-4 font-semibold">Category</th>
                                <th className="px-6 py-4 font-semibold">Format</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">Loading questions...</td>
                                </tr>
                            ) : questions.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <BookOpen size={40} className="text-gray-300 mb-3" />
                                            <p className="text-base font-medium text-gray-900">No questions found</p>
                                            <p className="text-sm mt-1">Try changing filters or add a new question.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                questions.map((q) => (
                                    <tr key={q._id} className="hover:bg-indigo-50/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-semibold text-gray-900 max-w-xl truncate" title={q.question}>
                                                {q.question}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1 truncate max-w-xl">
                                                Ans: <span className="font-medium text-emerald-600">{q.correctAnswer}</span>
                                                {q.type === 'MCQ' && q.options[q.correctAnswer] ? ` - ${q.options[q.correctAnswer]}` : ''}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700">
                                                {q.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-xs font-medium text-gray-700">{q.type}</span>
                                                <span className={`text-[10px] w-max px-2 py-0.5 rounded-md font-bold ${q.difficulty === 'Advanced' ? 'bg-red-50 text-red-600' :
                                                    q.difficulty === 'Moderate' ? 'bg-amber-50 text-amber-600' :
                                                        'bg-emerald-50 text-emerald-600'
                                                    }`}>
                                                    {q.difficulty}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => deleteQuestion(q._id)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                title="Delete Question"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl border border-gray-100 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center shrink-0">
                            <h2 className="text-xl font-bold text-gray-900">Add Finance Questions</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors">
                                <span className="text-xl leading-none">&times;</span>
                            </button>
                        </div>

                        <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-center">
                            <div className="flex bg-gray-200/50 p-1 rounded-lg w-full max-w-sm">
                                <button
                                    onClick={() => setInputMode('manual')}
                                    className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-all ${inputMode === 'manual' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    Manual Entry
                                </button>
                                <button
                                    onClick={() => setInputMode('json')}
                                    className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-all ${inputMode === 'json' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    Bulk JSON Upload
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                            <div className="p-6 overflow-y-auto flex-1 bg-gray-50/30">
                                {inputMode === 'json' ? (
                                    <div className="space-y-4">
                                        <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                                            <p className="text-sm font-bold text-indigo-900 mb-1">JSON Format Guide</p>
                                            <p className="text-xs text-indigo-700/80 mb-2">Paste a JSON array of objects. Keys match the manual entry fields.</p>
                                            <pre className="text-[10px] text-gray-600 font-mono bg-white p-2 rounded-lg border border-indigo-100 overflow-x-auto">
                                                {`[
  {
    "question": "Which of the following describes a Trial Balance?",
    "category": "Accounting",
    "type": "MCQ",
    "difficulty": "Basic",
    "options": {
      "A": "A financial statement",
      "B": "A statement of all ledger account balances",
      "C": "A statement of cash flows",
      "D": "None of the above"
    },
    "correctAnswer": "B",
    "explanation": "It tests arithmetical accuracy of ledger accounts."
  }
]`}
                                            </pre>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Raw JSON Array</label>
                                            <textarea
                                                required
                                                value={jsonInput}
                                                onChange={(e) => setJsonInput(e.target.value)}
                                                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-mono text-gray-700 bg-gray-50 min-h-[300px]"
                                                placeholder="Paste your JSON array here..."
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {questionsList.map((formData, index) => (
                                            <div key={index} className="relative bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                                                {questionsList.length > 1 && (
                                                    <button type="button" onClick={() => removeQuestion(index)} className="absolute top-4 right-4 text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors" title="Remove Question">
                                                        <Trash2 size={18} />
                                                    </button>
                                                )}
                                                <h3 className="font-bold text-gray-800 mb-5 flex items-center gap-2">
                                                    <span className="bg-indigo-100 text-indigo-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">{index + 1}</span>
                                                    Question Details
                                                </h3>

                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Question Text</label>
                                                        <textarea
                                                            name="question"
                                                            required
                                                            value={formData.question}
                                                            onChange={(e) => handleInputChange(index, e)}
                                                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm min-h-[100px]"
                                                            placeholder="Enter the practical problem or MCQ..."
                                                        />
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        <div>
                                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                                                            <div className="relative">
                                                                <select name="category" value={formData.category} onChange={(e) => handleInputChange(index, e)} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm appearance-none bg-white">
                                                                    {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                                                                </select>
                                                                <ChevronDown size={16} className="absolute right-3 top-3 text-gray-500 pointer-events-none" />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Format Type</label>
                                                            <div className="relative">
                                                                <select name="type" value={formData.type} onChange={(e) => handleInputChange(index, e)} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm appearance-none bg-white">
                                                                    {TYPES.map(c => <option key={c} value={c}>{c}</option>)}
                                                                </select>
                                                                <ChevronDown size={16} className="absolute right-3 top-3 text-gray-500 pointer-events-none" />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Difficulty</label>
                                                            <div className="relative">
                                                                <select name="difficulty" value={formData.difficulty} onChange={(e) => handleInputChange(index, e)} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm appearance-none bg-white">
                                                                    {DIFFICULTIES.map(c => <option key={c} value={c}>{c}</option>)}
                                                                </select>
                                                                <ChevronDown size={16} className="absolute right-3 top-3 text-gray-500 pointer-events-none" />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {formData.type === 'MCQ' && (
                                                        <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 space-y-3">
                                                            <label className="block text-sm font-bold text-indigo-900">MCQ Options</label>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                {['A', 'B', 'C', 'D'].map(opt => (
                                                                    <div key={opt} className="flex items-center gap-2">
                                                                        <span className="font-bold text-indigo-700 w-6">{opt}.</span>
                                                                        <input
                                                                            type="text"
                                                                            name={`opt_${opt}`}
                                                                            value={formData.options[opt]}
                                                                            onChange={(e) => handleInputChange(index, e)}
                                                                            required
                                                                            placeholder={`Option ${opt}`}
                                                                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                                                        />
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Correct Answer</label>
                                                            {formData.type === 'MCQ' ? (
                                                                <div className="relative">
                                                                    <select name="correctAnswer" value={formData.correctAnswer} onChange={(e) => handleInputChange(index, e)} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm appearance-none bg-white">
                                                                        {['A', 'B', 'C', 'D'].map(c => <option key={c} value={c}>Option {c}</option>)}
                                                                    </select>
                                                                    <ChevronDown size={16} className="absolute right-3 top-3 text-gray-500 pointer-events-none" />
                                                                </div>
                                                            ) : (
                                                                <input
                                                                    type="text"
                                                                    name="correctAnswer"
                                                                    value={formData.correctAnswer}
                                                                    onChange={(e) => handleInputChange(index, e)}
                                                                    required
                                                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                                                    placeholder="E.g., Rs. 50,000 or Specific Journal Entry"
                                                                />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Formula Used (Optional)</label>
                                                            <input
                                                                type="text"
                                                                name="formula"
                                                                value={formData.formula}
                                                                onChange={(e) => handleInputChange(index, e)}
                                                                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-mono text-slate-700"
                                                                placeholder="E.g., Net Profit / Sales * 100"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Explanation / Solution Steps</label>
                                                        <textarea
                                                            name="explanation"
                                                            value={formData.explanation}
                                                            onChange={(e) => handleInputChange(index, e)}
                                                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm min-h-[80px]"
                                                            placeholder="Provide the step-by-step calculation or reasoning..."
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        <button
                                            type="button"
                                            onClick={addAnotherQuestion}
                                            className="w-full py-3 border-2 border-dashed border-indigo-200 text-indigo-600 font-semibold rounded-xl hover:bg-indigo-50 hover:border-indigo-300 transition-colors flex justify-center items-center gap-2"
                                        >
                                            <Plus size={18} /> Add Another Question
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="p-6 border-t border-gray-100 bg-white shrink-0 flex justify-end gap-3 rounded-b-2xl">
                                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" className="px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-colors">
                                    {inputMode === 'json' ? 'Import Questions' : 'Save All Questions'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuestionBank;
