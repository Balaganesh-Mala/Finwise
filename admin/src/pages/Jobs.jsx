import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, MapPin, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';
import JobFormModal from '../components/JobFormModal';

const Jobs = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingJob, setEditingJob] = useState(null);

    const fetchJobs = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/jobs`);
            setJobs(res.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching jobs:', error);
            toast.error('Failed to load jobs');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this job?')) return;
        
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/jobs/${id}`);
            toast.success('Job deleted');
            setJobs(jobs.filter(job => job._id !== id));
        } catch (error) {
            console.error(error);
            toast.error('Failed to delete job');
        }
    };

    const openEditModal = (job) => {
        setEditingJob(job);
        setIsModalOpen(true);
    };

    const openCreateModal = () => {
        setEditingJob(null);
        setIsModalOpen(true);
    };

    return (
        <div className="container mx-auto px-6 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Job Listings</h1>
                    <p className="text-gray-500 mt-1">Manage open positions and career opportunities</p>
                </div>
                <button 
                    onClick={openCreateModal}
                    className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-medium shadow-md transition-colors"
                >
                    <Plus size={20} /> Add New Job
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : jobs.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <Briefcase size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No Jobs Found</h3>
                    <p className="text-gray-500 mb-6">Get started by creating your first job posting.</p>
                    <button 
                        onClick={openCreateModal}
                        className="text-primary-600 font-bold hover:underline"
                    >
                        Create Job
                    </button>
                </div>
            ) : (
                <div className="grid gap-6">
                    {jobs.map((job) => (
                        <div key={job._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition-shadow">
                            <div>
                                <h3 className="text-xl font-bold text-gray-800 mb-1">{job.title}</h3>
                                <p className="text-primary-600 font-medium text-sm mb-2">{job.company}</p>
                                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                    <span className="flex items-center gap-1"><MapPin size={16} /> {job.location}</span>
                                    <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600 font-medium">{job.type}</span>
                                    <span className="text-gray-900 font-semibold">{job.salary}</span>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <button 
                                    onClick={() => openEditModal(job)}
                                    className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                    title="Edit"
                                >
                                    <Edit2 size={18} />
                                </button>
                                <button 
                                    onClick={() => handleDelete(job._id)}
                                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <JobFormModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                jobToEdit={editingJob} 
                fetchJobs={fetchJobs} 
            />
        </div>
    );
};

export default Jobs;
