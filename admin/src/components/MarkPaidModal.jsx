import React, { useState } from 'react';
import { X, CheckCircle, IndianRupee, CreditCard, Banknote, Wallet } from 'lucide-react';

export default function MarkPaidModal({ isOpen, onClose, onConfirm, installment, loading }) {
    const [paymentMode, setPaymentMode] = useState('Cash');
    const [referenceId, setReferenceId] = useState('');

    if (!isOpen || !installment) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onConfirm({
            payment_mode: paymentMode,
            reference_id: referenceId,
            paid_amount: installment.amount
        });
    };

    const paymentModes = [
        { id: 'Cash', label: 'Cash', icon: <Banknote size={16} /> },
        { id: 'UPI', label: 'Online', icon: <Wallet size={16} /> },
        { id: 'Bank Transfer', label: 'Bank', icon: <CreditCard size={16} /> },
    ];

    const getModeStyles = (modeId) => {
        const isActive = paymentMode === modeId;
        switch (modeId) {
            case 'Cash':
                return isActive ? 'border-emerald-500 bg-emerald-50' : 'border-gray-100 bg-white hover:border-gray-200';
            case 'UPI':
                return isActive ? 'border-blue-500 bg-blue-50' : 'border-gray-100 bg-white hover:border-gray-200';
            case 'Bank Transfer':
                return isActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-100 bg-white hover:border-gray-200';
            default: return '';
        }
    };

    const getIconStyles = (modeId) => {
        const isActive = paymentMode === modeId;
        switch (modeId) {
            case 'Cash': return isActive ? 'text-emerald-600' : 'text-gray-400';
            case 'UPI': return isActive ? 'text-blue-600' : 'text-gray-400';
            case 'Bank Transfer': return isActive ? 'text-indigo-600' : 'text-gray-400';
            default: return '';
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                {/* Compact Header */}
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <h2 className="text-sm font-bold text-gray-900">Mark Installment Paid</h2>
                    <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-md transition-all">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    {/* Compact Summary - One Line */}
                    <div className="flex items-center justify-between p-2.5 bg-blue-50/50 rounded-lg border border-blue-100/50 text-xs">
                        <div className="flex flex-col">
                            <span className="text-gray-500 font-medium">#{installment.installment_no} • {installment.student_id?.name}</span>
                        </div>
                        <div className="flex items-center gap-0.5 font-bold text-blue-700 text-sm">
                            <IndianRupee size={12} />
                            {installment.amount.toLocaleString()}
                        </div>
                    </div>


                    {/* Mode Selection - Horizontal Grid */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Payment Mode</label>
                        <div className="grid grid-cols-3 gap-2">
                            {paymentModes.map((mode) => (
                                <button
                                    key={mode.id}
                                    type="button"
                                    onClick={() => setPaymentMode(mode.id)}
                                    className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border transition-all ${getModeStyles(mode.id)}`}
                                >
                                    <div className={getIconStyles(mode.id)}>
                                        {mode.icon}
                                    </div>
                                    <span className={`text-[10px] font-bold ${paymentMode === mode.id ? 'text-gray-900' : 'text-gray-500'}`}>
                                        {mode.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Compact Ref ID */}
                    {paymentMode !== 'Cash' && (
                        <div className="space-y-1.5 animate-in slide-in-from-top-1 duration-200">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Reference ID (Optional)</label>
                            <input
                                type="text"
                                value={referenceId}
                                onChange={(e) => setReferenceId(e.target.value)}
                                placeholder="Ref ID / Transaction #"
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-xs"
                            />
                        </div>
                    )}

                    {/* Action Button - Leaner */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-bold py-2.5 rounded-lg shadow-md shadow-emerald-100 transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-xs"
                    >
                        {loading ? (
                            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <CheckCircle size={14} />
                                Confirm Payment
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
