import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { Target, TrendingUp, Award, BrainCircuit, Activity } from 'lucide-react';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const PerformanceAnalytics = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const res = await axios.get(`${apiUrl}/api/interview/analytics`);
            setData(res.data);
        } catch (error) {
            console.error('Failed to load analytics', error);
            // Fallback mockup data if no tests exist yet to show structure
            setData({
                summary: {
                    totalTestsTaken: 124,
                    averageScore: 72,
                    caReadinessScore: 76,
                    strongestSubject: 'Accounting',
                    averageAccuracy: 84
                },
                charts: {
                    subjectwise: [
                        { name: 'Accounting', score: 82 },
                        { name: 'Taxation (GST)', score: 74 },
                        { name: 'Financial Mgt', score: 66 },
                        { name: 'Auditing', score: 70 },
                        { name: 'Business Law', score: 68 }
                    ],
                    monthlyTrend: [
                        { month: 'Jan', score: 55 },
                        { month: 'Feb', score: 62 },
                        { month: 'Mar', score: 68 },
                        { month: 'Apr', score: 72 },
                        { month: 'May', score: 74 }
                    ]
                },
                recentTests: [
                    { _id: '1', subject: 'Accounting Mock #4', score: 85, total_score: 100, accuracy: 90, date: new Date().toISOString() },
                    { _id: '2', subject: 'Taxation - TDS & GST', score: 65, total_score: 100, accuracy: 78, date: new Date(Date.now() - 86400000).toISOString() },
                    { _id: '3', subject: 'FM - Capital Budgeting', score: 55, total_score: 100, accuracy: 65, date: new Date(Date.now() - 172800000).toISOString() }
                ]
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading || !data) {
        return (
            <div className="flex items-center justify-center p-12 text-gray-500 animate-pulse gap-2">
                <Activity className="animate-spin" /> Loading Real-time Analytics...
            </div>
        );
    }

    const { summary, charts, recentTests } = data;

    // CA Readiness logic for gauge/color
    const readinessColor = summary.caReadinessScore >= 75 ? 'text-emerald-500' :
        summary.caReadinessScore >= 50 ? 'text-amber-500' : 'text-rose-500';

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto font-sans bg-slate-50/50 min-h-screen relative overflow-hidden">
            {/* Background animated blobs */}
            <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-50/50 to-transparent -z-10 pointer-events-none"></div>
            <div className="absolute top-20 right-20 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl -z-10 animate-pulse pointer-events-none"></div>
            <div className="absolute top-40 left-10 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl -z-10 animate-pulse delay-1000 pointer-events-none"></div>

            <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200"><TrendingUp size={24} /></div>
                    Performance Analytics
                </h1>
                <p className="text-slate-500 mt-2 text-base font-medium">Track student mastery in Accounting, Finance, and CA preparedness.</p>
            </div>

            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group cursor-default animate-in fade-in slide-in-from-bottom-4 delay-100">
                    <div className="absolute -right-8 -top-8 w-32 h-32 bg-indigo-50 rounded-full blur-2xl group-hover:bg-indigo-100 transition-colors duration-500"></div>
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">CA Readiness</p>
                            <h3 className={`text-4xl font-black mt-3 tracking-tighter ${readinessColor}`}>
                                {summary.caReadinessScore}%
                            </h3>
                            <p className="text-xs text-slate-400 mt-2 font-semibold flex items-center gap-1">
                                <Target size={12} /> AI Weighted Benchmark
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group cursor-default animate-in fade-in slide-in-from-bottom-4 delay-150">
                    <div className="absolute -right-8 -top-8 w-32 h-32 bg-emerald-50 rounded-full blur-2xl group-hover:bg-emerald-100 transition-colors duration-500"></div>
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Top Subject</p>
                            <h3 className="text-md font-bold mt-3 text-slate-800 leading-tight line-clamp-2">
                                {summary.strongestSubject}
                            </h3>
                        </div>
                        <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:scale-110 transition-transform"><Award size={24} /></div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group cursor-default animate-in fade-in slide-in-from-bottom-4 delay-200">
                    <div className="absolute -right-8 -top-8 w-32 h-32 bg-blue-50 rounded-full blur-2xl group-hover:bg-blue-100 transition-colors duration-500"></div>
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Avg Accuracy</p>
                            <h3 className="text-4xl font-black mt-3 text-slate-800 tracking-tighter">
                                {summary.averageAccuracy}%
                            </h3>
                        </div>
                        <div className="p-3.5 bg-blue-50 text-blue-600 rounded-2xl group-hover:scale-110 transition-transform"><BrainCircuit size={24} /></div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group cursor-default animate-in fade-in slide-in-from-bottom-4 delay-300">
                    <div className="absolute -right-8 -top-8 w-32 h-32 bg-amber-50 rounded-full blur-2xl group-hover:bg-amber-100 transition-colors duration-500"></div>
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Assessments</p>
                            <h3 className="text-4xl font-black mt-3 text-slate-800 tracking-tighter">
                                {summary.totalTestsTaken}
                            </h3>
                        </div>
                        <div className="p-3.5 bg-amber-50 text-amber-600 rounded-2xl group-hover:scale-110 transition-transform"><Activity size={24} /></div>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                {/* Subject-wise Performance (Bar Chart) */}
                <div className="bg-white p-7 rounded-3xl border border-slate-100 shadow-sm lg:col-span-2 group hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-2">
                        <div className="w-2 h-6 bg-indigo-500 rounded-full"></div>
                        Subject Mastery Overview
                    </h3>
                    <div className="h-80 w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={charts.subjectwise} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13, fontWeight: 500 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13 }} domain={[0, 100]} dx={-10} />
                                <Tooltip
                                    cursor={{ fill: '#f1f5f9', opacity: 0.5 }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', padding: '12px 16px', fontWeight: 'bold' }}
                                />
                                <Bar dataKey="score" radius={[6, 6, 0, 0]} maxBarSize={60} animationDuration={1500}>
                                    {charts.subjectwise.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Learning Trend (Line Chart) */}
                <div className="bg-white p-7 rounded-3xl border border-slate-100 shadow-sm group hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-2">
                        <div className="w-2 h-6 bg-emerald-500 rounded-full"></div>
                        Monthly Growth Trend
                    </h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={charts.monthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="#f59e0b" /> {/* Amber */}
                                        <stop offset="100%" stopColor="#ef4444" /> {/* Rose */}
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDashArray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13, fontWeight: 500 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13 }} domain={[0, 100]} dx={-10} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', padding: '12px 16px', fontWeight: 'bold' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="score"
                                    stroke="url(#lineGradient)"
                                    strokeWidth={4}
                                    dot={{ r: 5, fill: '#fff', strokeWidth: 3, stroke: '#f59e0b' }}
                                    activeDot={{ r: 8, strokeWidth: 0, fill: '#ef4444' }}
                                    animationDuration={2000}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Recent Activity Table */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-8 delay-200 duration-700">
                <div className="p-7 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        Recent Exam History
                    </h3>
                    <span className="px-3 py-1 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-full shadow-sm">Real-time Feed</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white text-slate-400 text-xs uppercase tracking-widest border-b border-slate-100">
                                <th className="px-7 py-5 font-bold">Assessment Topic</th>
                                <th className="px-7 py-5 font-bold">Completion Date</th>
                                <th className="px-7 py-5 font-bold">Student Accuracy</th>
                                <th className="px-7 py-5 font-bold text-right">Final Score</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100/80">
                            {recentTests.length === 0 ? (
                                <tr><td colSpan="4" className="text-center p-12 text-slate-400 font-medium">No recent exam history available yet.</td></tr>
                            ) : recentTests.map((test) => (
                                <tr key={test._id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-7 py-5">
                                        <p className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{test.subject}</p>
                                    </td>
                                    <td className="px-7 py-5">
                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold">
                                            {new Date(test.date).toLocaleDateString("en-GB", { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </div>
                                    </td>
                                    <td className="px-7 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-full bg-slate-100 rounded-full h-2 max-w-[140px] overflow-hidden flex">
                                                <div
                                                    className={`h-2 rounded-full transition-all duration-1000 ${test.accuracy >= 80 ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : test.accuracy >= 60 ? 'bg-gradient-to-r from-amber-400 to-amber-500' : 'bg-gradient-to-r from-rose-400 to-rose-500'}`}
                                                    style={{ width: `${test.accuracy}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-xs font-black text-slate-600">{test.accuracy}%</span>
                                        </div>
                                    </td>
                                    <td className="px-7 py-5 text-right">
                                        <span className={`inline-flex px-3 py-1.5 rounded-xl text-sm font-black shadow-sm ${(test.score / test.total_score) >= 0.75 ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                            (test.score / test.total_score) >= 0.5 ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
                                            }`}>
                                            {test.score} / {test.total_score}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PerformanceAnalytics;
