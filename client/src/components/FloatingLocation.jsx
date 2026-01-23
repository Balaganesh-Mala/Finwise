import React from 'react';
import { motion } from 'framer-motion';

const FloatingLocation = () => {

    // Fallback to a default
    const mapUrl = import.meta.env.VITE_MAP_URL || "https://maps.google.com";

    if (!mapUrl) return null;

    return (
        <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-48 right-8 z-50 group origin-center"
        >
            <div className="relative">

                {/* Button Container */}
                <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    animate={{ y: [0, -8, 0] }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="relative flex items-center justify-center w-14 h-14 bg-white rounded-full shadow-lg shadow-gray-300 border border-gray-100 overflow-hidden p-2"
                >
                    {/* Tooltip on Hover */}
                    <div className="absolute right-full mr-4 px-3 py-1 bg-white text-gray-800 text-sm font-semibold rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        Locate Us
                        <div className="absolute top-1/2 -right-1 transform -translate-y-1/2 w-2 h-2 bg-white rotate-45"></div>
                    </div>

                    {/* Accurate Google Maps Icon SVG */}
                    <svg
                        version="1.1"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 48 48"
                        className="w-full h-full"
                    >
                        <path fill="#34A853" d="M26 10c-5.5 0-10 4.5-10 10 0 1.5.3 2.9.9 4.2-.2.1-.3.2-.5.3-3.1 1.6-4.4 5.3-2.8 8.4l2 3.9c1.6 3.1 5.3 4.4 8.4 2.8 3.1-1.6 4.4-5.3 2.8-8.4-.5-1-1.3-1.8-2.2-2.3 2.5-1.5 4.3-4.1 4.3-7.2 0-2.4-1.1-4.6-2.9-6.3V10z" />
                        <path fill="#4285F4" d="M19 14.5c0-1.8.8-3.4 2.1-4.5V10c-5.5 0-10 4.5-10 10 0 2.2.7 4.2 1.9 5.9l8.1-9.4c-1.3-.6-2.1-1.6-2.1-2z" />
                        <path fill="#FBBC05" d="M21.1 10v.1c1.8-.7 3.8-.7 5.7.1l-6.4 7.4c-.6.7-.6 1.7.1 2.3l4.7 4.1c.3.3.7.4 1.1.4.4 0 .8-.1 1.1-.4 1-.9 1.3-2.4.6-3.6l-5.6-10.4z" />
                        <path fill="#EA4335" d="M19 25.9c.3.1.6 0 .8-.2l4.7-4.1-6.4-7.4C17.2 15.2 16 17.5 16 20c0 2.3 1.1 4.4 2.9 5.8.1 0 .1.1.1.1z" />

                        {/* Let's try an even simpler standard pin shape if the above is still complex */}
                        <g transform="translate(0,0)" style={{ display: 'none' }}>
                            {/* This is just a backup mechanism in comments if needed */}
                        </g>

                        {/* Standard Google Maps Pin Vector - Highly Accurate */}
                        <path fill="#4285F4" d="M18.5 25.5l14.9-12.4c-2.1-2-4.9-3.2-8-3.2-6.2 0-11.2 5-11.2 11.2 0 2.2.6 4.3 1.7 6.1l2.6-1.7z" style={{ display: 'none' }} /> {/* Hiding the previous broken one */}

                        {/* New Single-Path-per-Color Clean SVG */}
                        <path fill="#EA4335" d="M24 4C14.1 4 6 12 6 21.7c0 2.6.5 5 1.5 7.3l16.5 19L40.5 29c1-2.2 1.5-4.7 1.5-7.3C42 12 33.9 4 24 4z" />
                        <circle fill="#fff" cx="24" cy="22" r="7" />
                        {/* Standard Red Pin is safer if complex vector fails. But user wants "Google Map Logo". */}
                    </svg>

                    {/* Let's use an Image instead of SVG path if SVG keeps breaking. It's safer. */}
                    <div className="absolute inset-0 p-2 bg-white rounded-full">
                        <img
                            src="https://upload.wikimedia.org/wikipedia/commons/a/aa/Google_Maps_icon_%282020%29.svg"
                            alt="Google Maps"
                            className="w-full h-full object-contain pointer-events-none"
                        />
                    </div>

                </motion.div>
            </div>
        </a>
    );
};

export default FloatingLocation;
