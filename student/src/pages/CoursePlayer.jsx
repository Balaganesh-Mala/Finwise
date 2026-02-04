import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    PlayCircle, CheckCircle, FileText, MessageSquare, Star,
    ChevronDown, ChevronRight, Download, Menu, ArrowLeft, Clock,
    Edit2, Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';

const CoursePlayer = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [modules, setModules] = useState([]);
    const [activeTopic, setActiveTopic] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('description'); // description, notes, comments

    // Progress State
    const [progress, setProgress] = useState({}); // topicId -> { completed, watchedDuration }
    const videoRef = useRef(null);

    // Initial Data Fetch

    // Helper to get YouTube ID
    const getYouTubeVideoId = (url) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch Course Details
                const courseRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/courses/${courseId}`);
                setCourse(courseRes.data);

                // 2. Fetch Modules
                const modulesRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/courses/${courseId}`);
                // Wait for the specific module structure. 
                // Wait, my backend /api/courses returns course object. 
                // I need /api/modules/:courseId for modules list!
                // Let's fix that detail. 
                const modulesListRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/modules/${courseId}`);

                // 3. For each module, fetch topics
                const modulesWithTopics = await Promise.all(modulesListRes.data.modules.map(async (mod) => {
                    const topicsRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/topics/${mod._id}`);
                    return { ...mod, topics: topicsRes.data.topics };
                }));
                setModules(modulesWithTopics);

                // 4. Fetch User Progress (Assume we have studentId from somewhere, or the backend handles it via token/session if we had auth middleware correctly set. 
                // Current Auth is localStorage based. We need the student ID from local storage.)
                const storedUser = JSON.parse(localStorage.getItem('studentUser'));
                if (storedUser) {
                    const progressRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/student/progress/${courseId}/${storedUser._id}`);
                    const progressMap = {};
                    progressRes.data.progress.forEach(p => {
                        progressMap[p.topicId] = p;
                    });
                    setProgress(progressMap);
                }

                // Set initial active topic (first one)
                if (modulesWithTopics.length > 0 && modulesWithTopics[0].topics.length > 0) {
                    setActiveTopic(modulesWithTopics[0].topics[0]);
                }

                setLoading(false);
            } catch (err) {
                console.error(err);
                toast.error('Failed to load course content');
                setLoading(false);
            }
        };
        fetchData();
    }, [courseId]);

    // Handle Video Progress
    const handleVideoProgress = async () => {
        if (!videoRef.current || !activeTopic) return;

        const currentTime = videoRef.current.currentTime;
        const duration = videoRef.current.duration;
        const progressPercent = (currentTime / duration) * 100;

        // Auto-mark complete at 90%
        if (progressPercent > 90 && (!progress[activeTopic._id] || !progress[activeTopic._id].completed)) {
            await updateProgress(true, currentTime);
        }
    };

    const updateProgress = async (completed, watchedDuration) => {
        const storedUser = JSON.parse(localStorage.getItem('studentUser'));
        if (!storedUser || !activeTopic) return;

        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/student/progress/update`, {
                studentId: storedUser._id,
                courseId: courseId,
                topicId: activeTopic._id,
                completed: completed,
                watchedDuration: watchedDuration
            });

            setProgress(prev => ({
                ...prev,
                [activeTopic._id]: { ...prev[activeTopic._id], completed, watchedDuration }
            }));

            if (completed) toast.success('Lesson Completed!');
        } catch (err) {
            console.error('Progress sync failed', err);
        }
    };



    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [commentLoading, setCommentLoading] = useState(false);

    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editMessage, setEditMessage] = useState('');

    useEffect(() => {
        if (activeTab === 'discussion' && activeTopic) {
            fetchComments();
        }
    }, [activeTab, activeTopic]);

    const fetchComments = async () => {
        try {
            setCommentLoading(true);
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/student/comment/${activeTopic._id}`);
            setComments(res.data.comments);
        } catch (err) {
            console.error('Failed to fetch comments', err);
        } finally {
            setCommentLoading(false);
        }
    };

    const handlePostComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        const storedUser = JSON.parse(localStorage.getItem('studentUser'));
        if (!storedUser) return toast.error('Please login to comment');

        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/student/comment/add`, {
                topicId: activeTopic._id,
                studentId: storedUser._id,
                message: newComment
            });

            setComments([res.data.comment, ...comments]);
            setNewComment('');
            toast.success('Comment posted!');
        } catch (err) {
            console.error(err);
            toast.error('Failed to post comment');
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm("Delete this comment?")) return;
        const storedUser = JSON.parse(localStorage.getItem('studentUser'));

        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/comment/${commentId}`, {
                data: { studentId: storedUser._id }
            });
            setComments(comments.filter(c => c._id !== commentId));
            toast.success("Comment deleted");
        } catch (err) {
            toast.error("Failed to delete");
        }
    };

    const startEditing = (comment) => {
        setEditingCommentId(comment._id);
        setEditMessage(comment.message);
    };

    const cancelEditing = () => {
        setEditingCommentId(null);
        setEditMessage('');
    };

    const handleUpdateComment = async (commentId) => {
        const storedUser = JSON.parse(localStorage.getItem('studentUser'));
        try {
            const res = await axios.put(`${import.meta.env.VITE_API_URL}/api/comment/${commentId}`, {
                studentId: storedUser._id,
                message: editMessage
            });

            // Update local state
            setComments(comments.map(c => c._id === commentId ? res.data.comment : c));
            setEditingCommentId(null);
            toast.success("Comment updated");
        } catch (err) {
            toast.error("Failed to update");
        }
    };

    // Get current user for permission check
    const currentUser = JSON.parse(localStorage.getItem('studentUser'));

    if (loading) return <div className="h-screen flex items-center justify-center text-indigo-600 font-medium">Loading Course...</div>;

    return (
        <div className="flex h-screen bg-gray-50 flex-col md:flex-row overflow-hidden">
            {/* Sidebar Code */}
            <div className={`
                ${sidebarOpen ? 'w-full md:w-80' : 'w-0'} 
                bg-white border-r border-gray-200 flex-shrink-0 transition-all duration-300 flex flex-col z-20 absolute md:static h-full
            `}>
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white">
                    <h2 className="font-bold text-gray-800 line-clamp-1">{course?.title}</h2>
                    <button onClick={() => setSidebarOpen(false)} className="p-1 md:hidden">
                        <ArrowLeft size={20} />
                    </button>
                </div>

                <div className="overflow-y-auto flex-1 p-2 space-y-2">
                    {modules.length === 0 && (
                        <div className="p-4 text-center text-gray-500 text-sm">
                            <p>No modules found for this course.</p>
                            <p className="text-xs mt-2 text-indigo-500">Course ID: {courseId}</p>
                        </div>
                    )}
                    {modules.map((module, mIdx) => (
                        <div key={module._id} className="mb-2">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider px-3 py-2 mb-1">
                                Module {mIdx + 1}: {module.title}
                            </h3>
                            <div className="space-y-1">
                                {module.topics.map((topic, tIdx) => (
                                    <button
                                        key={topic._id}
                                        onClick={() => {
                                            setActiveTopic(topic);
                                            // On mobile, close sidebar after selection
                                            if (window.innerWidth < 768) setSidebarOpen(false);
                                        }}
                                        className={`w-full text-left p-3 rounded-lg flex items-start gap-3 transition-colors ${activeTopic?._id === topic._id
                                            ? 'bg-indigo-50 border-indigo-200'
                                            : 'hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className="mt-0.5">
                                            {progress[topic._id]?.completed ? (
                                                <CheckCircle size={16} className="text-green-500 fill-green-50" />
                                            ) : (
                                                <PlayCircle size={16} className={activeTopic?._id === topic._id ? 'text-indigo-600' : 'text-gray-400'} />
                                            )}
                                        </div>
                                        <div>
                                            <p className={`text-sm font-medium ${activeTopic?._id === topic._id ? 'text-indigo-700' : 'text-gray-700'}`}>
                                                {tIdx + 1}. {topic.title}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                                    <Clock size={10} /> {topic.duration}m
                                                </span>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full bg-gray-50 overflow-hidden relative w-full">

                {/* Top Bar */}
                <div className="h-16 bg-white border-b border-gray-200 flex items-center px-4 justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600">
                            <Menu size={20} />
                        </button>
                        <h1 className="font-semibold text-gray-800 line-clamp-1 hidden md:block">
                            {activeTopic?.title || 'Course Player'}
                        </h1>
                    </div>
                    <button onClick={() => navigate('/courses')} className="text-sm font-medium text-gray-500 hover:text-gray-800">
                        Back to Dashboard
                    </button>
                </div>

                {/* Content Scrollable */}
                <div className="flex-1 overflow-y-auto p-0 md:p-6 w-full">
                    {activeTopic ? (
                        <div className="max-w-4xl mx-auto space-y-6">

                            {/* Video Player Container */}
                            <div className="bg-black aspect-video w-full rounded-none md:rounded-xl overflow-hidden shadow-lg sticky top-0 md:static z-10 relative group">
                                {activeTopic.videoUrl ? (
                                    (activeTopic.videoUrl.includes('youtube.com') || activeTopic.videoUrl.includes('youtu.be')) ? (
                                        <div className="w-full h-full">
                                            <iframe
                                                className="w-full h-full"
                                                src={`https://www.youtube.com/embed/${getYouTubeVideoId(activeTopic.videoUrl)}?enablejsapi=1`}
                                                title={activeTopic.title}
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                            ></iframe>
                                            {/* Manual Complete Button for YouTube */}
                                            {/* Manual Complete Button Moved */}
                                        </div>
                                    ) : (
                                        <video
                                            ref={videoRef}
                                            src={activeTopic.videoUrl}
                                            controls
                                            controlsList="nodownload" // Disable download button
                                            onContextMenu={(e) => e.preventDefault()} // Disable right-click
                                            className="w-full h-full"
                                            onTimeUpdate={handleVideoProgress}
                                            onEnded={() => updateProgress(true, videoRef.current.duration)}
                                        >
                                            Your browser does not support the video tag.
                                        </video>
                                    )
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-900 text-gray-500">
                                        <p>No video available for this lesson.</p>
                                    </div>
                                )}
                            </div>

                            {/* Lesson Controls Toolbar */}
                            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold text-gray-800 line-clamp-1">{activeTopic.title}</h3>
                                    <p className="text-xs text-gray-500 mt-0.5">Lesson {modules.findIndex(m => m.topics.some(t => t._id === activeTopic._id)) + 1}.{modules.find(m => m.topics.some(t => t._id === activeTopic._id))?.topics.findIndex(t => t._id === activeTopic._id) + 1}</p>
                                </div>
                                <button
                                    onClick={() => updateProgress(!progress[activeTopic._id]?.completed, 1800)}
                                    className={`
                                        px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-all flex items-center gap-2
                                        ${progress[activeTopic._id]?.completed
                                            ? 'bg-green-100 text-green-700 border border-green-200 hover:bg-green-200'
                                            : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200'}
                                    `}
                                >
                                    {progress[activeTopic._id]?.completed ? (
                                        <>
                                            <CheckCircle size={16} className="fill-current" /> Completed
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle size={16} /> Mark Complete
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Tabs & Details */}
                            <div className="px-4 md:px-0 pb-10">
                                <div className="border-b border-gray-200 mb-6 flex gap-6 overflow-x-auto">
                                    {['Description', 'Notes', 'Discussion'].map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab.toLowerCase())}
                                            className={`pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.toLowerCase()
                                                ? 'border-indigo-600 text-indigo-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-800'
                                                }`}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </div>

                                {/* Tab Content */}
                                <div className="min-h-[200px]">
                                    {activeTab === 'description' && (
                                        <div className="prose prose-indigo max-w-none">
                                            <h2 className="text-xl font-bold text-gray-900 mb-2">{activeTopic.title}</h2>
                                            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                                                {activeTopic.description || 'No description provided.'}
                                            </p>
                                        </div>
                                    )}

                                    {activeTab === 'notes' && (
                                        <div className="space-y-3">
                                            <h3 className="font-semibold text-gray-800 mb-4">Lesson Materials</h3>
                                            {activeTopic.notes && activeTopic.notes.length > 0 ? (
                                                activeTopic.notes.map((note, idx) => (
                                                    <div key={idx} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-indigo-200 transition-colors">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                                                                <FileText size={20} />
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-gray-700 line-clamp-1">{note.name || `Note ${idx + 1}`}</p>
                                                                <p className="text-xs text-gray-400">PDF Document</p>
                                                            </div>
                                                        </div>
                                                        <a
                                                            href={note.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                                                        >
                                                            <Download size={16} /> Download
                                                        </a>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-gray-500 italic p-4 bg-gray-50 rounded-lg text-sm text-center">
                                                    No notes attached to this lesson.
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {activeTab === 'discussion' && (
                                        <div className="space-y-6">
                                            {/* Comment Form */}
                                            <form onSubmit={handlePostComment} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Ask a question or leave a comment</label>
                                                <textarea
                                                    value={newComment}
                                                    onChange={(e) => setNewComment(e.target.value)}
                                                    placeholder="Type your question here..."
                                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none transition-shadow"
                                                    rows="3"
                                                ></textarea>
                                                <div className="flex justify-end mt-2">
                                                    <button
                                                        type="submit"
                                                        disabled={!newComment.trim()}
                                                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                    >
                                                        Post Comment
                                                    </button>
                                                </div>
                                            </form>

                                            {/* Comments List */}
                                            <div className="space-y-4">
                                                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                                                    Discussion <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{comments.length}</span>
                                                </h3>

                                                {commentLoading ? (
                                                    <div className="text-center py-8 text-gray-400">Loading comments...</div>
                                                ) : comments.length === 0 ? (
                                                    <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                                        <p className="text-gray-500 text-sm">No comments yet. Be the first to ask!</p>
                                                    </div>
                                                ) : (
                                                    comments.map((comment) => (
                                                        <div key={comment._id} className="flex gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm group">
                                                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold shrink-0">
                                                                {comment.studentId?.name?.charAt(0) || 'S'}
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="flex justify-between items-start">
                                                                    <h4 className="font-semibold text-gray-900 text-sm">{comment.studentId?.name || 'Student'}</h4>
                                                                    <div className="flex items-center gap-3">
                                                                        <span className="text-xs text-gray-400">
                                                                            {new Date(comment.createdAt).toLocaleDateString()}
                                                                        </span>
                                                                        {/* Edit/Delete Actions for Owner */}
                                                                        {currentUser && currentUser._id === comment.studentId?._id && !editingCommentId && (
                                                                            <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                                                                <button
                                                                                    onClick={() => startEditing(comment)}
                                                                                    className="p-1 text-gray-400 hover:text-indigo-600 transition-colors"
                                                                                    title="Edit"
                                                                                >
                                                                                    <Edit2 size={16} />
                                                                                </button>
                                                                                <button
                                                                                    onClick={() => handleDeleteComment(comment._id)}
                                                                                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                                                                    title="Delete"
                                                                                >
                                                                                    <Trash2 size={16} />
                                                                                </button>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {editingCommentId === comment._id ? (
                                                                    <div className="mt-2">
                                                                        <textarea
                                                                            value={editMessage}
                                                                            onChange={(e) => setEditMessage(e.target.value)}
                                                                            className="w-full p-2 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                                                            rows="2"
                                                                        ></textarea>
                                                                        <div className="flex justify-end gap-2 mt-2">
                                                                            <button
                                                                                onClick={cancelEditing}
                                                                                className="px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded"
                                                                            >
                                                                                Cancel
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleUpdateComment(comment._id)}
                                                                                className="px-3 py-1 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded"
                                                                            >
                                                                                Save
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <p className="text-gray-600 text-sm mt-1 leading-relaxed">{comment.message}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400">
                            <PlayCircle size={48} className="mb-4 opacity-50" />
                            <p>Select a lesson from the sidebar to start learning.</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default CoursePlayer;
