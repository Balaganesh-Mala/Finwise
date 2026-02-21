import React, { useState, useEffect } from 'react';
import { MapPin, Briefcase, IndianRupee, ArrowRight, Award, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import JobDetailsModal from '../components/JobDetailsModal';
import JobApplicationModal from '../components/JobApplicationModal';
import axios from 'axios';
import toast from 'react-hot-toast';

const JobPortal = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedJob, setSelectedJob] = useState(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [completionStats, setCompletionStats] = useState({
        completionPercentage: 0,
        enrolled: false
    });

    useEffect(() => {
        const init = async () => {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const storedUser = localStorage.getItem('studentUser');
            let parsedUser = null;

            if (storedUser) {
                parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);

                // Fetch completion stats
                if (parsedUser._id) {
                    try {
                        const statsRes = await axios.get(`${API_URL}/api/student/progress/stats/${parsedUser._id}`);
                        if (statsRes.data.success) {
                            setCompletionStats(statsRes.data.stats);
                        }
                    } catch (error) {
                        console.error("Error fetching stats:", error);
                    }
                }
            }

            // Fetch jobs — include studentId so server can mask company data for ineligible students
            try {
                const studentId = parsedUser?._id || '';
                const res = await axios.get(`${API_URL}/api/jobs/fetch/student${studentId ? `?studentId=${studentId}` : ''}`);
                setJobs(res.data);
            } catch (err) {
                console.error('Error fetching jobs:', err);
                toast.error("Failed to load jobs");
            } finally {
                setLoading(false);
            }
        };

        init();
    }, []);

    // Derived eligibility
    const eligible = completionStats.completionPercentage >= 75;

    const openDetailsModal = (job) => {
        setSelectedJob(job);
        setIsDetailsModalOpen(true);
    };

    const closeDetailsModal = (action) => {
        setIsDetailsModalOpen(false);
        if (action === 'apply') {
            if (!eligible) {
                toast.error(
                    `Complete at least 75% of your course to unlock job applications. Current: ${completionStats.completionPercentage}%`,
                    { duration: 4000, icon: '🔒' }
                );
                return;
            }
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
        <div className="pb-20 font-sans">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Job Portal 🚀</h1>
                    <p className="text-gray-500 mt-1">Exclusive opportunities for our top graduates.</p>
                </div>

                {/* Progress Indicator */}
                <div className={`flex items-center gap-3 px-4 py-2 rounded-xl border ${eligible ? 'bg-green-50 border-green-100 text-green-700' : 'bg-orange-50 border-orange-100 text-orange-700'}`}>
                    <div className="flex flex-col items-end">
                        <span className="text-xs font-bold uppercase tracking-wider">Course Progress</span>
                        <span className="text-lg font-black">{completionStats.completionPercentage}%</span>
                    </div>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${eligible ? 'bg-green-500' : 'bg-orange-500'}`}>
                        {eligible ? <Award size={20} /> : <Lock size={18} />}
                    </div>
                </div>
            </div>

            {/* Eligibility Banner for ineligible students */}
            {!eligible && !loading && (
                <div className="w-full mb-6 flex items-start gap-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-5 py-4">
                    <Lock size={20} className="flex-shrink-0 mt-0.5 text-amber-500" />
                    <div>
                        <p className="font-bold text-sm">Job applications are locked</p>
                        <p className="text-sm mt-0.5">
                            Complete at least <span className="font-bold">75%</span> of your course to unlock full job details and apply.
                            You are currently at <span className="font-bold">{completionStats.completionPercentage}%</span>.
                        </p>
                    </div>
                </div>
            )}

            {/* Job Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading ? (
                    [...Array(3)].map((_, i) => (
                        <div key={i} className="bg-white rounded-2xl p-8 border border-gray-100 animate-pulse h-96" />
                    ))
                ) : jobs.length === 0 ? (
                    <div className="col-span-full text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <Briefcase size={64} className="mx-auto text-gray-400 mb-4" />
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
                        className={`bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full group border ${eligible ? 'hover:shadow-indigo-500/10 border-gray-100 hover:border-indigo-100' : 'border-gray-100'}`}
                    >
                        <div className="p-8 flex-grow">
                            <div className="flex justify-between items-start mb-6">
                                <div className="bg-gray-50 p-3 rounded-2xl group-hover:bg-indigo-50 transition-colors duration-300">
                                    {job.companyLogo ? (
                                        <img src={job.companyLogo} alt="Company" className="w-10 h-10 object-contain" />
                                    ) : (
                                        <Briefcase size={24} className="text-gray-600 group-hover:text-indigo-600 transition-colors" />
                                    )}
                                </div>
                                <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                    {job.type}
                                </span>
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                                {job.title}
                            </h3>

                            {/* Company name — shown as masked by the server if ineligible */}
                            <p className={`font-medium mb-6 flex items-center gap-1.5 ${eligible ? 'text-gray-500' : 'text-amber-600'}`}>
                                {!eligible && <Lock size={13} className="flex-shrink-0" />}
                                {job.company}
                            </p>

                            <div className="flex flex-col gap-3 mb-6">
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <MapPin size={16} className="text-gray-400" />
                                    {job.location}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-900 font-semibold bg-gray-50 px-3 py-2 rounded-lg w-fit">
                                    <IndianRupee size={16} className="text-indigo-600" />
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

                        {/* Card footer — locked or normal */}
                        <div className="p-4 px-8 pb-8">
                            {eligible ? (
                                <button
                                    onClick={() => openDetailsModal(job)}
                                    className="w-full bg-gray-900 text-white hover:bg-indigo-600 font-bold py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group-hover:translate-y-[-2px] shadow-lg shadow-gray-900/10 group-hover:shadow-indigo-600/20"
                                >
                                    View Details <ArrowRight size={18} />
                                </button>
                            ) : (
                                <button
                                    onClick={() => openDetailsModal(job)}
                                    className="w-full bg-amber-50 border border-amber-200 text-amber-700 font-bold py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 hover:bg-amber-100"
                                >
                                    <Lock size={16} /> View Details (Restricted)
                                </button>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Modals */}
            <JobDetailsModal
                job={selectedJob}
                isOpen={isDetailsModalOpen}
                onClose={closeDetailsModal}
                eligible={eligible}
                completion={completionStats.completionPercentage}
            />
            <JobApplicationModal
                job={selectedJob}
                isOpen={isApplicationModalOpen}
                onClose={closeApplicationModal}
            />
        </div>
    );
};

export default JobPortal;
