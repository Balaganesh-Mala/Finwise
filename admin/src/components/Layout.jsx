import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import axios from 'axios';
import {
  LayoutDashboard,
  Image,
  BookOpen,
  MessageSquare,
  Briefcase,
  FileText,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  ChevronDown,
  QrCode,
  Calendar
} from 'lucide-react';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [inquiryCount, setInquiryCount] = useState(0);
  const [settings, setSettings] = useState({ siteTitle: 'JobReady', logoUrl: '' });
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Fetch settings, inquiry count, and current user
  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

        // Parallel fetch for efficiency
        const [settingsRes, inquiriesRes, authRes] = await Promise.all([
          axios.get(`${apiUrl}/api/settings`),
          axios.get(`${apiUrl}/api/inquiries`),
          supabase.auth.getUser()
        ]);

        if (settingsRes.data) {
          setSettings(prev => ({ ...prev, ...settingsRes.data }));
        }

        const newCount = inquiriesRes.data.filter(i => i.status === 'new').length;
        setInquiryCount(newCount);

        if (authRes.data.user) {
          setUser(authRes.data.user);
        }

      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };

    fetchData();
  }, [location.pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Students', path: '/students', icon: Users },
    { name: 'Banners', path: '/banners', icon: Image },
    { name: 'Courses', path: '/courses', icon: BookOpen }, // Re-verified
    { name: 'Inquiries', path: '/inquiries', icon: MessageSquare, badge: inquiryCount > 0 ? inquiryCount : null },
    { name: 'Jobs', path: '/jobs', icon: Briefcase },
    { name: 'Applications', path: '/applications', icon: FileText },
    { name: 'Attendance Scanner', path: '/attendance/qr-scanner', icon: QrCode },
    { name: 'Att. History', path: '/attendance/history', icon: Calendar },
    { name: 'Blogs', path: '/blogs', icon: FileText },
    { name: 'Reviews', path: '/reviews', icon: Users },
    { name: 'Settings', path: '/settings', icon: Settings },
    { name: 'Trainers', path: '/trainers', icon: Users },
    { name: 'Test Bank', path: '/tests', icon: FileText },
  ];

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#0F172A] text-white transform transition-transform duration-300 ease-out border-r border-[#1E293B] ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 flex flex-col shadow-2xl`}
      >
        {/* Sidebar Header */}
        <div className="h-20 flex items-center px-6 border-b border-[#1E293B]">
          <div className="flex items-center gap-3">
            {settings.logoUrl ? (
              <img src={settings.logoUrl} alt="Logo" className="h-10 w-10 object-contain" />
            ) : (
              <div className="h-10 w-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/20">
                {settings.siteTitle.charAt(0)}
              </div>
            )}
            <div>
              <span className="block text-lg font-bold tracking-tight text-white leading-none">
                {settings.siteTitle}
              </span>
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">
                Admin Portal
              </span>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden ml-auto text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5 no-scrollbar">
          <div className="px-4 mb-4 text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <span className="w-8 h-[1px] bg-slate-700"></span>
            Menu
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`group flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-200 border border-transparent ${isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                  }`}
              >
                <div className="flex items-center gap-3.5">
                  <Icon
                    size={20}
                    strokeWidth={isActive ? 2 : 1.5}
                    className={`transition-colors ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`}
                  />
                  <span className="text-sm font-medium tracking-wide">{item.name}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-blue-500/10 text-blue-400'}`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 mx-4 mb-4 bg-slate-800/30 rounded-2xl border border-slate-700/30 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-3 px-1">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold border-2 border-[#0F172A] shadow-sm">
              A
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-white truncate">Administrator</p>
              <p className="text-xs text-slate-400 truncate">admin@jobready.com</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-[#0F172A] text-slate-400 border border-slate-700 hover:border-red-500/30 hover:text-red-400 hover:bg-red-500/5 transition-all text-sm font-medium"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">

        {/* Navbar */}
        <header className="h-20 flex items-center justify-between px-8 bg-white border-b border-gray-100 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <Menu size={24} />
            </button>

            {/* Breadcrumb / Title */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
                {navItems.find(i => i.path === location.pathname)?.name || 'Dashboard'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-5">
            {/* Search Bar */}
            <div className="hidden lg:flex items-center bg-gray-50 px-4 py-2.5 rounded-full border border-gray-100 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all w-72">
              <Search size={18} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search anything..."
                className="bg-transparent border-none outline-none text-sm ml-3 w-full text-gray-600 placeholder-gray-400"
              />
            </div>

            <div className="flex items-center gap-3">
              <button className="relative p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors border border-transparent hover:border-blue-100">
                <Bell size={20} />
                {inquiryCount > 0 && (
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                )}
              </button>

              <div className="h-8 w-[1px] bg-gray-200 mx-1"></div>

              <button className="flex items-center gap-2 p-1.5 pr-3 text-gray-600 hover:bg-gray-50 rounded-full transition-colors border border-transparent hover:border-gray-200">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                  A
                </div>
                <span className="text-sm font-medium hidden sm:block">Admin</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 lg:p-10 bg-[#F8FAFC]">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
