import React, { useEffect, useState } from 'react';
import { Users, BookOpen, MessageSquare, Briefcase, Plus, FileText, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar 
} from 'recharts';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalStudents: 0,
        activeCourses: 0,
        newInquiries: 0,
        activeJobs: 0,
        recentInquiries: [],
        monthlyInquiries: [],
        courseInterest: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/analytics`);
                if (res.data.success) {
                    setStats(res.data.data);
                }
            } catch (err) {
                console.error('Error fetching analytics:', err);
                setError('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const statCards = [
        { title: 'Total Students', value: stats.totalStudents, icon: Users, color: 'bg-indigo-600', textColor: 'text-indigo-600' },
        { title: 'Active Courses', value: stats.activeCourses, icon: BookOpen, color: 'bg-emerald-500', textColor: 'text-emerald-500' },
        { title: 'New Inquiries', value: stats.newInquiries, icon: MessageSquare, color: 'bg-amber-500', textColor: 'text-amber-500' },
        { title: 'Active Jobs', value: stats.activeJobs, icon: Briefcase, color: 'bg-blue-500', textColor: 'text-blue-500' },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
          <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleTimeString()}</p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 flex items-center space-x-4 transition-transform hover:-translate-y-1 duration-300">
                 <div className={`p-3 rounded-xl ${stat.color} bg-opacity-10`}>
                    <stat.icon size={24} className={stat.textColor} />
                 </div>
                 <div>
                    <p className="text-gray-500 text-sm font-medium mb-1">{stat.title}</p>
                    <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                 </div>
            </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Inquiry Growth</h2>
              <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={stats.monthlyInquiries} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                          <defs>
                              <linearGradient id="colorInquiries" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/>
                                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                              </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                          <XAxis 
                            dataKey="_id" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#9ca3af', fontSize: 12 }} 
                            dy={10}
                          />
                          <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#9ca3af', fontSize: 12 }} 
                          />
                          <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          />
                          <Area type="monotone" dataKey="count" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorInquiries)" />
                      </AreaChart>
                  </ResponsiveContainer>
              </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Popular Courses</h2>
              <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.courseInterest} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f3f4f6" />
                          <XAxis type="number" hide />
                          <YAxis 
                            dataKey="_id" 
                            type="category" 
                            width={140}
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#4b5563', fontSize: 13, fontWeight: 500 }} 
                          />
                          <Tooltip 
                             cursor={{ fill: '#f9fafb' }}
                             contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          />
                          <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} barSize={32} />
                      </BarChart>
                  </ResponsiveContainer>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Inquiries */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-gray-900">Recent Inquiries</h2>
                  <Link to="/inquiries" className="text-sm text-indigo-600 font-medium hover:text-indigo-700 flex items-center gap-1">
                      View All <ArrowRight size={16} />
                  </Link>
              </div>
              
              <div className="space-y-4">
                  {stats.recentInquiries.length > 0 ? (
                      stats.recentInquiries.map((inquiry) => (
                          <div key={inquiry._id} className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors border border-gray-50 hover:border-gray-100 group">
                              <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                                      {inquiry.name.charAt(0)}
                                  </div>
                                  <div>
                                      <p className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">{inquiry.name}</p>
                                      <p className="text-sm text-gray-500">{inquiry.courseInterested || 'General Inquiry'}</p>
                                  </div>
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                                      inquiry.status === 'new' ? 'bg-green-100 text-green-700' : 
                                      inquiry.status === 'contacted' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                                  }`}>
                                      {inquiry.status ? inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1) : 'New'}
                                  </span>
                                  <span className="text-xs text-gray-400">
                                      {new Date(inquiry.createdAt).toLocaleDateString()}
                                  </span>
                              </div>
                          </div>
                      ))
                  ) : (
                      <div className="text-center py-10 text-gray-400">
                          <MessageSquare size={48} className="mx-auto mb-3 opacity-20" />
                          <p>No inquiries found yet.</p>
                      </div>
                  )}
              </div>
          </div>

          {/* Quick Actions */}
           <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 gap-4 flex-1">
                  <Link to="/courses/new" className="flex items-center gap-3 p-4 rounded-xl bg-indigo-50 text-indigo-700 font-medium hover:bg-indigo-100 transition-colors border border-indigo-100">
                     <div className="p-2 bg-white rounded-lg text-indigo-600">
                         <Plus size={20} />
                     </div>
                     <span>Add New Course</span>
                  </Link>
                  
                  <Link to="/jobs/new" className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 text-blue-700 font-medium hover:bg-blue-100 transition-colors border border-blue-100">
                     <div className="p-2 bg-white rounded-lg text-blue-600">
                         <Briefcase size={20} />
                     </div>
                     <span>Post New Job</span>
                  </Link>
                  
                  <Link to="/blogs/new" className="flex items-center gap-3 p-4 rounded-xl bg-purple-50 text-purple-700 font-medium hover:bg-purple-100 transition-colors border border-purple-100">
                     <div className="p-2 bg-white rounded-lg text-purple-600">
                         <FileText size={20} />
                     </div>
                     <span>Write Blog Post</span>
                  </Link>
                  
                  <Link to="/inquiries" className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 text-amber-700 font-medium hover:bg-amber-100 transition-colors border border-amber-100">
                     <div className="p-2 bg-white rounded-lg text-amber-600">
                         <MessageSquare size={20} />
                     </div>
                     <span>View Inquiries</span>
                  </Link>
              </div>
           </div>
      </div>
    </div>
  );
};

export default Dashboard;
