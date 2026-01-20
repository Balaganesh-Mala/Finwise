import React, { useState } from 'react';
import SEO from '../components/SEO';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageSquare, Loader } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const Contact = () => {
    const { getContactInfo } = useSettings();
  
    // Dynamic Data from Settings
    const address = getContactInfo('address') || '123 Skills Ave, Tech City, State';
    const phone = getContactInfo('phone') || '+1 (555) 123-4567';
    const email = getContactInfo('email') || 'info@jobreadyskills.com';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
        await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/inquiries`, {
            ...formData,
            courseInterested: formData.subject, // Map subject to courseInterested or keep distinct if model allows
            source: 'contact_form'
        });
        toast.success('Thank you for contacting us! We will get back to you soon.');
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) {
        console.error('Error submitting contact form:', err);
        setError('Failed to send message. Please try again.');
        toast.error('Failed to send message. Please try again.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pt-24 pb-12">
      <SEO 
        title="Contact Us" 
        description="Get in touch with JobReady Skills Center. We are here to answer your queries about courses, fees, and career guidance."
      />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
          >
            Get in Touch
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-600 max-w-2xl mx-auto"
          >
            Have questions about our courses or career guidance? We're here to help you start your journey.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Contact Info Cards */}
          <div className="space-y-6 lg:col-span-1">
            
            {/* Address */}
            <motion.div 
                whileHover={{ y: -5 }}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4"
            >
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                    <MapPin size={24} />
                </div>
                <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Visit Us</h3>
                    <p className="text-gray-600 leading-relaxed text-sm">
                        {address}
                    </p>
                </div>
            </motion.div>

            {/* Email */}
            <motion.div 
                whileHover={{ y: -5 }}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4"
            >
                <div className="p-3 bg-pink-50 text-pink-600 rounded-xl">
                    <Mail size={24} />
                </div>
                <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Email Us</h3>
                    <p className="text-gray-600 text-sm">{email}</p>
                </div>
            </motion.div>

            {/* Phone */}
             <motion.div 
                whileHover={{ y: -5 }}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4"
            >
                <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                    <Phone size={24} />
                </div>
                <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Call Us</h3>
                    <p className="text-gray-600 text-sm">{phone}</p>
                </div>
            </motion.div>

            {/* Map Card */}
             <motion.div 
                whileHover={{ y: -5 }}
                className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 h-64 overflow-hidden relative"
            >
                <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.1841336113843!2d-73.9856563242627!3d40.7579717348123!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25855c6480299%3A0x55194ec5a1ae0bd7!2sTimes%20Square!5e0!3m2!1sen!2sus!4v1705680000000!5m2!1sen!2sus" 
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }} 
                    allowFullScreen="" 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Our Location"
                    className="rounded-xl"
                ></iframe>
            </motion.div>

          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-10"
            >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                            <input 
                                type="text" 
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                placeholder="John Doe"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                            <input 
                                type="email" 
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                placeholder="john@example.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                        <input 
                            type="tel" 
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                            placeholder="+1 (555) 000-0000"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                        <input 
                            type="text" 
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                            placeholder="Course Inquiry"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                        <textarea 
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            rows="5"
                            required
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all resize-none"
                            placeholder="Tell us what you're looking for..."
                        ></textarea>
                    </div>

                    <button 
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 disabled:bg-indigo-400"
                    >
                         {loading ? 'Sending...' : <>Send Message <Send size={18} /></>}
                    </button>
                </form>
            </motion.div>
          </div>

        </div>



      </div>
    </div>
  );
};

export default Contact;
