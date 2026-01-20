import React, { useState, useEffect } from 'react';
import { Search, Filter, MoreVertical, Trash2, CheckCircle, Clock, XCircle, Mail, Phone, MessageSquare } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Inquiries = () => {
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, new, contacted, closed

    useEffect(() => {
        fetchInquiries();
    }, []);

    const fetchInquiries = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/inquiries`);
            setInquiries(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching inquiries:', err);
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this inquiry?')) {
            try {
                await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/inquiries/${id}`);
                setInquiries(inquiries.filter(item => item._id !== id));
                toast.success('Inquiry deleted successfully');
            } catch (err) {
                console.error('Error deleting inquiry:', err);
                toast.error('Failed to delete inquiry');
            }
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            const res = await axios.patch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/inquiries/${id}`, { status: newStatus });
            setInquiries(inquiries.map(item => item._id === id ? res.data : item));
        } catch (err) {
            console.error('Error updating status:', err);
            toast.error('Failed to update status');
        }
    };

    const filteredInquiries = inquiries.filter(item => {
        if (filter === 'all') return true;
        return item.status === filter;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'new': return 'bg-blue-100 text-blue-700';
            case 'contacted': return 'bg-green-100 text-green-700';
            case 'closed': return 'bg-gray-100 text-gray-700';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading inquiries...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Inquiries & Quotes</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage student inquiries and quote requests.</p>
                </div>
                
                <div className="flex gap-2 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
                    {['all', 'new', 'contacted', 'closed'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize ${
                                filter === status 
                                    ? 'bg-indigo-600 text-white shadow-sm' 
                                    : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                                <th className="p-4">Student</th>
                                <th className="p-4">Contact Info</th>
                                <th className="p-4">Interest / Message</th>
                                <th className="p-4">Source</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Date</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredInquiries.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="p-8 text-center text-gray-500">
                                        No inquiries found matching your filter.
                                    </td>
                                </tr>
                            ) : (
                                filteredInquiries.map((inquiry) => (
                                    <tr key={inquiry._id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="p-4 align-top">
                                            <div className="font-semibold text-gray-900">{inquiry.name}</div>
                                        </td>
                                        <td className="p-4 align-top">
                                            <div className="flex flex-col space-y-1 text-sm text-gray-600">
                                                <div className="flex items-center gap-2">
                                                    <Mail size={14} className="text-gray-400" />
                                                    {inquiry.email}
                                                </div>
                                                 <div className="flex items-center gap-2">
                                                    <Phone size={14} className="text-gray-400" />
                                                    {inquiry.phone || 'N/A'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 align-top max-w-xs">
                                            <div className="text-sm">
                                                {inquiry.courseInterested && (
                                                     <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700 mb-1 border border-indigo-100">
                                                        {inquiry.courseInterested}
                                                    </span>
                                                )}
                                                <p className="text-gray-600 truncate group-hover:whitespace-normal group-hover:overflow-visible group-hover:bg-white group-hover:z-10 group-hover:absolute group-hover:shadow-lg group-hover:p-4 group-hover:rounded-lg group-hover:border group-hover:border-gray-100 group-hover:w-80">
                                                    {inquiry.message}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="p-4 align-top">
                                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${inquiry.source === 'quote_popup' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'}`}>
                                                {inquiry.source === 'quote_popup' ? 'Quote' : 'Contact'}
                                            </span>
                                        </td>
                                        <td className="p-4 align-top">
                                            <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wide ${getStatusColor(inquiry.status)}`}>
                                                {inquiry.status}
                                            </span>
                                        </td>
                                        <td className="p-4 align-top text-sm text-gray-500">
                                            {new Date(inquiry.createdAt).toLocaleDateString()}
                                            <br />
                                            <span className="text-xs text-gray-400">
                                                {new Date(inquiry.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </span>
                                        </td>
                                        <td className="p-4 align-top text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {inquiry.status === 'new' && (
                                                    <button 
                                                        onClick={() => handleStatusUpdate(inquiry._id, 'contacted')}
                                                        title="Mark as Contacted"
                                                        className="p-1.5 rounded-md hover:bg-green-50 text-gray-400 hover:text-green-600 transition-colors"
                                                    >
                                                        <CheckCircle size={18} />
                                                    </button>
                                                )}
                                                {inquiry.status === 'contacted' && (
                                                     <button 
                                                        onClick={() => handleStatusUpdate(inquiry._id, 'closed')}
                                                        title="Mark as Closed"
                                                        className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                                                    >
                                                        <XCircle size={18} />
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={() => handleDelete(inquiry._id)}
                                                    title="Delete"
                                                    className="p-1.5 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination (Static for now) */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-sm text-gray-500">
                    <div>Showing {filteredInquiries.length} results</div>
                </div>
            </div>
        </div>
    );
};

export default Inquiries;
