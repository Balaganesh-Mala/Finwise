import React, { useState, useEffect } from 'react';
import { X, Calendar, IndianRupee, PlusCircle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function AddCustomInstallmentModal({ isOpen, onClose, onSuccess, preselectedStudentId, feeStructureId }) {
    const [amount, setAmount] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [saving, setSaving] = useState(false);

    // Reset when opened
    useEffect(() => {
        if (isOpen) {
            setAmount('');
            setDueDate('');
        }
    }, [isOpen]);

    if (!isOpen || !preselectedStudentId || !feeStructureId) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            await axios.post(`${apiUrl}/api/finance/installments/standalone`, {
                student_id: preselectedStudentId,
                fee_structure_id: feeStructureId,
                amount: Number(amount),
                due_date: dueDate
            });
            toast.success("Custom installment added successfully");
            onSuccess();
            onClose();
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Failed to add installment');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <PlusCircle size={20} className="text-emerald-500" />
                        Add Installment
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="px-6 pt-4 pb-2 bg-amber-50/50 border-b border-amber-100">
                    <p className="text-xs text-amber-700 leading-relaxed">
                        Use this to add a new custom installment for a student's existing fee structure (e.g., handling deficit balances from partial payments, or extra fees).
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Installment Amount</label>
                        <div className="relative">
                            <IndianRupee size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="number"
                                required
                                min="1"
                                placeholder="e.g. 6000"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-gray-900 transition-all font-medium"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Due Date</label>
                        <div className="relative">
                            <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="date"
                                required
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-gray-900 transition-all"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full py-2.5 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 mt-2 shadow-md shadow-emerald-100"
                    >
                        {saving ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            "Create Installment"
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
