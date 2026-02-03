import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Video, FileText, CheckCircle, XCircle } from 'lucide-react';

const TrainerDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [trainer, setTrainer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [courses, setCourses] = useState([]); // All available courses
    const [isAssigning, setIsAssigning] = useState(false);
    const [selectedCourses, setSelectedCourses] = useState([]);

    useEffect(() => {
        const fetchTrainer = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/admin/trainers/${id}`);
                setTrainer(res.data);
                if (res.data.assignedCourses) {
                    setSelectedCourses(res.data.assignedCourses.map(c => c._id));
                }
            } catch (error) {
                toast.error('Failed to load details');
            } finally {
                setLoading(false);
            }
        };

        const fetchCourses = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/courses');
                setCourses(res.data);
            } catch (error) {
                console.error('Failed to fetch courses', error);
            }
        };

        fetchTrainer();
        fetchCourses();
    }, [id]);

    const updateStatus = async (newStatus) => {
        if (!window.confirm(`Mark as ${newStatus}?`)) return;
        try {
            await axios.put(`http://localhost:5000/api/admin/trainers/status/${id}`, { status: newStatus });
            toast.success('Status updated');
            navigate('/trainers');
        } catch (error) {
            toast.error('Update failed');
        }
    };

    const handleAssignCourses = async () => {
        try {
            const res = await axios.put(`http://localhost:5000/api/admin/trainers/status/${id}`, {
                assignedCourses: selectedCourses
            });
            setTrainer(prev => ({ ...prev, assignedCourses: res.data.assignedCourses }));
            toast.success('Courses assigned updated');
            setIsAssigning(false);
        } catch (error) {
            toast.error('Failed to assign courses');
        }
    };

    // Toggle course selection
    const toggleCourse = (courseId) => {
        if (selectedCourses.includes(courseId)) {
            setSelectedCourses(selectedCourses.filter(id => id !== courseId));
        } else {
            setSelectedCourses([...selectedCourses, courseId]);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!trainer) return <div>Not Found</div>;

    const { exam } = trainer;
    const totalQuestions = trainer.hiringRounds?.mcq?.testId?.questions?.length || trainer.hiringRounds?.mcq?.questionCount || 15;
    const maxScore = totalQuestions * 5;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <button onClick={() => navigate('/trainers')} className="flex items-center text-gray-600 hover:text-black">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
            </button>

            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-indigo-500">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{trainer.name}</h1>
                        <p className="text-gray-500">{trainer.email} • {trainer.role}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold capitalize 
                        ${trainer.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {trainer.status}
                    </span>
                </div>

                {/* Course Assignment Section */}
                <div className="mt-6 border-t border-indigo-100 pt-4">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                            Assigned Courses
                            <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full">
                                {trainer.assignedCourses?.length || 0}
                            </span>
                        </h3>
                        <button
                            onClick={() => setIsAssigning(!isAssigning)}
                            className="text-sm text-indigo-600 font-medium hover:underline"
                        >
                            {isAssigning ? 'Cancel' : 'Manage Access'}
                        </button>
                    </div>

                    {isAssigning ? (
                        <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                                {courses.map(course => (
                                    <label key={course._id} className="flex items-center space-x-2 p-2 bg-white rounded border border-gray-200 cursor-pointer hover:border-indigo-300">
                                        <input
                                            type="checkbox"
                                            checked={selectedCourses.includes(course._id)}
                                            onChange={() => toggleCourse(course._id)}
                                            className="rounded text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span className="text-sm text-gray-700 truncate" title={course.title}>{course.title}</span>
                                    </label>
                                ))}
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={handleAssignCourses}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {trainer.assignedCourses && trainer.assignedCourses.length > 0 ? (
                                trainer.assignedCourses.map(course => (
                                    <span key={course._id || course} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm border border-gray-200">
                                        {typeof course === 'object' ? course.title : 'Details hidden'}
                                    </span>
                                ))
                            ) : (
                                <p className="text-sm text-gray-400 italic">No courses assigned yet. This trainer cannot manage content.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Exam Results */}
            {exam ? (
                <div className="space-y-6">
                    {/* Scores */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-6 rounded-lg shadow text-center">
                            <h3 className="text-gray-500 font-medium uppercase text-xs">MCQ Score</h3>
                            <p className="text-3xl font-bold text-indigo-600">{exam.mcqScore || 0} / {maxScore}</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow text-center">
                            <h3 className="text-gray-500 font-medium uppercase text-xs">Exam Status</h3>
                            <p className="text-xl font-bold text-gray-800 capitalize">{exam.status || 'Pending'}</p>
                        </div>
                    </div>

                    {/* Submissions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Video */}
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="font-bold flex items-center mb-4"><Video className="mr-2 h-5 w-5 text-red-500" /> Video Submission</h3>
                            {exam.videoUrl ? (
                                <div className="flex flex-col items-center w-full space-y-2">
                                    <video
                                        src={exam.videoUrl}
                                        id="admin-video-player"
                                        className="w-full rounded bg-black h-48 object-cover transform -scale-x-100"
                                    // No native controls to avoid reverse text
                                    />
                                    <div className="flex items-center space-x-4">
                                        <button
                                            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm font-medium"
                                            onClick={() => document.getElementById('admin-video-player').play()}
                                        >
                                            Play
                                        </button>
                                        <button
                                            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm font-medium"
                                            onClick={() => document.getElementById('admin-video-player').pause()}
                                        >
                                            Pause
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-400">* Mirrored View</p>
                                </div>
                            ) : (
                                <p className="text-gray-400 italic">No video submitted.</p>
                            )}
                        </div>

                        {/* Written & Assignments */}
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="font-bold flex items-center mb-4"><FileText className="mr-2 h-5 w-5 text-blue-500" /> Written & Files</h3>

                            <div className="mb-4">
                                <h4 className="text-sm font-semibold text-gray-600 mb-1">Written Test:</h4>
                                <div className="bg-gray-50 p-3 rounded text-sm text-gray-800 max-h-40 overflow-auto">
                                    {exam.writtenTest || "No written response."}
                                </div>
                            </div>

                            <div>
                                <h4 className="text-sm font-semibold text-gray-600 mb-1">Assignments:</h4>
                                {exam.assignments && exam.assignments.length > 0 ? (
                                    <ul className="space-y-1">
                                        {exam.assignments.map((url, idx) => (
                                            <li key={idx}>
                                                <a href={url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm truncate block">
                                                    Download File {idx + 1}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-gray-400 text-sm italic">No files uploaded.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            onClick={() => updateStatus('rejected')}
                            className="flex items-center px-4 py-2 border border-red-300 text-red-700 rounded hover:bg-red-50"
                        >
                            <XCircle className="mr-2 h-4 w-4" /> Reject Candidate
                        </button>
                        <button
                            onClick={() => updateStatus('active')}
                            className="flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 shadow-md"
                        >
                            <CheckCircle className="mr-2 h-4 w-4" /> Hire & Activate
                        </button>
                    </div>

                </div>
            ) : (
                <div className="p-10 text-center bg-white rounded shadow">
                    <p className="text-gray-400">No exam data available yet.</p>
                </div>
            )}
        </div>
    );
};

export default TrainerDetails;
