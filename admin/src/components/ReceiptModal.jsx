import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Printer, IndianRupee, Building2, MapPin, Phone, Mail, Download, CheckCircle2, ShieldCheck } from 'lucide-react';
import sigImg from '../assets/sig.jpeg';

export default function ReceiptModal({ isOpen, onClose, installment }) {
    const [settings, setSettings] = useState(null);
    const [payment, setPayment] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

                // Fetch Settings & Payment Details in parallel
                const [settingsRes, paymentRes] = await Promise.all([
                    axios.get(`${apiUrl}/api/settings`),
                    installment?.status === 'Paid'
                        ? axios.get(`${apiUrl}/api/finance/installments/${installment._id}/payment`).catch(() => ({ data: null }))
                        : Promise.resolve({ data: null })
                ]);

                setSettings(settingsRes.data);
                if (paymentRes.data) setPayment(paymentRes.data);
            } catch (error) {
                console.error("Failed to fetch receipt data", error);
            } finally {
                setLoading(false);
            }
        };

        if (isOpen && installment) {
            fetchData();
        }
    }, [isOpen, installment]);

    if (!isOpen || !installment) return null;

    const handlePrint = () => {
        window.print();
    };

    const { student_id: student, amount, paid_date, installment_no } = installment;

    // Use actual payment date if available, otherwise fallback
    const displayDate = payment?.paid_at || paid_date || new Date();
    const formattedDate = new Date(displayDate).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:p-0 print:bg-white overflow-hidden">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[95vh] print:shadow-none print:max-h-none print:w-full print:rounded-none">

                {/* Header - Hidden in print */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white print:hidden">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <ShieldCheck size={20} />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">Official Payment Receipt</h2>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all">
                        <X size={20} />
                    </button>
                </div>

                {/* Receipt Content */}
                <div className="overflow-y-auto flex-1 bg-gray-50/30 print:bg-white p-0 md:p-8" id="receipt-content">
                    <div className="bg-white mx-auto shadow-sm border border-gray-100 print:border-none print:shadow-none relative">

                        {/* Premium Watermark for Print */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] overflow-hidden select-none print:opacity-[0.05]">
                            <h1 className="text-[12rem] font-black -rotate-45 uppercase tracking-tighter">OFFICIAL</h1>
                        </div>

                        {/* Removed Banner Image as per user request */}

                        <div className="p-8 md:p-12 relative z-10">
                            {/* Business Header */}
                            <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center gap-4">
                                        {settings?.logoUrl ? (
                                            <img src={settings.logoUrl} alt="Logo" className="h-14 w-auto object-contain" />
                                        ) : (
                                            <div className="h-12 w-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                                                <Building2 size={24} />
                                            </div>
                                        )}
                                        <div>
                                            <h1 className="text-2xl font-black text-gray-900 tracking-tight leading-none uppercase">
                                                {settings?.siteTitle || 'Finwise Career Solutions'}
                                            </h1>
                                            <p className="text-[10px] font-bold text-blue-600 tracking-[0.2em] mt-1 ml-0.5 uppercase">Career Solutions</p>
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-500 space-y-1 mt-2">
                                        {settings?.contact?.address && <p className="flex items-start gap-2 italic"><MapPin size={14} className="mt-0.5 text-gray-400" /> {settings.contact.address}</p>}
                                        <div className="flex flex-wrap gap-x-4 gap-y-1">
                                            {settings?.contact?.phone && <span className="flex items-center gap-1.5"><Phone size={14} className="text-gray-400" /> {settings.contact.phone}</span>}
                                            {settings?.contact?.email && <span className="flex items-center gap-1.5"><Mail size={14} className="text-gray-400" /> {settings.contact.email}</span>}
                                        </div>
                                    </div>
                                </div>

                                <div className="text-left md:text-right flex flex-col md:items-end w-full md:w-auto">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-wider mb-4 border border-emerald-100">
                                        <CheckCircle2 size={12} /> Payment Verified
                                    </div>
                                    <h2 className="text-5xl font-black text-gray-200 uppercase tracking-tighter mb-4 leading-none select-none">Receipt</h2>
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Receipt Number</p>
                                        <p className="font-mono text-lg font-bold text-gray-900">#REC-{installment._id.substring(18).toUpperCase()}</p>
                                    </div>
                                    <div className="space-y-1 mt-4">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Date Issued</p>
                                        <p className="font-bold text-gray-900">{formattedDate}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Info Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12 border-y border-gray-100 py-8">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Student Details</p>
                                    <p className="text-xl font-black text-gray-900">{student?.name || 'Valued Student'}</p>
                                    <p className="text-sm text-gray-500 mt-1 font-medium">{student?.email || 'N/A'}</p>
                                    <p className="text-sm text-gray-500 font-medium">{student?.phone || ''}</p>
                                    <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-lg text-xs font-bold text-gray-600 border border-gray-200">
                                        Course: <span className="text-blue-600">{student?.courseName || 'Investment Banking Operations & Accounting Analyst Program'}</span>
                                    </div>
                                </div>
                                <div className="md:text-right">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Payment Summary</p>
                                    <div className="space-y-2">
                                        <div className="flex justify-between md:justify-end gap-10">
                                            <span className="text-sm font-bold text-gray-400 uppercase">Payment Mode:</span>
                                            <span className="text-sm font-black text-gray-900 uppercase">
                                                {payment?.payment_mode || 'Mobile Payment / Cash'}
                                            </span>
                                        </div>
                                        {payment?.reference_id && (
                                            <div className="flex justify-between md:justify-end gap-10">
                                                <span className="text-sm font-bold text-gray-400 uppercase">Ref ID:</span>
                                                <span className="text-sm font-mono font-bold text-blue-600">{payment.reference_id}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between md:justify-end gap-10 pt-2">
                                            <span className="text-sm font-bold text-gray-400 uppercase">Status:</span>
                                            <span className="text-sm font-black text-emerald-600 uppercase">Successful</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Particulars Table */}
                            <div className="rounded-xl border border-gray-200 overflow-hidden mb-12 shadow-sm">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50/80 text-[10px] font-black uppercase tracking-[0.1em] text-gray-400 border-b border-gray-200">
                                            <th className="px-8 py-5">Description</th>
                                            <th className="px-8 py-5 text-right">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        <tr>
                                            <td className="px-8 py-6">
                                                <p className="text-lg font-black text-gray-900">Installment #{installment_no}</p>
                                                <p className="text-sm text-gray-500 mt-1 font-medium italic">Course fee payment for the current academic session.</p>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end text-xl font-black text-gray-900">
                                                    <IndianRupee size={20} className="mr-1 mt-0.5" />
                                                    {amount.toLocaleString('en-IN')}
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                    <tfoot>
                                        <tr className="bg-blue-600 text-white">
                                            <td className="px-8 py-6 text-sm font-black uppercase tracking-[0.2em]">Total Amount Collected</td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end text-2xl font-black">
                                                    <IndianRupee size={24} className="mr-1 mt-0.5" />
                                                    {amount.toLocaleString('en-IN')}
                                                </div>
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            {/* Terms & Signature */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-end mt-16 pb-8">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                                        <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">Important Notes</h3>
                                    </div>
                                    <ul className="space-y-2 text-[10px] font-bold text-gray-500 uppercase leading-relaxed tracking-wider list-none">
                                        <li className="flex gap-2"><span>&bull;</span> This is a computer-generated official receipt.</li>
                                        <li className="flex gap-2"><span>&bull;</span> Fees once paid are non-refundable & non-transferable.</li>
                                        <li className="flex gap-2"><span>&bull;</span> Valid across all Finwise Career Solutions branches.</li>
                                    </ul>
                                </div>

                                <div className="flex flex-col items-center">
                                    <div className="relative w-48 h-24 flex items-center justify-center">
                                        {/* Signature Line Decor */}
                                        <div className="absolute inset-x-0 bottom-6 border-b-2 border-gray-900/10"></div>

                                        <img
                                            src={sigImg}
                                            alt="Authorized Signature"
                                            className="max-h-20 w-auto object-contain relative z-10 filter mix-blend-multiply brightness-90 contrast-125"
                                            onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'block'; }}
                                        />
                                        <div className="hidden text-[10px] font-black text-gray-300 uppercase tracking-widest absolute">Seal & Sign</div>
                                    </div>
                                    <p className="text-xs font-black text-gray-900 uppercase tracking-[0.2em] mb-1 mt-2">Authorized Signatory</p>
                                    <p className="text-[10px] font-bold text-gray-400 capitalize whitespace-nowrap">For {settings?.siteTitle || 'Finwise Career Solutions'}</p>
                                </div>
                            </div>

                            {/* Bottom decorative bar */}
                            <div className="h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 mt-12 rounded-full"></div>
                        </div>
                    </div>
                </div>

                {/* Footer - Hidden in print */}
                <div className="px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-6 bg-white border-t border-gray-100 print:hidden shrink-0">
                    <div className="flex items-center gap-2 text-gray-400">
                        <Printer size={16} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Premium PDF Generation Available</span>
                    </div>
                    <div className="flex gap-4 w-full sm:w-auto">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 sm:flex-none px-8 py-3 text-sm font-bold text-gray-600 bg-white border-2 border-gray-100 rounded-xl hover:bg-gray-50 hover:border-gray-200 transition-all uppercase tracking-widest"
                        >
                            Back
                        </button>
                        <button
                            type="button"
                            onClick={handlePrint}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-10 py-3 text-sm font-black text-white bg-blue-600 rounded-xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 active:scale-95 transition-all uppercase tracking-widest"
                        >
                            <Download size={18} />
                            Download Receipt
                        </button>
                    </div>
                </div>

            </div>

            {/* Global Print Isolation Styles */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    /* Hide everything except our receipt */
                    #root, .print\\:hidden, button, .shrink-0, [role="dialog"] > div:first-child { display: none !important; }
                    body { background: white !important; margin: 0; padding: 0; }
                    
                    /* Show only the targeted content */
                    #receipt-content {
                        display: block !important;
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        height: auto !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        background: white !important;
                        z-index: 9999 !important;
                    }

                    /* Clean backgrounds and borders */
                    .shadow-sm, .shadow-2xl, .shadow-lg { box-shadow: none !important; }
                    .border { border: 1px solid #e5e7eb !important; }
                    .bg-gray-50, .bg-gray-50\\/80, .bg-gray-50\\/30 { background-color: #f9fafb !important; -webkit-print-color-adjust: exact; }
                    .bg-blue-600 { background-color: #2563eb !important; -webkit-print-color-adjust: exact; color: white !important; }
                    .text-blue-600 { color: #2563eb !important; -webkit-print-color-adjust: exact; }
                    .text-emerald-700 { color: #047857 !important; -webkit-print-color-adjust: exact; }
                }
            `}} />
        </div>
    );
}
