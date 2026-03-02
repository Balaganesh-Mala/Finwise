import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    IndianRupee,
    TrendingUp,
    TrendingDown,
    Users,
    Wallet,
    AlertCircle,
    Loader,
    FileText
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#64748B'];

export default function Dashboard() {
    const [loading, setLoading] = useState(true);
    const [timeFilter, setTimeFilter] = useState('all'); // 'all', 'month', 'year'
    const [data, setData] = useState({
        summaryStats: {
            totalFeesCollected: 0,
            pendingFees: 0,
            pendingCount: 0,
            totalExpenses: 0,
            netProfit: 0,
            overdueFees: 0
        },
        charts: {
            incomeVsExpenseData: [],
            expenseCategoryData: []
        }
    });

    useEffect(() => {
        fetchDashboardData();
    }, [timeFilter]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const res = await axios.get(`${apiUrl}/api/finance/dashboard?filter=${timeFilter}`);
            setData(res.data);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load dashboard metrics');
        } finally {
            setLoading(false);
        }
    };

    const downloadReport = () => {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(20);
        doc.setTextColor(40, 40, 40);
        doc.text('Financial Overview Report', 14, 22);

        doc.setFontSize(11);
        doc.setTextColor(100, 100, 100);
        const filterText = timeFilter === 'month' ? 'This Month' : timeFilter === 'year' ? 'This Year' : 'All Time';
        doc.text(`Generated on: ${new Date().toLocaleDateString()} | Filter: ${filterText}`, 14, 30);

        // Summary Stats Table
        autoTable(doc, {
            startY: 40,
            head: [['Financial Metric', 'Amount (INR)']],
            body: [
                ['Total Fees Collected', `Rs. ${data.summaryStats.totalFeesCollected.toLocaleString()}`],
                ['Pending Fees', `Rs. ${data.summaryStats.pendingFees.toLocaleString()} (${data.summaryStats.pendingCount} students)`],
                ['Total Expenses', `Rs. ${data.summaryStats.totalExpenses.toLocaleString()}`],
                ['Net Profit', `Rs. ${data.summaryStats.netProfit.toLocaleString()}`],
            ],
            theme: 'grid',
            headStyles: { fillColor: [59, 130, 246] },
        });

        // Expenses Breakdown Table
        if (data.charts.expenseCategoryData.length > 0) {
            autoTable(doc, {
                startY: doc.lastAutoTable.finalY + 15,
                head: [['Expense Category', 'Amount (INR)']],
                body: data.charts.expenseCategoryData.map(c => [c.name, `Rs. ${c.value.toLocaleString()}`]),
                theme: 'striped',
                headStyles: { fillColor: [239, 68, 68] },
            });
        }

        doc.save(`Financial_Report_${filterText.replace(' ', '_')}.pdf`);
        toast.success("Report downloaded successfully");
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    const { summaryStats, charts } = data;

    const summaryCards = [
        {
            title: "Total Fees Collected",
            value: `₹${summaryStats.totalFeesCollected.toLocaleString()}`,
            trend: "All time",
            isPositive: true,
            icon: IndianRupee,
            color: "text-emerald-500",
            bgColor: "bg-emerald-50"
        },
        {
            title: "Pending Fees",
            value: `₹${summaryStats.pendingFees.toLocaleString()}`,
            trend: `${summaryStats.pendingCount} Installments`,
            isPositive: false,
            icon: AlertCircle,
            color: "text-amber-500",
            bgColor: "bg-amber-50"
        },
        {
            title: "Total Expenses",
            value: `₹${summaryStats.totalExpenses.toLocaleString()}`,
            trend: "All time",
            isPositive: true,
            icon: Wallet,
            color: "text-red-500",
            bgColor: "bg-red-50"
        },
        {
            title: "Net Profit",
            value: `₹${summaryStats.netProfit.toLocaleString()}`,
            trend: "Estimated",
            isPositive: summaryStats.netProfit >= 0,
            icon: summaryStats.netProfit >= 0 ? TrendingUp : TrendingDown,
            color: summaryStats.netProfit >= 0 ? "text-blue-500" : "text-orange-500",
            bgColor: summaryStats.netProfit >= 0 ? "bg-blue-50" : "bg-orange-50"
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Financial Overview</h1>
                    <p className="text-sm text-gray-500 mt-1">Track your institute's financial health, incoming fees, and outgoing expenses.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <select
                        value={timeFilter}
                        onChange={(e) => setTimeFilter(e.target.value)}
                        className="bg-white border border-gray-200 text-gray-700 py-2 px-4 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium shadow-sm transition-all"
                    >
                        <option value="all">All Time</option>
                        <option value="month">This Month</option>
                        <option value="year">This Year</option>
                    </select>
                    <button
                        onClick={downloadReport}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2 h-[38px]"
                    >
                        <FileText size={16} />
                        Download Report
                    </button>
                </div>
            </div>

            {/* Top Summary Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {summaryCards.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-lg transition-shadow duration-300">
                            <div className="flex items-center justify-between">
                                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                                    <Icon className={`w-6 h-6 ${stat.color}`} />
                                </div>
                                <div className={`flex items-center gap-1 text-sm font-semibold px-2 py-1 rounded-full ${stat.isPositive ? 'text-emerald-700 bg-emerald-50' : 'text-red-700 bg-red-50'}`}>
                                    {stat.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                    {stat.trend}
                                </div>
                            </div>
                            <div className="mt-5">
                                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                                <h3 className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</h3>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">

                {/* Income vs Expense Bar Chart */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Income vs Expenses</h3>
                        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Last 6 Months</span>
                    </div>
                    <div className="h-[300px] w-full">
                        {charts.incomeVsExpenseData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={charts.incomeVsExpenseData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} tickFormatter={(val) => `₹${val / 1000}k`} />
                                    <Tooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Bar dataKey="income" name="Income" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                    <Bar dataKey="expense" name="Expense" fill="#EF4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400">Not enough data to graph</div>
                        )}
                    </div>
                </div>

                {/* Expense Category Pie Chart */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Expense Breakdown</h3>
                    </div>
                    <div className="h-[240px] w-full relative">
                        {charts.expenseCategoryData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={charts.expenseCategoryData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {charts.expenseCategoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400 text-sm">No expenses yet</div>
                        )}
                        {/* Center Text */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-sm text-gray-500">Total</span>
                            <span className="text-xl font-bold text-gray-900">
                                ₹{charts.expenseCategoryData.reduce((acc, curr) => acc + curr.value, 0).toLocaleString()}
                            </span>
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="mt-4 space-y-3 max-h-[120px] overflow-y-auto pr-2">
                        {charts.expenseCategoryData.map((category, idx) => (
                            <div key={idx} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                                    <span className="text-gray-600 font-medium truncate w-24">{category.name}</span>
                                </div>
                                <span className="text-gray-900 font-semibold">₹{(category.value).toLocaleString()}</span>
                            </div>
                        ))}
                    </div>

                </div>
            </div>

        </div>
    );
}
