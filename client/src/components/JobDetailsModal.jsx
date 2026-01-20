import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Briefcase, IndianRupee, CheckCircle, ArrowRight } from 'lucide-react';

const JobDetailsModal = ({ job, isOpen, onClose }) => {
    if (!isOpen || !job) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden relative flex flex-col max-h-[90vh]"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="bg-gray-900 text-white p-6 md:p-8 relative overflow-hidden flex-shrink-0">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF7F50] rounded-full blur-[80px] opacity-20 -mr-16 -mt-16"></div>
                        
                        <button 
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
                        >
                            <X size={20} className="text-white" />
                        </button>

                        <div className="relative z-10">
                            <span className="inline-block px-3 py-1 rounded-full bg-primary-500/20 border border-primary-500/30 text-primary-300 text-xs font-bold uppercase tracking-wider mb-4">
                                {job.type}
                            </span>
                            <h2 className="text-2xl md:text-3xl font-bold mb-2 pr-8">{job.title}</h2>
                            <p className="text-gray-300 text-lg">{job.company}</p>

                            <div className="flex flex-wrap gap-4 mt-6 text-sm font-medium text-gray-300">
                                <div className="flex items-center gap-2 bg-gray-800/50 px-3 py-2 rounded-lg">
                                    <MapPin size={16} className="text-primary-400" /> {job.location}
                                </div>
                                <div className="flex items-center gap-2 bg-gray-800/50 px-3 py-2 rounded-lg">
                                    <IndianRupee size={16} className="text-primary-400" /> {job.salary}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1">
                        <div className="mb-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-3">About the Role</h3>
                            <p className="text-gray-600 leading-relaxed">
                                {job.description}
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8 mb-8">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <div className="w-1 h-6 bg-primary-500 rounded-full"></div>
                                    Key Responsibilities
                                </h3>
                                <ul className="space-y-3">
                                    {job.responsibilities?.map((item, index) => (
                                        <li key={index} className="flex items-start gap-3 text-gray-600 text-sm">
                                            <CheckCircle size={16} className="text-primary-500 mt-1 flex-shrink-0" />
                                            <span>{item}</span>
                                        </li>
                                    )) || <p className="text-gray-500 italic">Detailed responsibilities available upon application.</p>}
                                </ul>
                            </div>
                            
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <div className="w-1 h-6 bg-primary-500 rounded-full"></div>
                                    Requirements
                                </h3>
                                <ul className="space-y-3">
                                    {job.requirements?.map((item, index) => (
                                        <li key={index} className="flex items-start gap-3 text-gray-600 text-sm">
                                            <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 flex-shrink-0"></div>
                                            <span>{item}</span>
                                        </li>
                                    )) || <p className="text-gray-500 italic">Detailed requirements available upon application.</p>}
                                </ul>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Required Skills</h3>
                            <div className="flex flex-wrap gap-2">
                                {job.skills.map((skill, index) => (
                                    <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Footer - Fixed Action Area */}
                    <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-4 flex-shrink-0">
                        <button 
                            onClick={onClose}
                            className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-100 transition-colors"
                        >
                            Close
                        </button>
                        <button 
                            onClick={() => onClose('apply')} // Pass a signal that we want to apply
                            className="px-8 py-3 rounded-xl bg-[#FF7F50] text-white font-bold hover:bg-[#e64a19] transition-colors shadow-lg shadow-orange-500/20 flex items-center gap-2"
                        >
                            Apply for this Job <ArrowRight size={18} />
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default JobDetailsModal;
