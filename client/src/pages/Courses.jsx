import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter } from 'lucide-react';
import SEO from '../components/SEO';
import CourseCard from '../components/CourseCard';

const Courses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('All');

    const categories = ['All', 'Beginner', 'Intermediate', 'Advanced'];

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/courses`);
                setCourses(res.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching courses:', err);
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    const filteredCourses = activeCategory === 'All'
        ? courses
        : courses.filter(course => course.skillLevel === activeCategory);

    return (
        <div className="bg-[#F9FAFB] min-h-screen relative overflow-hidden text-slate-900">
            <SEO
                title="Our Courses"
                description="Explore our range of professional finance courses including Global Accounting, Investment Banking, Taxation, and Audit."
            />

            {/* Cinematic Header Section */}
            <div className="pt-36 pb-12 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 border-b border-white/5 relative overflow-hidden shadow-2xl">
                {/* Subtle Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

                {/* Animated Header Specific Blobs - Traveling Effect */}
                <motion.div
                    animate={{
                        x: [-200, 800, -200],
                        y: [-200, 200, -200],
                        opacity: [0.1, 0.3, 0.1]
                    }}
                    transition={{
                        duration: 25,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500 rounded-full blur-[140px] pointer-events-none"
                />
                <motion.div
                    animate={{
                        x: [800, -200, 800],
                        y: [200, -200, 200],
                        opacity: [0.1, 0.25, 0.1]
                    }}
                    transition={{
                        duration: 30,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500 rounded-full blur-[120px] pointer-events-none"
                />

                <div className="container mx-auto px-8 md:px-12 lg:px-20 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="relative">
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/10 text-indigo-300 text-xs font-black uppercase tracking-widest mb-6 relative z-10 shadow-xl"
                            >
                                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                                All Courses
                            </motion.div>
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-5xl md:text-7xl font-black text-white leading-none tracking-tight mb-8 relative z-10"
                            >
                                Upgrade Your <span className="text-indigo-400">Skills</span>.
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="text-lg text-slate-400 max-w-xl font-medium relative z-10"
                            >
                                Explore our comprehensive range of courses designed to get you job-ready.
                            </motion.p>
                        </div>

                        {/* Category Filter Bento - Cinematic Style */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white/5 backdrop-blur-2xl p-8 rounded-[2rem] border border-white/10 flex flex-wrap gap-3 shadow-2xl"
                        >
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg ${activeCategory === cat
                                            ? 'bg-white text-slate-950 shadow-white/10'
                                            : 'bg-white/5 text-slate-400 border border-white/10 hover:border-indigo-400 hover:text-white'
                                        }`}
                                >
                                    {cat === 'All' ? 'All Skills' : cat}
                                </button>
                            ))}
                        </motion.div>
                    </div>
                </div>
            </div>

            <main className="container mx-auto px-8 md:px-12 lg:px-20 py-24 relative z-10">
                {loading ? (
                    <div className="flex flex-col justify-center items-center h-80 bg-white rounded-[3rem] shadow-xl shadow-slate-200/50">
                        <div className="w-12 h-12 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin mb-4" />
                        <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px]">Loading courses</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <AnimatePresence mode="popLayout">
                            {filteredCourses.map(course => (
                                <motion.div
                                    key={course._id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                    className="h-full"
                                >
                                    <CourseCard course={course} />
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {filteredCourses.length === 0 && (
                            <div className="col-span-full py-40 bg-white rounded-[3rem] text-center border-2 border-dashed border-slate-100">
                                <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-white">
                                    <Filter size={32} className="text-slate-200" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">No courses found.</h3>
                                <p className="text-slate-400 max-w-xs mx-auto text-sm font-medium">Try another skill level to find what you're looking for.</p>
                                <button
                                    onClick={() => setActiveCategory('All')}
                                    className="mt-10 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all"
                                >
                                    Reset Filter
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Courses;
