import React, { useState, useEffect, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import axios from 'axios';

const MyQR = () => {
    const [qrData, setQrData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [status, setStatus] = useState('Initializing...');
    const componentRef = useRef();

    useEffect(() => {
        const fetchUserAndQR = async () => {
            try {
                setStatus('Checking Authentication...');
                const storedUser = localStorage.getItem('studentUser');

                if (storedUser) {
                    const user = JSON.parse(storedUser);
                    console.log("User Authenticated:", user._id);
                    await fetchQR(user._id);
                } else {
                    console.warn("User not authenticated");
                    setError('User not authenticated. Please log in.');
                    setLoading(false);
                }
            } catch (err) {
                console.error("Auth Check Failed:", err);
                setError('Authentication check failed. Please refresh.');
                setLoading(false);
            }
        };
        fetchUserAndQR();
    }, []);

    const fetchQR = async (userId) => {
        try {
            setLoading(true);
            setStatus('Fetching QR Code from Server...');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            console.log(`Fetching QR for: ${userId} at ${apiUrl}`);

            // The backend is smart enough to check by ID or Supabase ID
            let res = await axios.get(`${apiUrl}/api/qr/${userId}`);

            console.log("QR Fetch Response:", res.data);
            setQrData(res.data);
            setLoading(false);
            setStatus('Ready');
        } catch (err) {
            console.error("Fetch QR Failed:", err);

            if (err.response && err.response.status === 404) {
                setStatus('QR Not Found. Generating New One...');
                await generateQR(userId);
            } else {
                setError(`Failed to load QR: ${err.message}`);
                setLoading(false);
            }
        }
    };

    const generateQR = async (userId) => {
        try {
            setStatus('Generating QR Code...');
            setStatus('Generating QR Code...');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const genRes = await axios.post(`${apiUrl}/api/qr/generate/${userId}`);

            if (genRes.data.success) {
                console.log("QR Generated:", genRes.data);
                setQrData({
                    qrImageURL: genRes.data.qrImageURL,
                    tokenCreatedAt: new Date()
                });
                setStatus('Ready');
            } else {
                setError('Server failed to generate QR');
            }
            setLoading(false);
        } catch (genErr) {
            console.error("Generation Error:", genErr);
            setError(`Failed to generate QR: ${genErr.response?.data?.message || genErr.message}`);
            setLoading(false);
        }
    };

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
    });

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-8">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                        My Attendance QR
                    </h2>
                    <p className="mt-2 text-sm text-gray-500">
                        Scan this code at the entrance to mark your attendance.
                    </p>
                </div>

                <div className="mt-8 flex justify-center" ref={componentRef}>
                    {loading ? (
                        <div className="animate-pulse flex flex-col items-center space-y-4">
                            <div className="rounded-full bg-gray-200 h-12 w-12"></div>
                            <div className="flex-1 space-y-4 py-1 w-full max-w-xs">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                                <div className="space-y-2">
                                    <div className="h-4 bg-gray-200 rounded"></div>
                                    <div className="h-4 bg-gray-200 rounded w-5/6 mx-auto"></div>
                                </div>
                            </div>
                            <p className="text-sm text-indigo-600 font-medium">{status}</p>
                        </div>
                    ) : error ? (
                        <div className="text-red-500 bg-red-50 p-4 rounded-md border border-red-200">
                            <p className="font-bold">Error Loading QR</p>
                            <p className="text-sm">{error}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="mt-2 text-indigo-600 hover:text-indigo-800 text-sm font-semibold"
                            >
                                Try Refreshing
                            </button>
                        </div>
                    ) : qrData ? (
                        <div className="flex flex-col items-center p-8 border-4 border-dashed border-gray-200 rounded-lg bg-gray-50">
                            <img
                                src={qrData.qrImageURL}
                                alt="Student QR Code"
                                className="w-64 h-64 object-contain bg-white p-2 rounded-lg shadow-sm"
                            />
                            <p className="mt-4 text-xs text-gray-400">
                                Generated: {new Date(qrData.tokenCreatedAt).toLocaleDateString()}
                            </p>
                        </div>
                    ) : (
                        <div className="text-gray-500">No QR Code found. Please contact admin.</div>
                    )}
                </div>

                <div className="mt-8 flex justify-center space-x-4">
                    {qrData && (
                        <>
                            <a
                                href={qrData.qrImageURL}
                                download="My_Attendance_QR.png"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm"
                            >
                                Download
                            </a>
                            <button
                                onClick={handlePrint}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm"
                            >
                                Print
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyQR;
