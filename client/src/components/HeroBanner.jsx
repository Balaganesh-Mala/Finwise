import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Play, CheckCircle, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import BookDemoModal from './BookDemoModal';
import { useSettings } from '../context/SettingsContext';
import img01 from '../assets/01T.png';
import img02 from '../assets/02T.png';
import img03 from '../assets/03T.png';
import img04 from '../assets/04T.png';
import img05 from '../assets/05T.png';
import img06 from '../assets/06T.png';
import googleLogo from '../assets/googleLogo.png';


const HeroBanner = () => {
    const { getContactInfo } = useSettings();
    const phone = getContactInfo('phone') || '+919963624087';

    // Default hardcoded banners as fallback
    const defaultBanners = [
        { fileUrl: img01, title: "Alex Johnson", description: "Placed at Google", _id: 'd1' },
        { fileUrl: img02, title: "Sarah Smith", description: "Works as SDE-II", _id: 'd2' },
        { fileUrl: img03, title: "Michael Brown", description: "Data Scientist", _id: 'd3' },
        { fileUrl: img04, title: "Emily Davis", description: "Product Manager", _id: 'd4' },
        { fileUrl: img05, title: "James Wilson", description: "Full Stack Dev", _id: 'd5' }
    ];

    const [banners, setBanners] = useState(defaultBanners);
    const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/banners`);
                const allBanners = res.data;
                // Filter: Active AND Order 1-5 (Hero Section)
                const heroBanners = allBanners.filter(b => b.isActive && b.order >= 1 && b.order <= 5);

                if (heroBanners.length > 0) {
                    setBanners(heroBanners);
                }
            } catch (err) {
                console.error("Error fetching hero banners:", err);
            }
        };

        fetchBanners();
    }, []);

    const [slidesToShow, setSlidesToShow] = useState(3);

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            if (width < 768) {
                setSlidesToShow(1);
            } else if (width < 1280) { // adjusted breakpoint for better fit
                setSlidesToShow(2);
            } else {
                setSlidesToShow(3);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const settings = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: slidesToShow,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        arrows: false, // Match usage or keep false as per design
        centerMode: window.innerWidth < 768, // Add center mode for mobile for better preview
        centerPadding: window.innerWidth < 768 ? '40px' : '0px',
    };

    return (
        <section className="relative min-h-[90vh] flex items-center bg-gradient-to-br from-primary-100 via-white to-gray-50 overflow-hidden pt-[32%] pb-12 md:pt-[10%] mx-auto md:px-24 lg:px-24">

            {/* Light Grid Background */}
            <div className="absolute inset-0 pointer-events-none" style={{
                backgroundImage: `linear-gradient(rgba(8, 131, 149, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(8, 131, 149, 0.05) 1px, transparent 1px)`,
                backgroundSize: '50px 50px',
                maskImage: 'radial-gradient(circle at center, black 30%, transparent 80%)',
                WebkitMaskImage: 'radial-gradient(circle at center, black 30%, transparent 80%)'
            }}></div>

            {/* Background Blobs */}
            <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[400px] md:w-[800px] h-[400px] md:h-[800px] bg-primary-100/20 rounded-full blur-3xl opacity-50 md:opacity-100" />
            <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-accent-50 rounded-full blur-3xl opacity-50 md:opacity-100" />

            <div className="container mx-auto px-4 md:px-6 relative z-10 grid lg:grid-cols-2 gap-12 lg:gap-12 items-center">

                {/* Text Content (Left) */}
                <div className="max-w-2xl text-center lg:text-left mx-auto lg:mx-0 mr-[40px]">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-50 text-accent-700 text-xs md:text-sm font-semibold mb-6">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0d9488] opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#0d9488]"></span>
                            </span>
                            New Batch Starting Soon
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.1] mb-6">
                            Launch your Career in <br className="hidden md:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-[#E2D6FE] block md:inline mt-2 md:mt-0">
                                Core Finance
                            </span>
                        </h1>

                        <p className="text-base md:text-xl text-gray-600 mb-6 leading-relaxed max-w-lg mx-auto lg:mx-0">
                            Stop learning outdated theory. Get hands-on experience with real-world projects and mentorship from engineers at top companies.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-8">
                            <button
                                onClick={() => setIsDemoModalOpen(true)}
                                className="w-full sm:w-auto px-8 py-4 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all flex items-center justify-center gap-2 shadow-xl shadow-gray-200"
                            >
                                Book your Slot <ArrowRight size={20} />
                            </button>
                            <a
                                href={`tel:${phone}`}
                                className="w-full sm:w-auto px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                            >
                                <Phone size={20} className="text-gray-900" />
                                Call Now
                            </a>
                        </div>

                        {/* Trust Section */}
                        <div className="flex flex-col gap-4 border-t border-gray-100 pt-8 items-center lg:items-start">
                            <div className="flex items-center gap-2">
                                <div className="flex -space-x-2">
                                    {[img01, img02, img03, img04, img05, img06].map((img, index) => (
                                        <div key={index} className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-bold text-gray-500 overflow-hidden">
                                            <img src={img} alt={`User ${index + 1}`} className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                    <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-gray-600">
                                        2k+
                                    </div>
                                </div>
                                <div className="text-sm text-left">
                                    <div className="flex items-center gap-2 mb-1">
                                        <img
                                            src={googleLogo}
                                            alt="Google"
                                            className="w-18 h-4"
                                        />
                                        <span className="text-gray-900 font-bold">4.9/5</span>
                                        <div className="flex items-center text-yellow-400 text-xs">
                                            {[1, 2, 3, 4, 5].map(s => (
                                                <svg key={s} className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                                                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                                </svg>
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-gray-500 text-xs">Rated by Students</p>
                                </div>
                            </div>
                        </div>

                    </motion.div>
                </div>

                {/* Visual Content (Right) - Student Carousel */}
                <div className="relative h-full w-full min-h-[400px] md:min-h-[500px] flex items-center justify-center mt-8 lg:mt-0">
                    <div className="w-full max-w-sm md:max-w-lg lg:max-w-xl">
                        <Slider key={slidesToShow} {...settings}>
                            {banners.map((item) => (
                                <div key={item._id} className="px-2 pb-8 pt-4 cursor-grab active:cursor-grabbing">
                                    <div className="relative group overflow-hidden rounded-[12px] transition-all duration-300 h-[550px] md:h-[400px] flex flex-col bg-white  mx-auto max-w-[280px] md:max-w-full">

                                        {/* Top Content Area (approx 35%) - clean white bg */}
                                        <div className="relative h-[35%] p-4 md:p-6 flex flex-col justify-between z-20 bg-white">
                                            <div className="flex items-center justify-between w-full">
                                                <span className="inline-block px-1 py-1 bg-accent-50 text-accent-700 text-[8px] font-bold uppercase tracking-wider rounded-md border border-accent-200 mb-2">
                                                    Success Story
                                                </span>
                                            </div>

                                            <div className="">
                                                <p className="text-gray-500 text-[10px] font-medium line-clamp-3 md:line-clamp-4">
                                                    {item.description || "Placed at top firms"}
                                                </p>
                                                <p className="text-gray-900 text-[12px] font-bold truncate mt-1">Placed at:</p>
                                            </div>
                                        </div>

                                        {/* Bottom Image Area (approx 65%) - Vibrant Gradient Background */}
                                        <div className="relative h-[100%] md:h-[65%] w-full flex items-end justify-center z-10 bg-gradient-to-t from-primary-600 to-transparent overflow-hidden">

                                            {/* Title Overlay */}
                                            <div className="absolute bottom-4 left-0 right-0 px-4 md:px-6 z-20 text-start">
                                                <h3 className="text-[12px] md:text-sm font-bold text-white tracking-wide drop-shadow-lg leading-tight truncate">
                                                    {item.title || "Student Name"}
                                                </h3>
                                            </div>

                                            {/* Abstract decorative shape for interest */}
                                            <div className="absolute top-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 to-transparent"></div>

                                            <img
                                                src={item.fileUrl}
                                                alt={item.title || "Student Success"}
                                                className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                                            />

                                            {/* Bottom overlay for depth */}
                                            <div className="absolute bottom-0 inset-x-0 h-1/3 bg-gradient-to-t from-primary-900/60 to-transparent"></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </Slider>
                    </div>

                    {/* Decorative Background Elements behind carousel */}
                    <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[80%] bg-gradient-to-tr from-primary-200/20 to-accent-200/20 rounded-[3rem] rotate-6 blur-2xl hidden md:block"></div>
                </div>

            </div>

            <BookDemoModal isOpen={isDemoModalOpen} onClose={() => setIsDemoModalOpen(false)} />
        </section>
    );
};

export default HeroBanner;
