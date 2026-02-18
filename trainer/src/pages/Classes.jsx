import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import {
    Calendar,
    Clock,
    Video,
    Plus,
    Search,
    Users,
    Link as LinkIcon,
    Trash2
} from 'lucide-react';

const Classes = () => {
    const { API_URL } = useAuth();
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        topic: '',
        date: '',
        time: '',
        meetingLink: '',
        batchId: ''
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        try {
            const token = localStorage.getItem('trainerToken');
            const res = await axios.get(`${API_URL}/classes`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setClasses(res.data);
        } catch (error) {
            console.error("Failed to fetch classes", error);
            toast.error("Failed to load classes");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const token = localStorage.getItem('trainerToken');

            // Combine date and time
            const combinedDate = new Date(`${formData.date}T${formData.time}`);

            await axios.post(`${API_URL}/classes`, {
                ...formData,
                date: combinedDate
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.success("Class scheduled successfully!");
            setIsModalOpen(false);
            setFormData({ topic: '', date: '', time: '', meetingLink: '', batchId: '' });
            fetchClasses();
        } catch (error) {
            console.error("Failed to schedule class", error);
            toast.error("Failed to schedule class");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">My Classes</h1>
                    <p className="text-muted-foreground mt-1">Manage your teaching schedule</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Schedule Class
                </button>
            </div>

            {/* Classes List */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {classes.length > 0 ? (
                    classes.map((cls) => (
                        <div key={cls._id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                            <div className="p-5">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold">
                                        {cls.batchId?.name || cls.batchId || 'General Batch'}
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-gray-900">
                                            {new Date(cls.date).toLocaleDateString()}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(cls.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>

                                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1" title={cls.topic}>
                                    {cls.topic}
                                </h3>

                                <div className="space-y-2 mt-4">
                                    {cls.meetingLink ? (
                                        <a
                                            href={cls.meetingLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center text-sm text-indigo-600 hover:text-indigo-800 hover:underline"
                                        >
                                            <Video className="mr-2 h-4 w-4" />
                                            Join Meeting
                                        </a>
                                    ) : (
                                        <div className="flex items-center text-sm text-gray-400">
                                            <Video className="mr-2 h-4 w-4" />
                                            No link provided
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
                                <span className="flex items-center">
                                    <Clock className="mr-1 h-3 w-3" />
                                    {cls.status || 'Scheduled'}
                                </span>
                                {/* Add delete/edit actions if needed later */}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                        <div className="bg-indigo-50 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                            <Calendar className="text-indigo-500" size={24} />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No classes found</h3>
                        <p className="text-gray-500 mt-1">Schedule your first class to get started.</p>
                    </div>
                )}
            </div>

            {/* Schedule Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900">Schedule New Class</h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                &times;
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
                                <input
                                    type="text"
                                    name="topic"
                                    required
                                    value={formData.topic}
                                    onChange={handleInputChange}
                                    placeholder="e.g. React Hooks Deep Dive"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                    <input
                                        type="date"
                                        name="date"
                                        required
                                        value={formData.date}
                                        onChange={handleInputChange}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                                    <input
                                        type="time"
                                        name="time"
                                        required
                                        value={formData.time}
                                        onChange={handleInputChange}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Batch Name / ID</label>
                                <input
                                    type="text"
                                    name="batchId"
                                    required
                                    value={formData.batchId}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Batch A or General"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Link</label>
                                <div className="relative">
                                    <LinkIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                    <input
                                        type="url"
                                        name="meetingLink"
                                        value={formData.meetingLink}
                                        onChange={handleInputChange}
                                        placeholder="https://zoom.us/j/..."
                                        className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            <div className="pt-2 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                                >
                                    {submitting ? 'Scheduling...' : 'Schedule Class'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Classes;
