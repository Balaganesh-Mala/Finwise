import React from 'react';
import { motion } from 'framer-motion';

const technologies = [
    // Row 1: Core Accounting & ERP
    { name: "Tally Prime", logo: "https://upload.wikimedia.org/wikipedia/en/9/9d/Tally_Prime_Logo.png" },
    { name: "QuickBooks", logo: "https://upload.wikimedia.org/wikipedia/commons/1/1a/QuickBooks.svg" },
    { name: "Zoho Books", logo: "https://upload.wikimedia.org/wikipedia/commons/6/6f/Zoho_Books_logo.svg" },
    { name: "Xero", logo: "https://upload.wikimedia.org/wikipedia/commons/7/70/Xero_software_logo.svg" },
    { name: "SAP FICO", logo: "https://upload.wikimedia.org/wikipedia/commons/5/58/SAP_2011_logo.svg" },
    { name: "Oracle NetSuite", logo: "https://upload.wikimedia.org/wikipedia/commons/b/b3/Oracle_NetSuite_logo.svg" },
    { name: "Microsoft Dynamics", logo: "https://upload.wikimedia.org/wikipedia/commons/0/08/Microsoft_Dynamics_365_Logo.svg" },

    // Row 2: Analytics & Visualization
    { name: "Advanced Excel", logo: "https://upload.wikimedia.org/wikipedia/commons/3/34/Microsoft_Office_Excel_%282019%E2%80%93present%29.svg" },
    { name: "Power BI", logo: "https://upload.wikimedia.org/wikipedia/commons/c/cf/New_Power_BI_Logo.svg" },
    { name: "Tableau", logo: "https://upload.wikimedia.org/wikipedia/commons/4/4b/Tableau_Logo.png" },
    { name: "Alteryx", logo: "https://upload.wikimedia.org/wikipedia/commons/3/36/Alteryx_Logo_2023.svg" },
    { name: "Python", logo: "https://upload.wikimedia.org/wikipedia/commons/c/c3/Python-logo-notext.svg" },
    { name: "SQL", logo: "https://upload.wikimedia.org/wikipedia/commons/8/87/Sql_data_base_with_logo.png" },

    // Row 3: Financial Markets & Taxation
    { name: "Bloomberg", logo: "https://upload.wikimedia.org/wikipedia/commons/d/d3/Bloomberg_logo.svg" },
    { name: "Reuters", logo: "https://upload.wikimedia.org/wikipedia/commons/3/3d/Thomson_Reuters_logo.svg" },
    { name: "GST Portal", logo: "https://cdn-icons-png.flaticon.com/512/2620/2620582.png" }, // Using generic document icon for GST/Tax
    { name: "Income Tax", logo: "https://upload.wikimedia.org/wikipedia/en/4/46/Income_Tax_Department_logo.png" },
    { name: "MS Word", logo: "https://upload.wikimedia.org/wikipedia/commons/f/fd/Microsoft_Office_Word_%282019%E2%80%93present%29.svg" },
    { name: "MS PowerPoint", logo: "https://upload.wikimedia.org/wikipedia/commons/0/0d/Microsoft_Office_PowerPoint_%282019%E2%80%93present%29.svg" },
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
    const row1 = technologies.slice(0, 7);
    const row2 = technologies.slice(7, 13);
    const row3 = technologies.slice(13);

    // Duplicate rows to ensure enough width for seamless looping on large screens
    const extendedRow1 = [...row1, ...row1, ...row1, ...row1];
    const extendedRow2 = [...row2, ...row2, ...row2, ...row2];
    const extendedRow3 = [...row3, ...row3, ...row3, ...row3];

    return (
        <section className="py-10 bg-gray-50 overflow-hidden border-b border-gray-200">
            <div className="container mx-auto px-4 mb-8 text-center">
                <span className="inline-block py-1 px-3 rounded-full bg-indigo-50 text-indigo-600 text-xs font-semibold tracking-wider uppercase mb-2">
                    Tools & Technologies
                </span>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                    Master In-Demand Skills
                </h2>
                <div className="w-16 h-1 bg-indigo-600 mx-auto rounded-full"></div>
            </div>

            <div className="flex flex-col gap-6">
                {/* Row 1: Office/Design */}
                <Marquee direction="left" speed={100}>
                    {extendedRow1.map((tech, index) => (
                        <div key={`row1-${index}`} className="mx-4 flex items-center justify-center min-w-[50px] md:min-w-[80px] cursor-pointer group">
                            <div className="p-2 rounded-lg bg-white group-hover:shadow-md transition-all duration-300 border border-gray-100">
                                <img
                                    src={tech.logo}
                                    alt={tech.name}
                                    title={tech.name}
                                    className="h-4 md:h-6 w-auto object-contain grayscale group-hover:grayscale-0 opacity-70 group-hover:opacity-100 transition-all duration-300"
                                />
                            </div>
                        </div>
                    ))}
                </Marquee>

                {/* Row 2: Frontend */}
                <Marquee direction="right" speed={105}>
                    {extendedRow2.map((tech, index) => (
                        <div key={`row2-${index}`} className="mx-4 flex items-center justify-center min-w-[50px] md:min-w-[80px] cursor-pointer group">
                            <div className="p-2 rounded-lg bg-white group-hover:shadow-md transition-all duration-300 border border-gray-100">
                                <img
                                    src={tech.logo}
                                    alt={tech.name}
                                    title={tech.name}
                                    className="h-4 md:h-6 w-auto object-contain grayscale group-hover:grayscale-0 opacity-70 group-hover:opacity-100 transition-all duration-300"
                                />
                            </div>
                        </div>
                    ))}
                </Marquee>

                {/* Row 3: Backend/Tools */}
                <Marquee direction="left" speed={95}>
                    {extendedRow3.map((tech, index) => (
                        <div key={`row3-${index}`} className="mx-4 flex items-center justify-center min-w-[50px] md:min-w-[80px] cursor-pointer group">
                            <div className="p-2 rounded-lg bg-white group-hover:shadow-md transition-all duration-300 border border-gray-100">
                                <img
                                    src={tech.logo}
                                    alt={tech.name}
                                    title={tech.name}
                                    className="h-4 md:h-6 w-auto object-contain grayscale group-hover:grayscale-0 opacity-70 group-hover:opacity-100 transition-all duration-300"
                                />
                            </div>
                        </div>
                    ))}
                </Marquee>
            </div>
        </section>
    );
};

export default TechLogos;
