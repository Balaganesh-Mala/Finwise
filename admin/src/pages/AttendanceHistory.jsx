import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const AttendanceHistory = () => {
    const [loading, setLoading] = useState(false);
    const [records, setRecords] = useState([]);
    const [filters, setFilters] = useState({
        startDate: new Date().toISOString().split('T')[0], // Default to today
        endDate: new Date().toISOString().split('T')[0]
    });

    const fetchHistory = async (overrideFilters = null) => {
        try {
            setLoading(true);
            const activeFilters = overrideFilters || filters;
            const queryParams = new URLSearchParams({
                startDate: activeFilters.startDate,
                endDate: activeFilters.endDate
            }).toString();

            const res = await axios.get(`http://localhost:5000/api/attendance/history?${queryParams}`);
            setRecords(res.data);
            if (res.data.length === 0) {
                toast.success('No records found for this period');
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch history');
        } finally {
            setLoading(false);
        }
    };

    // Initial load
    useEffect(() => {
        fetchHistory();
    }, []);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchHistory();
    };

    const handleClear = () => {
        const emptyFilters = { startDate: '', endDate: '' };
        setFilters(emptyFilters);
        fetchHistory(emptyFilters);
    };

    return (
        <div className="bg-gray-50 min-h-screen p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Attendance History</h1>
                    <p className="text-gray-500 mt-1">View and filter student check-in records</p>
                </div>

                {/* Filter Card */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
                    <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-1 w-full">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                            <input
                                type="date"
                                name="startDate"
                                value={filters.startDate}
                                onChange={handleFilterChange}
                                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                            />
                        </div>
                        <div className="flex-1 w-full">
                            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                            <input
                                type="date"
                                name="endDate"
                                value={filters.endDate}
                                onChange={handleFilterChange}
                                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                            />
                        </div>
                        <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 md:flex-initial bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                            >
                                {loading ? (
                                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                )}
                                Filter Records
                            </button>
                            <button
                                type="button"
                                onClick={handleClear}
                                className="flex-1 md:flex-initial bg-white border border-slate-300 text-slate-700 font-medium py-2.5 px-6 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                                Clear
                            </button>
                        </div>
                    </form>
                </div>

                {/* Results Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-gray-800">Records Found</h2>
                        <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">
                            {records.length}
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Date & Time</th>
                                    <th className="px-6 py-4">Student</th>
                                    <th className="px-6 py-4">Email</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Method</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                                {records.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                            No attendance records found for the selected range.
                                        </td>
                                    </tr>
                                ) : (
                                    records.map((record) => (
                                        <tr key={record._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 text-gray-600 font-mono">
                                                {new Date(record.date).toLocaleDateString()} <span className="text-gray-400">|</span> {new Date(record.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-gray-900">
                                                {record.studentId?.name || 'Unknown Student'}
                                            </td>
                                            <td className="px-6 py-4 text-gray-500">
                                                {record.studentId?.email}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${record.status === 'present' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {record.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 capitalize">
                                                {record.method}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AttendanceHistory;
