import React, { useState, useEffect } from 'react';
import { BookOpen, PlayCircle, Clock, Award, Loader } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const MyCourses = () => {
    const [courses, setCourses] = useState([]);
    const [studentData, setStudentData] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchEnrolledCourses();
    }, []);

    const fetchEnrolledCourses = async () => {
        try {
            // Get basics from local storage
            let user = JSON.parse(localStorage.getItem('studentUser'));

            // Fetch fresh student data (for startDate)
            // We need to assume we can get it via ID if available, or just rely on what we have.
            // Ideally typically we fetch /api/students/me or /api/students/:id
            if (user && user._id) {
                try {
                    const studentRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/students/${user._id}`);
                    user = studentRes.data; // Use fresh data
                    setStudentData(user);
                } catch (e) {
                    console.warn("Could not fetch fresh student details, using local storage", e);
                }
            }

            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/courses`);

            if (user?.courseName) {
                // 1. Try Exact Case-Insensitive Match
                let enrolled = res.data.filter(c =>
                    c.title.trim().toLowerCase() === user.courseName.trim().toLowerCase()
                );

                // 2. If no match, Try Partial
                if (enrolled.length === 0) {
                    enrolled = res.data.filter(c =>
                        c.title.toLowerCase().includes(user.courseName.trim().toLowerCase()) ||
                        user.courseName.trim().toLowerCase().includes(c.title.toLowerCase())
                    );
                }

                if (enrolled.length > 0) {
                    setCourses(enrolled);
                } else {
                    setCourses([]);
                    toast.error(`Course "${user.courseName}" not found.`);
                }
            } else {
                setCourses([]);
                toast('No enrolled course found.', { icon: 'ℹ️' });
            }

            setLoading(false);
        } catch (err) {
            console.error('Error fetching courses:', err);
            toast.error('Failed to load courses');
            setLoading(false);
        }
    };

    // Helper: Calculate Progress based on Time
    const calculateBatchProgress = (course) => {
        if (!studentData?.startDate || !course.duration) return { percent: 0, text: 'Start Learning' };

        const start = new Date(studentData.startDate);
        const today = new Date();

        // Calculate days passed
        const diffTime = Math.abs(today - start);
        const daysPassed = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Parse Duration (e.g., "3 Months", "12 Weeks")
        let totalDays = 90; // Default
        const durationStr = course.duration.toLowerCase();

        if (durationStr.includes('month')) {
            const months = parseInt(durationStr) || 3;
            totalDays = months * 30;
        } else if (durationStr.includes('week')) {
            const weeks = parseInt(durationStr) || 12;
            totalDays = weeks * 7;
        } else if (durationStr.includes('day')) {
            totalDays = parseInt(durationStr) || 90;
        }

        // Cap at 100%
        let percent = Math.round((daysPassed / totalDays) * 100);
        if (percent > 100) percent = 100;
        if (percent < 0) percent = 0; // Future start date

        return {
            percent,
            text: `Day ${daysPassed} of ${totalDays}`,
            daysPassed
        };
    };

    if (loading) return (
        <div className="flex h-64 items-center justify-center text-indigo-600">
            <Loader className="animate-spin" size={32} />
        </div>
    );

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800">My Courses</h1>
                <p className="text-gray-500 mt-1">Continue learning where you left off.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.length === 0 ? (
                    <div className="col-span-full text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                        <p className="text-gray-500">No courses available.</p>
                    </div>
                ) : (
                    courses.map((course) => {
                        const progress = calculateBatchProgress(course);
                        return (
                            <div key={course._id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col h-full">
                                <div className="relative h-48 overflow-hidden bg-gray-100 shrink-0">
                                    <img
                                        src={course.imageUrl || 'https://via.placeholder.com/400x200?text=No+Image'}
                                        alt={course.title}
                                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => navigate(`/course/${course._id}`)}
                                            className="bg-white text-indigo-600 px-4 py-2 rounded-full font-bold flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-transform"
                                        >
                                            <PlayCircle size={20} />
                                            Resume Learning
                                        </button>
                                    </div>
                                </div>

                                <div className="p-5 flex flex-col flex-1">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                                            {course.skillLevel || 'Course'}
                                        </span>
                                        <span className="text-xs text-gray-500 flex items-center gap-1">
                                            <Clock size={12} /> {course.duration}
                                        </span>
                                    </div>

                                    <h3 className="font-bold text-gray-900 mb-1 line-clamp-1" title={course.title}>
                                        {course.title}
                                    </h3>
                                    <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-grow">
                                        {course.description}
                                    </p>

                                    <div className="wb-4 mt-auto pt-4 border-t border-gray-50">
                                        {/* Batch Progress */}
                                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                                            <span>{progress.percent}% Completed</span>
                                            <span>{progress.text}</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
                                            <div
                                                className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                                                style={{ width: `${progress.percent}%` }}
                                            ></div>
                                        </div>

                                        <button
                                            onClick={() => navigate(`/course/${course._id}`)}
                                            className="w-full py-2.5 border border-indigo-200 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-600 hover:text-white transition-colors flex items-center justify-center gap-2"
                                        >
                                            <BookOpen size={16} />
                                            Go to Class
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default MyCourses;
