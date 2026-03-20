import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, ExternalLink, RefreshCw, Download } from "lucide-react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function PDFPreviewModal({ isOpen, onClose, application }) {
    const [blobUrl, setBlobUrl] = useState(null);
    const [directUrl, setDirectUrl] = useState(null); // For URL-based (Google Drive etc.) resumes
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const prevBlobUrl = useRef(null);

    const loadPdf = async () => {
        if (!application) return;
        setLoading(true);
        setError(null);
        setBlobUrl(null);
        setDirectUrl(null);

        try {
            const res = await axios.get(
                `${API_URL}/api/applications/${application._id}/preview`,
                { responseType: 'blob' }
            );

            // Check if the server returned JSON (for direct URL resumes)
            const contentType = res.headers?.['content-type'] || '';
            if (contentType.includes('application/json')) {
                // Parse the JSON from the blob
                const text = await res.data.text();
                const json = JSON.parse(text);
                if (json.directUrl) {
                    setDirectUrl(json.directUrl);
                    return;
                }
            }

            // Otherwise it's a streamed PDF — create a blob URL
            const blob = new Blob([res.data], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            if (prevBlobUrl.current) URL.revokeObjectURL(prevBlobUrl.current);
            prevBlobUrl.current = url;
            setBlobUrl(url);
        } catch (err) {
            console.error("PDF load error:", err);
            if (err.response?.data?.code === 'OLD_FORMAT') {
                setError("This resume was uploaded in an older format and cannot be previewed. Use the Download button instead, or ask the applicant to resubmit.");
            } else {
                setError("Could not load the PDF. Please try downloading it instead.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && application) {
            loadPdf();
        }
        // Cleanup blob URL when modal closes
        return () => {
            if (prevBlobUrl.current) {
                URL.revokeObjectURL(prevBlobUrl.current);
                prevBlobUrl.current = null;
            }
        };
    }, [isOpen, application]);

    if (!isOpen || !application) return null;

    return createPortal(
        <div className="fixed inset-0 z-[1000] flex items-center justify-center px-4">
            {/* BACKDROP */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

            {/* MODAL */}
            <div className="relative bg-white w-full max-w-5xl h-[90vh] rounded-2xl shadow-2xl z-10 overflow-hidden flex flex-col">

                {/* HEADER */}
                <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50 flex-shrink-0">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            📄 Resume Preview
                            <span className="text-xs font-normal text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
                                {application.fullName}
                            </span>
                        </h2>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={loadPdf}
                            disabled={loading}
                            className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-40"
                            title="Reload"
                        >
                            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                        </button>
                        <a
                            href={`${API_URL}/api/applications/${application._id}/download`}
                            className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Download PDF"
                        >
                            <Download size={18} />
                        </a>
                        <button
                            onClick={() => window.open(application.resumeUrl, '_blank')}
                            className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Open original file"
                        >
                            <ExternalLink size={18} />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Close"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* BODY */}
                <div className="flex-1 relative bg-gray-200">
                    {loading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 z-10">
                            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
                            <p className="font-semibold text-gray-600">Loading PDF...</p>
                            <p className="text-xs text-gray-400 mt-1">Fetching resume from server</p>
                        </div>
                    )}

                    {error && !loading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 z-10 p-8 text-center">
                            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
                                <X size={32} />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Could not load preview</h3>
                            <p className="text-gray-500 text-sm max-w-sm">{error}</p>
                            <a
                                href={`${API_URL}/api/applications/${application._id}/download`}
                                className="mt-6 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold text-sm"
                            >
                                Download PDF Instead
                            </a>
                        </div>
                    )}

                    {directUrl && !loading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 p-8 text-center">
                            <div className="w-20 h-20 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mb-5">
                                <ExternalLink size={36} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">External Resume Link</h3>
                            <p className="text-gray-500 text-sm max-w-md mb-2">
                                This applicant submitted a link to their resume (e.g. Google Drive or Dropbox).
                                It cannot be embedded — click below to open it.
                            </p>
                            <p className="text-xs text-gray-400 bg-gray-100 px-3 py-1.5 rounded-lg font-mono mb-6 max-w-sm truncate">
                                {directUrl}
                            </p>
                            <a
                                href={directUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-semibold text-sm flex items-center gap-2"
                            >
                                <ExternalLink size={16} /> Open Resume in New Tab
                            </a>
                        </div>
                    )}

                    {blobUrl && !loading && (
                        <iframe
                            src={blobUrl}
                            title={`Resume - ${application.fullName}`}
                            className="w-full h-full border-0"
                        />
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}
