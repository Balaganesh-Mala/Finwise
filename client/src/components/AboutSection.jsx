import React from 'react';
import { motion } from 'framer-motion';
import { Target, Users, Zap, ArrowRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const AboutSection = () => {
    return (
        <section className="py-24 bg-gray-50 relative overflow-hidden p-30 mx-auto px-4 md:px-12 lg:px-24">
             {/* Abstract Shapes */}
             <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-96 h-96 bg-indigo-200 rounded-full blur-[100px] opacity-50" />
             <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/3 w-96 h-96 bg-violet-200 rounded-full blur-[100px] opacity-50" />

            <div className="container mx-auto px-8 md:px-12 relative z-10">
                <div className="grid lg:grid-cols-2 gap-20 items-center">
                    
                    {/* Content Side */}
                    <div className="order-2 lg:order-1">
                        <motion.div
                             initial={{ opacity: 0, y: 20 }}
                             whileInView={{ opacity: 1, y: 0 }}
                             viewport={{ once: true }}
                             transition={{ duration: 0.6 }}
                        >
                            <div className="flex items-center gap-4 mb-8">
                                <span className="h-0.5 w-12 bg-indigo-600 rounded-full"></span>
                                <span className="text-indigo-600 font-bold uppercase tracking-widest text-sm">Who We Are</span>
                            </div>
                            
                            <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-8 leading-tight">
                                We Build The <br/>
                                <span className="relative inline-block mt-2">
                                    <span className="relative z-10 text-indigo-600">Workforce of Tomorrow</span>
                                    <span className="absolute bottom-2 left-0 w-full h-3 bg-indigo-100 -z-10 bg-opacity-60 skew-x-12"></span>
                                </span>
                            </h2>
                            
                            <p className="text-xl text-gray-600 mb-10 leading-relaxed font-light">
                                JobReady isn't just an institute; it's a career launchpad. We replace traditional rote learning with immersive, project-based experiences that simulate the real corporate world.
                            </p>

                            <div className="space-y-8 mb-12">
                                {[
                                    { title: "Visionary Curriculum", desc: "Updated weekly to match tech trends.", icon: Target },
                                    { title: "Elite Mentorship", desc: "Learn directly from Senior Engineers.", icon: Users },
                                    { title: "Rapid Placement", desc: "Dedicated hiring partners network.", icon: Zap }
                                ].map((item, idx) => (
                                    <motion.div 
                                        key={idx}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.2 + (idx * 0.1) }}
                                        className="flex items-start gap-6 p-6 rounded-2xl hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-gray-50 bg-white/50 backdrop-blur-sm"
                                    >
                                        <div className="bg-indigo-600 text-white p-4 rounded-xl shadow-lg shadow-indigo-200 shrink-0">
                                            <item.icon size={24} />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h4>
                                            <p className="text-gray-500 leading-relaxed">{item.desc}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            <Link 
                                to="/about"
                                className="inline-flex items-center gap-3 text-indigo-600 font-bold text-lg hover:gap-5 transition-all group px-6"
                            >
                                Read our full story <ArrowRight className="group-hover:text-indigo-700 w-6 h-6" />
                            </Link>
                        </motion.div>
                    </div>

                    {/* Visual Side */}
                    <div className="order-1 lg:order-2 relative py-10 lg:py-0">
                        <div className="relative h-[600px] w-full max-w-lg mx-auto lg:max-w-none">
                            {/* Main Tall Image */}
                            <motion.div 
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8 }}
                                className="absolute right-0 top-0 w-4/5 h-4/5 rounded-[2.5rem] overflow-hidden shadow-2xl z-10 border-8 border-white"
                            >
                                <img 
                                    src="https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                                    alt="Students Collaborating" 
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-indigo-900/10 mix-blend-multiply"></div>
                            </motion.div>

                            {/* Secondary Overlapping Image */}
                            <motion.div 
                                initial={{ opacity: 0, x: -40 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.3, duration: 0.8 }}
                                className="absolute left-0 bottom-0 w-3/5 h-1/2 rounded-[2rem] overflow-hidden shadow-2xl z-20 border-4 border-gray-50"
                            >
                                <img 
                                    src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                                    alt="Mentorship" 
                                    className="w-full h-full object-cover"
                                />
                            </motion.div>

                            {/* Decorative Elements */}
                            <div className="absolute right-12 bottom-12 z-30 bg-white p-4 rounded-2xl shadow-xl flex gap-1 animate-pulse">
                                {[1,2,3,4,5].map(i => (
                                    <Star key={i} size={20} className="text-yellow-400 fill-current" />
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default AboutSection;
