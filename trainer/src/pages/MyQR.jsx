import React, { useState, useEffect, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; // Import AuthContext

const MyQR = () => {
    const [qrData, setQrData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [status, setStatus] = useState('Initializing...');
    const componentRef = useRef();

    // Get user and API_URL from context
    // Note: AuthContext in trainer provides API_URL which has '/api/trainer' appended usually
    // But our QR routes are at '/api/qr/trainer/...'.
    // So we need the base URL.
    const { user } = useAuth();
    const BASE_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    useEffect(() => {
        if (user) {
            fetchQR(user._id);
        }
    }, [user]);

    const fetchQR = async (trainerId) => {
        try {
            setLoading(true);
            setStatus('Fetching QR Code...');

            // Try to get existing QR
            try {
                const res = await axios.get(`${BASE_API_URL}/api/qr/trainer/${trainerId}`);
                setQrData(res.data);
                setStatus('Ready');
                setLoading(false);
            } catch (err) {
                if (err.response && err.response.status === 404) {
                    setStatus('QR Not Found. Generating New One...');
                    await generateQR(trainerId);
                } else {
                    throw err;
                }
            }
        } catch (err) {
            console.error("Fetch QR Failed:", err);
            setError(`Failed to load QR: ${err.message}`);
            setLoading(false);
        }
    };

    const generateQR = async (trainerId) => {
        try {
            setStatus('Generating QR Code...');
            const genRes = await axios.post(`${BASE_API_URL}/api/qr/trainer/generate/${trainerId}`);

            if (genRes.data.success) {
                setQrData({
                    qrImageURL: genRes.data.qrImageURL,
                    tokenCreatedAt: new Date()
                });
                setStatus('Ready');
            } else {
                setError('Server failed to generate QR');
            }
        } catch (genErr) {
            console.error("Generation Error:", genErr);
            setError(`Failed to generate QR: ${genErr.response?.data?.message || genErr.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
    });

    if (!user) return <div>Loading User...</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-8">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                        My Trainer QR
                    </h2>
                    <p className="mt-2 text-sm text-gray-500">
                        Scan this code at the admin desk to mark your attendance.
                    </p>
                </div>

                <div className="mt-8 flex justify-center" ref={componentRef}>
                    {loading ? (
                        <div className="animate-pulse flex flex-col items-center space-y-4">
                            <div className="rounded-full bg-gray-200 h-12 w-12"></div>
                            <p className="text-sm text-indigo-600 font-medium">{status}</p>
                        </div>
                    ) : error ? (
                        <div className="text-red-500 bg-red-50 p-4 rounded-md border border-red-200">
                            <p>{error}</p>
                            <button onClick={() => window.location.reload()} className="mt-2 text-indigo-600 underline">Retry</button>
                        </div>
                    ) : qrData ? (
                        <div className="flex flex-col items-center p-8 border-4 border-dashed border-gray-200 rounded-lg bg-gray-50">
                            <img
                                src={qrData.qrImageURL}
                                alt="Trainer QR Code"
                                className="w-64 h-64 object-contain bg-white p-2 rounded-lg shadow-sm"
                            />
                            <p className="mt-4 text-xs text-gray-400">
                                Generated: {new Date(qrData.tokenCreatedAt).toLocaleDateString()}
                            </p>
                        </div>
                    ) : null}
                </div>

                <div className="mt-8 flex justify-center space-x-4">
                    {qrData && (
                        <>
                            <a
                                href={qrData.qrImageURL}
                                download="My_Trainer_QR.png"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 shadow-sm"
                            >
                                Download
                            </a>
                            <button
                                onClick={handlePrint}
                                className="px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-md hover:bg-gray-50 shadow-sm"
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
