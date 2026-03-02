import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Plus,
    Search,
    Filter,
    Download,
    Wallet,
    TrendingDown,
    Calendar,
    FileText,
    MoreVertical,
    Loader
} from 'lucide-react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip
} from 'recharts';
import toast from 'react-hot-toast';
import AddExpenseModal from '../components/AddExpenseModal';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function ExpenseManagement() {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');

    const [expenses, setExpenses] = useState([]);
    const [summary, setSummary] = useState({ totalExpenses: 0, categoryBreakdown: [] });
    const [loading, setLoading] = useState(true);

    const categories = ['All', 'Rent', 'Electricity', 'Wifi', 'Salaries', 'Marketing', 'Miscellaneous'];

    useEffect(() => {
        fetchExpenses();
        fetchSummary();
    }, []);

    const fetchExpenses = async () => {
        try {
            setLoading(true);
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const res = await axios.get(`${apiUrl}/api/expenses`);
            setExpenses(res.data);
        } catch (err) {
            toast.error('Failed to load expenses');
        } finally {
            setLoading(false);
        }
    };

    const fetchSummary = async () => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const res = await axios.get(`${apiUrl}/api/expenses/summary`);
            setSummary(res.data);
        } catch (err) {
            console.error('Failed to load expense summary', err);
        }
    };


    const displayData = expenses.filter(exp => {
        if (categoryFilter !== 'All' && exp.category !== categoryFilter) return false;
        if (searchTerm && !exp.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        return true;
    });

    const getCategoryColor = (category) => {
        const map = {
            'Rent': 'bg-blue-50 text-blue-700 border-blue-200',
            'Salaries': 'bg-emerald-50 text-emerald-700 border-emerald-200',
            'Marketing': 'bg-purple-50 text-purple-700 border-purple-200',
            'Electricity': 'bg-amber-50 text-amber-700 border-amber-200',
            'Wifi': 'bg-indigo-50 text-indigo-700 border-indigo-200',
            'Miscellaneous': 'bg-gray-50 text-gray-700 border-gray-200',
        };
        return map[category] || map['Miscellaneous'];
    };

    // Convert aggregation to chart format
    const chartData = summary.categoryBreakdown.map(item => ({
        name: item._id,
        value: item.totalAmount
    }));

    // Top 2 Spending
    const topCategories = [...summary.categoryBreakdown]
        .sort((a, b) => b.totalAmount - a.totalAmount)
        .slice(0, 2);

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Expense Management</h1>
                    <p className="text-sm text-gray-500 mt-1">Track outgoing costs, view bills, and analyze spending.</p>
                </div>
                <div className="flex gap-3">
                    <button className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm flex items-center gap-2">
                        <Download size={16} /> Export
                    </button>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
                        onClick={() => setIsAddModalOpen(true)}
                    >
                        <Plus size={18} /> Add Expense
                    </button>
                </div>
            </div>

            {/* Analytics Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Summary Stats */}
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
                                <Wallet size={20} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">All Time Recorded</p>
                            </div>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900 mb-1">₹{summary.totalExpenses.toLocaleString()}</h3>
                        <p className="text-sm flex items-center gap-1 text-emerald-600 font-medium opacity-0">
                            {/* Placeholder for trending */}
                            <TrendingDown size={16} /> Trending text
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
                        <p className="text-sm text-gray-500 font-medium mb-4">Highest Spend Categories</p>
                        <div className="space-y-4">
                            {topCategories.length > 0 ? topCategories.map((cat, idx) => {
                                const width = `${Math.min((cat.totalAmount / (summary.totalExpenses || 1)) * 100, 100)}%`;
                                return (
                                    <div key={idx}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-medium text-gray-700">{cat._id}</span>
                                            <span className="font-bold text-gray-900">₹{cat.totalAmount.toLocaleString()}</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                                            <div className="bg-blue-500 h-1.5 rounded-full" style={{ width }}></div>
                                        </div>
                                    </div>
                                )
                            }) : (
                                <span className="text-sm text-gray-400">Not enough data to graph top categories yet.</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Mini Pie Chart */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-sm font-bold text-gray-900 mb-4">Expense Distribution</h3>
                    <div className="h-[180px] w-full relative">
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={70}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-sm text-gray-400">No data</div>
                        )}
                        {/* Center Text */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-lg font-bold text-gray-900">{chartData.length}</span>
                            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Categories</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Expenses Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/50">
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setCategoryFilter(cat)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${categoryFilter === cat ? 'bg-white text-blue-600 shadow-sm border border-gray-200' : 'text-gray-600 hover:bg-gray-100'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search expenses..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                    </div>
                </div>

                {/* List */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white text-xs uppercase tracking-wider text-gray-500 border-b border-gray-100">
                                <th className="px-6 py-4 font-semibold">Expense Details</th>
                                <th className="px-6 py-4 font-semibold">Category</th>
                                <th className="px-6 py-4 font-semibold">Date</th>
                                <th className="px-6 py-4 font-semibold">Amount</th>
                                <th className="px-6 py-4 font-semibold text-right">Receipt/Bill</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center">
                                        <Loader className="w-6 h-6 animate-spin text-blue-600 mx-auto" />
                                    </td>
                                </tr>
                            ) : (
                                displayData.map((exp) => (
                                    <tr key={exp._id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-bold text-gray-900">{exp.title}</p>
                                            {exp.note && <p className="text-xs text-gray-500">{exp.note}</p>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-md text-xs font-medium border ${getCategoryColor(exp.category)}`}>
                                                {exp.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                                <Calendar size={14} className="text-gray-400" />
                                                <span>{new Date(exp.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-semibold text-gray-900">₹{exp.amount.toLocaleString()}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                {exp.bill_url ? (
                                                    <a href={exp.bill_url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 hover:border-blue-300 text-blue-600 hover:bg-blue-50 text-xs font-medium rounded-lg transition-colors">
                                                        <FileText size={14} /> View Bill
                                                    </a>
                                                ) : (
                                                    <span className="text-xs text-gray-400 italic">No bill</span>
                                                )}
                                                <button className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100">
                                                    <MoreVertical size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}

                            {!loading && displayData.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        No expenses found for the selected category matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <AddExpenseModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={() => {
                    fetchExpenses();
                    fetchSummary();
                }}
            />

        </div>
    );
}
