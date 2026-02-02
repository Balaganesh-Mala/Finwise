import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, ExternalLink } from "lucide-react";
import axios from "axios";

export default function PDFPreviewModal({ isOpen, onClose, application }) {
    const [previewUrl, setPreviewUrl] = useState(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen && application) {
            handlePreview();
        } else {
            // Cleanup on close
            // if (previewUrl) {
            //   URL.revokeObjectURL(previewUrl); 
            // }
            setPreviewUrl(null);
            setError(null);
        }
    }, [isOpen, application]);

    const handlePreview = async () => {
        try {
            setPreviewLoading(true);
            setError(null);

            // Use the proxy route (now returns JSON with URL)
            const res = await axios.get(
                `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/applications/${application._id}/preview`
            );

            if (res.data && res.data.url) {
                setPreviewUrl(res.data.url);
            } else {
                throw new Error("No URL returned from server");
            }

        } catch (err) {
            console.error("PDF PREVIEW ERROR:", err);
            setError("Failed to load PDF document");
        } finally {
            setPreviewLoading(false);
        }
    };

    if (!isOpen || !application) return null;

    return createPortal(
        <div className="fixed inset-0 z-[1000] flex items-center justify-center px-4">
            {/* BACKDROP */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            {/* MODAL */}
            <div className="relative bg-white w-full max-w-5xl h-[90vh] rounded-2xl shadow-2xl z-10 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">

                {/* HEADER */}
                <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            Resume Preview
                            <span className="text-xs font-normal text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
                                {application.fullName}
                            </span>
                        </h2>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => window.open(previewUrl || application.resumeUrl, '_blank')}
                            className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Open in New Tab"
                        >
                            <ExternalLink size={20} />
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
                <div className="flex-1 relative bg-gray-100 p-4">
                    {previewLoading ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 z-10">
                            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                            <p className="font-medium">Loading Resume...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center h-full text-center p-8">
                            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
                                <X size={32} />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Could not load preview</h3>
                            <p className="text-gray-500 max-w-md">{error}</p>
                            <a
                                href={`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/applications/${application._id}/download`}
                                className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                Download Instead
                            </a>
                        </div>
                    ) : (
                        <iframe
                            src={previewUrl}
                            title="PDF Preview"
                            className="w-full h-full rounded-lg shadow-sm bg-white"
                        />
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}
