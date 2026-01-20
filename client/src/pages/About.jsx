import React from 'react';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';
import AboutSection from '../components/AboutSection';
import { Users } from 'lucide-react';

const About = () => {
  return (
    <div className='bg-white'>
        <SEO 
            title="About Us" 
            description="Learn about our mission to empower the next generation of tech leaders through industry-focused training."
        />
        
        {/* Modern Hero Banner */}
        <div className="relative h-[500px] flex items-center justify-center overflow-hidden bg-indigo-900">
            {/* Background Image */}
            <div className="absolute inset-0">
                <img 
                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80" 
                    alt="Team collaboration" 
                    className="w-full h-full object-cover opacity-40"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/95 via-indigo-900/80 to-purple-900/80 mix-blend-multiply" />
            </div>

            {/* Content using Framer Motion */}
            <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "outBack" }}
                >
                    <span className="inline-block py-1 px-3 rounded-full bg-indigo-500/30 border border-indigo-400/30 text-indigo-100 text-sm font-semibold tracking-wider mb-6 backdrop-blur-sm">
                        OUR MISSION
                    </span>
                    <h1 className="text-5xl md:text-7xl font-extrabold mb-8 tracking-tight text-white leading-tight">
                        Empowering the <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-indigo-200 to-purple-200">
                            Future of Tech
                        </span>
                    </h1>
                    <p className="text-xl md:text-2xl text-indigo-100 max-w-3xl mx-auto leading-relaxed font-light mb-10">
                        Bridging the gap between academic theory and industry reality through immersive, project-based training.
                    </p>
                </motion.div>
            </div>
            
            {/* Decorative bottom fade to blend with next section */}
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-gray-50 to-transparent"></div>
        </div>
        
        <AboutSection />

        <div className="py-20 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-gray-900">Meet Our Team</h2>
                    <p className="text-gray-600 mt-4">Led by industry experts with decades of experience.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    {[1, 2, 3].map((item) => (
                        <div key={item} className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:-translate-y-2 transition-transform">
                            <div className="w-32 h-32 mx-auto bg-gray-200 rounded-full mb-6 overflow-hidden">
                                <img src={`https://i.pravatar.cc/300?img=${item + 10}`} alt="Team Member" className="w-full h-full object-cover" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">John Smith</h3>
                            <p className="text-indigo-600 font-medium">Founder & CEO</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
  );
}

export default About;
