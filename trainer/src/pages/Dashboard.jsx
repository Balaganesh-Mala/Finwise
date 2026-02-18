import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users, MessageSquare, TrendingUp, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard = () => {
    const { API_URL, user } = useAuth();
    const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const [stats, setStats] = useState(null);
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('trainerToken');
                const headers = { Authorization: `Bearer ${token}` };

                const [statsRes, meetingsRes] = await Promise.all([
                    axios.get(`${API_URL}/dashboard`, { headers }),
                    axios.get(`${BASE_URL}/api/admin/meetings`, { headers })
                ]);

                console.log("Dashboard Stats:", statsRes.data);
                console.log("Meetings API Response:", meetingsRes.data);

                setStats(statsRes.data);
                // Filter for upcoming meetings - REMOVED FILTER FOR DEBUGGING
                setMeetings(meetingsRes.data);
                console.log("Meetings State Set To:", meetingsRes.data);
            } catch (error) {
                console.error("Error fetching data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [API_URL]);

    if (loading) return (
        <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
                    <p className="text-muted-foreground mt-1">Welcome back, {user?.name}</p>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">
                        {user?.role || 'Trainer'}
                    </span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Total Classes</CardTitle>
                        <Calendar className="h-4 w-4 text-indigo-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{stats?.totalClasses || 0}</div>
                        <p className="text-xs text-muted-foreground">Sessions Conducted</p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Students</CardTitle>
                        <Users className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{stats?.studentsCount || 0}</div>
                        <p className="text-xs text-muted-foreground">Active Learners</p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Assigned Courses</CardTitle>
                        <TrendingUp className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{stats?.coursesCount || 0}</div>
                        <p className="text-xs text-muted-foreground">Courses Managed</p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow bg-gradient-to-br from-indigo-600 to-purple-700 text-white border-none">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-indigo-100">Performance</CardTitle>
                        <TrendingUp className="h-4 w-4 text-white" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Good</div>
                        <p className="text-xs text-indigo-200">Keep it up!</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                {/* Today's Schedule */}
                <Card className="col-span-4 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Today's Schedule</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {stats?.todaysClasses?.length > 0 ? (
                            <ul className="space-y-4">
                                {stats.todaysClasses.map(cls => (
                                    <li key={cls._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-white hover:shadow-sm transition-all">
                                        <div className="flex items-center space-x-4">
                                            <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                                                <Calendar size={20} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">{cls.topic}</p>
                                                <p className="text-xs text-gray-500">
                                                    Batch: <span className="font-medium text-gray-700">{cls.batchId?.name || 'General'}</span>
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-bold text-gray-900">
                                                {new Date(cls.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                            {cls.meetingLink && (
                                                <a href={cls.meetingLink} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:underline">
                                                    Join Link
                                                </a>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="text-center py-8">
                                <div className="bg-gray-50 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                                    <Calendar className="text-gray-400" size={20} />
                                </div>
                                <h3 className="text-sm font-medium text-gray-900">No classes today</h3>
                                <p className="text-xs text-gray-500 mt-1">Enjoy your free time!</p>
                            </div>
                        )}


                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="col-span-3 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-3">
                        <a href="/attendance" className="flex items-center p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors group">
                            <div className="p-2 bg-green-100 text-green-600 rounded-lg mr-3 group-hover:bg-green-200 transition-colors">
                                <Users size={18} />
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-gray-900">Mark Attendance</h4>
                                <p className="text-xs text-gray-500">Log daily attendance</p>
                            </div>
                        </a>

                        <a href="/students" className="flex items-center p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors group">
                            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg mr-3 group-hover:bg-blue-200 transition-colors">
                                <MessageSquare size={18} />
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-gray-900">View Students</h4>
                                <p className="text-xs text-gray-500">Manage student progress</p>
                            </div>
                        </a>

                        <a href="/my-qr" className="flex items-center p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors group">
                            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg mr-3 group-hover:bg-purple-200 transition-colors">
                                <TrendingUp size={18} />
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-gray-900">My QR Code</h4>
                                <p className="text-xs text-gray-500">Share your profile</p>
                            </div>
                        </a>
                    </CardContent>
                </Card>

                {/* Staff Meetings Card */}
                {/* Staff Meetings Card */}
                <Card className="col-span-full shadow-sm border-l-4 border-l-indigo-500">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center">
                            <Users className="mr-2 h-5 w-5 text-indigo-600" />
                            Upcoming Staff Meetings
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {meetings.length > 0 ? (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {meetings.map(meeting => (
                                    <div key={meeting._id} className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 hover:border-indigo-200 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-gray-900">{meeting.title}</h4>
                                            {meeting.link && (
                                                <a href={meeting.link} target="_blank" rel="noopener noreferrer" className="text-xs bg-indigo-600 text-white px-3 py-1 rounded-full font-medium hover:bg-indigo-700 transition-colors">
                                                    Join
                                                </a>
                                            )}
                                        </div>

                                        <div className="flex items-center text-xs text-gray-500 mb-3 space-x-3">
                                            <span className="flex items-center bg-white px-2 py-1 rounded border border-gray-100 shadow-sm">
                                                <Calendar size={12} className="mr-1 text-indigo-500" />
                                                {new Date(meeting.date).toLocaleDateString()}
                                            </span>
                                            <span className="flex items-center bg-white px-2 py-1 rounded border border-gray-100 shadow-sm">
                                                <Clock size={12} className="mr-1 text-indigo-500 h-3 w-3" />
                                                {meeting.time}
                                            </span>
                                        </div>

                                        {meeting.description && (
                                            <p className="text-sm text-gray-600 leading-relaxed bg-white p-3 rounded-lg border border-gray-100 text-pretty">
                                                {meeting.description}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                No upcoming staff meetings scheduled.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;
