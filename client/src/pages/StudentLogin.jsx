import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock, Eye, EyeOff, ArrowLeft, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';

const StudentLogin = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    // State for Login vs Set Password vs Forgot Password
    const [mode, setMode] = useState('login'); // 'login' | 'set_password' | 'forgot_password'
    const [message, setMessage] = useState(null); // { type: 'error' | 'success', text: '' }

    const [formData, setFormData] = useState({
        identifier: '',
        password: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        // 1. Check for errors in URL (e.g. Link expired)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const errorDescription = hashParams.get('error_description');
        if (errorDescription) {
            setMessage({ type: 'error', text: errorDescription.replaceAll('+', ' ') });
        }

        // 2. Check for "Password Recovery" or "Invite" event
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'PASSWORD_RECOVERY') {
                setMode('set_password');
                setMessage({ type: 'success', text: 'To complete your setup, please create a new password.' });
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        const { data, error } = await supabase.auth.signInWithPassword({
            email: formData.identifier,
            password: formData.password,
        });

        if (error) {
            setMessage({ type: 'error', text: error.message });
            setLoading(false);
        } else {
            // Successful Login
            navigate('/'); // Todo: Redirect to Student Dashboard
        }
    };

    const handleRecoverPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        // Make sure to add this URL to Supabase -> Authentication -> URL Configuration -> Redirect URLs
        const redirectTo = `${window.location.origin}/student/login`;

        const { data, error } = await supabase.auth.resetPasswordForEmail(formData.identifier, {
            redirectTo: redirectTo,
        });

        if (error) {
            setMessage({ type: 'error', text: error.message });
        } else {
            setMessage({ type: 'success', text: 'Check your email for the password reset link!' });
        }
        setLoading(false);
    };

    const handleSetPassword = async (e) => {
        e.preventDefault();
        if (formData.newPassword !== formData.confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match!' });
            return;
        }

        setLoading(true);
        const { data, error } = await supabase.auth.updateUser({
            password: formData.newPassword
        });

        if (error) {
            setMessage({ type: 'error', text: error.message });
            setLoading(false);
        } else {
            setMessage({ type: 'success', text: 'Password set successfully! Redirecting...' });
            setTimeout(() => {
                navigate('/'); // Todo: Redirect to Student Dashboard
            }, 2000);
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
            <Link to="/" className="absolute top-8 left-8 z-20 text-white/80 hover:text-white flex items-center gap-2 transition-colors">
                <div className="bg-white/10 p-2 rounded-full backdrop-blur-md">
                    <ArrowLeft size={20} />
                </div>
                <span className="font-medium">Back to Website</span>
            </Link>

            {/* Brand Slogan (Left Side) - Hidden on Mobile */}
            <div className="absolute left-16 bottom-16 z-10 hidden lg:block text-white max-w-xl">
                <h1 className="text-5xl font-bold leading-tight mb-4 text-white">
                    Unlock Your Potentional with <span className="text-indigo-400">Skill Up Academy.</span>
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
                    <h2 className="text-2xl font-bold text-gray-900">
                        {mode === 'login' && 'Sign In to Dashboard'}
                        {mode === 'set_password' && 'Set Your Password'}
                        {mode === 'forgot_password' && 'Reset Password'}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        {mode === 'login' && 'Enter your details to proceed'}
                        {mode === 'set_password' && 'Welcome! Please create a secure password.'}
                        {mode === 'forgot_password' && 'Enter your email to receive a reset link.'}
                    </p>
                </div>

                {message && (
                    <div className={`p-3 mb-4 rounded-lg text-sm ${message.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                        {message.text}
                    </div>
                )}

                {mode === 'login' && (
                    // Login Form
                    <form onSubmit={handleLogin} className="space-y-5">

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                            <div className="relative">
                                <input
                                    type="email"
                                    name="identifier"
                                    required
                                    value={formData.identifier}
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
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-semibold text-gray-700">Password</label>
                                <button
                                    type="button"
                                    onClick={() => { setMode('forgot_password'); setMessage(null); }}
                                    className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                                >
                                    Forgot?
                                </button>
                            </div>
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
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-lg shadow-lg shadow-indigo-200 transition-all transform hover:-translate-y-0.5"
                            >
                                {loading ? "Authenticating..." : "Login"}
                            </button>
                        </div>

                        <div className="relative py-2">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white/95 px-2 text-gray-400">Or login with</span>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button type="button" className="flex-1 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 flex justify-center transition-colors">
                                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                            </button>
                            <button type="button" className="flex-1 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 flex justify-center transition-colors">
                                <img src="https://www.svgrepo.com/show/448234/linkedin.svg" alt="LinkedIn" className="w-5 h-5" />
                            </button>
                        </div>

                    </form>
                )}

                {mode === 'forgot_password' && (
                    // Forgot Password Form
                    <form onSubmit={handleRecoverPassword} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                            <div className="relative">
                                <input
                                    type="email"
                                    name="identifier"
                                    required
                                    value={formData.identifier}
                                    onChange={handleChange}
                                    className="w-full pl-4 p-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                                    placeholder="john@example.com"
                                />
                                <div className="absolute right-3 top-3 text-gray-400">
                                    <Mail size={20} />
                                </div>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-lg shadow-lg shadow-indigo-200 transition-all transform hover:-translate-y-0.5"
                            >
                                {loading ? "Sending..." : "Send Reset Link"}
                            </button>
                        </div>

                        <div className="text-center pt-2">
                            <button
                                type="button"
                                onClick={() => { setMode('login'); setMessage(null); }}
                                className="text-indigo-600 font-medium hover:underline text-sm"
                            >
                                Back to Login
                            </button>
                        </div>
                    </form>
                )}

                {mode === 'set_password' && (
                    // Set Password Form
                    <form onSubmit={handleSetPassword} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">New Password</label>
                            <input
                                type="password"
                                name="newPassword"
                                required
                                value={formData.newPassword}
                                onChange={handleChange}
                                className="w-full pl-4 p-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Confirm Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                required
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="w-full pl-4 p-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-lg shadow-lg shadow-indigo-200 transition-all transform hover:-translate-y-0.5"
                            >
                                {loading ? "Updating..." : "Set Password & Login"}
                            </button>
                        </div>
                    </form>
                )}

                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-600">
                        Need an account?{' '}
                        <Link to="/contact" className="font-bold text-indigo-600 hover:underline">
                            Apply Now
                        </Link>
                    </p>
                </div>

            </motion.div>
        </div>
    );
};

export default StudentLogin;
