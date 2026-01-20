import React from 'react';
import { motion } from 'framer-motion';

const companies = [
    { name: "Google", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" },
    { name: "Microsoft", logo: "https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg" },
    { name: "Amazon", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" },
    { name: "Netflix", logo: "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg" },
    { name: "Meta", logo: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg" },
    { name: "Apple", logo: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" },
    { name: "Tesla", logo: "https://upload.wikimedia.org/wikipedia/commons/e/e8/Tesla_logo.png" },
    { name: "IBM", logo: "https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg" },
    { name: "Intel", logo: "https://upload.wikimedia.org/wikipedia/commons/c/c9/Intel-logo.svg" },
    { name: "Adobe", logo: "https://upload.wikimedia.org/wikipedia/commons/8/8d/Adobe_Corporate_Logo.png" },
    { name: "Oracle", logo: "https://upload.wikimedia.org/wikipedia/commons/5/50/Oracle_logo.svg" },
    { name: "Salesforce", logo: "https://upload.wikimedia.org/wikipedia/commons/f/f9/Salesforce.com_logo.svg" },
    { name: "Cisco", logo: "https://upload.wikimedia.org/wikipedia/commons/6/64/Cisco_logo.svg" },
    { name: "Uber", logo: "https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png" },
    { name: "Airbnb", logo: "https://upload.wikimedia.org/wikipedia/commons/6/69/Airbnb_Logo_B%C3%A9lo.svg" },
    { name: "Spotify", logo: "https://upload.wikimedia.org/wikipedia/commons/2/26/Spotify_logo_with_text.svg" },
    { name: "Slack", logo: "https://upload.wikimedia.org/wikipedia/commons/d/d5/Slack_icon_2019.svg" },
    { name: "Dropbox", logo: "https://upload.wikimedia.org/wikipedia/commons/c/cb/Dropbox_logo_2017.svg" },
    { name: "HP", logo: "https://upload.wikimedia.org/wikipedia/commons/a/ad/HP_logo_2012.svg" },
    { name: "Dell", logo: "https://upload.wikimedia.org/wikipedia/commons/4/48/Dell_Logo.svg" },
    { name: "Samsung", logo: "https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg" },
    { name: "Sony", logo: "https://upload.wikimedia.org/wikipedia/commons/c/ca/Sony_logo.svg" },
    // "Low level" / Startups / Other companies for 3rd row
    { name: "Zoho", logo: "https://upload.wikimedia.org/wikipedia/commons/6/66/Zoho_Corporation_logo.png" },
    { name: "Freshworks", logo: "https://upload.wikimedia.org/wikipedia/commons/0/07/Freshworks-Logo.svg" },
    { name: "Swiggy", logo: "https://upload.wikimedia.org/wikipedia/en/1/12/Swiggy_logo.svg" },
    { name: "Zomato", logo: "https://upload.wikimedia.org/wikipedia/commons/b/bd/Zomato_Logo.svg" },
    { name: "Paytm", logo: "https://upload.wikimedia.org/wikipedia/commons/2/24/Paytm_Logo_%28standalone%29.svg" },
    { name: "Flipkart", logo: "https://upload.wikimedia.org/wikipedia/en/7/7a/Flipkart_logo.svg" },
    { name: "Myntra", logo: "https://upload.wikimedia.org/wikipedia/commons/b/bc/Myntra_Logo.png" },
    { name: "Ola", logo: "https://upload.wikimedia.org/wikipedia/commons/0/03/Ola_Cabs_logo.svg" },
    { name: "Razorpay", logo: "https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg" },
    { name: "Zerodha", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a2/Zerodha_logo.svg" },
    { name: "Byjus", logo: "https://upload.wikimedia.org/wikipedia/commons/0/0c/Byju%27s_logo.png" },
    { name: "Unacademy", logo: "https://upload.wikimedia.org/wikipedia/commons/1/10/Unacademy_Logo.png" }
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
    // Split companies into 3 rows
    const row1 = companies.slice(0, 11);
    const row2 = companies.slice(11, 22);
    const row3 = companies.slice(22);

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
                <Marquee direction="left" speed={40}>
                    {row1.map((company, index) => (
                        <div key={`row1-${index}`} className="mx-4 flex items-center justify-center min-w-[60px] md:min-w-[100px] cursor-pointer group">
                            <div className="p-2 rounded-lg bg-gray-50 group-hover:bg-white group-hover:shadow-md transition-all duration-300 border border-transparent group-hover:border-gray-100">
                                <img
                                    src={company.logo}
                                    alt={company.name}
                                    className="h-4 md:h-6 w-auto object-contain grayscale group-hover:grayscale-0 opacity-60 group-hover:opacity-100 transition-all duration-300"
                                />
                            </div>
                        </div>
                    ))}
                </Marquee>

                {/* Row 2: Right to Left */}
                <Marquee direction="right" speed={45}>
                    {row2.map((company, index) => (
                        <div key={`row2-${index}`} className="mx-4 flex items-center justify-center min-w-[60px] md:min-w-[100px] cursor-pointer group">
                            <div className="p-2 rounded-lg bg-gray-50 group-hover:bg-white group-hover:shadow-md transition-all duration-300 border border-transparent group-hover:border-gray-100">
                                <img
                                    src={company.logo}
                                    alt={company.name}
                                    className="h-4 md:h-6 w-auto object-contain grayscale group-hover:grayscale-0 opacity-60 group-hover:opacity-100 transition-all duration-300"
                                />
                            </div>
                        </div>
                    ))}
                </Marquee>

                {/* Row 3: Right to Left (Startups/Mid-size) */}
                <Marquee direction="left" speed={35}>
                    {row3.map((company, index) => (
                        <div key={`row3-${index}`} className="mx-4 flex items-center justify-center min-w-[60px] md:min-w-[100px] cursor-pointer group">
                            <div className="p-2 rounded-lg bg-gray-50 group-hover:bg-white group-hover:shadow-md transition-all duration-300 border border-transparent group-hover:border-gray-100">
                                <img
                                    src={company.logo}
                                    alt={company.name}
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
