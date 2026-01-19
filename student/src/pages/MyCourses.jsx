import React from 'react';
import { BookOpen, PlayCircle, Clock, Award } from 'lucide-react';

const MyCourses = () => {
    // Mock Data - In a real app, fetch from Supabase/Backend
    const courses = [
        {
            id: 1,
            title: 'Full Stack Web Development',
            instructor: 'Dr. Angela Yu',
            progress: 75,
            totalModules: 12,
            completedModules: 9,
            thumbnail: 'https://images.unsplash.com/photo-1547658719-da2b51169166?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        },
        {
            id: 2,
            title: 'UI/UX Design Masterclass',
            instructor: 'Gary Simon',
            progress: 30,
            totalModules: 8,
            completedModules: 2,
            thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        },
        // Add more mock data as needed
    ];

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800">My Courses</h1>
                <p className="text-gray-500 mt-1">Continue learning where you left off.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                    <div key={course.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                        <div className="relative h-48 overflow-hidden">
                            <img 
                                src={course.thumbnail} 
                                alt={course.title} 
                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="bg-white text-indigo-600 px-4 py-2 rounded-full font-bold flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                                    <PlayCircle size={20} />
                                    Resume
                                </button>
                            </div>
                        </div>
                        
                        <div className="p-5">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">Web Dev</span>
                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                    <Clock size={12} /> 2h left
                                </span>
                            </div>

                            <h3 className="font-bold text-gray-900 mb-1 line-clamp-1" title={course.title}>{course.title}</h3>
                            <p className="text-sm text-gray-500 mb-4">{course.instructor}</p>

                            <div className="mb-4">
                                <div className="flex justify-between text-xs text-gray-500 mb-1">
                                    <span>{course.progress}% Completed</span>
                                    <span>{course.completedModules}/{course.totalModules} Modules</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2">
                                    <div 
                                        className="bg-indigo-600 h-2 rounded-full transition-all duration-500" 
                                        style={{ width: `${course.progress}%` }}
                                    ></div>
                                </div>
                            </div>
                            
                            <button className="w-full py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2">
                                <BookOpen size={16} />
                                View Curriculum
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MyCourses;
