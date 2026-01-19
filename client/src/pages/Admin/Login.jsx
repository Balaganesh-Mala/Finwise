import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Todo: Implement API login
    if (email === 'admin@jobready.com' && password === 'admin123') {
        // success
        navigate('/admin/dashboard');
    } else {
        alert('Invalid credentials (use admin@jobready.com / admin123)');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
           <h1 className="text-2xl font-bold text-gray-900">Admin Login</h1>
           <p className="text-gray-500">Sign in to manage the dashboard</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input 
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="admin@jobready.com"
                />
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input 
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="••••••••"
                />
            </div>
            
            <button 
                type="submit"
                className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition-colors"
            >
                Sign In
            </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
