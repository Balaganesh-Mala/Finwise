import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import axios from 'axios';

const QRScanner = () => {
    const [data, setData] = useState('No result');
    const [scanResult, setScanResult] = useState(null);
    const [scannedToday, setScannedToday] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isScanning, setIsScanning] = useState(false);

    // Check if scanner is already rendered to avoid double render in Strict Mode
    const scannerRef = useRef(null);
    const processingRef = useRef(false); // Synchronous lock
    const lastScanRef = useRef({ text: '', time: 0 }); // Debounce tracker

    useEffect(() => {
        fetchTodayAttendance();

        const handleVisibilityChange = () => {
            if (document.hidden) {
                stopScanner();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Cleanup on unmount
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            // Directly check ref to avoid closure staleness issues with isScanning state
            if (scannerRef.current) {
                stopScanner();
            }
        };
    }, []);

    const fetchTodayAttendance = async () => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const res = await axios.get(`${apiUrl}/api/attendance/today`);
            setScannedToday(res.data);
        } catch (err) {
            console.error("Failed to fetch today's attendance", err);
        }
    };

    const startScanner = async () => {
        // Check for Secure Context (HTTPS or Localhost)
        if (window.isSecureContext === false) {
            alert("Camera access requires a Secure Context (HTTPS). If you are testing on mobile via IP, browser security blocks the camera. Please use localhost, HTTPS, or a tunneling service (like ngrok).");
            return;
        }

        try {
            const html5QrCode = new Html5Qrcode("reader");
            scannerRef.current = html5QrCode;

            await html5QrCode.start(
                { facingMode: "environment" },
                {
                    fps: 5, // Lower FPS to reduce load
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0
                },
                (decodedText, decodedResult) => {
                    handleScan(decodedText);
                },
                (errorMessage) => {
                    // parse error, ignore it.
                }
            );
            setIsScanning(true);
            setLoading(false);
        } catch (err) {
            console.error("Failed to start scanner", err);
            if (err.name === 'NotAllowedError') {
                alert("Camera permission denied. Please allow camera access in your browser settings.");
            } else if (err.name === 'NotFoundError') {
                alert("No camera found on this device.");
            } else {
                alert(`Failed to start camera: ${err.message || 'Unknown error'}. Ensure you are on HTTPS if using mobile.`);
            }
        }
    };

    const stopScanner = async () => {
        if (scannerRef.current) {
            try {
                await scannerRef.current.stop();
                scannerRef.current.clear();
                setIsScanning(false);
            } catch (err) {
                console.error("Failed to stop scanner", err);
            }
        }
    };

    const handleScan = (decodedText) => {
        const now = Date.now();

        // 1. Debounce same code scan (3 seconds)
        if (decodedText === lastScanRef.current.text && (now - lastScanRef.current.time) < 3000) {
            return;
        }

        // 2. Synchronous Lock
        if (processingRef.current) return;

        processingRef.current = true;
        lastScanRef.current = { text: decodedText, time: now };

        setData(decodedText);
        processScan(decodedText);
    };

    const processScan = async (qrText) => {
        setLoading(true);
        setScanResult(null);

        try {
            // Play Beep
            const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
            audio.play().catch(e => console.log("Audio play failed", e));

            let payload = {};
            try {
                payload = JSON.parse(qrText);
            } catch (e) {
                console.error("Invalid QR Format", qrText);
                setScanResult({ success: false, message: 'Invalid QR Format. Is this a JobReady QR?' });
                processingRef.current = false; // Release lock
                setLoading(false);
                return;
            }

            const { studentId, trainerId, token } = payload;
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

            let res;
            if (trainerId) {
                // Trainer QR
                res = await axios.post(`${apiUrl}/api/attendance/trainer/qr-mark`, {
                    trainerId,
                    token
                });
            } else if (studentId) {
                // Student QR
                res = await axios.post(`${apiUrl}/api/attendance/qr-mark`, {
                    studentId,
                    token
                });
            } else {
                throw new Error('Invalid QR Data: Missing ID');
            }

            setScanResult(res.data);

            if (res.data.success) {
                // If it's a student, refresh today's list (optional: add trainer list fetch too)
                if (studentId) fetchTodayAttendance();
                setTimeout(() => setData('No result'), 3000);
            } else {
                setTimeout(() => setData('No result'), 3000);
            }

        } catch (err) {
            console.error(err);
            setScanResult({ success: false, message: `Error: ${err.response?.data?.message || err.message}` });
            setTimeout(() => setData('No result'), 3000);
        }

        setLoading(false);
        processingRef.current = false; // Release lock
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6 font-sans text-gray-900">
            <div className="max-w-6xl mx-auto">
                <header className="mb-6">
                    <h1 className="text-2xl font-bold">QR Attendance Scanner</h1>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Scanner Section */}
                    <div className="bg-white p-4 rounded shadow-sm border border-gray-200">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">Camera Feed</h2>
                            <span className={`text-sm font-medium ${isScanning ? 'text-green-600' : 'text-gray-500'}`}>
                                {isScanning ? 'Status: Active' : 'Status: Idle'}
                            </span>
                        </div>

                        {/* Scanner Box */}
                        <div className="bg-black relative rounded overflow-hidden aspect-square flex items-center justify-center mb-4">
                            <div id="reader" className="w-full h-full"></div>
                            {!isScanning && (
                                <div className="absolute inset-0 flex items-center justify-center text-white">
                                    <p>Camera is off</p>
                                </div>
                            )}
                        </div>

                        {/* Controls */}
                        <div className="flex justify-center gap-4">
                            {!isScanning ? (
                                <button
                                    onClick={startScanner}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-medium transition-colors"
                                >
                                    Start Camera
                                </button>
                            ) : (
                                <button
                                    onClick={stopScanner}
                                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-medium transition-colors"
                                >
                                    Stop Camera
                                </button>
                            )}
                        </div>

                        {/* Status Message */}
                        <div className="mt-4 text-center text-sm text-gray-600 bg-gray-50 p-2 rounded border border-gray-100">
                            {loading ? 'Processing...' : isScanning ? 'Point camera at a QR code' : 'Waiting to start...'}
                        </div>

                        {/* Scan Result */}
                        {scanResult && (
                            <div className={`mt-4 p-4 rounded border ${scanResult.success ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
                                }`}>
                                <div className="font-bold mb-1">{scanResult.message}</div>
                                {scanResult.student && (
                                    <div className="text-sm">
                                        <div>Name: {scanResult.student.name}</div>
                                        <div>Email: {scanResult.student.email}</div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* List Section */}
                    <div className="bg-white p-4 rounded shadow-sm border border-gray-200 h-full flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">Marked Attendance</h2>
                            <span className="bg-gray-100 px-2 py-1 rounded text-sm font-medium">
                                Total: {scannedToday.length}
                            </span>
                        </div>

                        <div className="overflow-auto flex-1 border border-gray-100 rounded">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-4 py-2">Time</th>
                                        <th className="px-4 py-2">Name</th>
                                        <th className="px-4 py-2">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {scannedToday.length === 0 ? (
                                        <tr>
                                            <td colSpan="3" className="px-4 py-8 text-center text-gray-500">
                                                No records for today.
                                            </td>
                                        </tr>
                                    ) : (
                                        scannedToday.map((record) => (
                                            <tr key={record._id} className="hover:bg-gray-50">
                                                <td className="px-4 py-2 text-gray-600">
                                                    {new Date(record.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </td>
                                                <td className="px-4 py-2 font-medium text-gray-800">
                                                    {record.studentId?.name || 'Unknown'}
                                                    <div className="text-xs text-gray-500 font-normal">{record.studentId?.email}</div>
                                                </td>
                                                <td className="px-4 py-2 text-green-600 font-medium">
                                                    Present
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QRScanner;
