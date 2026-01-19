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
  X 
} from 'lucide-react';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [inquiryCount, setInquiryCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  // Fetch new inquiry count
  const fetchInquiryCount = async () => {
      try {
          // In a real app, optimize this to only get count
          const res = await axios.get('http://localhost:5000/api/inquiries');
          const newCount = res.data.filter(i => i.status === 'new').length;
          setInquiryCount(newCount);
      } catch (err) {
          console.error('Error fetching inquiry count:', err);
      }
  };

  useEffect(() => {
      fetchInquiryCount();
      
      // Setup a simple polling or refetch when location changes (status might change in Inquiries page)
      // This is a basic way to keep sidebar synced without complex global state
      fetchInquiryCount();
  }, [location.pathname]); // Refetch when navigating (e.g. back from another page)

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
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-indigo-900 text-white transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}
      >
        <div className="flex items-center justify-between p-4 border-b border-indigo-800">
          <span className="text-2xl font-bold tracking-wider">JobReady</span>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden">
            <X size={24} />
          </button>
        </div>

        <nav className="mt-8 px-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-indigo-700 text-white' : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'}`}
              >
                <div className="flex items-center space-x-3">
                    <Icon size={20} />
                    <span className="font-medium">{item.name}</span>
                </div>
                {item.badge && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {item.badge}
                    </span>
                )}
              </Link>
            );
          })}
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-300 hover:bg-red-900/20 hover:text-red-100 transition-colors mt-8"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6 z-10">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden text-gray-600">
            <Menu size={24} />
          </button>
          
          <div className="flex items-center space-x-4 ml-auto">
             <div className="flex items-center space-x-2">
                 <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                     A
                 </div>
                 <span className="text-sm font-medium text-gray-700">Administrator</span>
             </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
           <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
