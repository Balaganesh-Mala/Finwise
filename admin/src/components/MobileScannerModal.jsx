import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import axios from 'axios';
import { X, CheckCircle, XCircle } from 'lucide-react';
import Swal from 'sweetalert2';

const MobileScannerModal = ({ onClose }) => {
    const [scanResult, setScanResult] = useState(null);
    const [isScanning, setIsScanning] = useState(false);
    const [loading, setLoading] = useState(false);

    const scannerRef = useRef(null);
    const processingRef = useRef(false);
    const lastScanRef = useRef({ text: '', time: 0 });

    useEffect(() => {
        let isMounted = true;

        // Timeout to allow DOM rendering before starting
        const startTimeout = setTimeout(() => {
            if (isMounted) startScanner();
        }, 300);

        return () => {
            isMounted = false;
            clearTimeout(startTimeout);
            stopScanner();
        };
    }, []);

    const startScanner = async () => {
        if (window.isSecureContext === false) {
            Swal.fire({
                title: 'Security Requirement',
                text: 'Camera access requires a Secure Context (HTTPS) or Localhost.',
                icon: 'warning',
                confirmButtonColor: '#4f46e5'
            });
            onClose();
            return;
        }

        try {
            const html5QrCode = new Html5Qrcode("mobile-scanner-reader");
            scannerRef.current = html5QrCode;

            await html5QrCode.start(
                { facingMode: "environment" },
                {
                    fps: 5,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0
                },
                (decodedText) => handleScan(decodedText),
                () => { } // ignore errors
            );
            setIsScanning(true);
        } catch (err) {
            console.error("Failed to start mobile scanner", err);
            onClose();
        }
    };

    const stopScanner = async () => {
        if (scannerRef.current) {
            try {
                await scannerRef.current.stop();
                scannerRef.current.clear();
            } catch (err) {
                console.error("Failed to stop scanner", err);
            }
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
        setLoading(true);
        setScanResult(null);

        try {
            const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
            audio.play().catch(() => { });

            let payload;
            try {
                payload = JSON.parse(qrText);
            } catch (e) {
                setScanResult({ success: false, message: 'Invalid QR Format' });
                processingRef.current = false;
                setLoading(false);
                setTimeout(() => setScanResult(null), 3000);
                return;
            }

            const { studentId, trainerId, token } = payload;
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

            let res;
            if (trainerId) {
                res = await axios.post(`${apiUrl}/api/attendance/trainer/qr-mark`, { trainerId, token });
            } else if (studentId) {
                res = await axios.post(`${apiUrl}/api/attendance/qr-mark`, { studentId, token });
            } else {
                throw new Error('Invalid QR Data');
            }

            setScanResult(res.data);

            setTimeout(() => {
                setScanResult(null);
            }, 3000);

        } catch (err) {
            setScanResult({ success: false, message: err.response?.data?.message || err.message });
            setTimeout(() => setScanResult(null), 3000);
        }

        setLoading(false);
        processingRef.current = false;
    };

    return (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm flex flex-col pt-10 px-4 animate-in fade-in duration-200">
            <button
                onClick={onClose}
                className="absolute top-6 right-6 bg-white/10 p-2 rounded-full text-white hover:bg-white/20 transition-colors z-50"
            >
                <X size={24} />
            </button>

            <div className="text-center text-white mb-8">
                <h2 className="text-2xl font-bold">Scanning...</h2>
                <p className="text-white/70 text-sm mt-2">Point camera at a JobReady QR Code</p>
            </div>

            <div className="w-full max-w-sm mx-auto aspect-square bg-black rounded-3xl overflow-hidden relative shadow-2xl ring-4 ring-indigo-500/50">
                <div id="mobile-scanner-reader" className="w-full h-full"></div>

                {/* Scanner Target Box Overlay */}
                <div className="absolute inset-0 pointer-events-none custom-scanner-overlay flex items-center justify-center">
                    <div className="w-64 h-64 border-2 border-indigo-500 rounded-3xl relative">
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-3xl"></div>
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-3xl"></div>
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-3xl"></div>
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-3xl"></div>
                        {isScanning && (
                            <div className="w-full h-1 bg-indigo-500/80 shadow-[0_0_15px_rgba(99,102,241,0.8)] absolute top-0 animate-[scan_2s_ease-in-out_infinite]"></div>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-8 mx-auto w-full max-w-sm">
                {loading && (
                    <div className="text-center p-4 bg-indigo-900/50 text-indigo-100 rounded-xl border border-indigo-500/30 animate-pulse">
                        Processing scan...
                    </div>
                )}

                {scanResult && !loading && (
                    <div className={`p-4 rounded-xl border flex items-center gap-3 shadow-lg animate-in slide-in-from-bottom-4 ${scanResult.success
                            ? 'bg-green-500/20 border-green-500/50 text-green-100'
                            : 'bg-red-500/20 border-red-500/50 text-red-100'
                        }`}>
                        {scanResult.success ? <CheckCircle className="text-green-400" /> : <XCircle className="text-red-400" />}
                        <div>
                            <p className="font-bold text-sm">{scanResult.message}</p>
                            {scanResult.student && (
                                <p className="text-xs opacity-80 mt-1">{scanResult.student.name}</p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes scan {
                    0%, 100% { top: 0; }
                    50% { top: 100%; }
                }
                .custom-scanner-overlay {
                    background: radial-gradient(circle, transparent 60%, rgba(0,0,0,0.4) 120%);
                }
            `}} />
        </div>
    );
};

export default MobileScannerModal;
