import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Download, ExternalLink, Calendar, Mail, Phone, Briefcase, Trash2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Applications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchApplications = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/applications`);
            setApplications(res.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching applications:', error);
            toast.error('Failed to load applications');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this application?')) {
            try {
                await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/applications/${id}`);
                setApplications(applications.filter(app => app._id !== id));
                toast.success('Application deleted');
            } catch (error) {
                console.error(error);
                toast.error('Failed to delete application');
            }
        }
    };

    return (
        <div className="container mx-auto px-6 py-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Job Applications</h1>
            <p className="text-gray-500 mb-8">Manage incoming applications and resumes</p>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : applications.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <Briefcase size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No Applications Yet</h3>
                    <p className="text-gray-500">Wait for candidates to apply to your open positions.</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="p-4 font-semibold text-gray-600 text-sm">Candidate</th>
                                <th className="p-4 font-semibold text-gray-600 text-sm">Job Role</th>
                                <th className="p-4 font-semibold text-gray-600 text-sm">Contact</th>
                                <th className="p-4 font-semibold text-gray-600 text-sm">Applied On</th>
                                <th className="p-4 font-semibold text-gray-600 text-sm">Resume</th>
                                <th className="p-4 font-semibold text-gray-600 text-sm">Status</th>
                                <th className="p-4 font-semibold text-gray-600 text-sm">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {applications.map((app) => (
                                <tr key={app._id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="p-4">
                                        <div className="font-bold text-gray-900">{app.fullName}</div>
                                    </td>
                                    <td className="p-4">
                                        {app.jobId ? (
                                            <div>
                                                <div className="font-medium text-primary-600">{app.jobId.title}</div>
                                                <div className="text-xs text-gray-400">{app.jobId.company}</div>
                                            </div>
                                        ) : (
                                            <span className="text-red-400 text-sm italic">Job Deleted</span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col gap-1 text-sm text-gray-600">
                                            <div className="flex items-center gap-2"><Mail size={14}/> {app.email}</div>
                                            <div className="flex items-center gap-2"><Phone size={14}/> {app.phone}</div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm text-gray-500">
                                        {formatDate(app.appliedAt)}
                                    </td>
                                    <td className="p-4">
                                        <a 
                                            href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/applications/${app._id}/download`} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 text-sm font-medium rounded-lg hover:bg-indigo-100 transition-colors"
                                            title="Download Resume"
                                        >
                                            <Download size={16} /> Download
                                        </a>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                                            app.status === 'New' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                        }`}>
                                            {app.status}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <button 
                                            onClick={() => handleDelete(app._id)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete Application"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Applications;
