import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Check, ChevronRight, AlertCircle, FileText, CheckCircle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const JobApplicationModal = ({ job, isOpen, onClose }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Initial State matches the previous one but we will use better names for consent
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        email: '',
        resume: null
    });

    const [consents, setConsents] = useState({
        salary: null,
        hiringProcess: null,
        interview: null,
        joining: null,
        terms: false
    });

    if (!isOpen || !job) return null;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('File size exceeds 5MB');
                return;
            }
            setFormData(prev => ({ ...prev, resume: file }));
        }
    };

    const handleConsentChange = (key, value) => {
        setConsents(prev => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const loadingToast = toast.loading('Submitting your application...');

        try {
            const data = new FormData();
            data.append('jobId', job._id);
            data.append('fullName', formData.fullName);
            data.append('email', formData.email);
            data.append('phone', formData.phone);
            data.append('resume', formData.resume);

            // Convert consents to the structure expected by backend schema if needed
            // Or just stringify the object
            data.append('consent', JSON.stringify({
                salary: consents.salary === 'yes',
                hiringProcess: consents.hiringProcess === 'yes',
                interview: consents.interview === 'yes',
                joining: consents.joining === 'yes',
                terms: consents.terms
            }));

            await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/applications`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            toast.dismiss(loadingToast);
            toast.custom((t) => (
                <div
                    className={`${t.visible ? 'animate-enter' : 'animate-leave'
                        } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
                >
                    <div className="flex-1 w-0 p-4">
                        <div className="flex items-start">
                            <div className="flex-shrink-0 pt-0.5">
                                <CheckCircle className="h-10 w-10 text-green-500" />
                            </div>
                            <div className="ml-3 flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                    Application Submitted!
                                </p>
                                <p className="mt-1 text-sm text-gray-500">
                                    Your application for {job.title} has been received. We will contact you soon.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex border-l border-gray-200">
                        <button
                            onClick={() => toast.dismiss(t.id)}
                            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            Close
                        </button>
                    </div>
                </div>
            ), { duration: 5000 });

            setTimeout(() => {
                onClose();
                setStep(1);
                setFormData({ fullName: '', phone: '', email: '', resume: null });
                setConsents({ salary: null, hiringProcess: null, interview: null, joining: null, terms: false });
            }, 2000);

        } catch (error) {
            console.error(error);
            toast.dismiss(loadingToast);
            toast.error(error.response?.data?.msg || 'Failed to submit application. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const isStep1Valid = formData.fullName && formData.email && formData.phone.length >= 10 && formData.resume;
    const isStep2Valid = consents.salary === 'yes' &&
        consents.hiringProcess === 'yes' &&
        consents.interview === 'yes' &&
        consents.joining === 'yes' &&
        consents.terms;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden relative flex flex-col max-h-[90vh]"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="bg-gray-50 px-8 py-6 border-b border-gray-100 flex justify-between items-center flex-shrink-0">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Apply for {job.title}</h2>
                            <p className="text-gray-500 text-sm mt-1">{job.company}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1 bg-gray-100">
                        <motion.div
                            className="h-full bg-[#FF7F50]"
                            initial={{ width: "0%" }}
                            animate={{ width: step === 1 ? "50%" : "100%" }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>

                    {/* Body */}
                    <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
                        <form id="application-form">
                            {step === 1 ? (
                                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs">1</span>
                                        Personal Details
                                    </h3>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                        <input
                                            type="text"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleInputChange}
                                            placeholder="Ex: Bala Ganesh Mala"
                                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Registered Mobile Number</label>
                                        <div className="flex">
                                            <span className="inline-flex items-center px-4 rounded-l-lg border border-r-0 border-gray-200 bg-gray-50 text-gray-500 text-sm font-medium">
                                                IN +91
                                            </span>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                placeholder="9876543210"
                                                className="w-full px-4 py-3 rounded-r-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Registered Email ID</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            placeholder="malabalaganesh@gmail.com"
                                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Upload your Resume
                                            <span className="block text-xs font-normal text-gray-500 mt-0.5">Make your resume stronger by adding unique projects with a focus on React.</span>
                                        </label>
                                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-primary-400 transition-colors bg-gray-50 group cursor-pointer relative">
                                            <input
                                                type="file"
                                                accept=".pdf,.doc,.docx,.jpg,.png"
                                                onChange={handleFileUpload}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            />
                                            {formData.resume ? (
                                                <div className="flex flex-col items-center text-primary-600">
                                                    <FileText size={40} className="mb-2" />
                                                    <span className="font-medium text-sm">{formData.resume.name}</span>
                                                    <span className="text-xs text-green-600 mt-1">File Selected</span>
                                                </div>
                                            ) : (
                                                <>
                                                    <Upload size={32} className="mx-auto text-gray-400 mb-3 group-hover:text-primary-500 transition-colors" />
                                                    <p className="text-sm text-gray-600 font-medium">
                                                        <span className="text-primary-600">Click to upload</span> or drag and drop
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-1">PNG, JPG, PDF up to 5 MB</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs">2</span>
                                        Consent & Declaration
                                    </h3>

                                    {[
                                        {
                                            id: 'salary',
                                            text: 'Are you willing to accept the specified Salary/Stipend, Location, Bond, and Role, and have you thoroughly reviewed the Important Notes provided in the Job Details?'
                                        },
                                        {
                                            id: 'hiringProcess',
                                            text: 'Are you willing to participate in the entire hiring process, including assessments and assignments, with the awareness that absence from any interview stage may result in a temporary two-month profile suspension?'
                                        },
                                        {
                                            id: 'interview',
                                            text: 'Will you be available for the in-person interview process (offline drive) at the mentioned location and date, (if applicable)?'
                                        },
                                        {
                                            id: 'joining',
                                            text: 'If you are selected, will you accept the offer & join immediately?'
                                        }
                                    ].map((q) => (
                                        <div key={q.id} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                            <p className="text-sm font-medium text-gray-800 mb-3 leading-relaxed">{q.text}</p>
                                            <div className="flex gap-6">
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name={q.id}
                                                        value="yes"
                                                        checked={consents[q.id] === 'yes'}
                                                        onChange={() => handleConsentChange(q.id, 'yes')}
                                                        className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                                                    />
                                                    <span className="text-sm text-gray-700">Yes</span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name={q.id}
                                                        value="no"
                                                        checked={consents[q.id] === 'no'}
                                                        onChange={() => handleConsentChange(q.id, 'no')}
                                                        className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                                                    />
                                                    <span className="text-sm text-gray-700">No</span>
                                                </label>
                                            </div>
                                        </div>
                                    ))}

                                    <div className="flex items-start gap-3 p-4 bg-orange-50 border border-orange-100 rounded-xl">
                                        <AlertCircle size={20} className="text-orange-600 flex-shrink-0 mt-0.5" />
                                        <div className="text-sm text-orange-800">
                                            <label className="flex items-start gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    name="terms"
                                                    checked={consents.terms}
                                                    onChange={(e) => handleConsentChange('terms', e.target.checked)}
                                                    className="w-4 h-4 mt-0.5 text-primary-600 focus:ring-primary-500 rounded flex-shrink-0"
                                                />
                                                <span>
                                                    Submit your application only if you fully agree with Terms & Conditions, failure to accept any of them will result in your profile being rejected.
                                                </span>
                                            </label>
                                        </div>
                                    </div>

                                    <p className="text-xs text-gray-500 text-center">
                                        The deadline for applying to this job is <span className="font-semibold text-gray-900">
                                            {job.deadline ? new Date(job.deadline).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            }) : 'Open until filled'}
                                        </span>
                                    </p>
                                </div>
                            )}
                        </form>
                    </div>

                    {/* Footer - Fixed */}
                    <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-between items-center flex-shrink-0">
                        {step === 2 && (
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="px-6 py-2.5 rounded-lg text-gray-600 font-semibold hover:bg-gray-200 transition-colors"
                            >
                                Back
                            </button>
                        )}
                        <div className="ml-auto">
                            {step === 1 ? (
                                <button
                                    type="button"
                                    onClick={() => isStep1Valid && setStep(2)}
                                    disabled={!isStep1Valid}
                                    className="px-8 py-3 rounded-xl bg-gray-900 text-white font-bold hover:bg-gray-800 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    Next Step <ChevronRight size={18} />
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubmit}
                                    disabled={!isStep2Valid || loading}
                                    className="px-8 py-3 rounded-xl bg-[#FF7F50] text-white font-bold hover:bg-[#e64a19] transition-colors shadow-lg shadow-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {loading ? 'Submitting...' : 'Submit Application'} <Check size={18} />
                                </button>
                            )}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default JobApplicationModal;
