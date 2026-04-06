import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Bot, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MockInterview = () => {
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
                            rotate: [0, 5, -5, 0]
                        }}
                        transition={{ 
                            repeat: Infinity, 
                            duration: 4,
                            ease: "easeInOut"
                        }}
                        className="w-full h-full bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-indigo-200 relative z-10"
                    >
                        <Bot size={48} strokeWidth={1.5} />
                    </motion.div>
                    
                    {/* Decorative Elements */}
                    <div className="absolute -top-2 -right-2 text-yellow-400 animate-pulse">
                        <Sparkles size={24} />
                    </div>
                    <div className="absolute -bottom-4 -left-4 w-full h-full bg-indigo-100 rounded-3xl -z-10 rotate-6 opacity-50"></div>
                </div>

                {/* Content */}
                <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">
                    AI Mock Interview
                </h1>
                
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-sm font-bold mb-6">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
                    </span>
                    Coming Soon
                </div>

                <p className="text-slate-500 text-lg mb-10 leading-relaxed">
                    We're building a state-of-the-art AI Interview Coach to help you master your career goals. Stay tuned for an immersive practice experience!
                </p>

                {/* Action Button */}
                <button
                    onClick={() => navigate('/')}
                    className="group flex items-center gap-2 mx-auto px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Dashboard
                </button>
            </motion.div>

            {/* Background Decorative Blobs */}
            <div className="fixed top-1/4 left-1/4 w-64 h-64 bg-indigo-400/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
            <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl -z-10 animate-pulse delay-700"></div>
        </div>
    );
};

export default MockInterview;
