import React, { useState } from 'react';
import { UserPlus, Mail, AlertCircle, CheckCircle } from 'lucide-react';
import axios from 'axios';

const Students = () => {
    const [inviteData, setInviteData] = useState({ name: '', email: '' });
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null); // { type: 'success' | 'error', message: '' }

    const handleInvite = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);

        try {
            // Call Backend API (Port 5000)
            const res = await axios.post('http://localhost:5000/api/students/invite', inviteData);
            
            setStatus({ type: 'success', message: res.data.message });
            setInviteData({ name: '', email: '' }); // Reset form
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Failed to send invitation';
            setStatus({ type: 'error', message: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Student Management</h1>
                    <p className="text-gray-500 text-sm">Validating, inviting, and managing students.</p>
                </div>
            </div>

            {/* Invite Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-2xl">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                        <UserPlus size={24} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Invite New Student</h2>
                        <p className="text-sm text-gray-500">Send an email invitation with password setup link.</p>
                    </div>
                </div>

                {status && (
                    <div className={`p-4 mb-6 rounded-lg flex items-center gap-3 ${status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {status.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                        <p>{status.message}</p>
                    </div>
                )}

                <form onSubmit={handleInvite} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Student Name</label>
                            <input 
                                type="text" 
                                required
                                value={inviteData.name}
                                onChange={(e) => setInviteData({...inviteData, name: e.target.value})}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="Enter full name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                            <div className="relative">
                                <input 
                                    type="email" 
                                    required
                                    value={inviteData.email}
                                    onChange={(e) => setInviteData({...inviteData, email: e.target.value})}
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="student@example.com"
                                />
                                <Mail className="absolute left-3 top-2.5 text-gray-400" size={18} />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-70 flex items-center gap-2"
                        >
                            {loading ? 'Sending Invite...' : (
                                <>
                                    <UserPlus size={18} /> Send Invitation
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
            
            <div className="mt-8">
                 <h2 className="text-lg font-bold text-gray-800 mb-4">All Students</h2>
                 <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
                     <p>Student list integration coming soon...</p>
                 </div>
            </div>
        </div>
    );
};

export default Students;
