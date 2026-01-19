import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, MapPin, Phone, Mail, Youtube, ArrowRight } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

const Footer = () => {
  const { getContactInfo, getSocialLink, settings } = useSettings();

  const siteTitle = settings?.siteTitle || 'JobReady';
  const address = getContactInfo('address') || '123 Skills Ave, Tech City, State';
  const phone = getContactInfo('phone') || '+1 (555) 123-4567';
  const email = getContactInfo('email') || 'info@jobreadyskills.com';

  return (
    <footer className="bg-[#0f172a] text-gray-300 pt-20 pb-10 border-t border-gray-800">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
          
          {/* Brand & Newsletter - Spans 4 columns */}
          <div className="lg:col-span-4 space-y-6">
            <Link to="/" className="inline-block">
                <h3 className="text-3xl font-bold text-white tracking-tight">{siteTitle}</h3>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              Empowering your career with industry-ready skills and professional training. Join thousands of students achieving their dreams.
            </p>
            
            {/* Newsletter Input */}
            <div className="pt-2">
                <h4 className="text-sm font-semibold text-white mb-3">Stay updated with our newsletter</h4>
                <div className="flex gap-2">
                    <input 
                        type="email" 
                        placeholder="Enter your email" 
                        className="bg-gray-800/50 border border-gray-700 text-white text-sm rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 outline-none transition-all placeholder:text-gray-500"
                    />
                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-2.5 transition-colors flex items-center justify-center">
                        <ArrowRight size={18} />
                    </button>
                </div>
            </div>

            <div className="flex space-x-4 pt-4">
              {getSocialLink('facebook') && <a href={getSocialLink('facebook')} target="_blank" rel="noreferrer" className="bg-gray-800 p-2 rounded-full hover:bg-indigo-600 text-gray-400 hover:text-white transition-all"><Facebook size={18} /></a>}
              {getSocialLink('instagram') && <a href={getSocialLink('instagram')} target="_blank" rel="noreferrer" className="bg-gray-800 p-2 rounded-full hover:bg-pink-600 text-gray-400 hover:text-white transition-all"><Instagram size={18} /></a>}
              {getSocialLink('linkedin') && <a href={getSocialLink('linkedin')} target="_blank" rel="noreferrer" className="bg-gray-800 p-2 rounded-full hover:bg-blue-600 text-gray-400 hover:text-white transition-all"><Linkedin size={18} /></a>}
              {getSocialLink('youtube') && <a href={getSocialLink('youtube')} target="_blank" rel="noreferrer" className="bg-gray-800 p-2 rounded-full hover:bg-red-600 text-gray-400 hover:text-white transition-all"><Youtube size={18} /></a>}
            </div>
          </div>

          {/* Spacer Column */}
          <div className="hidden lg:block lg:col-span-1"></div>

          {/* Quick Links */}
          <div className="lg:col-span-2">
            <h4 className="text-white font-semibold mb-6">Explore</h4>
            <ul className="space-y-4 text-sm">
              <li><Link to="/" className="hover:text-indigo-400 transition-colors block">Home</Link></li>
              <li><Link to="/about" className="hover:text-indigo-400 transition-colors block">About Us</Link></li>
              <li><Link to="/career" className="hover:text-indigo-400 transition-colors block">Careers</Link></li>
              <li><Link to="/blogs" className="hover:text-indigo-400 transition-colors block">Latest Blogs</Link></li>
              <li><Link to="/contact" className="hover:text-indigo-400 transition-colors block">Contact Us</Link></li>
            </ul>
          </div>

          {/* Courses */}
          <div className="lg:col-span-2">
            <h4 className="text-white font-semibold mb-6">Top Courses</h4>
            <ul className="space-y-4 text-sm">
              <li><Link to="/courses" className="hover:text-indigo-400 transition-colors block">Full Stack Dev</Link></li>
              <li><Link to="/courses" className="hover:text-indigo-400 transition-colors block">Data Science</Link></li>
              <li><Link to="/courses" className="hover:text-indigo-400 transition-colors block">UI/UX Design</Link></li>
              <li><Link to="/courses" className="hover:text-indigo-400 transition-colors block">Digital Marketing</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="lg:col-span-3">
            <h4 className="text-white font-semibold mb-6">Get in Touch</h4>
            <ul className="space-y-5 text-sm">
              <li className="flex items-start group">
                <MapPin className="text-indigo-500 mt-0.5 mr-3 flex-shrink-0 group-hover:text-indigo-400 transition-colors" size={18} />
                <span className="leading-snug">{address}</span>
              </li>
              <li className="flex items-center group">
                <Phone className="text-indigo-500 mr-3 flex-shrink-0 group-hover:text-indigo-400 transition-colors" size={18} />
                <span>{phone}</span>
              </li>
              <li className="flex items-center group">
                <Mail className="text-indigo-500 mr-3 flex-shrink-0 group-hover:text-indigo-400 transition-colors" size={18} />
                <a href={`mailto:${email}`} className="hover:text-indigo-400 transition-colors">{email}</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm text-center md:text-left">
            © {new Date().getFullYear()} <span className="text-gray-300 font-medium">{siteTitle}</span>. All rights reserved.
          </p>
          <div className="flex items-center space-x-8 text-sm text-gray-500">
            <Link to="/privacy" className="hover:text-indigo-400 transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-indigo-400 transition-colors">Terms of Service</Link>
            <Link to="/cookies" className="hover:text-indigo-400 transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
