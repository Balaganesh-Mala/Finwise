import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, LogIn, ChevronRight } from 'lucide-react';
import { usePopup } from '../context/PopupContext';
import { motion, AnimatePresence } from 'framer-motion';

import { useSettings } from '../context/SettingsContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { openPopup } = usePopup();
  const { settings } = useSettings();
  const location = useLocation();

  const siteTitle = settings?.siteTitle || 'Wonew';

  // Scroll effect for glassmorphism
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Courses', path: '/courses' },
    { name: 'Career', path: '/career' },
    { name: 'About Us', path: '/about' },
    { name: 'Blogs', path: '/blogs' },
    { name: 'Contact Us', path: '/contact' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md shadow-lg py-2' : 'bg-white py-4'
        }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">

          {/* Logo */}
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            {settings?.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt={siteTitle}
                className="w-10 h-10 rounded-lg object-cover group-hover:rotate-12 transition-transform"
                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
              />
            ) : null}

            {/* Fallback Logo (shown if no logoUrl or if image fails) */}
            <div
              className={`w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl group-hover:rotate-12 transition-transform ${settings?.logoUrl ? 'hidden' : 'flex'}`}
            >
              {siteTitle.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl text-gray-900 leading-none">{siteTitle}</span>
              <span className="text-xs text-gray-500 font-medium tracking-wider">SKILL ACADEMY</span>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${isActive
                      ? 'text-indigo-600 bg-indigo-50'
                      : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
                    }`}
                >
                  {link.name}
                </Link>
              )
            })}
          </div>

          {/* Action Buttons */}
          <div className="hidden lg:flex items-center gap-4">
            <a
              href={import.meta.env.VITE_STUDENT_APP_URL || 'http://localhost:5174'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-600 font-medium hover:text-indigo-600 transition-colors"
            >
              <LogIn size={18} />
              Student Login
            </a>
            <button
              onClick={openPopup}
              className="bg-gray-900 text-white px-6 py-2.5 rounded-full font-medium hover:bg-gray-800 transition-all shadow-lg hover:shadow-gray-200 flex items-center gap-2"
            >
              Get Quote <ChevronRight size={16} />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-4">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 hover:text-indigo-600 p-2"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t border-gray-100 overflow-hidden"
          >
            <div className="p-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="block px-4 py-3 rounded-xl text-gray-600 font-medium hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <div className="h-px bg-gray-100 my-4"></div>
              <a
                href={import.meta.env.VITE_STUDENT_APP_URL || 'http://localhost:5174'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50"
                onClick={() => setIsOpen(false)}
              >
                <LogIn size={20} /> Student Login
              </a>
              <button
                onClick={() => { openPopup(); setIsOpen(false); }}
                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 shadow-lg shadow-indigo-100"
              >
                Get Free Quote
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
