import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users, MessageSquare, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard = () => {
    const { API_URL, user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('trainerToken');
                const res = await axios.get(`${API_URL}/dashboard`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setStats(res.data);
            } catch (error) {
                console.error("Error fetching stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [API_URL]);

    if (loading) return <div>Loading dashboard...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">Welcome back, {user?.name}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalClasses || 0}</div>
                        <p className="text-xs text-muted-foreground">Assigned Batches</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Students</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">~</div>
                        <p className="text-xs text-muted-foreground">Active Students</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Today's Schedule</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {stats?.todaysClasses?.length > 0 ? (
                            <ul className="space-y-4">
                                {stats.todaysClasses.map(cls => (
                                    <li key={cls._id} className="flex items-center border-b pb-2">
                                        <div className="ml-4 space-y-1">
                                            <p className="text-sm font-medium leading-none">{cls.topic}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {new Date(cls.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-muted-foreground">No classes scheduled for today.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;
