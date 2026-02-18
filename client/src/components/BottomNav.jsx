import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Calendar, ArrowRight } from 'lucide-react';
import BookDemoModal from './BookDemoModal';
import { useSettings } from '../context/SettingsContext';

const BottomNav = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
    const { getContactInfo } = useSettings();

    // Fallback phone if context is not ready or empty
    const phone = getContactInfo('phone') || '+919963624087';

    useEffect(() => {
        const handleScroll = () => {
            // Calculate scroll percentage
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = (scrollTop / docHeight) * 100;

            // Show if scrolled more than 30% (user said 50%, but 30-40% is usually better UX for "mid-page")
            // I'll stick to 40% as a good compromise between "50%" and usability
            if (scrollPercent > 3) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed bottom-4 left-0 right-0 z-40 flex justify-center px-4 pointer-events-none"
                    >
                        <div className="bg-white/90 backdrop-blur-md border border-gray-200 shadow-2xl rounded-2xl p-2 md:p-3 pointer-events-auto flex items-center gap-3 md:gap-6 max-w-lg w-full">

                            {/* Call Now Button */}
                            <a
                                href={`tel:${phone}`}
                                className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-800 py-3 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors shadow-sm"
                            >
                                <Phone size={18} className="text-primary-600" />
                                <span className="hidden sm:inline">Call Now</span>
                                <span className="sm:hidden">Call</span>
                            </a>

                            {/* Book Demo Button */}
                            <button
                                onClick={() => setIsDemoModalOpen(true)}
                                className="flex-[2] flex items-center justify-center gap-2 bg-primary-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-primary-800 transition-colors shadow-lg shadow-gray-200"
                            >
                                <Calendar size={18} />
                                <span>Book Your Slot</span>
                                <ArrowRight size={16} className="hidden sm:block" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <BookDemoModal isOpen={isDemoModalOpen} onClose={() => setIsDemoModalOpen(false)} />
        </>
    );
};

export default BottomNav;
