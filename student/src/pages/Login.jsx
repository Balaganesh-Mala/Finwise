import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

const Login = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    // Forgot Password States
    const [showForgotModal, setShowForgotModal] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotLoading, setForgotLoading] = useState(false);
    const [forgotStatus, setForgotStatus] = useState({ success: false, message: '' });

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setForgotLoading(true);
        setForgotStatus({ success: false, message: '' });

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const res = await axios.post(`${API_URL}/api/students/request-reset`, { email: forgotEmail });

            if (res.data.success) {
                setForgotStatus({ success: true, message: 'Reset link sent! Check your inbox.' });
                setForgotEmail(''); // Clear input on success
            }
        } catch (err) {
            setForgotStatus({
                success: false,
                message: err.response?.data?.message || 'Failed to send reset link. Try again.'
            });
        } finally {
            setForgotLoading(false);
        }
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const res = await axios.post(`${API_URL}/api/students/login`, {
                email: formData.email,
                password: formData.password
            });

            if (res.data.success) {
                // Save user to local storage (Simple session management)
                localStorage.setItem('studentUser', JSON.stringify(res.data.user));
                navigate('/');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center lg:justify-end lg:px-24 overflow-hidden bg-gray-900">

            {/* Full Screen Background Image */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
                    alt="Modern Campus"
                    className="w-full h-full object-cover"
                />
                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 to-indigo-900/40 backdrop-blur-[2px]"></div>
            </div>

            {/* Back Link */}
            <a href={import.meta.env.VITE_MAIN_WEBSITE_URL || 'http://localhost:5173'} className="absolute top-8 left-8 z-20 text-white/80 hover:text-white flex items-center gap-2 transition-colors">
                <div className="bg-white/10 p-2 rounded-full backdrop-blur-md">
                    <ArrowLeft size={20} />
                </div>
                <span className="font-medium">Back to Website</span>
            </a>

            {/* Brand Slogan (Left Side) - Hidden on Mobile */}
            <div className="absolute left-16 bottom-16 z-10 hidden lg:block text-white max-w-xl">
                <h1 className="text-5xl font-bold leading-tight mb-4 text-white">
                    Unlock Your Potential with <span className="text-indigo-400">JobReady.</span>
                </h1>
                <p className="text-lg text-gray-300">
                    Join thousands of students forwarding their careers with our award-winning curriculum and mentorship.
                </p>
            </div>

            {/* Login Card (Right Side) */}
            <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="w-full max-w-[450px] bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 md:p-10 relative z-10 mx-4"
            >
                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">JR</div>
                    <h2 className="text-2xl font-bold text-gray-900">Sign In to Dashboard</h2>
                    <p className="text-sm text-gray-500 mt-1">Enter your student ID credentials</p>
                </div>

                {error && (
                    <div className="p-3 mb-4 rounded-lg text-sm bg-red-50 text-red-600 border border-red-100 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                        <div className="relative">
                            <input
                                type="email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full pl-4 p-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                                placeholder="john@example.com"
                            />
                            <div className="absolute right-3 top-3 text-gray-400 hover:text-indigo-500 transition-colors">
                                <User size={20} />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full pl-4 p-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-lg shadow-lg shadow-indigo-200 transition-all transform hover:-translate-y-0.5 flex justify-center items-center gap-2"
                        >
                            {loading ? "Authenticating..." : "Login"}
                        </button>
                    </div>

                    <div className="mt-8 text-center border-t border-gray-200 pt-6">
                        <button
                            type="button"
                            onClick={() => setShowForgotModal(true)}
                            className="text-sm text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
                        >
                            Forgot your password?
                        </button>
                    </div>

                </form>
            </motion.div>

            {/* Forgot Password Modal */}
            {showForgotModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md relative"
                    >
                        <button
                            onClick={() => setShowForgotModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            ✕
                        </button>

                        <div className="text-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Reset Password</h3>
                            <p className="text-sm text-gray-500 mt-2">Enter your email to receive a reset link.</p>
                        </div>

                        {forgotStatus.message && (
                            <div className={`p-3 mb-4 rounded-lg text-sm flex items-center gap-2 ${forgotStatus.success ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                <span>{forgotStatus.success ? '✓' : '⚠'}</span>
                                {forgotStatus.message}
                            </div>
                        )}

                        <form onSubmit={handleForgotPassword} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={forgotEmail}
                                    onChange={(e) => setForgotEmail(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="Enter your registered email"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={forgotLoading}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition-colors flex justify-center"
                            >
                                {forgotLoading ? 'Sending...' : 'Send Reset Link'}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default Login;
