import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, Zap, Trophy, TrendingUp, Sparkles, Megaphone, X, Gift, Check } from 'lucide-react';

const RewardNotice = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="md:relative md:mb-8 md:mt-0 mt-4 h-auto">
            <AnimatePresence mode="wait">
                {!isOpen ? (
                    /* Pulsing Blinking Icon Status - Responsive Position */
                    <motion.button
                        key="icon"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        onClick={() => setIsOpen(true)}
                        className="group lg:relative fixed bottom-28 right-4 lg:bottom-0 lg:right-0 z-[45] flex items-center gap-3 bg-white border border-indigo-100 px-4 py-3 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] hover:shadow-indigo-500/20 transition-all active:scale-95"
                    >
                        {/* Blinking Indicator */}
                        <div className="flex h-3 w-3 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                             <div className="p-1.5 bg-amber-50 text-amber-500 rounded-lg group-hover:rotate-12 transition-transform">
                                <Sparkles size={18} fill="currentColor" fillOpacity={0.2} />
                             </div>
                             <div className="text-left">
                                <span className="block text-[10px] font-black text-rose-500 uppercase tracking-widest leading-none mb-1">New Update</span>
                                <span className="block text-sm font-bold text-slate-700">Check Your New Rewards</span>
                             </div>
                        </div>

                        {/* Hover Effect Glow */}
                        <div className="absolute inset-0 bg-indigo-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </motion.button>
                ) : (
                    /* Expanded Full Notice - Responsive Modal */
                    <motion.div 
                        key="content"
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="lg:relative fixed inset-x-4 bottom-24 lg:inset-auto lg:bottom-0 z-[50] overflow-hidden bg-white border border-slate-200 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] md:shadow-xl md:shadow-slate-200/50"
                    >
                        {/* Close Button */}
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsOpen(false);
                            }}
                            className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all z-20"
                        >
                            <X size={18} />
                        </button>

                        <div className="p-6 md:p-10">
                            <div className="space-y-6">
                                {/* Header */}
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-widest">
                                        <Sparkles size={14} className="text-amber-500" /> New Reward Structure
                                    </div>
                                    <h3 className="text-xl font-extrabold text-slate-900">More Achievements, Bigger Rewards!</h3>
                                    <p className="text-sm text-slate-500 font-medium leading-relaxed">
                                        Our new algorithm better recognizes your hard work and daily consistency.
                                    </p>
                                </div>

                                {/* Content Grid - Simplified List */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
                                    {/* Attendance */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-slate-900 font-bold">
                                            <Zap size={16} className="text-amber-500" /> Daily Attendance
                                        </div>
                                        <div className="pl-6 space-y-1">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-slate-600 font-medium">QR Presence Reward</span>
                                                <span className="font-bold text-indigo-600">+10 Coins</span>
                                            </div>
                                            <p className="text-[10px] text-slate-400 font-bold leading-relaxed">*Added to your existing 50 Points reward.</p>
                                        </div>
                                    </div>

                                    {/* Interviews */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-slate-900 font-bold">
                                            <Trophy size={16} className="text-indigo-600" /> Mock Interviews
                                        </div>
                                        <div className="pl-6 grid grid-cols-1 gap-1.5">
                                            {[
                                                { label: 'Elite (8+)', val: '50🪙', color: 'text-indigo-600' },
                                                { label: 'Good (6+)', val: '30🪙', color: 'text-indigo-600' },
                                                { label: 'Bonus Improv.', val: '+25🪙', color: 'text-emerald-600' },
                                                { label: 'First Time', val: '+100🪙', color: 'text-amber-600' }
                                            ].map((item, i) => (
                                                <div key={i} className="flex justify-between items-center text-sm">
                                                    <span className="text-slate-600 font-medium">{item.label}</span>
                                                    <span className={`font-bold ${item.color}`}>{item.val}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                                    <Check size={12} className="text-emerald-500" /> Wallet Transaction Synced
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default RewardNotice;
