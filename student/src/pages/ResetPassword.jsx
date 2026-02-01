import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Lock, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setStatus({ type: 'error', message: 'Passwords do not match!' });
            return;
        }

        if (password.length < 6) {
            setStatus({ type: 'error', message: 'Password must be at least 6 characters.' });
            return;
        }

        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const res = await axios.post(`${API_URL}/api/students/reset-password`, {
                token,
                newPassword: password
            });

            if (res.data.success) {
                setStatus({ type: 'success', message: 'Password reset successfully!' });
                setTimeout(() => navigate('/login'), 3000);
            }
        } catch (err) {
            setStatus({
                type: 'error',
                message: err.response?.data?.message || 'Failed to reset password. Link might be expired.'
            });
        } finally {
            setLoading(false);
        }
    };

    if (status.type === 'success') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-sm w-full">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="text-green-600" size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Success!</h2>
                    <p className="text-gray-600 mb-6">Your password has been reset. Redirecting to login...</p>
                    <Link to="/login" className="block w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition">
                        Login Now
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
                    alt="Background"
                    className="w-full h-full object-cover opacity-20"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 relative z-10"
            >
                <div className="text-center mb-8">
                    <div className="mx-auto w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
                        <Lock className="text-indigo-600" size={24} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Set New Password</h2>
                    <p className="text-gray-500 mt-2 text-sm">Create a strong password for your account</p>
                </div>

                {status.type === 'error' && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 flex items-center gap-2 text-sm border border-red-100">
                        <AlertCircle size={16} />
                        {status.message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                        <input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-lg shadow-lg shadow-indigo-100 transition-all flex justify-center items-center gap-2"
                    >
                        {loading ? 'Resetting...' : 'Update Password'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <Link to="/login" className="inline-flex items-center text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors">
                        <ArrowLeft size={16} className="mr-1" /> Back to Login
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default ResetPassword;
