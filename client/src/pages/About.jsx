import React from 'react';
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
        <div className="bg-indigo-900 text-white py-20 text-center">
            <h1 className="text-4xl font-bold mb-4">About JobReady Skills Center</h1>
            <p className="text-xl max-w-2xl mx-auto text-indigo-100">
                Empowering the next generation of tech leaders through industry-focused training.
            </p>
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
