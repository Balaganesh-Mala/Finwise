import React, { useState, useEffect } from 'react';
import * as interviewService from '../services/interviewService';
import { Calendar, ChevronRight } from 'lucide-react';

const InterviewHistory = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadHistory = async () => {
            const storedUser = localStorage.getItem('studentUser');
            if (storedUser) {
                const user = JSON.parse(storedUser);
                console.log("Current User:", user?._id);
                try {
                    const data = await interviewService.getHistory(user._id);
                    console.log("Loaded History:", data);
                    setHistory(data);
                } catch (err) {
                    console.error("Failed to load history", err);
                }
            }
            setLoading(false);
        };
        loadHistory();
    }, []);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading history...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Your Interview History</h1>

                <div className="space-y-4">
                    {history.map((session) => (
                        <div key={session._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-center">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-wide">
                                            {session.interviewType}
                                        </span>
                                        <span className="text-gray-400 text-sm flex items-center gap-1">
                                            <Calendar size={14} /> {new Date(session.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h3 className="font-semibold text-gray-800 text-lg">
                                        Score: <span className={session.finalScore?.total >= 7 ? 'text-green-600' : 'text-orange-500'}>{session.finalScore?.total || 0}/10</span>
                                    </h3>
                                </div>
                                <ChevronRight className="text-gray-300" />
                            </div>

                            <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase">Communication</p>
                                    <p className="font-bold text-gray-800">{session.finalScore?.communication || 0}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase">Technical</p>
                                    <p className="font-bold text-gray-800">{session.finalScore?.technical || 0}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase">Confidence</p>
                                    <p className="font-bold text-gray-800">{session.finalScore?.confidence || 0}</p>
                                </div>
                            </div>
                        </div>
                    ))}

                    {history.length === 0 && (
                        <div className="text-center py-12 text-gray-400">
                            No interviews found. Start your first mock interview!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InterviewHistory;
