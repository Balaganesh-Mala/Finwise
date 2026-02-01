import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Search, Filter } from 'lucide-react';

const AttendanceHistory = () => {
    const [loading, setLoading] = useState(false);
    const [records, setRecords] = useState([]);
    const [filters, setFilters] = useState({
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });

    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('studentUser');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const fetchHistory = async (overrideFilters = null) => {
        if (!user) return;

        try {
            setLoading(true);
            const activeFilters = overrideFilters || filters;

            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const queryParams = new URLSearchParams({
                startDate: activeFilters.startDate,
                endDate: activeFilters.endDate,
                studentId: user._id // Send Mongo ID
            }).toString();

            const res = await axios.get(`${API_URL}/api/attendance/history?${queryParams}`);
            setRecords(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch when user is loaded or filters change? 
    // Let's trigger manually or on mount if user exists
    useEffect(() => {
        if (user) {
            fetchHistory();
        }
    }, [user]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        fetchHistory();
    };

    const handleClear = () => {
        const emptyFilters = { startDate: '', endDate: '' };
        setFilters(emptyFilters);
        fetchHistory(emptyFilters);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Attendance</h1>
                    <p className="text-gray-500 text-sm">Track your daily check-ins</p>
                </div>
            </div>

            {/* Filter */}
            <div className="bg-white p-4 rounded shadow-sm border border-gray-200">
                <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="w-full md:w-auto">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <input
                            type="date"
                            name="startDate"
                            value={filters.startDate}
                            onChange={handleFilterChange}
                            className="w-full md:w-48 rounded border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-2"
                        />
                    </div>
                    <div className="w-full md:w-auto">
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <input
                            type="date"
                            name="endDate"
                            value={filters.endDate}
                            onChange={handleFilterChange}
                            className="w-full md:w-48 rounded border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-2"
                        />
                    </div>

                    <div className="flex gap-2 w-full md:w-auto">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors font-medium flex items-center gap-2"
                        >
                            <Filter size={16} />
                            Filter
                        </button>
                        <button
                            type="button"
                            onClick={handleClear}
                            className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded hover:bg-gray-50 transition-colors font-medium"
                        >
                            Clear
                        </button>
                    </div>
                </form>
            </div>

            {/* List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h2 className="font-semibold text-gray-800">History Log</h2>
                    <span className="text-xs font-medium bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">{records.length} Records</span>
                </div>

                <div className="overflow-x-auto">
                    {records.length === 0 ? (
                        <div className="p-12 text-center text-gray-400">
                            <Calendar size={48} className="mx-auto mb-3 opacity-20" />
                            <p>No records found for this period.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                                <tr>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Time</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Confirmation</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {records.map(record => (
                                    <tr key={record._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-gray-900 font-medium">
                                            {new Date(record.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 font-mono text-sm">
                                            {new Date(record.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 capitalize">
                                                {record.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right text-xs text-gray-400">
                                            {record.method === 'qr' ? 'Verified via QR' : 'Manual Entry'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AttendanceHistory;
