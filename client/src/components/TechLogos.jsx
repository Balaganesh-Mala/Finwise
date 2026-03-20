import React from 'react';
import { motion } from 'framer-motion';

import {
    FiBriefcase,
    FiTrendingUp,
    FiPieChart,
    FiCreditCard,
    FiFileText,
    FiCheckSquare,
    FiBookOpen,
    FiDatabase,
    FiMonitor,
    FiBarChart2,
    FiActivity,
    FiShield,
    FiGrid
} from 'react-icons/fi';
import { SiSap } from 'react-icons/si';

const technologies = [
    // Row 1: Finance Domains & Operations
    { name: "Private Equity", icon: <FiBriefcase className="w-5 h-5 mr-3 text-blue-600" /> },
    { name: "Hedge Fund", icon: <FiTrendingUp className="w-5 h-5 mr-3 text-blue-600" /> },
    { name: "Mutual Fund", icon: <FiPieChart className="w-5 h-5 mr-3 text-blue-600" /> },
    { name: "Accounts Payable", icon: <FiCreditCard className="w-5 h-5 mr-3 text-emerald-600" /> },
    { name: "Accounts Receivable", icon: <FiFileText className="w-5 h-5 mr-3 text-emerald-600" /> },
    { name: "Reconciliation", icon: <FiCheckSquare className="w-5 h-5 mr-3 text-emerald-600" /> },
    { name: "Record to Report (R2R)", icon: <FiBookOpen className="w-5 h-5 mr-3 text-emerald-600" /> },
    { name: "Order to Cash (O2C)", icon: <FiActivity className="w-5 h-5 mr-3 text-emerald-600" /> },

    // Row 2: Finance Roles & Profiles
    { name: "NA Analyst", icon: <FiMonitor className="w-5 h-5 mr-3 text-indigo-600" /> },
    { name: "Financial Analyst", icon: <FiBarChart2 className="w-5 h-5 mr-3 text-indigo-600" /> },
    { name: "Financial Reporting Analyst", icon: <FiFileText className="w-5 h-5 mr-3 text-indigo-600" /> },
    { name: "Research Analyst", icon: <FiTrendingUp className="w-5 h-5 mr-3 text-indigo-600" /> },
    { name: "Loan Syndication", icon: <FiBriefcase className="w-5 h-5 mr-3 text-indigo-600" /> },
    { name: "Tax Associate", icon: <FiCheckSquare className="w-5 h-5 mr-3 text-indigo-600" /> },
    { name: "Accounts Executive", icon: <FiCreditCard className="w-5 h-5 mr-3 text-indigo-600" /> },
    { name: "Risk Analyst", icon: <FiShield className="w-5 h-5 mr-3 text-indigo-600" /> },

    // Row 3: Tools & Software
    { name: "Advanced Excel", icon: <FiGrid className="w-5 h-5 mr-3 text-green-600" /> },
    { name: "MS Word", icon: <FiFileText className="w-5 h-5 mr-3 text-blue-700" /> },
    { name: "MS PowerPoint", icon: <FiMonitor className="w-5 h-5 mr-3 text-orange-600" /> },
    { name: "Tally Prime", icon: <FiDatabase className="w-5 h-5 mr-3 text-purple-600" /> },
    { name: "SAP FICO", icon: <SiSap className="w-5 h-5 mr-3 text-blue-500" /> },
    { name: "QuickBooks", icon: <FiDatabase className="w-5 h-5 mr-3 text-green-500" /> },
    { name: "Power BI", icon: <FiPieChart className="w-5 h-5 mr-3 text-yellow-600" /> },
    { name: "SQL", icon: <FiDatabase className="w-5 h-5 mr-3 text-blue-400" /> }
];

const Marquee = ({ children, direction = "left", speed = 50 }) => {
    return (
        <div className="flex overflow-hidden whitespace-nowrap">
            <motion.div
                className="flex flex-shrink-0"
                initial={{ x: direction === "left" ? 0 : "-100%" }}
                animate={{ x: direction === "left" ? "-100%" : 0 }}
                transition={{
                    repeat: Infinity,
                    ease: "linear",
                    duration: speed,
                }}
            >
                {children}
            </motion.div>
            <motion.div
                className="flex flex-shrink-0"
                initial={{ x: direction === "left" ? 0 : "-100%" }}
                animate={{ x: direction === "left" ? "-100%" : 0 }}
                transition={{
                    repeat: Infinity,
                    ease: "linear",
                    duration: speed,
                }}
            >
                {children}
            </motion.div>
        </div>
    );
};

const TechLogos = () => {
    const row1 = technologies.slice(0, 8);
    const row2 = technologies.slice(8, 16);
    const row3 = technologies.slice(16, 24);

    // Duplicate rows to ensure enough width for seamless looping on large screens
    const extendedRow1 = [...row1, ...row1, ...row1];
    const extendedRow2 = [...row2, ...row2, ...row2];
    const extendedRow3 = [...row3, ...row3, ...row3];

    return (
        <section className="py-10 bg-gray-50 overflow-hidden border-b border-gray-200">
            <div className="container mx-auto px-4 mb-8 text-center">
                <span className="inline-block py-1 px-3 rounded-full bg-indigo-50 text-indigo-600 text-xs font-semibold tracking-wider uppercase mb-2">
                    Tools & Technologies
                </span>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                    Roles, Profiles & Tools
                </h2>
                <div className="w-16 h-1 bg-indigo-600 mx-auto rounded-full"></div>
            </div>

            <div className="flex flex-col gap-6">
                {/* Row 1: Office/Design */}
                <Marquee direction="left" speed={100}>
                    {extendedRow1.map((tech, index) => (
                        <div key={`row1-${index}`} className="mx-4 flex items-center justify-center cursor-default">
                            <div className="px-6 py-3 rounded-full bg-white shadow-sm border border-gray-100 text-gray-700 font-medium hover:text-indigo-600 hover:border-indigo-100 hover:bg-indigo-50 transition-all duration-300 whitespace-nowrap flex items-center group">
                                {tech.icon}
                                <span>{tech.name}</span>
                            </div>
                        </div>
                    ))}
                </Marquee>

                {/* Row 2: Frontend */}
                <Marquee direction="right" speed={105}>
                    {extendedRow2.map((tech, index) => (
                        <div key={`row2-${index}`} className="mx-4 flex items-center justify-center cursor-default">
                            <div className="px-6 py-3 rounded-full bg-white shadow-sm border border-gray-100 text-gray-700 font-medium hover:text-emerald-600 hover:border-emerald-100 hover:bg-emerald-50 transition-all duration-300 whitespace-nowrap flex items-center group">
                                {tech.icon}
                                <span>{tech.name}</span>
                            </div>
                        </div>
                    ))}
                </Marquee>

                {/* Row 3: Backend/Tools */}
                <Marquee direction="left" speed={95}>
                    {extendedRow3.map((tech, index) => (
                        <div key={`row3-${index}`} className="mx-4 flex items-center justify-center cursor-default">
                            <div className="px-6 py-3 rounded-full bg-white shadow-sm border border-gray-100 text-gray-700 font-medium hover:text-purple-600 hover:border-purple-100 hover:bg-purple-50 transition-all duration-300 whitespace-nowrap flex items-center group">
                                {tech.icon}
                                <span>{tech.name}</span>
                            </div>
                        </div>
                    ))}
                </Marquee>
            </div>
        </section>
    );
};

export default TechLogos;
