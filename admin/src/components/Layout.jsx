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
  ChevronDown
} from 'lucide-react';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [inquiryCount, setInquiryCount] = useState(0);
  const [settings, setSettings] = useState({ siteTitle: 'JobReady', logoUrl: '' });
  const location = useLocation();
  const navigate = useNavigate();

  // Fetch settings and inquiry count
  useEffect(() => {
      const fetchData = async () => {
          try {
              const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
              
              const [settingsRes, inquiriesRes] = await Promise.all([
                  axios.get(`${apiUrl}/api/settings`),
                  axios.get(`${apiUrl}/api/inquiries`)
              ]);

              if (settingsRes.data) {
                  setSettings(prev => ({ ...prev, ...settingsRes.data }));
              }

              const newCount = inquiriesRes.data.filter(i => i.status === 'new').length;
              setInquiryCount(newCount);

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
    { name: 'Courses', path: '/courses', icon: BookOpen },
    { name: 'Inquiries', path: '/inquiries', icon: MessageSquare, badge: inquiryCount > 0 ? inquiryCount : null },
    { name: 'Jobs', path: '/jobs', icon: Briefcase },
    { name: 'Blogs', path: '/blogs', icon: FileText },
    { name: 'Reviews', path: '/reviews', icon: Users },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-slate-100 font-sans">
      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-600/20 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-gray-900 text-white transform transition-transform duration-300 ease-out border-r border-gray-800 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 flex flex-col shadow-2xl`}
      >
        {/* Sidebar Header / Brand */}
        <div className="h-20 flex items-center px-8 border-b border-gray-800/50">
            <div className="flex items-center gap-3.5">
                {settings.logoUrl ? (
                    <img src={settings.logoUrl} alt="Logo" className="h-9 w-9 object-contain" />
                ) : (
                    <div className="h-9 w-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-500/30">
                        {settings.siteTitle.charAt(0)}
                    </div>
                )}
                <span className="text-xl font-bold tracking-tight text-white truncate max-w-[160px]">
                    {settings.siteTitle}
                </span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden ml-auto text-gray-400 hover:text-white">
                <X size={24} />
            </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 no-scrollbar">
          <div className="px-4 mb-3 text-[11px] font-bold text-gray-500 uppercase tracking-widest">
              Pages
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`group flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 border border-transparent ${
                    isActive 
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-900/40' 
                    : 'text-gray-400 hover:bg-white/5 hover:text-gray-100'
                }`}
              >
                <div className="flex items-center gap-3.5">
                    <Icon 
                        size={20} 
                        strokeWidth={isActive ? 2.5 : 2}
                        className={`transition-colors ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'}`} 
                    />
                    <span className="text-sm font-medium tracking-wide">{item.name}</span>
                </div>
                {item.badge && (
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${isActive ? 'bg-white/20 text-white backdrop-blur-sm' : 'bg-rose-500/20 text-rose-400'}`}>
                        {item.badge}
                    </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 mx-4 mb-4 bg-gray-800/50 rounded-2xl border border-gray-700/50">
            <div className="flex items-center gap-3 mb-4 px-2">
                 <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold border-2 border-gray-900 shadow-sm">
                     A
                 </div>
                 <div className="overflow-hidden">
                     <p className="text-sm font-bold text-white truncate">Administrator</p>
                     <p className="text-xs text-gray-400 truncate">admin@jobready.com</p>
                 </div>
            </div>
            <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-gray-800 text-gray-300 border border-gray-700 hover:border-red-500/50 hover:text-red-400 hover:bg-red-500/10 transition-all text-sm font-medium shadow-sm hover:shadow-none"
            >
                <LogOut size={16} />
                <span>Sign Out</span>
            </button>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col overflow-hidden relative bg-white md:rounded-l-[3rem] md:my-2 md:mr-2 md:shadow-2xl md:shadow-gray-200/50 md:border md:border-gray-100 z-10 clip-path-container">
        
        {/* Navbar */}
        <header className="h-20 flex items-center justify-between px-8 z-10 bg-white/80 backdrop-blur-md sticky top-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                <Menu size={24} />
            </button>
            
            {/* Breadcrumb / Title dynamic based on path */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900 capitalize tracking-tight">
                    {navItems.find(i => i.path === location.pathname)?.name || 'Dashboard'}
                </h2>
                <p className="text-sm text-gray-500 hidden sm:block">
                   Welcome back, Administrator
                </p>
            </div>
          </div>
          
          <div className="flex items-center gap-5">
             {/* Search Bar */}
             <div className="hidden lg:flex items-center bg-gray-50 px-4 py-2.5 rounded-full border border-gray-100 focus-within:border-indigo-200 focus-within:ring-2 focus-within:ring-indigo-50 transition-all w-64">
                <Search size={18} className="text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Type to search..." 
                    className="bg-transparent border-none outline-none text-sm ml-3 w-full text-gray-600 placeholder-gray-400"
                />
             </div>

             <div className="flex items-center gap-2">
                <button className="relative p-2.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors border border-transparent hover:border-indigo-100">
                    <Bell size={20} />
                    {inquiryCount > 0 && (
                        <span className="absolute top-2 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
                    )}
                </button>
                
                <button className="p-2.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors border border-transparent hover:border-indigo-1000">
                    <Settings size={20} />
                </button>
             </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 lg:p-10 scroll-smooth">
           <div className="max-w-7xl mx-auto pb-10">
               <Outlet />
           </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
