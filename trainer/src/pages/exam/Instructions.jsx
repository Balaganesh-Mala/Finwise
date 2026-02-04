import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle, Clock, Video, FileText } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const Instructions = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [rounds, setRounds] = React.useState({
        mcq: { enabled: false },
        video: { enabled: false },
        assignment: { enabled: false }
    });

    const [checkingStatus, setCheckingStatus] = React.useState(true);

    React.useEffect(() => {
        if (user && user.hiringRounds) {
            setRounds(user.hiringRounds);
        }
    }, [user]);

    // Check Exam Status on Mount
    React.useEffect(() => {
        const checkStatus = async () => {
            try {
                if (!user) {
                    setCheckingStatus(false); // If no user, stop checking and show content
                    return;
                }
                const token = localStorage.getItem('trainerToken');
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

                const { data: exam } = await axios.get(`${API_URL}/api/trainer/exam/status`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (exam && (exam.status === 'submitted' || exam.status === 'reviewed')) {
                    navigate('/exam/success'); // Or a dedicated 'status' page if you have one
                }
            } catch (error) {
                console.error("Failed to check exam status", error);
            } finally {
                setCheckingStatus(false);
            }
        };
        checkStatus();
    }, [user, navigate]);

    const startExam = () => {
        if (!user) return;

        if (rounds.mcq?.enabled) {
            navigate('/exam/mcq');
        } else if (rounds.video?.enabled) {
            navigate('/exam/video');
        } else if (rounds.assignment?.enabled) {
            navigate('/exam/assignment');
        } else {
            navigate('/exam/success');
        }
    };

    if (checkingStatus) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Checking assessment status...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle className="text-3xl text-center text-indigo-700">Trainer Hiring Assessment</CardTitle>
                    <CardDescription className="text-center text-lg">
                        Welcome, {user?.name}. Please read the instructions carefully.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-6">
                        {rounds.mcq?.enabled && (
                            <div className="flex items-start bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                                <Clock className="mr-4 h-6 w-6 text-indigo-600 mt-1" />
                                <div>
                                    <h3 className="font-semibold text-lg text-gray-800">Round 1: Multiple Choice Questions</h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        You will face <strong>{rounds.mcq.testId?.questions?.length || rounds.mcq.questionCount || 15} questions</strong> designed to test your domain knowledge.
                                        Calculated time: ~{(rounds.mcq.testId?.questions?.length || rounds.mcq.questionCount || 15) * 2} Minutes.
                                    </p>
                                    {(rounds.mcq.testId?.instructions || rounds.mcq.instructions) ? (
                                        <div className="mt-2 text-sm text-indigo-800 bg-indigo-50 p-2.5 rounded border border-indigo-100">
                                            <strong>Note:</strong> {rounds.mcq.testId?.instructions || rounds.mcq.instructions}
                                        </div>
                                    ) : (
                                        <div className="mt-2 text-sm text-gray-500 bg-gray-50 p-2.5 rounded border border-gray-100">
                                            <strong>Note:</strong> Please complete all questions within the time limit.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        {rounds.video?.enabled && (
                            <div className="flex items-start bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                                <Video className="mr-4 h-6 w-6 text-indigo-600 mt-1" />
                                <div>
                                    <h3 className="font-semibold text-lg text-gray-800">Round 2: Video Teaching Demonstration</h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        You will be asked to record a short video/audio response. Ensure your camera and microphone are ready.
                                    </p>
                                    <p className="text-sm text-gray-800 font-medium mt-2 bg-yellow-50 p-2 rounded border border-yellow-100">
                                        <span className="text-yellow-700 font-bold">Task:</span> {rounds.video.testId?.prompt || rounds.video.testId?.instructions || rounds.video.question || "Record a 2-5 minute video explaining a concept related to your domain."}
                                    </p>
                                </div>
                            </div>
                        )}
                        {rounds.assignment?.enabled && (
                            <div className="flex items-start bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                                <FileText className="mr-4 h-6 w-6 text-indigo-600 mt-1" />
                                <div>
                                    <h3 className="font-semibold text-lg text-gray-800">Round 3: Assignment Upload</h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Upload requested documents such as Lesson Plans, Resumes, or specific Task Files (PDF/Word/Excel accepted).
                                    </p>
                                    {(rounds.assignment.testId?.instructions || rounds.assignment.question) && (
                                        <p className="text-sm text-gray-800 font-medium mt-2 bg-blue-50 p-2 rounded border border-blue-100">
                                            <span className="text-blue-700 font-bold">Details:</span> {rounds.assignment.testId?.instructions || rounds.assignment.question}
                                        </p>
                                    )}
                                    <p className="text-xs text-gray-400 mt-1 italic">
                                        * Ensure your file is under 10MB.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="rounded-lg bg-orange-50 p-5 border border-orange-100">
                        <h4 className="font-semibold text-orange-800 mb-2 flex items-center">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            General Guidelines & Tips
                        </h4>
                        <ul className="text-sm text-orange-900 space-y-1.5 list-disc list-inside">
                            <li>Ensure you have a <strong>stable internet connection</strong> to avoid submission errors.</li>
                            <li>For the Video round, find a <strong>quiet, well-lit environment</strong>. Professionalism counts!</li>
                            <li>Do not refresh the page or switch tabs during the MCQ test, as your progress may be lost.</li>
                            <li>Have your assignment files ready on your device before starting.</li>
                            <li>If you face any technical issues, please contact support immediately.</li>
                        </ul>
                    </div>

                    <Button onClick={startExam} className="w-full text-lg py-6 bg-indigo-600 hover:bg-indigo-700">
                        Start Assessment
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default Instructions;
