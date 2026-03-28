import React from 'react';
import { motion } from 'framer-motion';

const companies = [
    { name: "Wells Fargo", logo: "https://upload.wikimedia.org/wikipedia/commons/b/b3/Wells_Fargo_Bank.svg" },
    { name: "FactSet", logo: "https://upload.wikimedia.org/wikipedia/commons/8/87/FactSet_logo.svg" },
    { name: "Deloitte", logo: "https://upload.wikimedia.org/wikipedia/commons/5/56/Deloitte.svg" },
    { name: "EY", logo: "https://upload.wikimedia.org/wikipedia/commons/f/f8/EY_logo_2019.svg" },
    { name: "KPMG", logo: "https://upload.wikimedia.org/wikipedia/commons/1/18/KPMG_logo.svg" },
    { name: "S&P Global", logo: "https://upload.wikimedia.org/wikipedia/commons/0/05/PricewaterhouseCoopers_Logo.svg" },
    { name: "Broadridge", logo: "https://upload.wikimedia.org/wikipedia/commons/5/5e/Broadridge_Financial_Solutions_Logo.svg" },
    { name: "Accenture", logo: "https://upload.wikimedia.org/wikipedia/commons/c/cd/Accenture_2017_logo.svg" },
    { name: "Ascensus", logo: "https://upload.wikimedia.org/wikipedia/commons/4/41/Ascensus_logo.svg" },
    { name: "Alter Domus", logo: "https://upload.wikimedia.org/wikipedia/en/9/90/Alter_Domus_logo.png" },
    { name: "Genpact", logo: "https://upload.wikimedia.org/wikipedia/commons/b/b2/Genpact_logo.svg" },
    { name: "MSN Labs", logo: "https://avatars.githubusercontent.com/u/105156324?s=200&v=4" }, // Fallback for M2N
    { name: "KFintech", logo: "https://upload.wikimedia.org/wikipedia/commons/1/1b/Experian_logo.svg" },
    { name: "IBM", logo: "https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg" },
    { name: "Clear Harbor", logo: "https://media.licdn.com/dms/image/C4D0BAQE8u1Q7V_z2_A/company-logo_200_200/0/1630567015444?e=2147483647&v=beta&t=k6z5lU0u0G9_9_9" }, // LinkedIn hosted
    { name: "Computershare", logo: "https://upload.wikimedia.org/wikipedia/commons/f/fd/Computershare_logo.svg" },
    { name: "Cognizant", logo: "https://upload.wikimedia.org/wikipedia/commons/6/6f/Capgemini_2017_logo.svg" },
    { name: "Wipro", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a0/Wipro_Primary_Logo_Color_RGB.svg" },
    { name: "Infosys", logo: "https://upload.wikimedia.org/wikipedia/commons/9/95/Infosys_logo.svg" },
    { name: "Invesco", logo: "https://upload.wikimedia.org/wikipedia/commons/f/f5/Invesco_logo.svg" },
    { name: "E2Open", logo: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Raymond_James_logo.svg" },
    { name: "State Street", logo: "https://upload.wikimedia.org/wikipedia/commons/7/7c/R1_RCM_Logo.svg" }
];

// Internal Marquee Component using Framer Motion
const Marquee = ({ children, direction = "left", speed = 25 }) => {
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

const CompanyLogos = () => {
    // Split companies evenly into 3 rows of 8
    const row1 = companies.slice(0, 8);
    const row2 = companies.slice(8, 16);
    const row3 = companies.slice(16, 24);

    // Duplicate arrays to ensure seamless infinite scrolling on large screens
    const extendedRow1 = [...row1, ...row1, ...row1];
    const extendedRow2 = [...row2, ...row2, ...row2];
    const extendedRow3 = [...row3, ...row3, ...row3];

    return (
        <section className="py-10 bg-white overflow-hidden border-b border-gray-100">
            <div className="container mx-auto px-4 mb-8 text-center">
                <span className="inline-block py-1 px-3 rounded-full bg-indigo-50 text-indigo-600 text-xs font-semibold tracking-wider uppercase mb-2">
                    Placement Partners
                </span>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                    Top Companies Hiring Our Students
                </h2>
                <div className="w-16 h-1 bg-indigo-600 mx-auto rounded-full"></div>
            </div>

            <div className="flex flex-col gap-6">
                {/* Row 1: Left to Right */}
                <Marquee direction="left" speed={70}>
                    {extendedRow1.map((company, index) => (
                        <div key={`row1-${index}`} className="mx-4 flex items-center justify-center min-w-[60px] md:min-w-[100px] cursor-pointer group">
                            <div className="p-2 rounded-lg bg-gray-50 group-hover:bg-white group-hover:shadow-md transition-all duration-300 border border-transparent group-hover:border-gray-100">
                                <img
                                    src={company.logo}
                                    alt={company.name}
                                    title={company.name}
                                    className="h-4 md:h-6 w-auto object-contain grayscale group-hover:grayscale-0 opacity-60 group-hover:opacity-100 transition-all duration-300"
                                />
                            </div>
                        </div>
                    ))}
                </Marquee>

                {/* Row 2: Right to Left */}
                <Marquee direction="right" speed={80}>
                    {extendedRow2.map((company, index) => (
                        <div key={`row2-${index}`} className="mx-4 flex items-center justify-center min-w-[60px] md:min-w-[100px] cursor-pointer group">
                            <div className="p-2 rounded-lg bg-gray-50 group-hover:bg-white group-hover:shadow-md transition-all duration-300 border border-transparent group-hover:border-gray-100">
                                <img
                                    src={company.logo}
                                    alt={company.name}
                                    title={company.name}
                                    className="h-4 md:h-6 w-auto object-contain grayscale group-hover:grayscale-0 opacity-60 group-hover:opacity-100 transition-all duration-300"
                                />
                            </div>
                        </div>
                    ))}
                </Marquee>

                {/* Row 3: Right to Left (Startups/Mid-size) */}
                <Marquee direction="left" speed={75}>
                    {extendedRow3.map((company, index) => (
                        <div key={`row3-${index}`} className="mx-4 flex items-center justify-center min-w-[60px] md:min-w-[100px] cursor-pointer group">
                            <div className="p-2 rounded-lg bg-gray-50 group-hover:bg-white group-hover:shadow-md transition-all duration-300 border border-transparent group-hover:border-gray-100">
                                <img
                                    src={company.logo}
                                    alt={company.name}
                                    title={company.name}
                                    className="h-4 md:h-6 w-auto object-contain grayscale group-hover:grayscale-0 opacity-60 group-hover:opacity-100 transition-all duration-300"
                                />
                            </div>
                        </div>
                    ))}
                </Marquee>
            </div>
        </section>
    );
};

export default CompanyLogos;
