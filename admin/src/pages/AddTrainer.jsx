import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';

const AddTrainer = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'MS Office Trainer',
        hiringRounds: {
            mcq: { enabled: true, testId: '' },
            video: { enabled: true, testId: '' },
            assignment: { enabled: true, testId: '' }
        }
    });
    const [loading, setLoading] = useState(false);
    const [tests, setTests] = useState([]);

    useEffect(() => {
        // Fetch available tests
        const fetchTests = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/tests`);
                setTests(res.data);
            } catch (error) {
                console.error("Error fetching tests", error);
            }
        };
        fetchTests();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleHiringRoundToggle = (round) => {
        setFormData(prev => ({
            ...prev,
            hiringRounds: {
                ...prev.hiringRounds,
                [round]: { ...prev.hiringRounds[round], enabled: !prev.hiringRounds[round].enabled }
            }
        }));
    };

    const handleTestSelection = (round, testId) => {
        setFormData(prev => ({
            ...prev,
            hiringRounds: {
                ...prev.hiringRounds,
                [round]: { ...prev.hiringRounds[round], testId }
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/trainers/create`, formData);
            toast.success('Trainer registered & email sent!');
            setFormData({
                name: '',
                email: '',
                role: 'MS Office Trainer',
                hiringRounds: {
                    mcq: { enabled: true, testId: '' },
                    video: { enabled: true, testId: '' },
                    assignment: { enabled: true, testId: '' }
                }
            });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error registering trainer');
        } finally {
            setLoading(false);
        }
    };

    const getTestsByType = (type) => tests.filter(t => t.type === type);

    return (
        <div className="bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto mt-10">
            <div className="flex items-center gap-2 mb-6">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center"
                    type="button"
                >
                    <ArrowLeft className="h-5 w-5 text-gray-600" />
                </button>
                <h2 className="text-2xl font-bold text-indigo-700">Register New Trainer</h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Email Address</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Applying For Role</label>
                    <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                    >
                        <option value="MS Office Trainer">MS Office Trainer</option>
                        <option value="Spoken English Trainer">Spoken English Trainer</option>
                        <option value="Coding Trainer">Coding Trainer</option>
                    </select>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Hiring Process</h3>
                    <div className="space-y-4">
                        {/* MCQ */}
                        <div className="p-3 bg-white rounded border border-gray-100 transition-all hover:shadow-sm">
                            <label className="flex items-center space-x-3 mb-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.hiringRounds.mcq.enabled}
                                    onChange={() => handleHiringRoundToggle('mcq')}
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                                <span className="text-sm font-medium text-gray-700">MCQ Test</span>
                            </label>
                            {formData.hiringRounds.mcq.enabled && (
                                <div className="mt-2 pl-7">
                                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Select Presets Test</label>
                                    <select
                                        value={formData.hiringRounds.mcq.testId}
                                        onChange={(e) => handleTestSelection('mcq', e.target.value)}
                                        className="block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                                    >
                                        <option value="">-- Select MCQ Test --</option>
                                        {getTestsByType('mcq').map(t => (
                                            <option key={t._id} value={t._id}>{t.title} ({t.questions?.length} Qs)</option>
                                        ))}
                                    </select>
                                    {formData.hiringRounds.mcq.testId && <p className="text-[10px] text-green-600 mt-1">✓ Test Selected from Bank</p>}
                                </div>
                            )}
                        </div>

                        {/* Video */}
                        <div className="p-3 bg-white rounded border border-gray-100 transition-all hover:shadow-sm">
                            <label className="flex items-center space-x-3 mb-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.hiringRounds.video.enabled}
                                    onChange={() => handleHiringRoundToggle('video')}
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                                <span className="text-sm font-medium text-gray-700">Video Introduction</span>
                            </label>
                            {formData.hiringRounds.video.enabled && (
                                <div className="mt-2 pl-7">
                                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Select Video Scenario</label>
                                    <select
                                        value={formData.hiringRounds.video.testId}
                                        onChange={(e) => handleTestSelection('video', e.target.value)}
                                        className="block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                                    >
                                        <option value="">-- Select Video Round --</option>
                                        {getTestsByType('video').map(t => (
                                            <option key={t._id} value={t._id}>{t.title}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        {/* Assignment */}
                        <div className="p-3 bg-white rounded border border-gray-100 transition-all hover:shadow-sm">
                            <label className="flex items-center space-x-3 mb-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.hiringRounds.assignment.enabled}
                                    onChange={() => handleHiringRoundToggle('assignment')}
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                                <span className="text-sm font-medium text-gray-700">Assignment Upload</span>
                            </label>
                            {formData.hiringRounds.assignment.enabled && (
                                <div className="mt-2 pl-7">
                                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Select Assignment Task</label>
                                    <select
                                        value={formData.hiringRounds.assignment.testId}
                                        onChange={(e) => handleTestSelection('assignment', e.target.value)}
                                        className="block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                                    >
                                        <option value="">-- Select Assignment --</option>
                                        {getTestsByType('assignment').map(t => (
                                            <option key={t._id} value={t._id}>{t.title}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending Invite...
                        </>
                    ) : (
                        'Register Trainer'
                    )}
                </button>
            </form>
        </div>
    );
};

export default AddTrainer;
