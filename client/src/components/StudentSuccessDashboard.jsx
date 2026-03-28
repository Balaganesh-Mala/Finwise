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
    ArrowRight,
    LineChart,
    GraduationCap,
    Calendar
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
            icon: LineChart,
            image: PerformanceReportsImg,
            title: "Dashboard",
            desc: "Comprehensive overview of your progress, activity metrics, and course statistics."
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
            icon: GraduationCap,
            image: CertificatesImg,
            title: "Learning",
            desc: "Access your enrolled courses, resume classes, and track your curriculum effortlessly."
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
            icon: Calendar,
            image: FeeInvoiceImg,
            title: "Attendance",
            desc: "Monitor your class attendance and keep track of your daily learning streaks."
        }
    ];

    // Duplicate logic for seamless loop
    const loopedFeatures = [...features, ...features];

    return (
        <section className="py-24 bg-slate-950 relative overflow-hidden">
            {/* Cinematic Background Decoration */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff1a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff1a_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_30%,transparent_100%)] pointer-events-none" />
            
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-indigo-600 rounded-full filter blur-[120px] opacity-[0.15]"></div>
                <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-600 rounded-full filter blur-[120px] opacity-[0.1]"></div>
            </div>

            <div className="container-fluid relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16 px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest relative z-10 shadow-xl mb-6 mx-auto"
                        >
                            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                            Student Features
                        </motion.div>
                        
                        <h3 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight tracking-tight">
                            Your <span className="text-indigo-400">Success Dashboard</span>
                        </h3>
                        <p className="text-lg text-slate-400 font-medium leading-relaxed max-w-2xl mx-auto">
                            Everything you need to master your skills and land your dream job, seamlessly integrated into one powerful platform.
                        </p>
                    </motion.div>
                </div>

                {/* Infinite Carousel Container */}
                <div className="flex overflow-hidden py-8 relative group">
                    <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-slate-950 to-transparent z-20 pointer-events-none md:block hidden" />
                    <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-slate-950 to-transparent z-20 pointer-events-none md:block hidden" />

                    <motion.div
                        className="flex gap-8 px-4"
                        animate={{ x: "-50%" }}
                        transition={{
                            ease: "linear",
                            duration: 50,
                            repeat: Infinity
                        }}
                        style={{ width: "max-content", willChange: "transform" }}
                    >
                        {loopedFeatures.map((feature, idx) => (
                            <div
                                key={idx}
                                className="w-[350px] md:w-[420px] flex-shrink-0 group/card p-6 rounded-[2rem] bg-slate-900 border border-white/10 hover:border-indigo-500/50 hover:bg-slate-800 transition-all duration-300 flex flex-col h-full relative overflow-hidden"
                            >
                                {/* Glow Overlay */}
                                <div className="absolute inset-0 bg-transparent group-hover/card:bg-indigo-500/5 rounded-[2rem] transition-colors duration-300 pointer-events-none" />

                                {/* macOS Browser Mockup for Screenshots */}
                                <div className="mb-8 rounded-2xl overflow-hidden shadow-xl shadow-black/30 border border-white/5 bg-slate-950 h-64 flex flex-col relative z-10 transition-transform duration-300 group-hover/card:-translate-y-1">
                                    <div className="bg-slate-800 px-4 py-3 flex items-center gap-2 border-b border-white/5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                                    </div>
                                    <div className="flex-1 flex items-center justify-center p-2 bg-slate-900 overflow-hidden relative">
                                        {/* Fallback pattern in case image is missing */}
                                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none" />
                                        <img
                                            src={feature.image}
                                            alt={feature.title}
                                            className="w-full h-full object-contain relative z-10"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col relative z-10 flex-grow">
                                    <div className="flex items-center gap-4 mb-3">
                                        <div className="p-3 bg-white/5 rounded-xl text-indigo-400 group-hover/card:bg-indigo-500 group-hover/card:text-white border border-white/10 group-hover/card:border-indigo-400 transition-all duration-500 shadow-md">
                                            <feature.icon className="w-6 h-6" />
                                        </div>
                                        <h4 className="text-2xl font-black text-white group-hover/card:text-indigo-400 transition-colors duration-300">
                                            {feature.title}
                                        </h4>
                                    </div>

                                    <p className="text-slate-400 leading-relaxed font-medium mt-2">
                                        {feature.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="mt-16 text-center relative z-10"
                >
                    <Link
                        to="/student/login"
                        className="inline-flex items-center justify-center gap-2 bg-white text-slate-950 px-10 py-5 rounded-full font-black uppercase text-sm tracking-widest shadow-xl shadow-white/10 hover:bg-indigo-500 hover:text-white hover:shadow-indigo-500/30 hover:-translate-y-1 transition-all duration-300 group"
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
