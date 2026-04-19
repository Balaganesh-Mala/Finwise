import React, { useState, useEffect, useRef } from 'react';
import { Shield, AlertTriangle, Eye, Lock, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ProtectedViewer = ({ type, url, title, studentInfo }) => {
    const [isLoading, setIsLoading] = useState(true);
    const viewerRef = useRef(null);

    useEffect(() => {
        // Reset loading on URL change
        setIsLoading(true);
        // Safety fallback: Hide loader after 5 seconds if onLoad doesn't fire
        const timer = setTimeout(() => setIsLoading(false), 5000);
        return () => clearTimeout(timer);
    }, [url]);

    useEffect(() => {
        const handleContextMenu = (e) => e.preventDefault();
        const handlePrint = (e) => {
            if (e.ctrlKey && (e.key === 'p' || e.keyCode === 80)) {
                e.preventDefault();
                alert("Printing is disabled for protected materials.");
            }
        };
        const handleSave = (e) => {
            if (e.ctrlKey && (e.key === 's' || e.keyCode === 83)) {
                e.preventDefault();
                alert("Saving is disabled for protected materials.");
            }
        };
        const handleCopy = (e) => {
            if (e.ctrlKey && (e.key === 'c' || e.keyCode === 67)) {
                e.preventDefault();
                alert("Copying is disabled for protected materials.");
            }
        };

        // Advanced shortcut blocking (Ctrl+U, F12, etc. can still be used but we deter them)
        const handleShortcuts = (e) => {
            if (e.ctrlKey && (e.keyCode === 85 || e.keyCode === 83 || e.keyCode === 80 || e.keyCode === 67)) {
                e.preventDefault();
                return false;
            }
        };

        window.addEventListener('contextmenu', handleContextMenu);
        window.addEventListener('keydown', handlePrint);
        window.addEventListener('keydown', handleSave);
        window.addEventListener('keydown', handleCopy);
        window.addEventListener('keydown', handleShortcuts);

        return () => {
            window.removeEventListener('contextmenu', handleContextMenu);
            window.removeEventListener('keydown', handlePrint);
            window.removeEventListener('keydown', handleSave);
            window.removeEventListener('keydown', handleCopy);
            window.removeEventListener('keydown', handleShortcuts);
        };
    }, []);


    return (
        <div className="relative w-full h-full bg-white overflow-hidden group">
            {/* Branded Loading Overlay */}
            <AnimatePresence>
                {isLoading && (
                    <motion.div 
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-[110] bg-white flex flex-col items-center justify-center"
                    >
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Shield size={20} className="text-indigo-600 animate-pulse" />
                            </div>
                        </div>
                        <div className="mt-6 flex flex-col items-center">
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-[0.2em] animate-pulse">Finwise Secure</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-2">Preparing protected session...</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Personalized Branded Watermark (Simplified to 3 instances, Reduced Size) */}
            <div className="absolute inset-0 pointer-events-none select-none z-[90] overflow-hidden opacity-[0.05] flex flex-col justify-around items-center py-20">
                {[...Array(3)].map((_, i) => (
                    <div 
                        key={i} 
                        className="text-slate-900 font-black text-lg md:text-xl -rotate-12 whitespace-nowrap"
                    >
                        Finwise career solutions
                    </div>
                ))}
            </div>

            {/* Floating Subtle Student Watermark (Moved to corner) */}
            <div className="absolute inset-0 pointer-events-none z-[95] overflow-hidden">
                <div className="animate-pulse-slow absolute bottom-12 right-12 opacity-[0.1] text-[10px] font-black text-slate-800 uppercase tracking-widest bg-white/50 px-3 py-1 rounded-full border border-slate-200">
                    ID: {studentInfo?.regNo || studentInfo?._id?.substring(0,8)} • {studentInfo?.name}
                </div>
            </div>

            {/* Content Container */}
            <div className="w-full h-full select-none" onContextMenu={(e) => e.preventDefault()}>
                {type === 'video' ? (
                    <div className="w-full h-full bg-black flex items-center justify-center">
                        {url.includes('youtube.com') || url.includes('youtu.be') ? (
                            <iframe
                                width="100%"
                                height="100%"
                                src={`${url.replace('watch?v=', 'embed/')}?rel=0&modestbranding=1&controls=1&showinfo=0`}
                                title={title}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="pointer-events-auto"
                                onLoad={() => setIsLoading(false)}
                            ></iframe>
                        ) : (
                            <video 
                                src={url} 
                                controls 
                                controlsList="nodownload" 
                                className="w-full h-full object-contain"
                                onLoadedData={() => setIsLoading(false)}
                            />
                        )}
                    </div>
                ) : (type === 'link' || (type === 'document' && url.includes('http') && !url.includes('cloudinary'))) ? (
                    <div className="w-full h-full bg-white relative flex flex-col overflow-hidden">
                        {(url.includes('docs.google.com') || url.includes('drive.google.com')) ? (
                            <div className="w-full h-full bg-white rounded-3xl overflow-y-auto border border-slate-200 shadow-inner select-none no-scrollbar"
                                onContextMenu={(e) => e.preventDefault()}
                            >
                                <div className="pointer-events-none w-full">
                                    <iframe
                                        src={(() => {
                                            try {
                                                let embedUrl = url;
                                                if (embedUrl.includes('/edit')) embedUrl = embedUrl.split('/edit')[0] + '/preview';
                                                else if (embedUrl.includes('/view')) embedUrl = embedUrl.split('/view')[0] + '/preview';
                                                else if (!embedUrl.includes('/preview')) {
                                                    embedUrl = embedUrl.endsWith('/') ? embedUrl + 'preview' : embedUrl + '/preview';
                                                }
                                                return embedUrl;
                                            } catch (e) { return url; }
                                        })()}
                                        className="w-full h-[1500px] border-none bg-white"
                                        title={title}
                                        loading="lazy"
                                        onLoad={() => setIsLoading(false)}
                                    ></iframe>
                                </div>
                            </div>
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-white" onLoad={() => setIsLoading(false)}>
                                <div className="p-6 bg-indigo-50 rounded-[2.5rem] mb-6 text-indigo-600 shadow-inner">
                                    <Eye size={48} />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-800 mb-2">{title}</h2>
                                <p className="text-slate-500 max-w-md mb-8 font-medium">This is a protected external resource. Click below to view it in a secure session.</p>
                                <a 
                                    href={url} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-slate-900 transition-all shadow-xl shadow-indigo-100 flex items-center gap-3"
                                >
                                    Open Protected Link
                                    <Shield size={18} />
                                </a>
                                <p className="mt-8 text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                                     <Lock size={12} /> External permissions apply
                                </p>
                            </div>
                        )}
                    </div>
                ) : (
                    /* PDF / Document Viewer */
                    <object 
                        data={`${url}#toolbar=0&navpanes=0&scrollbar=0`}
                        type="application/pdf"
                        className="w-full h-full"
                    >
                        <div className="w-full h-full flex flex-col items-center justify-center bg-white p-8">
                             <AlertTriangle size={48} className="text-amber-500 mb-4" />
                             <p className="text-slate-700 font-bold">Unable to render preview directly.</p>
                             <a href={url} target="_blank" rel="noreferrer" className="mt-4 text-indigo-600 font-bold underline">Open Document Safely</a>
                        </div>
                    </object>
                )}
            </div>

            <style>{`
                @keyframes pulse-slow {
                    0%, 100% { opacity: 0.08; transform: translate(0, 0); }
                    50% { opacity: 0.15; transform: translate(-5px, -5px); }
                }
                .animate-pulse-slow {
                    animation: pulse-slow 5s infinite ease-in-out;
                }
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                @media print {
                    body { display: none !important; }
                    .no-print { display: none !important; }
                }
            `}</style>
        </div>
    );
};

export default ProtectedViewer;
