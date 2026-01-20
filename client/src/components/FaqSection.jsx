import React, { useState } from 'react';
import { Plus, Minus, ArrowRight, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const FaqSection = () => {
  const [activeIndex, setActiveIndex] = useState(null);
  const navigate = useNavigate();

  const faqs = [
    {
      question: "What is the 'JobReady Guarantee' program?",
      answer: "Our JobReady Guarantee is a commitment to your career success. If you complete our 'Mastery' tracks and don't secure a job within 6 months of graduation, we'll refund 100% of your tuition. Terms and conditions apply, ensuring you're fully prepared for the market."
    },
    {
      question: "Do I get a certificate upon completion?",
      answer: "Yes! Upon successfully completing any course and its final project, you receive a verified industry-recognized certificate. These can be added to your LinkedIn profile and resume to showcase your new skills to recruiters."
    },
    {
      question: "Are the courses suitable for beginners?",
      answer: "Absolutely. We have dedicated paths for absolute beginners that start from the basics (no coding experience required) and gradually build up to advanced concepts. Look for the 'Beginner Friendly' tag on our course cards."
    },
    {
      question: "How does the placement support work?",
      answer: "Our dedicated Career Services team helps you with resume building, mock interviews, and portfolio reviews. We also have partnerships with over 50+ hiring companies and share exclusive job openings with our qualified graduates."
    },
    {
      question: "Can I access the course content on mobile?",
      answer: "Yes, our platform is fully responsive. You can learn on-the-go using your smartphone or tablet through our Student Portal, ensuring you never miss a lesson."
    },
    {
      question: "What if I miss a live session?",
      answer: "Don't worry! All live sessions are recorded and uploaded to your dashboard within 24 hours. You have lifetime access to these recordings and all course materials."
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
