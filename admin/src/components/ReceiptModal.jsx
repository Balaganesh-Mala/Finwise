import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Printer, IndianRupee, Building2, MapPin, Phone, Mail, Download } from 'lucide-react';
import sigImg from '../assets/sig.jpeg'; // Make sure the user actually puts the file here!

export default function ReceiptModal({ isOpen, onClose, installment }) {
    const [settings, setSettings] = useState(null);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                const res = await axios.get(`${apiUrl}/api/settings`);
                setSettings(res.data);
            } catch (error) {
                console.error("Failed to fetch settings", error);
            }
        };

        if (isOpen) {
            fetchSettings();
        }
    }, [isOpen]);

    if (!isOpen || !installment) return null;

    const handlePrint = () => {
        window.print();
    };

    const { student_id: student, amount, paid_date, installment_no } = installment;
    const formattedDate = paid_date
        ? new Date(paid_date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
        : new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 print:p-0 print:bg-white">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] print:shadow-none print:max-h-none print:w-full print:rounded-none">

                {/* Header - Hidden in print */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 print:hidden">
                    <h2 className="text-xl font-bold text-gray-900">Payment Receipt Preview</h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Receipt Content - This part gets printed */}
                <div className="p-10 overflow-y-auto flex-1 bg-white text-gray-800" id="receipt-content">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start border-b-2 border-gray-800 pb-6 mb-8 gap-6">
                        <div className="flex items-center gap-5">
                            {settings?.logoUrl ? (
                                <img src={settings.logoUrl} alt="Company Logo" className="h-16 w-auto object-contain" />
                            ) : (
                                <div className="h-16 w-16 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 border border-gray-200 shadow-sm">
                                    <Building2 size={24} />
                                </div>
                            )}
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{settings?.siteTitle || 'YOUR COMPANY NAME'}</h1>
                                <div className="text-sm text-gray-600 mt-1 space-y-0.5">
                                    {settings?.contact?.phone && <p className="flex items-center gap-1.5"><Phone size={12} />{settings.contact.phone}</p>}
                                    {settings?.contact?.email && <p className="flex items-center gap-1.5"><Mail size={12} />{settings.contact.email}</p>}
                                </div>
                            </div>
                        </div>

                        <div className="text-left md:text-right w-full md:w-auto mt-4 md:mt-0">
                            <h2 className="text-4xl font-light text-gray-900 tracking-widest uppercase mb-2">Receipt</h2>
                            <div className="text-sm flex md:justify-end items-center gap-3">
                                <span className="text-gray-500 uppercase tracking-wider text-xs font-bold">Receipt No:</span>
                                <span className="font-semibold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">REC-{installment._id.substring(0, 8).toUpperCase()}</span>
                            </div>
                            <div className="text-sm flex md:justify-end items-center gap-3 mt-2">
                                <span className="text-gray-500 uppercase tracking-wider text-xs font-bold">Date:</span>
                                <span className="font-semibold text-gray-900">{formattedDate}</span>
                            </div>
                        </div>
                    </div>

                    {/* Billed To */}
                    <div className="mb-8">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 border-b border-gray-100 pb-1">Billed To</h3>
                        <p className="font-bold text-xl text-gray-900 mb-1">{student?.name || 'Unknown Student'}</p>
                        {student?.email && <p className="text-sm text-gray-600 mb-2">{student.email}</p>}
                        {student?.courseName && (
                            <p className="text-sm font-medium text-gray-800 bg-gray-50 inline-block px-3 py-1 rounded-md border border-gray-200">
                                Course: {student.courseName}
                            </p>
                        )}
                    </div>

                    {/* Particulars Table */}
                    <div className="mb-10 rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-100/50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                                    <th className="px-6 py-4 font-bold">Description</th>
                                    <th className="px-6 py-4 font-bold text-center">Payment Mode</th>
                                    <th className="px-6 py-4 font-bold text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-gray-100">
                                    <td className="px-6 py-5">
                                        <p className="font-semibold text-gray-900 text-base">Course Fee Installment #{installment_no}</p>
                                        <p className="text-sm text-gray-500 mt-1">Payment towards tuition fees.</p>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <span className="text-sm font-medium text-gray-700 bg-white border border-gray-200 px-3 py-1 rounded-full shadow-sm">Cash / Online</span>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex items-center justify-end font-semibold text-gray-900 text-lg">
                                            <IndianRupee size={16} className="mr-0.5 mt-0.5" />
                                            {amount.toLocaleString()}
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                            <tfoot>
                                <tr className="bg-gray-50 border-t border-gray-200">
                                    <td colSpan="2" className="px-6 py-4 text-right font-bold text-gray-600 uppercase tracking-wider text-sm">
                                        Total Amount Paid
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end font-black text-xl text-emerald-600">
                                            <IndianRupee size={20} className="mr-0.5 mt-0.5" />
                                            {amount.toLocaleString()}
                                        </div>
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* Footer Section: Terms & Signature */}
                    <div className="mt-16 flex flex-col md:flex-row justify-between items-end gap-10">
                        <div className="text-xs text-gray-500 w-full md:w-1/2">
                            <p className="font-bold text-gray-800 mb-2 uppercase tracking-wide border-b border-gray-200 pb-1 w-max">Terms & Conditions</p>
                            <ul className="space-y-1 mt-2 list-disc pl-4 text-gray-500/80">
                                <li>This is a computer-generated receipt and valid for accounting records.</li>
                                <li>Fees once paid are non-refundable and non-transferable.</li>
                                <li>Late payment may attract additional penalty charges based on company policy.</li>
                            </ul>
                        </div>

                        <div className="w-full md:w-1/3 text-center flex flex-col items-center">
                            <div className="h-20 w-48 relative mb-2 flex items-end justify-center">
                                {/* Using an img tag gracefully failing via CSS or alt if missing */}
                                <img
                                    src={sigImg}
                                    alt="Signature"
                                    className="max-h-20 w-auto object-contain z-10 filter mix-blend-multiply"
                                    onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'block'; }}
                                />
                                <div className="absolute bottom-0 w-full border-b border-gray-300 z-0"></div>
                            </div>
                            <p className="text-sm font-bold text-gray-900 uppercase tracking-wider">Authorized Signatory</p>
                            <p className="text-xs font-medium text-gray-500 mt-0.5">{settings?.siteTitle || 'Administration'}</p>
                        </div>
                    </div>

                    <div className="mt-12 pt-6 border-t border-gray-100 text-center text-xs text-gray-400 font-medium tracking-wide uppercase">
                        Thank you for your payment
                    </div>

                </div>

                {/* Footer - Hidden in print */}
                <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-50/80 border-t border-gray-100 print:hidden">
                    <p className="text-xs text-gray-500">Preview looks exactly as it will print.</p>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 sm:flex-none px-6 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                        >
                            Close
                        </button>
                        <button
                            type="button"
                            onClick={handlePrint}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-sm"
                        >
                            <Download size={16} />
                            Download / Print PDF
                        </button>
                    </div>
                </div>

            </div>

            {/* Print Styles */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .fixed {
                        position: absolute !important;
                    }
                    #receipt-content, #receipt-content * {
                        visibility: visible;
                    }
                    #receipt-content {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        background: white !important;
                        padding: 3rem !important;
                    }
                }
            `}} />
        </div>
    );
}
