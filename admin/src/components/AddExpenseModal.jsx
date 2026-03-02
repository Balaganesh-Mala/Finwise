import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, CheckCircle, IndianRupee, Loader, UploadCloud } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AddExpenseModal({ isOpen, onClose, onSuccess }) {
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        title: '',
        category: 'Miscellaneous',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        note: '',
        bill_url: ''
    });

    useEffect(() => {
        if (isOpen) {
            setForm({
                title: '',
                category: 'Miscellaneous',
                amount: '',
                date: new Date().toISOString().split('T')[0],
                note: '',
                bill_url: ''
            });
        }
    }, [isOpen]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.title || !form.amount || !form.date) {
            return toast.error("Please fill required fields (Title, Amount, Date).");
        }

        try {
            setLoading(true);
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

            await axios.post(`${apiUrl}/api/expenses`, {
                ...form,
                amount: Number(form.amount)
            });

            toast.success("Expense successfully recorded!");
            onSuccess(); // Refresh the parent list
            onClose(); // Close modal
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Failed to record expense");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <h2 className="text-xl font-bold text-gray-900">Add New Expense</h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto flex-1">
                    <form id="expense-form" onSubmit={handleSubmit} className="space-y-5">

                        {/* Title */}
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Expense Title</label>
                            <input
                                type="text"
                                name="title"
                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                placeholder="e.g. Office Rent, Marker Pens..."
                                value={form.title}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* Category */}
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">Category</label>
                                <select
                                    name="category"
                                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                    value={form.category}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="Rent">Rent</option>
                                    <option value="Electricity">Electricity</option>
                                    <option value="Wifi">Wifi</option>
                                    <option value="Salaries">Salaries</option>
                                    <option value="Marketing">Marketing</option>
                                    <option value="Miscellaneous">Miscellaneous</option>
                                </select>
                            </div>

                            {/* Amount */}
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">Amount</label>
                                <div className="relative">
                                    <IndianRupee size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="number"
                                        name="amount"
                                        min="0"
                                        className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                        placeholder="0.00"
                                        value={form.amount}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Date */}
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Payment Date</label>
                            <input
                                type="date"
                                name="date"
                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                value={form.date}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* Note */}
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Additional Notes (Optional)</label>
                            <textarea
                                name="note"
                                rows="2"
                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                placeholder="..."
                                value={form.note}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Bill Upload Mock */}
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Upload Bill / Receipt (Optional)</label>
                            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-center bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer"
                                onClick={() => toast("File upload handling goes here (AWS S3/Multer).")}
                            >
                                <UploadCloud size={32} className="text-blue-500 mb-2" />
                                <span className="text-sm font-medium text-gray-700">Click to upload bill image/PDF</span>
                                <span className="text-xs text-gray-400 mt-1">PNG, JPG or PDF up to 5MB</span>
                            </div>
                        </div>

                    </form>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3 bg-gray-50/50">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="expense-form"
                        disabled={loading}
                        className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-70"
                    >
                        {loading ? <Loader className="w-4 h-4 animate-spin" /> : <CheckCircle size={16} />}
                        Save Expense
                    </button>
                </div>

            </div>
        </div>
    );
}
