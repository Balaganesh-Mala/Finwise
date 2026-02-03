import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import axios from 'axios';
import { QrCode, ClipboardList, RefreshCw, Calendar, Search, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Attendance = () => {
    const [activeTab, setActiveTab] = useState('scan');
    const { user } = useAuth(); // Helper to current user

    // --- Scanner Logic ---
    const [scanData, setScanData] = useState('No result');
    const [scanResult, setScanResult] = useState(null);
    const [isScanning, setIsScanning] = useState(false);
    const [loadingScan, setLoadingScan] = useState(false);

    const scannerRef = useRef(null);
    const processingRef = useRef(false);
    const lastScanRef = useRef({ text: '', time: 0 });

    // --- History Logic ---
    const [history, setHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [historyFilters, setHistoryFilters] = useState({
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });

    // AuthContext in trainer uses /api/trainer base. 
    // We should use the same base for shared routes like /api/attendance
    const BASE_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    // Cleanup scanner
    useEffect(() => {
        return () => {
            if (scannerRef.current) {
                stopScanner();
            }
        };
    }, []);

    // Initial fetch for history if tab active
    useEffect(() => {
        if (activeTab === 'student_history' || activeTab === 'my_history') {
            fetchHistory();
        }
    }, [activeTab]);

    // --- Scanner Functions ---
    const startScanner = async () => {
        if (window.isSecureContext === false) {
            alert("Camera access requires a Secure Context (HTTPS).");
            return;
        }
        try {
            const html5QrCode = new Html5Qrcode("reader");
            scannerRef.current = html5QrCode;
            await html5QrCode.start(
                { facingMode: "environment" },
                { fps: 5, qrbox: { width: 250, height: 250 } },
                (decodedText) => handleScan(decodedText),
                () => { }
            );
            setIsScanning(true);
        } catch (err) {
            console.error(err);
            alert("Failed to start camera.");
        }
    };

    const stopScanner = async () => {
        if (scannerRef.current) {
            try {
                await scannerRef.current.stop();
                scannerRef.current.clear();
                setIsScanning(false);
            } catch (err) { console.error(err); }
        }
    };

    const handleScan = (decodedText) => {
        const now = Date.now();
        if (decodedText === lastScanRef.current.text && (now - lastScanRef.current.time) < 3000) return;
        if (processingRef.current) return;

        processingRef.current = true;
        lastScanRef.current = { text: decodedText, time: now };
        processScan(decodedText);
    };

    const processScan = async (qrText) => {
        setLoadingScan(true);
        setScanResult(null);
        try {
            let payload = {};
            try { payload = JSON.parse(qrText); }
            catch (e) { throw new Error('Invalid QR Format'); }

            const { studentId, token } = payload;

            const res = await axios.post(`${BASE_API_URL}/api/attendance/qr-mark`, { studentId, token });

            setScanResult(res.data);
            if (res.data.success) {
                // Audio feedback could go here
                setTimeout(() => setScanResult(null), 3000);
            }
        } catch (err) {
            setScanResult({ success: false, message: err.message || 'Scan Failed' });
        } finally {
            setLoadingScan(false);
            processingRef.current = false;
        }
    };

    // --- History Functions ---
    const fetchHistory = async () => {
        setLoadingHistory(true);
        setHistory([]);
        try {
            let queryParams = new URLSearchParams({
                startDate: historyFilters.startDate,
                endDate: historyFilters.endDate
            });

            if (activeTab === 'my_history' && user) {
                queryParams.append('trainerId', user._id);
            } else if (activeTab === 'student_history') {
                queryParams.append('type', 'student');
            }

            const res = await axios.get(`${BASE_API_URL}/api/attendance/history?${queryParams.toString()}`);
            setHistory(res.data);
        } catch (err) {
            console.error("History fetch error", err);
        } finally {
            setLoadingHistory(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Attendance Manager</h1>
                    <p className="text-gray-500">Scan student QR codes or view attendance logs.</p>
                </div>
                <div className="flex space-x-2 bg-white p-1 rounded-lg border border-gray-200">
                    <button
                        onClick={() => setActiveTab('scan')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'scan' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <QrCode size={18} />
                        Scanner
                    </button>
                    <button
                        onClick={() => setActiveTab('student_history')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'student_history' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <ClipboardList size={18} />
                        Student History
                    </button>
                    <button
                        onClick={() => setActiveTab('my_history')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'my_history' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <UserCheck size={18} />
                        My Attendance
                    </button>
                </div>
            </div>

            {activeTab === 'scan' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="mb-4 flex justify-between items-center">
                            <h2 className="font-semibold text-gray-800">Camera Feed</h2>
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${isScanning ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                {isScanning ? 'LIVE' : 'IDLE'}
                            </span>
                        </div>
                        <div className="bg-black relative rounded-lg overflow-hidden aspect-square flex items-center justify-center mb-6">
                            <div id="reader" className="w-full h-full"></div>
                            {!isScanning && <div className="absolute text-white/50">Camera Off</div>}
                        </div>
                        <button
                            onClick={isScanning ? stopScanner : startScanner}
                            className={`w-full py-3 rounded-lg font-medium text-white transition-colors ${isScanning ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'
                                }`}
                        >
                            {isScanning ? 'Stop Scanning' : 'Start Camera'}
                        </button>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h2 className="font-semibold text-gray-800 mb-4">Scan Results</h2>
                        {scanResult ? (
                            <div className={`p-4 rounded-lg border ${scanResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                <div className={`font-bold ${scanResult.success ? 'text-green-800' : 'text-red-800'}`}>
                                    {scanResult.message}
                                </div>
                                {scanResult.student && (
                                    <div className="mt-2 text-sm text-gray-600">
                                        <p><span className="font-medium">Student:</span> {scanResult.student.name}</p>
                                        <p><span className="font-medium">Email:</span> {scanResult.student.email}</p>
                                        <p className="text-xs text-gray-400 mt-1">{new Date().toLocaleTimeString()}</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-100 rounded-lg">
                                <QrCode size={48} className="mx-auto mb-2 opacity-20" />
                                <p>Ready to scan...</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {(activeTab === 'student_history' || activeTab === 'my_history') && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="p-4 border-b border-gray-100 flex flex-wrap gap-4 items-end">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Start Date</label>
                            <input
                                type="date"
                                value={historyFilters.startDate}
                                onChange={e => setHistoryFilters({ ...historyFilters, startDate: e.target.value })}
                                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">End Date</label>
                            <input
                                type="date"
                                value={historyFilters.endDate}
                                onChange={e => setHistoryFilters({ ...historyFilters, endDate: e.target.value })}
                                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        <button
                            onClick={fetchHistory}
                            disabled={loadingHistory}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
                        >
                            {loadingHistory ? <RefreshCw size={16} className="animate-spin" /> : <Search size={16} />}
                            Filter
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3">Date</th>
                                    <th className="px-6 py-3">
                                        {activeTab === 'my_history' ? 'Trainer' : 'Student'}
                                    </th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3">Method</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {history.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                            No records found.
                                        </td>
                                    </tr>
                                ) : (
                                    history.map(record => (
                                        <tr key={record._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {new Date(record.date).toLocaleDateString()} <span className="text-gray-400 text-xs ml-1">{new Date(record.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {activeTab === 'my_history' ? (
                                                    <>
                                                        <div className="text-sm font-medium text-gray-900">{record.trainerId?.name || 'Me'}</div>
                                                        <div className="text-xs text-gray-500">{record.trainerId?.email}</div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="text-sm font-medium text-gray-900">{record.studentId?.name || 'Unknown'}</div>
                                                        <div className="text-xs text-gray-500">{record.studentId?.email}</div>
                                                    </>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 capitalize">
                                                    {record.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 capitalize">
                                                {record.method}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Attendance;
