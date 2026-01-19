import React from 'react';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import { Star, Quote, Code, Palette, Database, TrendingUp } from 'lucide-react';

const ReviewsSection = () => {
    // 1st Row Data (Tech/Dev focus)
    const reviewsRow1 = [
        {
            id: 1,
            name: "Sarah Johnson",
            role: "SDE II @ Google",
            review: "The Full Stack course was a game-changer. The depth of backend knowledge I gained helped me crack my interviews.",
            rating: 5,
            icon: Code,
            color: "bg-blue-100 text-blue-600"
        },
        {
            id: 2,
            name: "David Wilson",
            role: "Frontend Dev @ Netflix",
            review: "React & Node.js ecosystem concepts were explained perfectly. Building real projects made all the difference.",
            rating: 5,
            icon: Code,
            color: "bg-indigo-100 text-indigo-600"
        },
        {
            id: 3,
            name: "Priya Patel",
            role: "Data Analyst @ Microsoft",
            review: "SQL and Python modules were fantastic. I pivoted from a non-tech background easily.",
            rating: 5,
            icon: Database,
            color: "bg-green-100 text-green-600"
        },
        {
            id: 4,
            name: "James Rodriguez",
            role: "Mobile Dev @ Uber",
            review: "Flutter roadmap was precise. Published my first app within 2 months of joining.",
            rating: 4,
            icon: Code,
            color: "bg-orange-100 text-orange-600"
        }
    ];

    // 2nd Row Data (Design/Management focus)
    const reviewsRow2 = [
        {
            id: 5,
            name: "Emily Davis",
            role: "UX Designer @ Airbnb",
            review: "JobReady's design critique sessions were brutal but necessary. They shaped my design thinking.",
            rating: 5,
            icon: Palette,
            color: "bg-pink-100 text-pink-600"
        },
         {
            id: 6,
            name: "Michael Chen",
            role: "Product Manager @ Amazon",
            review: "The logic building and system design aspects helped me transition into Product Management seamlessly.",
            rating: 5,
            icon: TrendingUp,
            color: "bg-yellow-100 text-yellow-600"
        },
        {
            id: 7,
            name: "Anita Roy",
            role: "Marketing Head @ Zomato",
            review: "Digital marketing strategies taught here are current and very effective. ROI focused learning.",
            rating: 5,
            icon: TrendingUp,
            color: "bg-red-100 text-red-600"
        },
        {
            id: 8,
            name: "Karthik S",
            role: "Full Stack @ Swiggy",
            review: "Best investment for my career. The placement assistance team really works hard for you.",
            rating: 5,
            icon: Code,
            color: "bg-indigo-100 text-indigo-600"
        }
    ];

    // Base settings for the "Marquee" effect
    const baseSettings = {
        dots: false,
        infinite: true,
        slidesToShow: 3,
        slidesToScroll: 1,
        autoplay: true,
        speed: 8000,           // Slow speed for linear movement
        autoplaySpeed: 0,      // Continuous
        cssEase: "linear",     // Smooth continuous motion
        pauseOnHover: true,
        arrows: false,
        className: "center",
        responsive: [
            {
                breakpoint: 1024,
                settings: { slidesToShow: 2 }
            },
            {
                breakpoint: 640,
                settings: { slidesToShow: 1 }
            }
        ]
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
                        
                        <p className="text-gray-600 text-sm leading-relaxed italic mb-4">
                            "{data.review}"
                        </p>
                    </div>

                    <div className="flex items-center gap-3 border-t border-gray-50 pt-4 mt-auto">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-500 font-bold text-xs">
                            {data.name.charAt(0)}
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 text-sm">{data.name}</h4>
                            <p className="text-xs text-indigo-600 font-medium">{data.role}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <section className="py-24 bg-gray-50 overflow-hidden">
            <div className="container mx-auto px-6 mb-16 text-center">
                <span className="inline-block py-1 px-3 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold tracking-widest uppercase mb-4">
                    Wall of Love
                </span>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                    Trusted by <span className="text-indigo-600">Thousands</span>
                </h2>
                <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                    Join the community of developers, designers, and managers who have transformed their careers with us.
                </p>
            </div>

            <div className="space-y-8 container ">
                {/* Row 1 - Left Loop */}
                <div className="cursor-grab active:cursor-grabbing">
                    <Slider {...settingsRow1}>
                        {reviewsRow1.map(review => (
                            <ReviewCard key={review.id} data={review} />
                        ))}
                    </Slider>
                </div>

                {/* Row 2 - Right Loop */}
                <div className="cursor-grab active:cursor-grabbing" dir="rtl">
                    <Slider {...settingsRow2}>
                         {reviewsRow2.map(review => (
                            <div key={review.id} dir="ltr"> {/* Reset direction for text readability inside card */}
                                <ReviewCard data={review} />
                            </div>
                        ))}
                    </Slider>
                </div>
            </div>
        </section>
    );
};

export default ReviewsSection;
