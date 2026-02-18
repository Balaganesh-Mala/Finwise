import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Calendar, Clock, Video, Plus, Trash2, Users } from 'lucide-react';

const Meetings = () => {
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        time: '',
        link: ''
    });
    const [submitting, setSubmitting] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    useEffect(() => {
        fetchMeetings();
    }, []);

    const fetchMeetings = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/admin/meetings`);
            setMeetings(res.data);
        } catch (error) {
            console.error("Failed to fetch meetings", error);
            toast.error("Failed to load meetings");
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
            await axios.post(`${API_URL}/api/admin/meetings`, formData);
            toast.success("Meeting scheduled and trainers notified!");
            setIsModalOpen(false);
            setFormData({ title: '', description: '', date: '', time: '', link: '' });
            fetchMeetings();
        } catch (error) {
            console.error("Failed to schedule meeting", error);
            toast.error("Failed to schedule meeting");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to cancel this meeting?")) return;
        try {
            await axios.delete(`${API_URL}/api/admin/meetings/${id}`);
            toast.success("Meeting cancelled");
            fetchMeetings();
        } catch (error) {
            console.error("Failed to delete meeting", error);
            toast.error("Failed to cancel meeting");
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Staff Meetings</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Schedule Meeting
                </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {meetings.map((meeting) => (
                    <div key={meeting._id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-all">
                        <div className="p-5">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-lg font-bold text-gray-900 line-clamp-1" title={meeting.title}>
                                    {meeting.title}
                                </h3>
                                <button
                                    onClick={() => handleDelete(meeting._id)}
                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                                {meeting.description || 'No description provided.'}
                            </p>

                            <div className="space-y-2 text-sm">
                                <div className="flex items-center text-gray-700">
                                    <Calendar className="mr-2 h-4 w-4 text-indigo-500" />
                                    {new Date(meeting.date).toLocaleDateString()}
                                </div>
                                <div className="flex items-center text-gray-700">
                                    <Clock className="mr-2 h-4 w-4 text-indigo-500" />
                                    {meeting.time}
                                </div>
                                {meeting.link && (
                                    <a
                                        href={meeting.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center text-indigo-600 hover:underline"
                                    >
                                        <Video className="mr-2 h-4 w-4" />
                                        Join Link
                                    </a>
                                )}
                            </div>
                        </div>
                        <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex items-center text-xs text-gray-500">
                            <Users className="mr-1 h-3 w-3" />
                            All Trainers Invited
                        </div>
                    </div>
                ))}

                {meetings.length === 0 && (
                    <div className="col-span-full text-center py-12 text-gray-500">
                        No upcoming meetings scheduled.
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900">New Staff Meeting</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    required
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="e.g. Weekly Sync"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Agenda or details..."
                                    rows="3"
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Link</label>
                                <input
                                    type="url"
                                    name="link"
                                    value={formData.link}
                                    onChange={handleInputChange}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="https://meet.google.com/..."
                                />
                            </div>

                            <div className="pt-2 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {submitting ? 'Scheduling...' : 'Schedule & Notify'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Meetings;
