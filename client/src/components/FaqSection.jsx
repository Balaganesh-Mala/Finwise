import React, { useState } from 'react';
import { Plus, Minus, ArrowRight, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const FaqSection = () => {
  const [activeIndex, setActiveIndex] = useState(null);
  const navigate = useNavigate();

  const faqs = [
    {
      question: "What specific finance roles can I apply for after this course?",
      answer: "Our curriculum prepares you for high-demand roles such as Investment Banking Analyst, Equity Research Associate, Financial Analyst (FP&A), Risk Analyst, and Private Equity Associate. We target roles at top-tier banks and financial firms."
    },
    {
      question: "Is this course suitable for non-commerce graduates?",
      answer: "Absolutely. We have a 'Finance for Non-Finance' module that starts from the very basics of accounting and economics. Engineers and science graduates have successfully transitioned into finance roles through our program."
    },
    {
      question: "Do you teach practical Financial Modeling?",
      answer: "Yes, Financial Modeling is the core of our program. You will build comprehensive 3-statement models, DCF valuations, and LBO models from scratch using real historical data of public companies."
    },
    {
      question: "Which companies hire from Finwise Career Solutions?",
      answer: "Our graduates are working at leading firms like J.P. Morgan, Goldman Sachs, Morgan Stanley, Deloitte, KPMG, and various boutique investment banks. We have a dedicated placement team to connect you with these opportunities."
    },
    {
      question: "What tools will I master during the course?",
      answer: "You will gain advanced proficiency in Excel (including macros and VBA), Power BI for financial dashboarding, and Python for Finance. We also continually update our tool stack based on industry requirements."
    },
    {
      question: "How is this different from doing a CFA or MBA?",
      answer: "While CFA/MBA provide theoretical knowledge, Finwise focuses on practical, job-ready skills. You will be building models and pitchbooks just like an analyst on the job. Our program is designed to get you hired immediately."
    }
  ];

  const toggleFaq = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const currentUrl = encodeURIComponent(window.location.href);
  const whatsappMessage = encodeURIComponent("Hi, I was looking at the FAQ section and have a question. Can you help?");

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">

          {/* Left Column: Sticky Header info */}
          <div className="lg:col-span-5">
            <div className="sticky top-32">
              <span className="text-indigo-600 font-bold tracking-wider uppercase text-sm mb-4 block">Support Center</span>
              <h2 className="text-4xl font-extrabold text-gray-900 mb-6 leading-tight">
                Frequently Asked <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Questions</span>
              </h2>
              <p className="text-lg text-gray-500 mb-8 leading-relaxed">
                Everything you need to know about the product and billing. Can’t find the answer you’re looking for? Please chat to our friendly team.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href={`https://wa.me/1234567890?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                >
                  <MessageCircle className="mr-2" size={20} />
                  Chat with us
                </a>
                <button
                  onClick={() => navigate('/courses')}
                  className="inline-flex items-center justify-center px-6 py-3 border border-gray-200 text-base font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-all"
                >
                  Explore Courses
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: FAQ List */}
          <div className="lg:col-span-7">
            <div className="divide-y divide-gray-200">
              {faqs.map((faq, index) => (
                <div key={index} className="py-2">
                  <button
                    className="w-full py-6 flex items-start justify-between text-left focus:outline-none group"
                    onClick={() => toggleFaq(index)}
                  >
                    <span className={`text-lg font-medium transition-colors duration-200 ${activeIndex === index ? 'text-indigo-600' : 'text-gray-900 group-hover:text-indigo-600'}`}>
                      {faq.question}
                    </span>
                    <span className={`ml-6 flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 ${activeIndex === index ? 'bg-indigo-100 text-indigo-600 rotate-180' : 'bg-gray-100 text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600'}`}>
                      {activeIndex === index ? <Minus size={16} /> : <Plus size={16} />}
                    </span>
                  </button>

                  <AnimatePresence>
                    {activeIndex === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="pb-8 text-gray-500 leading-relaxed text-base">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default FaqSection;
