import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, Phone, Mail, GraduationCap, BookOpen, CheckCircle } from 'lucide-react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const BookDemoModal = ({ isOpen, onClose }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        course: '',
        education: '',
        date: new Date(),
        timeSlot: '',
        name: '',
        phone: '',
        email: ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [courses, setCourses] = useState([]);
    const [timeSlots, setTimeSlots] = useState([]);
    const [fetchingSlots, setFetchingSlots] = useState(false);
    const [coursesLoading, setCoursesLoading] = useState(false);

    const resetForm = () => {
        setStep(1);
        setSuccess(false);
        setFormData({
            course: '',
            education: '',
            date: new Date(),
            timeSlot: '',
            name: '',
            phone: '',
            email: ''
        });
        setTimeSlots([]);
    };

    useEffect(() => {
        if (isOpen) {
            setStep(1);
            fetchCourses();
            fetchSlots(new Date());
        }
    }, [isOpen]);

    // Fetch methods
    const fetchCourses = async () => {
        setCoursesLoading(true);
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/courses`);
            // Assuming res.data is array of course objects with title
            if (Array.isArray(res.data)) {
                // Filter active courses if needed, or just map titles
                // If the API returns objects like { _id, title, ... }
                const courseTitles = res.data.map(c => c.title);
                setCourses(courseTitles);
            }
        } catch (err) {
            console.error("Error fetching courses", err);
            // Fallback
            setCourses(["Full Stack Development", "Data Science", "Digital Marketing"]);
        } finally {
            setCoursesLoading(false);
        }
    };

    const fetchSlots = async (date) => {
        setFetchingSlots(true);
        try {
            // Normalize to UTC Midnight to match Admin creation
            const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));

            const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/demos/slots`, {
                params: { date: utcDate.toISOString() }
            });
            // Backend returns array of slot objects: { time: "10:00 AM", isBooked: false, ... }
            // unique times
            const available = res.data.map(s => s.time);
            setTimeSlots(available);
        } catch (err) {
            console.error("Error fetching slots", err);
            setTimeSlots([]);
        } finally {
            setFetchingSlots(false);
        }
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const educationLevels = [
        "Undergraduate",
        "Post Graduate",
        "Working Professional"
    ];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleDateChange = (date) => {
        setFormData({ ...formData, date, timeSlot: '' }); // Reset slot when date changes
        fetchSlots(date);
    };

    const handleSlotSelect = (slot) => {
        setFormData({ ...formData, timeSlot: slot });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/demos/book`, formData);
            setSuccess(true);
        } catch (err) {
            console.error("Booking failed", err);
            alert("Failed to book demo. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Book Your Free Demo</h2>
                        <p className="text-xs text-gray-500 mt-1">Take the first step towards your career</p>
                    </div>
                    <button onClick={handleClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
                        <X size={20} />
                    </button>
                </div>

                {success ? (
                    <div className="p-12 flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                            <CheckCircle size={32} className="text-green-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h3>
                        <p className="text-gray-600 mb-8">
                            Thank you, <span className="font-semibold">{formData.name}</span>. We have sent a confirmation details to your email.
                        </p>
                        <button
                            onClick={handleClose}
                            className="w-full py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all"
                        >
                            Close
                        </button>
                    </div>
                ) : (
                    <div className="p-6">
                        {/* Progress Steps */}
                        <div className="flex items-center justify-center gap-2 mb-8">
                            {[1, 2, 3].map((s) => (
                                <div key={s} className={`h-2 rounded-full flex-1 transition-all ${s <= step ? 'bg-primary-500' : 'bg-gray-100'}`} />
                            ))}
                        </div>

                        <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); setStep(step + 1); }}>

                            {/* Step 1: Course & Education */}
                            {step === 1 && (
                                <div className="space-y-4 animate-in slide-in-from-right duration-300">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Course Interest</label>
                                        <div className="grid grid-cols-1 gap-2">
                                            {coursesLoading ? (
                                                <>
                                                    {[1, 2, 3].map(i => (
                                                        <div key={i} className="p-3 rounded-xl border border-gray-100 bg-gray-50 flex items-center gap-3 animate-pulse">
                                                            <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
                                                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                                        </div>
                                                    ))}
                                                </>
                                            ) : (
                                                courses.map(course => (
                                                    <div
                                                        key={course}
                                                        onClick={() => setFormData({ ...formData, course })}
                                                        className={`p-3 rounded-xl border cursor-pointer flex items-center gap-3 transition-all ${formData.course === course ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 hover:border-gray-300'}`}
                                                    >
                                                        <BookOpen size={18} className={formData.course === course ? 'text-primary-500' : 'text-gray-400'} />
                                                        <span className="text-sm font-medium">{course}</span>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Current Education Level</label>
                                        <div className="relative">
                                            <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <select
                                                name="education"
                                                value={formData.education}
                                                onChange={handleChange}
                                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none appearance-none bg-white"
                                                required
                                            >
                                                <option value="">Select Education</option>
                                                {educationLevels.map(level => (
                                                    <option key={level} value={level}>{level}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Date & Time */}
                            {step === 2 && (
                                <div className="space-y-6 animate-in slide-in-from-right duration-300">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
                                        <div className="border border-gray-200 rounded-xl p-1">
                                            <DatePicker
                                                selected={formData.date}
                                                onChange={handleDateChange}
                                                minDate={new Date()}
                                                inline
                                                calendarClassName="w-full border-none shadow-none"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Time Slot</label>
                                        {fetchingSlots ? (
                                            <div className="text-center py-4 text-gray-500 text-sm">Checking availability...</div>
                                        ) : timeSlots.length > 0 ? (
                                            <div className="grid grid-cols-3 gap-2">
                                                {timeSlots.map(slot => (
                                                    <div
                                                        key={slot}
                                                        onClick={() => handleSlotSelect(slot)}
                                                        className={`py-2 px-1 text-center rounded-lg border text-sm cursor-pointer transition-all ${formData.timeSlot === slot ? 'bg-primary-500 text-white border-primary-500' : 'border-gray-200 hover:border-gray-300 text-gray-600'}`}
                                                    >
                                                        {slot}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-4 bg-gray-50 rounded-lg text-gray-500 text-sm border border-gray-100">
                                                No slots available for this date.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Personal Details */}
                            {step === 3 && (
                                <div className="space-y-4 animate-in slide-in-from-right duration-300">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                                                placeholder="John Doe"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                                                placeholder="+91 98765 43210"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                                                placeholder="john@example.com"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Footer Buttons */}
                            <div className="mt-8 flex gap-3">
                                {step > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => setStep(step - 1)}
                                        className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                                    >
                                        Back
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    disabled={
                                        (step === 1 && (!formData.course || !formData.education)) ||
                                        (step === 2 && (!formData.date || !formData.timeSlot)) ||
                                        loading
                                    }
                                    className="flex-1 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-all shadow-lg shadow-primary-200 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                                >
                                    {loading ? (
                                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        step === 3 ? "Confirm Booking" : "Next Step"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookDemoModal;
