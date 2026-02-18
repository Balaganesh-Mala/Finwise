import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Clock, Trash2, Plus, User, Phone, Mail, BookOpen, Search } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const ManageDemos = () => {
    const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' or 'slots'
    const [bookings, setBookings] = useState([]);
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);

    // Slot Creation State
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedTimes, setSelectedTimes] = useState([]);

    const timeOptions = [
        "10:00 AM", "11:00 AM", "12:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM"
    ];

    const toggleTime = (time) => {
        if (selectedTimes.includes(time)) {
            setSelectedTimes(selectedTimes.filter(t => t !== time));
        } else {
            setSelectedTimes([...selectedTimes, time]);
        }
    };

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            if (activeTab === 'bookings') {
                const res = await axios.get(`${baseUrl}/api/demos/bookings`);
                setBookings(res.data);
            } else {
                const res = await axios.get(`${baseUrl}/api/demos/slots`);
                setSlots(res.data);
            }
        } catch (err) {
            console.error("Error fetching data:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSlot = async () => {
        if (selectedTimes.length === 0) {
            alert("Please select at least one time slot.");
            return;
        }

        try {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

            const slotsPayload = selectedTimes.map(time => {
                // Normalize to UTC Noon/Midnight to avoid timezone shifts
                // We want the "date" to represent the calendar day strictly
                const utcDate = new Date(Date.UTC(
                    selectedDate.getFullYear(),
                    selectedDate.getMonth(),
                    selectedDate.getDate()
                ));

                return {
                    date: utcDate,
                    time: time
                };
            });

            const payload = {
                slots: slotsPayload
            };

            await axios.post(`${baseUrl}/api/demos/slots`, payload);
            alert("Slots created successfully!");
            setSelectedTimes([]);
            fetchData(); // Refresh list
        } catch (err) {
            console.error("Error creating slot:", err);
            alert("Failed to create slots. Some might already exist.");
        }
    };

    const handleDeleteSlot = async (id) => {
        if (!window.confirm("Are you sure you want to delete this slot?")) return;
        try {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            await axios.delete(`${baseUrl}/api/demos/slots/${id}`);
            fetchData();
        } catch (err) {
            console.error("Error deleting slot:", err);
        }
    };

    return (
        <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Demo Management</h1>
                    <p className="text-gray-500 text-sm">Manage free demo bookings and available time slots</p>
                </div>

                <div className="flex bg-white rounded-lg p-1 shadow-sm border border-gray-200">
                    <button
                        onClick={() => setActiveTab('bookings')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'bookings' ? 'bg-primary-50 text-primary-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Bookings
                    </button>
                    <button
                        onClick={() => setActiveTab('slots')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'slots' ? 'bg-primary-50 text-primary-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Manage Slots
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
            ) : (
                <>
                    {activeTab === 'bookings' && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                                            <th className="p-4">Student</th>
                                            <th className="p-4">Contact</th>
                                            <th className="p-4">Course Intent</th>
                                            <th className="p-4">Requested Slot</th>
                                            <th className="p-4">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {bookings.length > 0 ? bookings.map((booking) => (
                                            <tr key={booking._id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-xs">
                                                            {booking.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-semibold text-gray-900">{booking.name}</p>
                                                            <p className="text-xs text-gray-500">{booking.education}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex flex-col gap-1 text-sm text-gray-600">
                                                        <div className="flex items-center gap-2">
                                                            <Mail size={14} className="text-gray-400" /> {booking.email}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Phone size={14} className="text-gray-400" /> {booking.phone}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">
                                                        <BookOpen size={12} /> {booking.course}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="text-sm text-gray-700 font-medium">
                                                        {new Date(booking.date).toLocaleDateString()}
                                                    </div>
                                                    <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                                        <Clock size={12} /> {booking.timeSlot}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${booking.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                                                        booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-gray-100 text-gray-600'
                                                        }`}>
                                                        {booking.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="5" className="p-8 text-center text-gray-500 text-sm">
                                                    No bookings found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'slots' && (
                        <div className="grid lg:grid-cols-3 gap-6">
                            {/* Create Slot Form */}
                            <div className="lg:col-span-1">
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <Plus size={20} className="text-primary-600" /> Create New Slot
                                    </h3>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
                                            <DatePicker
                                                selected={selectedDate}
                                                onChange={(date) => setSelectedDate(date)}
                                                minDate={new Date()}
                                                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Select Time(s)</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {timeOptions.map(time => (
                                                    <button
                                                        key={time}
                                                        onClick={() => toggleTime(time)}
                                                        className={`py-2 px-3 text-sm rounded-lg border transition-all ${selectedTimes.includes(time)
                                                            ? 'bg-primary-600 text-white border-primary-600 shadow-md'
                                                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                                            }`}
                                                    >
                                                        {time}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleCreateSlot}
                                            className="w-full py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all shadow-lg shadow-gray-200 mt-4"
                                        >
                                            Add Available Slot
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Slots List */}
                            <div className="lg:col-span-2">
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                    <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                                        <h3 className="font-semibold text-gray-700">Available Slots</h3>
                                        <span className="text-xs font-medium bg-white px-2 py-1 rounded border border-gray-200 text-gray-500">
                                            Total: {slots.length}
                                        </span>
                                    </div>
                                    <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                                        {slots.length > 0 ? slots.map((slot) => (
                                            <div key={slot._id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex flex-col items-center justify-center border border-blue-100">
                                                        <span className="text-[10px] font-bold uppercase leading-none">
                                                            {new Date(slot.date).toLocaleString('default', { month: 'short' })}
                                                        </span>
                                                        <span className="text-lg font-bold leading-none">
                                                            {new Date(slot.date).getDate()}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-900 font-semibold flex items-center gap-2">
                                                            {slot.time}
                                                            {slot.isBooked && (
                                                                <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-[10px] rounded uppercase">Booked</span>
                                                            )}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {new Date(slot.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric' })}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {!slot.isBooked && (
                                                        <button
                                                            onClick={() => handleDeleteSlot(slot._id)}
                                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Delete Slot"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        )) : (
                                            <div className="p-8 text-center text-gray-500">
                                                No slots available. Create one to get started.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ManageDemos;
