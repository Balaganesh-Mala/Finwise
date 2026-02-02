import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Award, Share2, Download } from 'lucide-react';

const CertificateSection = () => {
    return (
        <section className="py-24 bg-white overflow-hidden relative mx-auto px-4 md:px-12 lg:px-24">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-indigo-50 rounded-full blur-3xl opacity-50"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-pink-50 rounded-full blur-3xl opacity-50"></div>

            <div className="container mx-auto px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                    {/* Left Column: Content */}
                    <div className="space-y-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 text-sm font-semibold">
                            <Award size={18} />
                            <span>Industry Recognized</span>
                        </div>

                        <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                            Earn a Certificate that <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                                Proves Your Skills
                            </span>
                        </h2>

                        <p className="text-lg text-gray-600 leading-relaxed">
                            Upon successful completion of your course, you'll receive a verified certificate from Skill Up Academy.
                            Showcase your achievement on LinkedIn, your resume, and to potential employers.
                        </p>

                        <div className="space-y-4">
                            {[
                                "Globally recognized by top companies",
                                "Shareable directly to LinkedIn & Socials",
                                "Verifiable unique credential ID"
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                                        <CheckCircle size={14} strokeWidth={3} />
                                    </div>
                                    <span className="text-gray-700 font-medium">{item}</span>
                                </div>
                            ))}
                        </div>

                        <button className="bg-gray-900 text-white px-8 py-4 rounded-xl font-semibold hover:bg-gray-800 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center gap-2">
                            Get Certified Today <Share2 size={18} />
                        </button>
                    </div>

                    {/* Right Column: Certificate Mockup */}
                    <div className="relative perspective-1000">
                        {/* The Certificate Card */}
                        <motion.div
                            initial={{ rotateY: 10, rotateX: 5 }}
                            whileHover={{ rotateY: 0, rotateX: 0 }}
                            transition={{ type: "spring", stiffness: 100 }}
                            className="relative bg-white border-[12px] border-double border-gray-100 shadow-2xl rounded-lg p-1 aspect-[1.414/1] w-full max-w-2xl mx-auto transform rotate-2 lg:rotate-3 hover:rotate-0 transition-transform duration-500"
                        >
                            {/* Inner Border */}
                            <div className="h-full w-full border border-gray-200 p-8 flex flex-col items-center justify-between text-center relative overflow-hidden bg-[#fafafa]">

                                {/* Background Pattern */}
                                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>

                                {/* Header */}
                                <div className="relative z-10 w-full">
                                    <div className="flex justify-between items-start w-full mb-8">
                                        <div className="text-left">
                                            <h4 className="text-2xl font-bold text-gray-900 tracking-wider font-serif">Skill Up Academy</h4>
                                            <p className="text-xs text-indigo-600 font-semibold tracking-widest uppercase mt-1">Skills Center</p>
                                        </div>
                                        <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-white shadow-lg">
                                            <Award size={32} />
                                        </div>
                                    </div>

                                    <p className="text-gray-500 uppercase tracking-widest text-sm font-semibold mb-2">Certificate of Completion</p>
                                    <p className="text-gray-600 text-sm">This is to certify that</p>
                                </div>

                                {/* Name & Course */}
                                <div className="relative z-10 py-4">
                                    <h3 className="text-4xl lg:text-5xl font-serif text-gray-900 italic mb-4 font-medium" style={{ fontFamily: 'Playfair Display, serif' }}>
                                        Alex Johnson
                                    </h3>
                                    <div className="w-32 h-px bg-gray-300 mx-auto my-4"></div>
                                    <p className="text-gray-600">has successfully completed the comprehensive course on</p>
                                    <h4 className="text-xl lg:text-2xl font-bold text-indigo-700 mt-2">Full Stack Web Development</h4>
                                </div>

                                {/* Footer / Signatures */}
                                {/* Footer / Signatures */}
                                <div className="relative z-10 w-full flex flex-col gap-8 md:flex-row md:justify-between md:items-end mt-8">
                                    <div className="text-center order-2 md:order-1">
                                        <div className="w-24 md:w-32 border-b border-gray-400 mb-2 mx-auto"></div>
                                        <p className="text-xs text-gray-500 font-semibold uppercase">Instructor</p>
                                    </div>

                                    <div className="text-center order-1 md:order-2 mb-4 md:mb-0">
                                        <div className="w-20 h-20 md:w-24 md:h-24 absolute left-1/2 -translate-x-1/2 -top-10 md:-top-12 opacity-10 pointer-events-none">
                                            <img src="/logo-placeholder.png" alt="" />
                                        </div>
                                        <p className="text-xs text-gray-400 font-mono">ID: JR-2024-8839</p>
                                        <p className="text-xs text-gray-400">Date: Oct 24, 2024</p>
                                    </div>

                                    <div className="text-center order-3">
                                        {/* Fake Signature */}
                                        <div className="font-cursive text-lg md:text-xl text-gray-800 mb-1" style={{ fontFamily: 'cursive' }}>Sarah Smith</div>
                                        <div className="w-24 md:w-32 border-b border-gray-400 mb-2 mx-auto"></div>
                                        <p className="text-xs text-gray-500 font-semibold uppercase">Director</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Floating Badge/Card */}
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -bottom-8 -left-8 bg-white p-4 rounded-xl shadow-xl border border-gray-100 hidden md:flex items-center gap-4 z-20"
                        >
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                <Download size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-900">Instant Download</p>
                                <p className="text-xs text-gray-500">PDF & Image Formats</p>
                            </div>
                        </motion.div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default CertificateSection;
