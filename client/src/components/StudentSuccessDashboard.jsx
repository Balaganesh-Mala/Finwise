import React from 'react';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    BarChart2,
    Trophy,
    Video,
    Briefcase,
    Award,
    BookOpen,
    FileText,
    Receipt,
    ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Import Images
import PersonalDashboardImg from '../assets/Personal Dashboard.png';
import PerformanceReportsImg from '../assets/Performance Reports.png';
import BatchRankingImg from '../assets/Batch Ranking.png';
import AIMockInterviewsImg from '../assets/AI Mock Interviews.png';
import JobPortalImg from '../assets/Exclusive Job Portal (1).png';
import CertificatesImg from '../assets/Certificates.png';
import StudyMaterialsImg from '../assets/Study Materials.png';
import AssignmentsTestsImg from '../assets/Assignments & Tests.png';
import FeeInvoiceImg from '../assets/Fee & Invoice History.png';

const StudentSuccessDashboard = () => {
    const features = [
        {
            icon: LayoutDashboard,
            image: PersonalDashboardImg,
            title: "Personal Dashboard",
            desc: "Your central hub for course progress, upcoming classes, and quick actions."
        },
        {
            icon: BarChart2,
            image: PerformanceReportsImg,
            title: "Performance Reports",
            desc: "Weekly detailed insights into your learning curve and assessment scores."
        },
        {
            icon: Trophy,
            image: BatchRankingImg,
            title: "Batch Ranking",
            desc: "Healthy competition with peers to keep you motivated and on top."
        },
        {
            icon: Video,
            image: AIMockInterviewsImg,
            title: "AI Mock Interviews",
            desc: "Practice with our AI interviewer to perfect your technical answers."
        },
        {
            icon: Briefcase,
            image: JobPortalImg,
            title: "Exclusive Job Portal",
            desc: "Direct access to hiring partners and premium job listings."
        },
        {
            icon: Award,
            image: CertificatesImg,
            title: "Certificates",
            desc: "Showcase your achievements with verifiable digital certificates."
        },
        {
            icon: BookOpen,
            image: StudyMaterialsImg,
            title: "Study Materials",
            desc: "Curated resources, recorded lectures, and interview cheat sheets."
        },
        {
            icon: FileText,
            image: AssignmentsTestsImg,
            title: "Assignments & Tests",
            desc: "Hands-on coding challenges and quizzes to reinforce learning."
        },
        {
            icon: Receipt,
            image: FeeInvoiceImg,
            title: "Fee & Invoice History",
            desc: "Transparent access to all your payment records and invoices."
        }
    ];

    // Duplicate logic for seamless loop
    const loopedFeatures = [...features, ...features];

    return (
        <section className="py-24 bg-white relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-[#FF7F50] rounded-full mix-blend-multiply filter blur-[120px] opacity-[0.05]"></div>
                <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-indigo-500 rounded-full mix-blend-multiply filter blur-[120px] opacity-[0.05]"></div>
            </div>

            <div className="container-fluid relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16 px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <h2 className="text-sm font-bold tracking-widest text-[#FF7F50] uppercase mb-3">
                            Student Features
                        </h2>
                        <h3 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
                            Your <span className="text-[#FF7F50]">Success Dashboard</span>
                        </h3>
                        <p className="text-lg text-gray-600 leading-relaxed">
                            Everything you need to master your skills and land your dream job, all in one place.
                        </p>
                    </motion.div>
                </div>

                {/* Infinite Carousel Container */}
                <div className="flex overflow-hidden py-8 mask-gradient relative">
                    <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-20 pointer-events-none md:block hidden" />
                    <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-20 pointer-events-none md:block hidden" />

                    <motion.div
                        className="flex gap-8"
                        animate={{ x: "-50%" }}
                        transition={{
                            ease: "linear",
                            duration: 40, // Adjust speed here
                            repeat: Infinity
                        }}
                        style={{ width: "max-content" }}
                    >
                        {loopedFeatures.map((feature, idx) => (
                            <div
                                key={idx}
                                className="w-[350px] md:w-[400px] flex-shrink-0 group p-6 rounded-3xl bg-gray-50 hover:bg-white border border-gray-100 hover:border-[#FF7F50]/30 hover:shadow-2xl transition-all duration-300 flex flex-col h-full"
                            >
                                {/* Image Container */}
                                <div className="mb-6 rounded-2xl overflow-hidden shadow-sm border border-gray-100 group-hover:shadow-md transition-shadow duration-300 bg-white h-56 flex items-center justify-center p-4">
                                    <img
                                        src={feature.image}
                                        alt={feature.title}
                                        className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-500"
                                    />
                                </div>

                                <div className="flex items-center gap-4 mb-3">
                                    <div className="p-2 bg-[#FF7F50]/10 rounded-lg text-[#FF7F50] group-hover:bg-[#FF7F50] group-hover:text-white transition-colors duration-300">
                                        <feature.icon className="w-6 h-6" />
                                    </div>
                                    <h4 className="text-xl font-bold text-gray-900 group-hover:text-[#FF7F50] transition-colors">
                                        {feature.title}
                                    </h4>
                                </div>

                                <p className="text-gray-500 leading-relaxed text-sm flex-grow">
                                    {feature.desc}
                                </p>
                            </div>
                        ))}
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="mt-12 text-center"
                >
                    <Link
                        to="/student/login"
                        className="inline-flex items-center justify-center gap-2 bg-[#FF7F50] text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg shadow-[#FF7F50]/30 hover:bg-[#FF6347] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                    >
                        Access Student Login
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </motion.div>
            </div>
        </section>
    );
};

export default StudentSuccessDashboard;
