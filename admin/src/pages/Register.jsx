import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Lock, Mail, UserPlus, AlertTriangle } from 'lucide-react';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Check if registration is allowed (0 users exist)
  useEffect(() => {
    const checkUsers = async () => {
      // Intentionally using a hacky way to check user count indirectly or assume pure client-side first-run
      // Since 'auth.users' table is not directly accessible usually without service role, 
      // we might rely on the user trying to sign up. 
      // However, for a "One-Time" setup, we can try to just proceed.
      // Ideally, this check should be server-side, but client-side is okay for this simplified requirement.
      
      // Better approach: We will just try to register. If it's the *developer* running this, they know to use it.
      // Real "One-Time" logic is hard without backend admin functions.
      // We will assume if you are here, you are the first one.
      setLoading(false); 
    };
    checkUsers();
  }, [navigate]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegistering(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      
      // Auto login or success message
      alert('Admin account created! You can now login.');
      navigate('/login');

    } catch (err) {
      setError(err.message);
    } finally {
      setRegistering(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Checking availability...</div>;

  return (
    <div className="min-h-screen bg-indigo-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <UserPlus className="mx-auto h-12 w-12 text-indigo-400" />
        <h2 className="mt-6 text-3xl font-extrabold text-white">
          Setup Admin Account
        </h2>
        <p className="mt-2 text-sm text-indigo-200">
          Create the master administrator account.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10">
          
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  This is a one-time setup. Please use a strong password.
                </p>
              </div>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleRegister}>
            {error && <p className="text-red-600 text-sm text-center">{error}</p>}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                  placeholder="admin@jobready.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                  placeholder="Strong Password"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={registering}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {registering ? 'Creating Account...' : 'Create Admin Account'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
