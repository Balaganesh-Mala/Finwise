import React, { useState, useEffect } from 'react';
import SEO from '../components/SEO';
import { MapPin, Briefcase, IndianRupee, ArrowRight, TrendingUp, Users, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import JobDetailsModal from '../components/JobDetailsModal';
import JobApplicationModal from '../components/JobApplicationModal';

import axios from 'axios';

const Career = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedJob, setSelectedJob] = useState(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/jobs`);
                setJobs(res.data);
            } catch (err) {
                console.error("Failed to fetch jobs", err);
            } finally {
                setLoading(false);
            }
        };
        fetchJobs();
    }, []);

    const openDetailsModal = (job) => {
        setSelectedJob(job);
        setIsDetailsModalOpen(true);
    };

    const closeDetailsModal = (action) => {
        setIsDetailsModalOpen(false);
        if (action === 'apply') {
            // Wait for details modal to close slightly before opening application
            setTimeout(() => setIsApplicationModalOpen(true), 100);
        } else {
            setTimeout(() => setSelectedJob(null), 300);
        }
    };

    const closeApplicationModal = () => {
        setIsApplicationModalOpen(false);
        setTimeout(() => setSelectedJob(null), 300);
    };



    return (
        <div className="bg-gray-50 min-h-screen pb-20 font-sans">
            <SEO
                title="Careers | We Design Your Future"
                description="Find your dream job with our hiring partners. We connect skilled graduates with top tech companies."
            />

            {/* Hero Section */}
            <div className="bg-gray-900 text-white py-24 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-primary-600 rounded-full blur-[128px] opacity-40"></div>
                <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-80 h-80 bg-orange-600 rounded-full blur-[100px] opacity-30"></div>

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="inline-block py-1 px-3 rounded-full bg-primary-500/10 border border-primary-500/30 text-primary-400 text-sm font-semibold mb-6 tracking-wide uppercase">
                            Career Opportunities
                        </span>
                        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight text-white">
                            Build Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-orange-400">Future</span> With Us
                        </h1>
                        <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
                            Connect with top companies and startups. We bridge the gap between your skills and your dream career.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        className="flex justify-center gap-4 md:gap-12 flex-wrap text-gray-300 font-medium border-t border-gray-800 pt-10 mt-4 max-w-4xl mx-auto"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-800 rounded-lg text-primary-400"><Users size={20} /></div>
                            <span>500+ Hired</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-800 rounded-lg text-primary-400"><TrendingUp size={20} /></div>
                            <span>Top Packages</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-800 rounded-lg text-primary-400"><Award size={20} /></div>
                            <span>Verified Jobs</span>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Job Grid Section */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {loading ? (
                        [...Array(3)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl p-8 border border-gray-100 animate-pulse h-96"></div>
                        ))
                    ) : jobs.length === 0 ? (
                        <div className="col-span-full text-center py-20 bg-white rounded-2xl shadow-xl shadow-gray-200/50">
                            <Briefcase size={64} className="mx-auto text-gray-700 mb-4" />
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Openings Currently</h3>
                            <p className="text-gray-500">Please check back later for new opportunities.</p>
                        </div>
                    ) : jobs.map((job, index) => (
                        <motion.div
                            key={job._id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:shadow-primary-500/10 transition-all duration-300 overflow-hidden flex flex-col h-full group border border-gray-100 hover:border-primary-100"
                        >
                            <div className="p-8 flex-grow">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="bg-gray-50 p-3 rounded-2xl group-hover:bg-primary-50 transition-colors duration-300">
                                        {job.companyLogo ? (
                                            <img src={job.companyLogo} alt={job.company} className="w-10 h-10 object-contain" />
                                        ) : (
                                            <Briefcase size={24} className="text-gray-600 group-hover:text-primary-600 transition-colors" />
                                        )}
                                    </div>
                                    <span className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                        {job.type}
                                    </span>
                                </div>

                                <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                                    {job.title}
                                </h3>
                                <p className="text-gray-500 font-medium mb-6">{job.company}</p>

                                <div className="flex flex-col gap-3 mb-6">
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <MapPin size={16} className="text-gray-400" />
                                        {job.location}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-900 font-semibold bg-gray-50 px-3 py-2 rounded-lg w-fit">
                                        <IndianRupee size={16} className="text-primary-600" />
                                        {job.salary}
                                    </div>
                                </div>

                                <p className="text-gray-600 text-sm leading-relaxed mb-6 line-clamp-3">
                                    {job.description}
                                </p>

                                <div className="flex flex-wrap gap-2 mt-auto pt-6 border-t border-gray-50">
                                    {job.skills.slice(0, 3).map((skill, idx) => (
                                        <span key={idx} className="bg-white text-gray-500 px-3 py-1 rounded-full text-xs font-medium border border-gray-200">
                                            {skill}
                                        </span>
                                    ))}
                                    {job.skills.length > 3 && (
                                        <span className="text-gray-400 text-xs px-2 py-1 flex items-center">+{job.skills.length - 3} more</span>
                                    )}
                                </div>
                            </div>

                            <div className="p-4 px-8 pb-8">
                                <button
                                    onClick={() => openDetailsModal(job)}
                                    className="w-full bg-gray-900 text-white hover:bg-primary-600 font-bold py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group-hover:translate-y-[-2px] shadow-lg shadow-gray-900/10 group-hover:shadow-primary-600/20"
                                >
                                    Apply Now <ArrowRight size={18} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* CTA Section */}
                <div className="mt-24 mb-10 bg-gray-900 rounded-3xl p-10 md:p-20 text-white shadow-2xl relative overflow-hidden text-center border border-gray-800">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-600 rounded-full blur-[150px] opacity-20 -mr-20 -mt-20"></div>
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600 rounded-full blur-[150px] opacity-10 -ml-20 -mb-20"></div>

                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">Hire Our Top Graduates</h2>
                        <p className="text-gray-300 text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
                            Looking for skilled talent? Connect with candidates who are industry-ready, project-experienced, and trained in the latest technologies.
                        </p>
                        <a
                            href="/contact"
                            className="bg-primary-600 text-white px-10 py-4 rounded-full font-bold hover:bg-primary-500 transition-all shadow-lg shadow-primary-600/30 transform hover:-translate-y-1 inline-flex items-center gap-2"
                        >
                            Partner With Us <ArrowRight size={20} />
                        </a>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <JobDetailsModal
                job={selectedJob}
                isOpen={isDetailsModalOpen}
                onClose={closeDetailsModal}
            />

            <JobApplicationModal
                job={selectedJob}
                isOpen={isApplicationModalOpen}
                onClose={closeApplicationModal}
            />
        </div>
    );
};

export default Career;
