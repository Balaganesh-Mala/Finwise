import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, Calendar, ArrowRight } from 'lucide-react';

const MyCourses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                // Fetch all courses (public endpoint) or trainer specific if available
                // For now, allow viewing all courses to add content
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                const { data } = await axios.get(`${API_URL}/api/trainer/courses`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('trainerToken')}` }
                });
                setCourses(data);
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch courses:", error);
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Course Materials</h1>
                <p className="text-gray-500">Manage videos and notes for your courses.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map(course => (
                    <div key={course._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
                        <div className="h-40 bg-gray-100 relative">
                            {course.imageUrl ? (
                                <img src={course.imageUrl} alt={course.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <BookOpen size={48} opacity={0.2} />
                                </div>
                            )}
                            <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-indigo-600 shadow-sm">
                                {course.level || 'Beginner'}
                            </div>
                        </div>

                        <div className="p-5 flex-1 flex flex-col">
                            <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2">{course.title}</h3>
                            <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-1">{course.overview}</p>

                            <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                                <div className="flex items-center gap-1">
                                    <Clock size={14} /> {course.duration}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Calendar size={14} /> {new Date(course.updatedAt || course.createdAt).toLocaleDateString()}
                                </div>
                            </div>

                            <button
                                onClick={() => navigate(`/materials/${course._id}`)}
                                className="w-full py-2 bg-indigo-50 text-indigo-700 font-medium rounded-lg hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2"
                            >
                                Manage Content <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                ))}

                {courses.length === 0 && (
                    <div className="col-span-full text-center py-12 text-gray-500">
                        No courses found.
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyCourses;
