import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2, Search, X, Link as LinkIcon, Image, BookOpen, Clock, DollarSign, BarChart } from 'lucide-react';
import toast from 'react-hot-toast';

const Courses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        duration: '',
        fee: '',
        skillLevel: 'Beginner',
        imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        syllabusUrl: '',
        enrollLink: ''
    });

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/courses');
            setCourses(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching courses:', err);
            toast.error('Failed to load courses');
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this course?')) {
            try {
                await axios.delete(`http://localhost:5000/api/courses/${id}`);
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
                title: course.title,
                description: course.description,
                duration: course.duration,
                fee: course.fee,
                skillLevel: course.skillLevel,
                imageUrl: course.imageUrl || '',
                syllabusUrl: course.syllabusUrl || '',
                enrollLink: course.enrollLink || ''
            });
        } else {
            setEditingCourse(null);
            setFormData({
                title: '',
                description: '',
                duration: '',
                fee: '',
                skillLevel: 'Beginner',
                imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
                syllabusUrl: '',
                enrollLink: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCourse(null);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingCourse) {
                const res = await axios.put(`http://localhost:5000/api/courses/${editingCourse._id}`, formData);
                setCourses(courses.map(c => c._id === editingCourse._id ? res.data : c));
                toast.success('Course updated successfully');
            } else {
                const res = await axios.post('http://localhost:5000/api/courses', formData);
                setCourses([res.data, ...courses]);
                toast.success('Course created successfully');
            }
            handleCloseModal();
        } catch (err) {
            console.error('Error saving course:', err);
            toast.error('Failed to save course. Please check all fields.');
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
                                        <Edit size={16} />
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
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
                            <h2 className="text-xl font-bold text-gray-800">
                                {editingCourse ? 'Edit Course' : 'Create New Course'}
                            </h2>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Course Title</label>
                                    <input 
                                        type="text" 
                                        name="title" 
                                        value={formData.title} 
                                        onChange={handleChange}
                                        required
                                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                        placeholder="e.g. Full Stack Web Development"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea 
                                        name="description" 
                                        value={formData.description} 
                                        onChange={handleChange}
                                        required
                                        rows="3"
                                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                                        placeholder="Detailed description of the course..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-3 text-gray-400" size={18} />
                                        <input 
                                            type="text" 
                                            name="duration" 
                                            value={formData.duration} 
                                            onChange={handleChange}
                                            required
                                            className="w-full pl-10 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                            placeholder="e.g. 6 Months"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Course Fee</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-3 text-gray-400" size={18} />
                                        <input 
                                            type="text" 
                                            name="fee" 
                                            value={formData.fee} 
                                            onChange={handleChange}
                                            required
                                            className="w-full pl-10 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                            placeholder="e.g. $999"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Skill Level</label>
                                    <div className="relative">
                                        <BarChart className="absolute left-3 top-3 text-gray-400" size={18} />
                                        <select 
                                            name="skillLevel" 
                                            value={formData.skillLevel} 
                                            onChange={handleChange}
                                            className="w-full pl-10 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
                                        >
                                            <option value="Beginner">Beginner</option>
                                            <option value="Intermediate">Intermediate</option>
                                            <option value="Advanced">Advanced</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                                    <div className="relative">
                                        <Image className="absolute left-3 top-3 text-gray-400" size={18} />
                                        <input 
                                            type="text" 
                                            name="imageUrl" 
                                            value={formData.imageUrl} 
                                            onChange={handleChange}
                                            className="w-full pl-10 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                            placeholder="https://..."
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <button 
                                    type="button" 
                                    onClick={handleCloseModal}
                                    className="px-5 py-2.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="px-5 py-2.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg font-medium transition-colors shadow-lg shadow-indigo-200"
                                >
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
