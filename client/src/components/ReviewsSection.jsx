import React, { useState, useEffect } from 'react';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Star, TrendingUp, PieChart, BarChart, CircleDollarSign, Briefcase, Calculator, LineChart } from 'lucide-react';
import axios from 'axios';

// Default images if needed, though we expect URLs from backend or we can use these as fallbacks
import Img01 from '../assets/01T.png';
import Img02 from '../assets/02T.png';
import Img04 from '../assets/04T.png';
import Img06 from '../assets/06T.png';

const ReviewsSection = () => {
    // Manual responsive logic
    const [slidesToShow, setSlidesToShow] = useState(3);
    const [reviews, setReviews] = useState({ row1: [], row2: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            if (width < 768) {
                setSlidesToShow(1);
            } else if (width < 1024) {
                setSlidesToShow(2);
            } else {
                setSlidesToShow(3);
            }
        };

        handleResize(); // Initial
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/reviews?isApproved=true`);
                const allReviews = res.data.data;

                // Process reviews to add UI specific props (icon, color, image fallback)
                const processedReviews = allReviews.map((review, index) => {
                    // Cyclic assignment of metadata for visual variety
                    const meta = getReviewMetadata(index);
                    return {
                        id: review._id,
                        name: review.studentName,
                        role: review.role,
                        review: review.reviewText,
                        rating: review.rating,
                        icon: meta.icon,
                        color: meta.color,
                        image: review.studentImage && review.studentImage !== 'no-photo.jpg' ? review.studentImage : meta.image
                    };
                });

                // Split into two rows
                const midpoint = Math.ceil(processedReviews.length / 2);
                setReviews({
                    row1: processedReviews.slice(0, midpoint),
                    row2: processedReviews.slice(midpoint)
                });
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch reviews", err);
                setLoading(false);
            }
        };

        fetchReviews();
    }, []);

    // Helper to get consistent random-like UI data
    const getReviewMetadata = (index) => {
        const icons = [TrendingUp, CircleDollarSign, PieChart, BarChart, Briefcase, Calculator, LineChart];
        const colors = [
            "bg-blue-100 text-blue-600",
            "bg-indigo-100 text-indigo-600",
            "bg-green-100 text-green-600",
            "bg-orange-100 text-orange-600",
            "bg-primary-100 text-primary-600",
            "bg-accent-100 text-accent-600",
            "bg-primary-50 text-primary-600"
        ];
        const images = [Img01, Img02, Img04, Img06];

        return {
            icon: icons[index % icons.length],
            color: colors[index % colors.length],
            image: images[index % images.length]
        };
    };

    // Base settings for the "Marquee" effect
    const baseSettings = {
        dots: false,
        infinite: true,
        slidesToShow: slidesToShow, // Dynamic
        slidesToScroll: 1,
        mobileFirst: false, // We control logic manually
        autoplay: true,
        speed: 8000,           // Slow speed for linear movement
        autoplaySpeed: 0,      // Continuous
        cssEase: "linear",     // Smooth continuous motion
        pauseOnHover: true,
        arrows: false,
        className: "center",
        // No responsive array
    };

    // Row 1: Left to Right (visually items move left)
    const settingsRow1 = {
        ...baseSettings,
        rtl: false
    };

    // Row 2: Right to Left (visually items move right)
    const settingsRow2 = {
        ...baseSettings,
        rtl: true // Reverses direction
    };

    const ReviewCard = ({ data }) => {
        const Icon = data.icon;
        return (
            <div className="px-4 py-4">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow duration-300 h-full min-h-[220px] flex flex-col justify-between mx-2">

                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl ${data.color}`}>
                                <Icon size={20} />
                            </div>
                            <div className="flex gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        size={14}
                                        fill={i < data.rating ? "#FBBF24" : "none"}
                                        className={i < data.rating ? "text-yellow-400" : "text-gray-200"}
                                    />
                                ))}
                            </div>
                        </div>

                        <p className="text-gray-600 text-sm leading-relaxed italic mb-4 line-clamp-5">
                            "{data.review}"
                        </p>
                    </div>

                    <div className="flex items-center gap-3 border-t border-gray-50 pt-4 mt-auto">
                        <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                            <img
                                src={data.image}
                                alt={data.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 text-sm">{data.name}</h4>
                            <p className="text-xs text-primary-600 font-medium">{data.role}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return <div className="py-20 text-center text-gray-400">Loading reviews...</div>;
    }

    if (reviews.row1.length === 0 && reviews.row2.length === 0) {
        return null; // Or show a default message
    }

    return (
        <section className="py-8 bg-gray-50 overflow-hidden">
            <div className="container mx-auto px-6 mb-16 text-center">
                <span className="inline-block py-1 px-3 rounded-full bg-primary-100 text-primary-600 text-xs font-bold tracking-widest uppercase mb-4">
                    Wall of Love
                </span>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                    Trusted by <span className="text-primary-600">Thousands</span>
                </h2>
                <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                    Join the community of developers, designers, and managers who have transformed their careers with us.
                </p>
            </div>

            <div className="space-y-8 container mx-auto">
                {/* Row 1 - Left Loop */}
                {reviews.row1.length > 0 && (
                    <div className="cursor-grab active:cursor-grabbing">
                        <Slider key={`row1-${slidesToShow}`} {...settingsRow1}>
                            {reviews.row1.map(review => (
                                <ReviewCard key={review.id} data={review} />
                            ))}
                        </Slider>
                    </div>
                )}

                {/* Row 2 - Right Loop */}
                {reviews.row2.length > 0 && (
                    <div className="cursor-grab active:cursor-grabbing" dir="rtl">
                        <Slider key={`row2-${slidesToShow}`} {...settingsRow2}>
                            {reviews.row2.map(review => (
                                <div key={review.id} dir="ltr"> {/* Reset direction for text readability inside card */}
                                    <ReviewCard data={review} />
                                </div>
                            ))}
                        </Slider>
                    </div>
                )}
            </div>
        </section>
    );
};

export default ReviewsSection;
