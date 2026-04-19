import React, { useState, useEffect } from 'react';
import { X, Calendar, IndianRupee, Save } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function EditInstallmentModal({ isOpen, onClose, onSuccess, installment }) {
    const [amount, setAmount] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (installment) {
            setAmount(installment.amount || '');
            if (installment.due_date) {
                setDueDate(new Date(installment.due_date).toISOString().split('T')[0]);
            }
        }
    }, [installment]);

    if (!isOpen || !installment) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            await axios.put(`${apiUrl}/api/finance/installments/${installment._id}`, {
                amount: Number(amount),
                due_date: dueDate
            });
            toast.success("Installment updated successfully");
            onSuccess();
            onClose();
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Failed to update installment');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-800">Edit Installment</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Student</label>
                        <div className="px-4 py-2.5 bg-gray-50 rounded-lg border border-gray-200 text-sm font-medium text-gray-700">
                            {installment.student_id?.name}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Installment Amount</label>
                        <div className="relative">
                            <IndianRupee size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="number"
                                required
                                min="0"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-gray-900 transition-all font-medium"
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
                                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-gray-900 transition-all"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 mt-2"
                    >
                        {saving ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <Save size={16} /> Save Changes
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
