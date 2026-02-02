import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Play, Star, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const HeroBanner = () => {
    // Default hardcoded banners as fallback
    const defaultBanners = [
        { fileUrl: "https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80", resourceType: 'image', _id: 'd1' },
        { fileUrl: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80", resourceType: 'image', _id: 'd2' },
        { fileUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80", resourceType: 'image', _id: 'd3' }
    ];

    const [banners, setBanners] = useState(defaultBanners);
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/banners`);
                const allBanners = res.data;
                // Filter: Active AND Order 1-5 (Hero Section)
                const heroBanners = allBanners.filter(b => b.isActive && b.order >= 1 && b.order <= 5);

                if (heroBanners.length > 0) {
                    setBanners(heroBanners);
                }
            } catch (err) {
                console.error("Error fetching hero banners:", err);
            }
        };

        fetchBanners();
    }, []);

    // Reset current index when banners change to prevent out-of-bounds access
    useEffect(() => {
        setCurrent(0);
    }, [banners]);

    useEffect(() => {
        if (banners.length <= 1) return; // Don't cycle if only 1 banner
        const timer = setInterval(() => {
            setCurrent(prev => (prev + 1) % banners.length);
        }, 5000); // 5 seconds per slide
        return () => clearInterval(timer);
    }, [banners.length]);

    const currentBanner = banners[current];

    // Safety guard
    if (!currentBanner) return null;

    return (
        <section className="relative min-h-[90vh] flex items-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 overflow-hidden pt-20 mx-auto px-4 md:px-12 lg:px-24">

            {/* Light Grid Background */}
            <div className="absolute inset-0 pointer-events-none" style={{
                backgroundImage: `linear-gradient(rgba(99, 102, 241, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(99, 102, 241, 0.05) 1px, transparent 1px)`,
                backgroundSize: '50px 50px',
                maskImage: 'radial-gradient(circle at center, black 30%, transparent 80%)',
                WebkitMaskImage: 'radial-gradient(circle at center, black 30%, transparent 80%)'
            }}></div>

            {/* Background Blobs */}
            <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[800px] h-[800px] bg-indigo-200/30 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[600px] h-[600px] bg-purple-200/30 rounded-full blur-3xl" />

            <div className="container mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-12 items-center">

                {/* Text Content (Left) */}
                <div className="max-w-2xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 text-green-700 text-sm font-semibold mb-6">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-600"></span>
                            </span>
                            New Batch Starting Soon
                        </div>

                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-[1.1] mb-6">
                            Unlock Your <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
                                Global Potential
                            </span>
                        </h1>

                        <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                            Stop learning outdated theory. Get hands-on experience with real-world projects and mentorship from engineers at top companies.
                        </p>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-10">
                            <Link
                                to="/courses"
                                className="px-8 py-4 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all flex items-center gap-2 shadow-xl shadow-gray-200"
                            >
                                Browse Courses <ArrowRight size={20} />
                            </Link>
                            <Link
                                to="/about"
                                className="px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50 transition-all flex items-center gap-2"
                            >
                                <Play size={20} fill="currentColor" className="text-gray-900" />
                                How it works
                            </Link>
                        </div>

                        <div className="flex items-center gap-8 text-sm font-medium text-gray-500">
                            <div className="flex items-center gap-2">
                                <CheckCircle size={18} className="text-green-500" /> 100% Job Assist
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle size={18} className="text-green-500" /> Live Mentorship
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle size={18} className="text-green-500" /> Verified Certs
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Visual Content (Right) */}
                <div className="relative hidden lg:block h-[600px]">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        className="relative h-full w-full"
                    >
                        {/* Main Image Slider Shape */}
                        <div className="absolute top-10 right-10 w-4/5 h-4/5 bg-gray-900 rounded-[3rem] overflow-hidden shadow-2xl rotate-3 transition-transform hover:rotate-0 duration-500">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentBanner._id || current}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.8 }}
                                    className="w-full h-full"
                                >
                                    {currentBanner.resourceType === 'video' ? (
                                        <video
                                            src={currentBanner.fileUrl}
                                            className="w-full h-full object-cover"
                                            autoPlay
                                            muted
                                            loop
                                            playsInline
                                        />
                                    ) : (
                                        <img
                                            src={currentBanner.fileUrl}
                                            alt="Hero"
                                            className="w-full h-full object-cover"
                                        />
                                    )}
                                </motion.div>
                            </AnimatePresence>
                            {/* Overlay Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 to-transparent pointer-events-none"></div>
                        </div>

                        {/* Floating Badge 1 */}
                        <motion.div
                            initial={{ x: 50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="absolute top-20 right-0 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3 z-20"
                        >
                            <div className="bg-yellow-100 p-2 rounded-lg text-yellow-600">
                                <Star fill="currentColor" size={24} />
                            </div>
                            <div>
                                <p className="font-bold text-gray-900">4.9/5 Rating</p>
                                <p className="text-xs text-gray-500">Student Reviews</p>
                            </div>
                        </motion.div>

                        {/* Floating Badge 2 */}
                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.7 }}
                            className="absolute bottom-20 left-10 bg-white p-4 pr-8 rounded-2xl shadow-xl border border-gray-100 flex -space-x-4 items-center z-20"
                        >
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                                    <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="Student" />
                                </div>
                            ))}
                            <div className="ml-6 pl-2">
                                <p className="font-bold text-gray-900">10k+ Students</p>
                                <p className="text-xs text-gray-500">Improving skills</p>
                            </div>
                        </motion.div>

                    </motion.div>
                </div>

            </div>
        </section>
    );
};

export default HeroBanner;
