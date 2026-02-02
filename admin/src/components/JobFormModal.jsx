import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const JobFormModal = ({ isOpen, onClose, jobToEdit, fetchJobs }) => {
    const [formData, setFormData] = useState({
        title: '',
        company: '',
        location: '',
        type: 'Full-time',
        description: '',
        skills: [],
        responsibilities: [],
        requirements: [],
        salary: '',
        applyLink: ''
    });

    const [currentSkill, setCurrentSkill] = useState('');
    const [currentResp, setCurrentResp] = useState('');
    const [currentReq, setCurrentReq] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (jobToEdit) {
            setFormData({
                title: jobToEdit.title,
                company: jobToEdit.company,
                companyLogo: jobToEdit.companyLogo || '',
                location: jobToEdit.location,
                type: jobToEdit.type || 'Full-time',
                description: jobToEdit.description,
                skills: jobToEdit.skills || [],
                responsibilities: jobToEdit.responsibilities || [],
                requirements: jobToEdit.requirements || [],
                salary: jobToEdit.salary || '',
                applyLink: jobToEdit.applyLink || '',
                deadline: jobToEdit.deadline || '',
                workingHours: jobToEdit.workingHours || '',
                companyWebsite: jobToEdit.companyWebsite || '',
                companyLinkedin: jobToEdit.companyLinkedin || ''
            });
        } else {
            // Reset for new job
            setFormData({
                title: '',
                company: '',
                companyLogo: '',
                location: '',
                type: 'Full-time',
                description: '',
                skills: [],
                responsibilities: [],
                requirements: [],
                salary: '',
                applyLink: '',
                deadline: '',
                workingHours: '',
                companyWebsite: '',
                companyLinkedin: ''
            });
        }
    }, [jobToEdit, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Helper to generic list management
    const addItem = (field, currentVal, setFn) => {
        if (!currentVal.trim()) return;
        setFormData(prev => ({
            ...prev,
            [field]: [...prev[field], currentVal]
        }));
        setFn('');
    };

    const removeItem = (field, index) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const url = jobToEdit
                ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/jobs/${jobToEdit._id}`
                : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/jobs`;

            const method = jobToEdit ? 'put' : 'post';

            const data = new FormData();
            data.append('title', formData.title);
            data.append('company', formData.company);
            data.append('location', formData.location);
            data.append('type', formData.type);
            data.append('description', formData.description);
            data.append('salary', formData.salary);

            if (formData.applyLink) data.append('applyLink', formData.applyLink);
            if (formData.deadline) data.append('deadline', formData.deadline);
            if (formData.workingHours) data.append('workingHours', formData.workingHours);
            if (formData.companyWebsite) data.append('companyWebsite', formData.companyWebsite);
            if (formData.companyLinkedin) data.append('companyLinkedin', formData.companyLinkedin);

            data.append('skills', JSON.stringify(formData.skills));
            data.append('responsibilities', JSON.stringify(formData.responsibilities));
            data.append('requirements', JSON.stringify(formData.requirements));

            if (formData.companyLogo instanceof File) {
                data.append('companyLogo', formData.companyLogo);
            }

            await axios[method](url, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            toast.success(jobToEdit ? 'Job Updated' : 'Job Created');
            fetchJobs();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.msg || 'Failed to save job');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 flex-shrink-0">
                    <h2 className="text-xl font-bold text-gray-800">{jobToEdit ? 'Edit Job' : 'Add New Job'}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full text-gray-500"><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                            <input name="title" value={formData.title} onChange={handleChange} required className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" placeholder="e.g. React Developer" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                            <input name="company" value={formData.company} onChange={handleChange} required className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" placeholder="e.g. Tech Corp" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Company Logo</label>
                            <input
                                type="file"
                                name="companyLogo"
                                accept="image/*"
                                onChange={(e) => setFormData({ ...formData, companyLogo: e.target.files[0] })}
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                            />
                            {(formData.companyLogo && !(formData.companyLogo instanceof File)) && (
                                <p className="text-xs text-gray-500 mt-1">Current Logo: <a href={formData.companyLogo} target="_blank" rel="noreferrer" className="text-primary-600 underline">View</a></p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                            <input name="location" value={formData.location} onChange={handleChange} required className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" placeholder="e.g. Bangalore, KA" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                            <select name="type" value={formData.type} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
                                <option>Full-time</option>
                                <option>Part-time</option>
                                <option>Contract</option>
                                <option>Internship</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Salary Range</label>
                            <input name="salary" value={formData.salary} onChange={handleChange} required className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" placeholder="e.g. ₹12L - ₹15L" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">External Apply Link (Optional)</label>
                            <input name="applyLink" value={formData.applyLink} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" placeholder="https://..." />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Last Date to Apply</label>
                            <input type="date" name="deadline" value={formData.deadline ? formData.deadline.split('T')[0] : ''} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Working Hours</label>
                            <input name="workingHours" value={formData.workingHours} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" placeholder="e.g. 9:00 AM - 6:00 PM" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Company Website</label>
                            <input name="companyWebsite" value={formData.companyWebsite} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" placeholder="https://example.com" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Company LinkedIn</label>
                            <input name="companyLinkedin" value={formData.companyLinkedin} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" placeholder="https://linkedin.com/company/..." />
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} required rows={4} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none" placeholder="Job Overview..." />
                    </div>

                    {/* Arrays: Skills */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
                        <div className="flex gap-2 mb-2">
                            <input value={currentSkill} onChange={(e) => setCurrentSkill(e.target.value)} className="flex-1 p-2 border rounded-lg" placeholder="Add a skill" onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('skills', currentSkill, setCurrentSkill))} />
                            <button type="button" onClick={() => addItem('skills', currentSkill, setCurrentSkill)} className="bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200"><Plus size={20} /></button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {formData.skills.map((skill, i) => (
                                <span key={i} className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                                    {skill} <button type="button" onClick={() => removeItem('skills', i)}><X size={14} /></button>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Arrays: Responsibilities */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Responsibilities</label>
                        <div className="flex gap-2 mb-2">
                            <input value={currentResp} onChange={(e) => setCurrentResp(e.target.value)} className="flex-1 p-2 border rounded-lg" placeholder="Add responsibility" onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('responsibilities', currentResp, setCurrentResp))} />
                            <button type="button" onClick={() => addItem('responsibilities', currentResp, setCurrentResp)} className="bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200"><Plus size={20} /></button>
                        </div>
                        <ul className="space-y-1">
                            {formData.responsibilities.map((item, i) => (
                                <li key={i} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded">
                                    <span>• {item}</span>
                                    <button type="button" onClick={() => removeItem('responsibilities', i)} className="text-red-500 hover:text-red-700"><Trash2 size={14} /></button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Arrays: Requirements */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Requirements</label>
                        <div className="flex gap-2 mb-2">
                            <input value={currentReq} onChange={(e) => setCurrentReq(e.target.value)} className="flex-1 p-2 border rounded-lg" placeholder="Add requirement" onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('requirements', currentReq, setCurrentReq))} />
                            <button type="button" onClick={() => addItem('requirements', currentReq, setCurrentReq)} className="bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200"><Plus size={20} /></button>
                        </div>
                        <ul className="space-y-1">
                            {formData.requirements.map((item, i) => (
                                <li key={i} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded">
                                    <span>• {item}</span>
                                    <button type="button" onClick={() => removeItem('requirements', i)} className="text-red-500 hover:text-red-700"><Trash2 size={14} /></button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </form>

                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 flex-shrink-0">
                    <button onClick={onClose} className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-white font-medium">Cancel</button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-5 py-2.5 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 shadow-md disabled:bg-primary-400"
                    >
                        {loading ? 'Saving...' : jobToEdit ? 'Update Job' : 'Create Job'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default JobFormModal;
