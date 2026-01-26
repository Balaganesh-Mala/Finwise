import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { BookOpen, Award, Clock, TrendingUp, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Dashboard = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            setUser(user);
        });
    }, []);

    // Mock Data for Analytics
    const activityData = [
        { name: 'Mon', hours: 2 },
        { name: 'Tue', hours: 4 },
        { name: 'Wed', hours: 1 },
        { name: 'Thu', hours: 5 },
        { name: 'Fri', hours: 3 },
        { name: 'Sat', hours: 6 },
        { name: 'Sun', hours: 2 },
    ];

    const progressData = [
        { name: 'Completed', value: 3, color: '#10B981' }, // Green
        { name: 'In Progress', value: 4, color: '#6366F1' }, // Indigo
        { name: 'Not Started', value: 2, color: '#E5E7EB' }, // Gray
    ];

    const stats = [
        { label: 'Enrolled Courses', value: '9', icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50', trend: '+2 this month' },
        { label: 'Certificates Earned', value: '3', icon: Award, color: 'text-green-600', bg: 'bg-green-50', trend: 'Top 10% of students' },
        { label: 'Hours Learned', value: '23h', icon: Clock, color: 'text-purple-600', bg: 'bg-purple-50', trend: '+5h this week' },
        { label: 'Avg. Quiz Score', value: '88%', icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50', trend: '+12% improvement' },
    ];

    return (
        <div>
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        Welcome back, {user?.user_metadata?.full_name || 'Student'}! 👋
                    </h1>
                    <p className="text-gray-500 mt-1">Here is an overview of your learning progress.</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 bg-white px-4 py-2 rounded-lg border border-gray-200">
                    <Calendar size={16} />
                    <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
                                <stat.icon size={24} />
                            </div>
                            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">{stat.trend}</span>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium mb-1">{stat.label}</p>
                            <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Analytics Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">

                {/* Activity Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-800 mb-6">Weekly Learning Activity</h2>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                            <BarChart data={activityData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                                <Tooltip
                                    cursor={{ fill: '#F9FAFB' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Bar dataKey="hours" fill="#6366F1" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Progress Chart */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-800 mb-6">Course Progress</h2>
                    <div style={{ width: '100%', height: 300, position: 'relative' }}>
                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                            <PieChart>
                                <Pie
                                    data={progressData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {progressData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Center Text */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-3xl font-bold text-gray-900">78%</span>
                            <span className="text-xs text-gray-400 font-medium">Avg. Completion</span>
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="flex justify-center gap-4 mt-4">
                        {progressData.map((item, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                <span className="text-xs text-gray-500">{item.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Activity / Enrolled Courses Placeholder */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-gray-800">Recent Activity</h2>
                    <button className="text-indigo-600 text-sm font-medium hover:underline">View All</button>
                </div>

                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold shrink-0">
                                <BookOpen size={18} />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-medium text-gray-900 text-sm">Completed Module: React Hooks</h4>
                                <p className="text-xs text-gray-500 mt-0.5">Full Stack Web Development</p>
                            </div>
                            <span className="text-xs text-gray-400">2h ago</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
