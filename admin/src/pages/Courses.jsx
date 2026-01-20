import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, Search, X, Image, BookOpen, Clock, DollarSign, BarChart, Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Courses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);

    // Form State
    const initialFormState = {
        title: '',
        description: '',
        overview: '',
        duration: '',
        fee: '',
        skillLevel: 'Beginner',
        image: null, 
        syllabusPdf: null, 
        brochurePdf: null,
        highlights: [],
        syllabus: [] 
    };
    
    const [formData, setFormData] = useState(initialFormState);
    const [newHighlight, setNewHighlight] = useState('');
    const [newModule, setNewModule] = useState({ title: '', modules: [] }); // modules here is array of strings (topics)
    const [currentTopic, setCurrentTopic] = useState('');

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/courses`);
            setCourses(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching courses:', err);
            toast.error('Failed to load courses');
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this course? This will remove all associated files.')) {
            try {
                await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/courses/${id}`);
                setCourses(courses.filter(course => course._id !== id));
                toast.success('Course deleted successfully');
            } catch (err) {
                console.error('Error deleting course:', err);
                toast.error('Failed to delete course');
            }
        }
    };

    const handleOpenModal = (course = null) => {
        if (course) {
            setEditingCourse(course);
            setFormData({
                ...initialFormState,
                title: course.title,
                description: course.description,
                overview: course.overview || '',
                duration: course.duration,
                fee: course.fee,
                skillLevel: course.skillLevel,
                highlights: course.highlights || [],
                syllabus: course.syllabus || []
            });
        } else {
            setEditingCourse(null);
            setFormData(initialFormState);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCourse(null);
        setFormData(initialFormState);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.files[0] });
    };

    // Highlights Helpers
    const addHighlight = () => {
        if (newHighlight.trim()) {
            setFormData({ ...formData, highlights: [...formData.highlights, newHighlight.trim()] });
            setNewHighlight('');
        }
    };
    const removeHighlight = (index) => {
        const updated = formData.highlights.filter((_, i) => i !== index);
        setFormData({ ...formData, highlights: updated });
    };

    // Syllabus Helpers
    const addSyllabusModule = () => {
        if (newModule.title.trim()) {
            setFormData({ ...formData, syllabus: [...formData.syllabus, { ...newModule, modules: [...newModule.modules] }] });
            setNewModule({ title: '', modules: [] });
        }
    };
    const removeSyllabusModule = (index) => {
        const updated = formData.syllabus.filter((_, i) => i !== index);
        setFormData({ ...formData, syllabus: updated });
    };
    const addTopicToModule = () => {
        if (currentTopic.trim()) {
            setNewModule({ ...newModule, modules: [...newModule.modules, currentTopic.trim()] });
            setCurrentTopic('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const toastId = toast.loading('Saving course...');

        try {
            const data = new FormData();
            data.append('title', formData.title);
            data.append('description', formData.description);
            data.append('overview', formData.overview);
            data.append('duration', formData.duration);
            data.append('fee', formData.fee);
            data.append('skillLevel', formData.skillLevel);
            data.append('highlights', JSON.stringify(formData.highlights));
            data.append('syllabus', JSON.stringify(formData.syllabus));

            if (formData.image) data.append('image', formData.image);
            if (formData.syllabusPdf) data.append('syllabusPdf', formData.syllabusPdf);
            if (formData.brochurePdf) data.append('brochurePdf', formData.brochurePdf);

            let res;
            if (editingCourse) {
                res = await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/courses/${editingCourse._id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                setCourses(courses.map(c => c._id === editingCourse._id ? res.data : c));
                toast.success('Course updated successfully', { id: toastId });
            } else {
                res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/courses`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                setCourses([res.data, ...courses]);
                toast.success('Course created successfully', { id: toastId });
            }
            handleCloseModal();
        } catch (err) {
            console.error('Error saving course:', err);
            toast.error('Failed to save course', { id: toastId });
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading courses...</div>;

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Courses Management</h1>
                    <p className="text-gray-500 text-sm mt-1">Add, edit, and manage your course catalog.</p>
                </div>
                <button 
                    onClick={() => handleOpenModal()}
                    className="bg-indigo-600 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 font-medium hover:bg-indigo-700 transition-colors shadow-sm"
                >
                    <Plus size={20} /> Add New Course
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.length === 0 ? (
                    <div className="col-span-full text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                        <p className="text-gray-500">No courses found. Click "Add New Course" to get started.</p>
                    </div>
                ) : (
                    courses.map((course) => (
                        <div key={course._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col group hover:shadow-md transition-shadow">
                            <div className="relative h-48 bg-gray-100">
                                <img 
                                    src={course.imageUrl || 'https://via.placeholder.com/400x200?text=No+Image'} 
                                    alt={course.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 p-1 rounded-lg shadow-sm backdrop-blur-sm">
                                    <button 
                                        onClick={() => handleOpenModal(course)}
                                        className="p-1.5 text-gray-600 hover:text-indigo-600 rounded-md hover:bg-indigo-50 transition-colors"
                                        title="Edit"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(course._id)}
                                        className="p-1.5 text-gray-600 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <div className="absolute bottom-2 left-2">
                                     <span className="bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                                        {course.skillLevel}
                                     </span>
                                </div>
                            </div>
                            
                            <div className="p-5 flex flex-col flex-grow">
                                <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1" title={course.title}>
                                    {course.title}
                                </h3>
                                <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-grow" title={course.description}>
                                    {course.description}
                                </p>
                                
                                <div className="flex items-center justify-between text-sm text-gray-600 pt-4 border-t border-gray-100 mt-auto">
                                    <div className="flex items-center gap-1">
                                        <Clock size={16} className="text-gray-400" />
                                        {course.duration}
                                    </div>
                                    <div className="font-semibold text-indigo-600">
                                        {course.fee}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
                            <h2 className="text-xl font-bold text-gray-800">
                                {editingCourse ? 'Edit Course' : 'Create New Course'}
                            </h2>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            
                            {/* Basic Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Course Title</label>
                                    <input 
                                        type="text" name="title" value={formData.title} onChange={handleChange} required
                                        className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-indigo-500"
                                        placeholder="e.g. Full Stack Web Development"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Short Description (Card)</label>
                                    <textarea 
                                        name="description" value={formData.description} onChange={handleChange} required rows="2"
                                        className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-indigo-500"
                                        placeholder="Brief summary for the card view..."
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Detailed Overview</label>
                                    <textarea 
                                        name="overview" value={formData.overview} onChange={handleChange} required rows="5"
                                        className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-indigo-500"
                                        placeholder="Detailed course overview, prerequisites, and goals..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                                    <input type="text" name="duration" value={formData.duration} onChange={handleChange} required
                                        className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-indigo-500" placeholder="e.g. 6 Months" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Fee (INR)</label>
                                    <input type="text" name="fee" value={formData.fee} onChange={handleChange} required
                                        className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-indigo-500" placeholder="e.g. 45000" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Skill Level</label>
                                    <select name="skillLevel" value={formData.skillLevel} onChange={handleChange}
                                        className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-indigo-500 bg-white">
                                        <option value="Beginner">Beginner</option>
                                        <option value="Intermediate">Intermediate</option>
                                        <option value="Advanced">Advanced</option>
                                    </select>
                                </div>
                                
                                {/* File Inputs */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Course Image</label>
                                    <input type="file" name="image" onChange={handleFileChange} accept="image/*"
                                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Syllabus PDF</label>
                                    <input type="file" name="syllabusPdf" onChange={handleFileChange} accept="application/pdf"
                                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Brochure PDF</label>
                                    <input type="file" name="brochurePdf" onChange={handleFileChange} accept="application/pdf"
                                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                                </div>
                            </div>

                            {/* Highlights Builder */}
                            <div className="border-t border-gray-100 pt-6">
                                <label className="block text-sm font-bold text-gray-800 mb-2">Key Highlights</label>
                                <div className="flex gap-2 mb-3">
                                    <input 
                                        type="text" 
                                        value={newHighlight} 
                                        onChange={(e) => setNewHighlight(e.target.value)}
                                        className="flex-1 p-2 border border-gray-300 rounded-lg outline-none focus:border-indigo-500"
                                        placeholder="Add a key highlight (e.g. 100+ Hours Live Classes)"
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addHighlight())}
                                    />
                                    <button type="button" onClick={addHighlight} className="bg-indigo-100 text-indigo-600 p-2 rounded-lg hover:bg-indigo-200">
                                        <Plus size={20} />
                                    </button>
                                </div>
                                <ul className="space-y-2">
                                    {formData.highlights.map((h, i) => (
                                        <li key={i} className="flex justify-between items-center bg-gray-50 p-2 rounded text-sm text-gray-700">
                                            <span>{h}</span>
                                            <button type="button" onClick={() => removeHighlight(i)} className="text-red-400 hover:text-red-600">
                                                <X size={16} />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Syllabus Builder */}
                            <div className="border-t border-gray-100 pt-6">
                                <label className="block text-sm font-bold text-gray-800 mb-2">Syllabus Modules</label>
                                
                                <div className="bg-gray-50 p-4 rounded-xl space-y-3 mb-4 border border-gray-200">
                                    <input 
                                        type="text" 
                                        value={newModule.title} 
                                        onChange={(e) => setNewModule({...newModule, title: e.target.value})}
                                        className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-indigo-500 font-medium"
                                        placeholder="Module Title (e.g. Introduction to Web)"
                                    />
                                    <div className="flex gap-2">
                                       <input 
                                            type="text" 
                                            value={currentTopic} 
                                            onChange={(e) => setCurrentTopic(e.target.value)}
                                            className="flex-1 p-2 border border-gray-300 rounded-lg outline-none focus:border-indigo-500 text-sm"
                                            placeholder="Topic (e.g. HTML5 Semantics)"
                                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTopicToModule())}
                                        />
                                        <button type="button" onClick={addTopicToModule} className="bg-gray-200 text-gray-600 px-3 rounded-lg hover:bg-gray-300 text-sm">Add Topic</button>
                                    </div>
                                    {newModule.modules.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {newModule.modules.map((m, i) => (
                                                <span key={i} className="bg-white border border-gray-200 px-2 py-1 rounded text-xs text-gray-600">{m}</span>
                                            ))}
                                        </div>
                                    )}
                                    <button type="button" onClick={addSyllabusModule} className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
                                        Add Module to Course
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {formData.syllabus.map((mod, i) => (
                                        <div key={i} className="border border-gray-200 rounded-lg p-3">
                                            <div className="flex justify-between items-center mb-2">
                                                <h4 className="font-bold text-gray-800 text-sm">Module {i+1}: {mod.title}</h4>
                                                <button type="button" onClick={() => removeSyllabusModule(i)} className="text-red-400 hover:text-red-600">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                            <ul className="list-disc list-inside text-xs text-gray-600 pl-2">
                                                {mod.modules.map((top, j) => <li key={j}>{top}</li>)}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <button type="button" onClick={handleCloseModal} className="px-5 py-2.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" className="px-5 py-2.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg font-medium transition-colors shadow-lg shadow-indigo-200">
                                    {editingCourse ? 'Save Changes' : 'Create Course'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Courses;
