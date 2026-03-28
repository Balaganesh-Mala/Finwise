import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';
import AboutSection from '../components/AboutSection';
import { Users } from 'lucide-react';
import axios from 'axios';

const About = () => {
    const [teamMembers, setTeamMembers] = useState([]);

    useEffect(() => {
        const fetchTeam = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/banners`);
                const allBanners = res.data;
                // Filter Orders 8-11 for Team Members
                const team = allBanners.filter(b => b.isActive && b.order >= 7 && b.order <= 10);
                setTeamMembers(team);
            } catch (err) {
                console.error("Error fetching team:", err);
            }
        };
        fetchTeam();
    }, []);

    return (
        <div className="bg-[#F9FAFB] min-h-screen relative overflow-hidden text-slate-900">
            <SEO
                title="About Us"
                description="Learn about our mission to empower the next generation of finance and accounting professionals through industry-focused training."
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

                <div className="container mx-auto px-8 md:px-12 lg:px-20 relative z-10 text-center space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/10 text-indigo-300 text-xs font-black uppercase tracking-widest relative z-10 shadow-xl mx-auto"
                    >
                        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                        Our Mission
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-black text-white leading-none tracking-tight relative z-10"
                    >
                        Building Job-Ready Finance Professionals  <br className="hidden md:block" />
                        <span className="text-indigo-400">for the Future</span>.
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg text-slate-400 max-w-3xl mx-auto font-medium relative z-10"
                    >
                        Transforming commerce graduates into industry-ready accounting and finance professionals through practical, project-based training.
                    </motion.p>
                </div>
            </div>

            <AboutSection />

            <div className="py-20 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900">Meet Our Team</h2>
                        <p className="text-gray-600 mt-4">Led by industry experts with decades of experience.</p>
                    </div>

                    {teamMembers.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 text-center">
                            {teamMembers.map((member) => (
                                <div key={member._id} className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:-translate-y-2 transition-transform h-full">
                                    <div className="w-32 h-32 mx-auto bg-gray-200 rounded-full mb-6 overflow-hidden">
                                        <img src={member.fileUrl} alt={member.title} className="w-full h-full object-cover" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">{member.title}</h3>
                                    <p className="text-indigo-600 font-medium text-sm mt-1">
                                        {member.order === 8 ? 'CEO & Founder' :
                                            member.order === 9 ? 'Chief Financial Expert' :
                                                member.order === 10 ? 'Head of Professional Training' : 'Financial Mentor'}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 italic p-8">

                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default About;
