import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const FeeCurriculumModal = ({ isOpen, onClose, course, intent = 'fee' }) => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitStatus, setSubmitStatus] = useState('idle');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus('loading');
    
    const isBrochure = intent === 'brochure';
    const isSyllabus = intent === 'syllabus';
    
    const defaultMessage = isBrochure 
        ? `I would like to receive the course brochure for the ${course?.title || 'course'}.` 
        : isSyllabus
        ? `I would like to receive the detailed syllabus for the ${course?.title || 'course'}.`
        : `I am interested in getting the fee structure and curriculum details for the ${course?.title || 'course'}.`;

    const sourceValue = isBrochure ? 'brochure_download' : isSyllabus ? 'syllabus_download' : 'quote_popup';

    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/inquiries`, {
        ...formData,
        courseId: course?._id,
        message: formData.message.trim() === '' ? defaultMessage : formData.message,
        courseInterested: course?.title || 'Unknown Course',
        source: sourceValue
      });
      setSubmitStatus('success');
      setTimeout(() => {
        onClose();
        setSubmitStatus('idle');
        setFormData({ name: '', email: '', phone: '', message: '' });
      }, 2500);
    } catch (err) {
      console.error(err);
      setSubmitStatus('error');
    }
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full h-full sm:h-auto max-w-4xl bg-white sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[100dvh] sm:max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-100 bg-white">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 pr-4 truncate">
                {intent === 'brochure' ? 'Download Brochure' : intent === 'syllabus' ? 'Download Syllabus' : 'Get Fee & Curriculum'} - {course?.title}
              </h3>
              <button 
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
                aria-label="Close popup"
              >
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto bg-gray-50/50 relative">
              <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-4">
                {submitStatus === 'success' ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Inquiry Submitted!</h3>
                    <p className="text-gray-500">
                      {intent === 'brochure' 
                        ? "We've sent the requested brochure directly to your email!" 
                        : intent === 'syllabus'
                        ? "We've sent the detailed syllabus directly to your email!"
                        : "We've sent the detailed fee structure and curriculum directly to your email!"}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                        <input required type="text" className="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Enter your name" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                          <input required type="email" className="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all outline-none" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="you@example.com" />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number</label>
                          <input required type="tel" className="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all outline-none" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+91 " />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Message (Optional)</label>
                        <textarea className="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all outline-none resize-none h-28" value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} placeholder={intent === 'fee' ? "I would like to know the fee structure and get the curriculum..." : "Any additional questions..."} />
                      </div>
                    </div>
                    
                    {submitStatus === 'error' && (
                       <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100 flex items-center mt-4">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                          There was an error submitting your request. Please try again later.
                       </div>
                    )}

                    <div className="pt-2">
                      <button type="submit" disabled={submitStatus === 'loading'} className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl hover:bg-indigo-700 transition-colors shadow-md disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center">
                        {submitStatus === 'loading' ? (
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : null}
                        {submitStatus === 'loading' 
                            ? 'Submitting Inquiry...' 
                            : intent === 'brochure' 
                              ? 'Get Brochure via Email' 
                              : intent === 'syllabus'
                                ? 'Get Syllabus via Email'
                                : 'Send Info to Email'}
                      </button>
                    </div>
                  </>
                )}
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default FeeCurriculumModal;
