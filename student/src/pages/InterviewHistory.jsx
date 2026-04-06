import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Bot, ArrowLeft, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const InterviewHistory = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full"
            >
                {/* Icon Container */}
                <div className="relative mb-8 mx-auto w-24 h-24">
                    <motion.div
                        animate={{ 
                            scale: [1, 1.1, 1],
                            rotate: [0, -5, 5, 0]
                        }}
                        transition={{ 
                            repeat: Infinity, 
                            duration: 5,
                            ease: "easeInOut"
                        }}
                        className="w-full h-full bg-slate-100 rounded-3xl flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-300 relative z-10"
                    >
                        <History size={48} strokeWidth={1.5} />
                    </motion.div>
                    
                    {/* Decorative Elements */}
                    <div className="absolute -top-2 -right-2 text-indigo-500 animate-bounce">
                        <Clock size={24} />
                    </div>
                </div>

                {/* Content */}
                <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">
                    Interview History
                </h1>
                
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-50 text-slate-600 rounded-full text-sm font-bold mb-6">
                    Coming Soon
                </div>

                <p className="text-slate-500 text-lg mb-10 leading-relaxed">
                    Once our AI Interview Coach is live, this section will host your past performances, detailed transcripts, and personalized feedback reports.
                </p>

                {/* Action Button */}
                <button
                    onClick={() => navigate('/')}
                    className="group flex items-center gap-2 mx-auto px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Dashboard
                </button>
            </motion.div>

            {/* Background Decorative Blobs */}
            <div className="fixed top-1/4 left-1/4 w-64 h-64 bg-slate-400/5 rounded-full blur-3xl -z-10 animate-pulse"></div>
            <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-indigo-400/5 rounded-full blur-3xl -z-10 animate-pulse delay-700"></div>
        </div>
    );
};

export default InterviewHistory;
