import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Plus, Trash2, IndianRupee, Loader, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AddFeeStructureModal({ isOpen, onClose, onSuccess }) {
    const [loading, setLoading] = useState(false);
    const [fetchingStudents, setFetchingStudents] = useState(false);
    const [students, setStudents] = useState([]);

    const [studentId, setStudentId] = useState('');
    const [totalFee, setTotalFee] = useState('');
    const [installments, setInstallments] = useState([]);

    useEffect(() => {
        if (isOpen) {
            fetchStudents();
            // Reset state on open
            setStudentId('');
            setTotalFee('');
            setInstallments([{ amount: '', due_date: '' }]);
        }
    }, [isOpen]);

    const fetchStudents = async () => {
        try {
            setFetchingStudents(true);
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const res = await axios.get(`${apiUrl}/api/students/list`); // Assumes list endpoint exists
            setStudents(res.data);
        } catch (error) {
            console.error("Failed to fetch students", error);
            // Don't toast fail here as some systems might not have the student endpoint mapped perfectly yet
        } finally {
            setFetchingStudents(false);
        }
    };

    const handleAddInstallment = () => {
        setInstallments([...installments, { amount: '', due_date: '' }]);
    };

    const handleRemoveInstallment = (index) => {
        const newInsts = [...installments];
        newInsts.splice(index, 1);
        setInstallments(newInsts);
    };

    const handleInstallmentChange = (index, field, value) => {
        const newInsts = [...installments];
        newInsts[index][field] = value;
        setInstallments(newInsts);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic validation
        if (!studentId || !totalFee) {
            return toast.error("Please provide student and total fee.");
        }

        const calculatedSum = installments.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
        if (calculatedSum !== Number(totalFee)) {
            return toast.error(`Sum of installments (₹${calculatedSum}) must equal Total Fee (₹${totalFee}).`);
        }

        try {
            setLoading(true);
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

            await axios.post(`${apiUrl}/api/finance/fee-structure`, {
                student_id: studentId,
                total_fee: Number(totalFee),
                installments_data: installments
            });

            toast.success("Fee structure successfully created!");
            onSuccess(); // Refresh the parent list
            onClose(); // Close modal
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Failed to create fee structure");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <h2 className="text-xl font-bold text-gray-900">Add Fee Structure</h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto flex-1">
                    <form id="fee-form" onSubmit={handleSubmit} className="space-y-6">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Student Selection */}
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">Select Student</label>
                                <select
                                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                    value={studentId}
                                    onChange={(e) => setStudentId(e.target.value)}
                                    required
                                >
                                    <option value="" disabled>-- Choose a student --</option>
                                    {fetchingStudents ? (
                                        <option disabled>Loading students...</option>
                                    ) : (
                                        students.map(s => (
                                            <option key={s._id} value={s._id}>{s.name} ({s.email})</option>
                                        ))
                                    )}
                                </select>
                            </div>

                            {/* Total Fee */}
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">Total Course Fee</label>
                                <div className="relative">
                                    <IndianRupee size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="number"
                                        min="0"
                                        className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                        placeholder="e.g. 45000"
                                        value={totalFee}
                                        onChange={(e) => setTotalFee(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Installments Section */}
                        <div className="pt-4 border-t border-gray-100">
                            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-2">
                                <div>
                                    <h3 className="font-semibold text-gray-900">Installment Breakdown</h3>
                                    <p className="text-xs text-gray-500">Split the total fee into multiple payment dates.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleAddInstallment}
                                    className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors border border-blue-200"
                                >
                                    <Plus size={16} /> Add Split
                                </button>
                            </div>

                            <div className="space-y-3">
                                {installments.map((inst, index) => (
                                    <div key={index} className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200">
                                        <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0">
                                            #{index + 1}
                                        </div>

                                        <div className="flex-1 relative">
                                            <IndianRupee size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="number"
                                                min="0"
                                                placeholder="Amount"
                                                className="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                                value={inst.amount}
                                                onChange={(e) => handleInstallmentChange(index, 'amount', e.target.value)}
                                                required
                                            />
                                        </div>

                                        <div className="flex-1">
                                            <input
                                                type="date"
                                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                                value={inst.due_date}
                                                onChange={(e) => handleInstallmentChange(index, 'due_date', e.target.value)}
                                                required
                                            />
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => handleRemoveInstallment(index)}
                                            disabled={installments.length === 1}
                                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center justify-between mt-4 text-sm font-medium px-2">
                                <span className="text-gray-500">Current Split Total:</span>
                                <span className={`text-lg ${installments.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0) === Number(totalFee) ? 'text-emerald-600' : 'text-amber-600'}`}>
                                    ₹{installments.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0).toLocaleString()} <span className="text-gray-400 text-xs font-normal">/ ₹{Number(totalFee).toLocaleString()}</span>
                                </span>
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
                        form="fee-form"
                        disabled={loading}
                        className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-70"
                    >
                        {loading ? <Loader className="w-4 h-4 animate-spin" /> : <CheckCircle size={16} />}
                        Create Structure
                    </button>
                </div>

            </div>
        </div>
    );
}
