import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Search,
    Filter,
    User,
    IndianRupee,
    Calendar,
    CheckCircle,
    AlertCircle,
    Clock,
    Plus,
    Mail,
    Loader,
    Receipt
} from 'lucide-react';
import toast from 'react-hot-toast';
import AddFeeStructureModal from '../components/AddFeeStructureModal';
import ReceiptModal from '../components/ReceiptModal';

export default function FeeManagement() {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [installments, setInstallments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All'); // All, Pending, Paid, Overdue
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedReceipt, setSelectedReceipt] = useState(null);

    const [stats, setStats] = useState({
        totalStudents: 0,
        upcomingCount: 0,
        actionRequiredCount: 0
    });

    useEffect(() => {
        fetchInstallments();
    }, [filter]);

    const fetchInstallments = async () => {
        try {
            setLoading(true);
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const statusQuery = filter !== 'All' ? `?status=${filter}` : '';
            const res = await axios.get(`${apiUrl}/api/finance/installments${statusQuery}`);

            setInstallments(res.data);

            // Calculate basic stats logic on the frontend if filter is 'All'
            if (filter === 'All') {
                const uniqueStudents = new Set(res.data.map(i => i.student_id?._id));

                const now = new Date();
                const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

                let upc = 0;
                let actReq = 0;

                res.data.forEach(inst => {
                    if (inst.status === 'Overdue') actReq++;
                    if (inst.status === 'Pending') {
                        const due = new Date(inst.due_date);
                        if (due > now && due <= nextWeek) {
                            upc++;
                        }
                    }
                });

                setStats({
                    totalStudents: uniqueStudents.size,
                    upcomingCount: upc,
                    actionRequiredCount: actReq
                });
            }

        } catch (err) {
            console.error(err);
            toast.error('Failed to fetch fees details');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkPaid = async (id) => {
        if (!window.confirm("Are you sure you want to mark this installment as paid?")) return;

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            await axios.post(`${apiUrl}/api/finance/installments/${id}/pay`, {
                payment_mode: 'Cash', // Default mock until form is added
            });
            toast.success("Payment recorded!");
            fetchInstallments(); // reload
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Failed to record payment');
        }
    };

    const handleSendReminder = async (id) => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            await axios.post(`${apiUrl}/api/finance/installments/${id}/remind`);
            toast.success("Reminder queued to send!");
        } catch (err) {
            console.error(err);
            toast.error('Failed to send reminder');
        }
    };

    const displayData = installments.filter(inst => {
        if (searchTerm && inst.student_id) {
            return inst.student_id.name.toLowerCase().includes(searchTerm.toLowerCase());
        }
        return true;
    });

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Paid':
                return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200"><CheckCircle size={14} /> Paid</span>;
            case 'Overdue':
                return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200"><AlertCircle size={14} /> Overdue</span>;
            case 'Pending':
            default:
                return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200"><Clock size={14} /> Pending</span>;
        }
    };

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Fee Management</h1>
                    <p className="text-sm text-gray-500 mt-1">Track student installments, send reminders, and record payments.</p>
                </div>
                <div className="flex gap-3">
                    <button className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm flex items-center gap-2">
                        <Filter size={16} /> Filters
                    </button>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
                        onClick={() => setIsAddModalOpen(true)}
                    >
                        <Plus size={18} /> Add Fee Structure
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                        <User size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Students (with fees)</p>
                        <h3 className="text-2xl font-bold text-gray-900">{stats.totalStudents}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                        <Clock size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Upcoming (7 days)</p>
                        <h3 className="text-2xl font-bold text-gray-900">{stats.upcomingCount} <span className="text-sm font-normal text-gray-500">installments</span></h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border-red-100 bg-gradient-to-br from-white to-red-50/50 shadow-sm flex items-center gap-4 border">
                    <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                        <AlertCircle size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-red-600/80 font-medium">Action Required</p>
                        <h3 className="text-2xl font-bold text-red-700">{stats.actionRequiredCount} <span className="text-sm font-normal text-red-600/70">Overdue</span></h3>
                    </div>
                </div>
            </div>

            {/* Main List Area */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/50">
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
                        {['All', 'Pending', 'Paid', 'Overdue'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setFilter(tab)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filter === tab ? 'bg-white text-blue-600 shadow-sm border border-gray-200' : 'text-gray-600 hover:bg-gray-100'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search students..."
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
                                <th className="px-6 py-4 font-semibold">Student</th>
                                <th className="px-6 py-4 font-semibold">Inst. Info</th>
                                <th className="px-6 py-4 font-semibold">Amount</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
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
                                displayData.map((inst) => (
                                    <tr key={inst._id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {inst.student_id?.profilePicture ? (
                                                    <img src={inst.student_id.profilePicture} alt={inst.student_id.name} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-700 font-bold border border-blue-200 flex-shrink-0">
                                                        {inst.student_id ? inst.student_id.name.charAt(0).toUpperCase() : '?'}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900">{inst.student_id ? inst.student_id.name : 'Unknown Student'}</p>
                                                    {/*<p className="text-xs text-gray-500">{inst.student_id?.batchTiming || 'N/A'}</p>*/}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-medium text-gray-700">Instalment #{inst.installment_no}</p>
                                            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                                <Calendar size={12} />
                                                <span>Due: {new Date(inst.due_date).toLocaleDateString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1 font-semibold text-gray-900">
                                                <IndianRupee size={14} className="text-gray-400" />
                                                {inst.amount.toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(inst.status)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {inst.status !== 'Paid' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleSendReminder(inst._id)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors tooltip-trigger border border-transparent hover:border-blue-100"
                                                            title="Send Reminder"
                                                        >
                                                            <Mail size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleMarkPaid(inst._id)}
                                                            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium rounded-lg transition-colors shadow-sm flex items-center gap-1.5"
                                                        >
                                                            <CheckCircle size={14} /> Mark Paid
                                                        </button>
                                                    </>
                                                )}
                                                {inst.status === 'Paid' && (
                                                    <button
                                                        onClick={() => setSelectedReceipt(inst)}
                                                        className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 shadow-sm"
                                                    >
                                                        <Receipt size={14} /> View Receipt
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}

                            {!loading && displayData.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        No installments found matching your criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

            </div>

            <AddFeeStructureModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={fetchInstallments}
            />

            <ReceiptModal
                isOpen={!!selectedReceipt}
                onClose={() => setSelectedReceipt(null)}
                installment={selectedReceipt}
            />

        </div>
    );
}
