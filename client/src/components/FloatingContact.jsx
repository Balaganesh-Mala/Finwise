import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Phone, Mail, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useSettings } from '../context/SettingsContext';

const FloatingContact = () => {
    const { getContactInfo } = useSettings();
    const [isOpen, setIsOpen] = useState(false);
    
    // Mini Carousel Logic
    const [currentImage, setCurrentImage] = useState(0);
    const [showHint, setShowHint] = useState(false);
    
    const images = [
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80", 
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80"
    ];

    useEffect(() => {
        if (isOpen) {
            const timer = setInterval(() => {
                setCurrentImage((prev) => (prev + 1) % images.length);
            }, 3000);
            return () => clearInterval(timer);
        }
    }, [isOpen]);

    // Sound and Hint Effect
    useEffect(() => {
        const timer = setTimeout(() => {
            // Using a more reliable sound source (Slack-like knock)
            const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
            audio.volume = 1.0; // Max volume
            
            // Try to play, handle browser autoplay policy
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.log("Audio autoplay blocked by browser policy:", error);
                    // Fallback: We can't force sound without interaction
                });
            }
            setShowHint(true);
        }, 5000); // Increased delay slightly to allow for initial interaction
        return () => clearTimeout(timer);
    }, []);

    const whatsappNumber = getContactInfo('whatsapp') || "1234567890";
    const phoneNumber = getContactInfo('phone') || "+1 (555) 123-4567";
    const emailAddress = getContactInfo('email') || "info@jobreadyskills.com";

    const contactOptions = [
        {
            icon: MessageSquare,
            label: "Chat on WhatsApp",
            sub: "Average reply: 2 mins",
            color: "text-green-600",
            bg: "bg-green-50",
            action: () => window.open(`https://wa.me/${whatsappNumber.replace(/\D/g, '')}`, "_blank")
        },
        {
            icon: Phone,
            label: "Call Us Now",
            sub: phoneNumber,
            color: "text-blue-600",
            bg: "bg-blue-50",
            action: () => window.open(`tel:${phoneNumber.replace(/\D/g, '')}`)
        },
        {
            icon: Mail,
            label: "Send an Email",
            sub: emailAddress,
            color: "text-orange-600",
            bg: "bg-orange-50",
            action: () => window.open(`mailto:${emailAddress}`)
        }
    ];

    return (
        <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-4">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="bg-white rounded-2xl shadow-2xl w-80 overflow-hidden border border-gray-100 mb-2"
                    >
                        {/* Top Carousel Area */}
                        <div className="h-40 relative bg-gray-100">
                            {images.map((img, idx) => (
                                <motion.img
                                    key={idx}
                                    src={img}
                                    alt="Support Team"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: idx === currentImage ? 1 : 0 }}
                                    transition={{ duration: 0.5 }}
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                            ))}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                                <div className="text-white">
                                    <p className="font-bold text-sm">We're here to help!</p>
                                    <p className="text-xs opacity-90">Talk to our career experts.</p>
                                </div>
                            </div>
                        </div>

                        {/* Contact Options */}
                        <div className="p-4 space-y-2">
                            {contactOptions.map((opt, idx) => {
                                const Icon = opt.icon;
                                return (
                                    <button
                                        key={idx}
                                        onClick={opt.action}
                                        className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-all group text-left"
                                    >
                                        <div className={`w-10 h-10 rounded-full ${opt.bg} ${opt.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                                            <Icon size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900 text-sm">{opt.label}</h4>
                                            <p className="text-xs text-gray-500">{opt.sub}</p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Notification Hint */}
            <AnimatePresence>
                {showHint && !isOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="absolute right-16 top-2 bg-white px-4 py-2 rounded-xl shadow-lg border border-gray-100 whitespace-nowrap flex items-center gap-2"
                    >
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                        <span className="text-gray-700 font-medium text-sm">Hi there! 👋 Need help?</span>
                        <button onClick={(e) => { e.stopPropagation(); setShowHint(false); }} className="text-gray-400 hover:text-gray-600 ml-1">
                            <X size={14} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Toggle Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-colors ${
                    isOpen ? 'bg-gray-800 text-white' : 'bg-indigo-600 text-white'
                }`}
            >
                {isOpen ? <X size={24} /> : <MessageCircle size={28} />}
            </motion.button>
        </div>
    );
};

export default FloatingContact;
