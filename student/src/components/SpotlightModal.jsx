import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Play, Image as ImageIcon, ExternalLink, Calendar } from 'lucide-react';

const SpotlightModal = () => {
    const [announcement, setAnnouncement] = useState(null);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const fetchAnnouncement = async () => {
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                const { data } = await axios.get(`${API_URL}/api/announcements/active`);
                
                if (data) {
                    const dismissedId = localStorage.getItem('dismissed_spotlight_id');
                    if (dismissedId !== data._id) {
                        setAnnouncement(data);
                        setTimeout(() => setIsOpen(true), 1500);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch spotlight announcement:", error);
            }
        };

        fetchAnnouncement();
    }, []);

    const handleClose = () => {
        setIsOpen(false);
        if (announcement) {
            localStorage.setItem('dismissed_spotlight_id', announcement._id);
        }
    };

    if (!announcement || !isOpen) return null;

    const getYoutubeId = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const youtubeId = announcement.youtubeUrl ? getYoutubeId(announcement.youtubeUrl) : null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none p-4 md:p-10">
            {/* Glass Backdrop */}
            <div 
                className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl animate-in fade-in duration-500 pointer-events-auto"
                onClick={handleClose}
            ></div>

            {/* Modal Container */}
            <div className="relative w-full max-w-4xl bg-white rounded-[2rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 border border-white/20 flex flex-col md:flex-row max-h-[85vh] pointer-events-auto">
                
                {/* Mobile Close Button (Hidden on MD) */}
                <button 
                    onClick={handleClose}
                    className="absolute top-4 right-4 z-[110] md:hidden p-2 bg-black/20 text-white rounded-full backdrop-blur-md"
                >
                    <X size={20} />
                </button>

                {/* Left: Media Area */}
                <div className="w-full md:w-[55%] lg:w-[60%] bg-slate-50 flex items-center justify-center relative bg-gradient-to-br from-slate-100 to-slate-200">
                    <div className="w-full h-full min-h-[250px] md:min-h-[400px] flex items-center justify-center">
                        {youtubeId ? (
                            <iframe 
                                className="w-full h-full aspect-video md:aspect-auto"
                                src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=0`}
                                title="YouTube video player" 
                                frameBorder="0" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowFullScreen
                            ></iframe>
                        ) : announcement.type === 'video' ? (
                            <video 
                                src={announcement.mediaUrl} 
                                className="w-full h-full object-contain" 
                                controls 
                                autoPlay 
                                muted={false}
                            />
                        ) : (
                            <img 
                                src={announcement.mediaUrl} 
                                alt={announcement.title} 
                                className="w-full h-full object-contain"
                            />
                        )}
                    </div>

                    {/* Badge */}
                    <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/50 text-white text-[10px] font-black px-3 py-1.5 rounded-full backdrop-blur-md uppercase tracking-widest">
                        {youtubeId || announcement.type === 'video' ? <Play size={10} fill="currentColor" /> : <ImageIcon size={10} />}
                        Spotlight
                    </div>
                </div>

                {/* Right: Content Area */}
                <div className="w-full md:w-[45%] lg:w-[40%] flex flex-col h-full overflow-hidden bg-white">
                    {/* Header */}
                    <div className="p-6 md:p-8 pb-4 flex justify-between items-start shrink-0">
                        <div className="flex-1">
                            <span className="text-indigo-600 font-black text-[10px] uppercase tracking-[0.2em] mb-2 block">System Announcement</span>
                            <h2 className="text-xl md:text-2xl font-black text-slate-900 leading-tight">
                                {announcement.title}
                            </h2>
                        </div>
                        <button 
                            onClick={handleClose}
                            className="hidden md:flex p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-900 rounded-full transition-all shrink-0 ml-4"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Body (Scrollable) */}
                    <div className="flex-1 overflow-y-auto px-6 md:px-8 py-2 custom-scrollbar">
                        <p className="text-slate-600 leading-relaxed text-sm md:text-base whitespace-pre-wrap">
                            {announcement.description}
                        </p>
                    </div>

                    {/* Footer / Buttons */}
                    <div className="p-6 md:p-8 pt-4 shrink-0 bg-gradient-to-t from-white via-white/95 to-transparent">
                        <div className="space-y-3">
                            {announcement.buttonLink && (
                                <a 
                                    href={announcement.buttonLink}
                                    target={announcement.buttonLink.startsWith('http') ? '_blank' : '_self'}
                                    rel="noopener noreferrer"
                                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-xl shadow-indigo-100 active:scale-95 uppercase tracking-wider"
                                >
                                    {announcement.buttonText || 'Learn More'}
                                    <ExternalLink size={16} />
                                </a>
                            )}
                            
                            <button 
                                onClick={handleClose}
                                className="w-full py-4 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-2xl font-bold text-sm transition-all active:scale-95"
                            >
                                Dismiss
                            </button>
                        </div>

                        {announcement.endDate && (
                            <div className="mt-4 flex items-center justify-center gap-1.5 text-[9px] text-slate-300 font-bold uppercase tracking-widest">
                                <Calendar size={10} />
                                Ends {new Date(announcement.endDate).toLocaleDateString()}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
            `}} />
        </div>
    );
};

export default SpotlightModal;
