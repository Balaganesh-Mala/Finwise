import React from 'react';
import { Link } from 'react-router-dom';
import { Home, MoveLeft } from 'lucide-react';

const NotFound = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6 md:px-12 lg:px-24 py-20">
            <div className="max-w-3xl w-full text-center">
                {/* Large 404 Text with Gradient */}
                <h1 className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 select-none opacity-50 mb-8">
                    404
                </h1>

                <div className="relative -mt-20 sm:-mt-24 mb-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Page Not Found
                    </h2>
                    <p className="text-lg text-gray-600 max-w-lg mx-auto mb-8">
                        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link
                            to="/dashboard"
                            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-200"
                        >
                            <Home className="mr-2" size={20} />
                            Back to Dashboard
                        </Link>

                        <button
                            onClick={() => window.history.back()}
                            className="inline-flex items-center justify-center px-6 py-3 border border-gray-200 text-base font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-all hover:shadow-md"
                        >
                            <MoveLeft className="mr-2" size={20} />
                            Go Back
                        </button>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-100/30 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
            </div>
        </div>
    );
};

export default NotFound;
