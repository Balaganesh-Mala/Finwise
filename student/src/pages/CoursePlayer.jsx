import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    PlayCircle, CheckCircle, FileText, MessageSquare, Star,
    ChevronDown, ChevronRight, Download, Menu, ArrowLeft, Clock,
    Edit2, Trash2, Lock, AlertCircle, Upload, BookOpen,
    Trophy, XCircle, SkipForward, RotateCcw, Award
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
    const [activeTab, setActiveTab] = useState('description');

    // Drip Unlock State
    // null = no restriction (before API loads, or drip not configured)
    const [unlockedTopicIds, setUnlockedTopicIds] = useState(null);
    const [dripLoaded, setDripLoaded] = useState(false);

    // Topic Content (MCQ, Tasks, Assignments)
    const [topicContent, setTopicContent] = useState(null);
    const [contentLoading, setContentLoading] = useState(false);
    const [mySubmissions, setMySubmissions] = useState({ tasks: [], assignments: [], mcq: null });

    // MCQ Quiz State – one-by-one timed mode
    const [mcqAnswers, setMcqAnswers] = useState({});        // { qIdx: string | string[] }
    const [mcqSubmitting, setMcqSubmitting] = useState(false);
    const [quizPhase, setQuizPhase] = useState('idle');      // idle | active | submitted
    const [currentQIdx, setCurrentQIdx] = useState(0);
    const [timeLeft, setTimeLeft] = useState(60);
    const [quizResult, setQuizResult] = useState(null);
    const [shuffledQuestions, setShuffledQuestions] = useState([]); // questions with shuffled options
    const timerRef = useRef(null);

    // Task Submission State
    const [taskText, setTaskText] = useState({});
    const [taskFile, setTaskFile] = useState({});
    const [taskSubmitting, setTaskSubmitting] = useState({});

    // Assignment Upload State
    const [assignFile, setAssignFile] = useState({});
    const [assignSubmitting, setAssignSubmitting] = useState({});

    // Progress State
    const [progress, setProgress] = useState({});
    const videoRef = useRef(null);

    // ─── Quiz Timer ───────────────────────────────────────────────
    useEffect(() => {
        if (quizPhase !== 'active') return;
        setTimeLeft(60);
        clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    // Auto-advance: mark as skipped (no answer) and move on
                    handleNextQuestion();
                    return 60;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timerRef.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentQIdx, quizPhase]);

    // Fisher-Yates shuffle
    const shuffle = (arr) => {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    };

    const buildShuffledQuestions = (questions) =>
        questions.map(q => ({ ...q, options: shuffle(q.options || []) }));

    const startQuiz = () => {
        const qs = topicContent?.mcqTest?.testId?.questions || [];
        setShuffledQuestions(buildShuffledQuestions(qs));
        setMcqAnswers({});
        setCurrentQIdx(0);
        setTimeLeft(60);
        setQuizPhase('active');
    };

    const retakeQuiz = () => {
        // Reset result and restart
        setQuizResult(null);
        setMySubmissions(prev => ({ ...prev, mcq: null }));
        startQuiz();
    };

    const handleNextQuestion = () => {
        clearInterval(timerRef.current);
        if (currentQIdx < shuffledQuestions.length - 1) {
            setCurrentQIdx(prev => prev + 1);
        } else {
            submitQuiz();
        }
    };

    const submitQuiz = async () => {
        clearInterval(timerRef.current);
        setQuizPhase('submitted');
        const storedUser = JSON.parse(localStorage.getItem('studentUser'));
        if (!storedUser || !topicContent?.mcqTest?.testId) return;
        setMcqSubmitting(true);
        try {
            const answers = Object.entries(mcqAnswers).map(([questionId, selected]) => ({
                questionId,
                selected: Array.isArray(selected) ? selected : [selected]
            }));
            const res = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/topic-content/${activeTopic._id}/attempt-mcq`,
                { studentId: storedUser._id, testId: topicContent.mcqTest.testId._id, answers }
            );
            setQuizResult(res.data.attempt);
            setMySubmissions(prev => ({ ...prev, mcq: res.data.attempt }));
        } catch (err) {
            // Already attempted
            if (err.response?.data?.attempt) {
                setQuizResult(err.response.data.attempt);
                setMySubmissions(prev => ({ ...prev, mcq: err.response.data.attempt }));
            } else {
                toast.error(err.response?.data?.message || 'Failed to submit quiz');
                setQuizPhase('idle');
            }
        } finally {
            setMcqSubmitting(false);
        }
    };

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
                const courseRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/courses/${courseId}`);
                setCourse(courseRes.data);

                const modulesListRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/modules/${courseId}`);

                const modulesWithTopics = await Promise.all(modulesListRes.data.modules.map(async (mod) => {
                    const topicsRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/topics/${mod._id}`);
                    return { ...mod, topics: topicsRes.data.topics };
                }));
                setModules(modulesWithTopics);

                const storedUser = JSON.parse(localStorage.getItem('studentUser'));
                if (storedUser) {
                    // Fetch progress
                    const progressRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/student/progress/${courseId}/${storedUser._id}`);
                    const progressMap = {};
                    progressRes.data.progress.forEach(p => {
                        progressMap[p.topicId] = p;
                    });
                    setProgress(progressMap);

                    // Fetch drip unlock status
                    try {
                        const dripRes = await axios.get(
                            `${import.meta.env.VITE_API_URL}/api/drip/unlocked/${storedUser._id}/${courseId}`
                        );
                        const ids = dripRes.data.unlockedTopicIds;
                        if (!ids || ids.length === 0) {
                            setUnlockedTopicIds(null); // no restriction
                        } else {
                            setUnlockedTopicIds(new Set(ids));
                        }
                    } catch (e) {
                        console.warn('Drip fetch failed, defaulting to show all', e);
                        setUnlockedTopicIds(null); // null = no restriction
                    }
                    setDripLoaded(true);
                }

                if (modulesWithTopics.length > 0 && modulesWithTopics[0].topics.length > 0) {
                    const firstTopic = modulesWithTopics[0].topics[0];
                    setActiveTopic(firstTopic);
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

    // Fetch topic content + my submissions when activeTopic changes
    useEffect(() => {
        if (!activeTopic) return;
        const storedUser = JSON.parse(localStorage.getItem('studentUser'));
        setTopicContent(null);
        setMcqAnswers({});
        setContentLoading(true);

        const loadContent = async () => {
            try {
                const [contentRes, submissionsRes] = await Promise.all([
                    axios.get(`${import.meta.env.VITE_API_URL}/api/topic-content/${activeTopic._id}`),
                    storedUser
                        ? axios.get(`${import.meta.env.VITE_API_URL}/api/topic-content/${activeTopic._id}/my-submissions/${storedUser._id}`)
                        : Promise.resolve({ data: { submissions: { tasks: [], assignments: [], mcq: null } } })
                ]);
                setTopicContent(contentRes.data.content);
                setMySubmissions(submissionsRes.data.submissions);
            } catch (e) {
                console.error('Content fetch failed', e);
            } finally {
                setContentLoading(false);
            }
        };
        loadContent();
    }, [activeTopic?._id]);

    const isTopicUnlocked = (topic) => {
        if (unlockedTopicIds === null) return true; // No drip configured or not yet loaded
        if (!topic.unlockOrder) return true; // No unlock order = not part of drip = always accessible
        return unlockedTopicIds.has(topic._id.toString());
    };

    const handleVideoProgress = async () => {
        if (!videoRef.current || !activeTopic) return;
        const currentTime = videoRef.current.currentTime;
        const duration = videoRef.current.duration;
        const progressPercent = (currentTime / duration) * 100;
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
            setProgress(prev => ({ ...prev, [activeTopic._id]: { ...prev[activeTopic._id], completed, watchedDuration } }));
            if (completed) toast.success('Lesson Completed!');
        } catch (err) {
            console.error('Progress sync failed', err);
        }
    };

    // MCQ submission (now handled by submitQuiz above)
    const handleMCQSubmit = submitQuiz;

    // Task submission
    const handleTaskSubmit = async (taskIndex) => {
        const storedUser = JSON.parse(localStorage.getItem('studentUser'));
        if (!storedUser) return;
        setTaskSubmitting(prev => ({ ...prev, [taskIndex]: true }));
        const formData = new FormData();
        formData.append('studentId', storedUser._id);
        formData.append('taskIndex', taskIndex);
        if (taskText[taskIndex]) formData.append('answerText', taskText[taskIndex]);
        if (taskFile[taskIndex]) formData.append('file', taskFile[taskIndex]);
        try {
            const res = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/topic-content/${activeTopic._id}/submit/task`,
                formData, { headers: { 'Content-Type': 'multipart/form-data' } }
            );
            setMySubmissions(prev => {
                const newTasks = [...prev.tasks];
                const existIdx = newTasks.findIndex(t => t.taskIndex === taskIndex);
                if (existIdx >= 0) newTasks[existIdx] = res.data.submission;
                else newTasks.push(res.data.submission);
                return { ...prev, tasks: newTasks };
            });
            toast.success('Task submitted successfully!');
        } catch (err) {
            toast.error('Failed to submit task');
        } finally {
            setTaskSubmitting(prev => ({ ...prev, [taskIndex]: false }));
        }
    };

    // Assignment upload
    const handleAssignmentSubmit = async (assignmentIndex) => {
        const storedUser = JSON.parse(localStorage.getItem('studentUser'));
        if (!storedUser || !assignFile[assignmentIndex]) {
            toast.error('Please select a file to upload');
            return;
        }
        setAssignSubmitting(prev => ({ ...prev, [assignmentIndex]: true }));
        const formData = new FormData();
        formData.append('studentId', storedUser._id);
        formData.append('assignmentIndex', assignmentIndex);
        formData.append('file', assignFile[assignmentIndex]);
        try {
            const res = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/topic-content/${activeTopic._id}/submit/assignment`,
                formData, { headers: { 'Content-Type': 'multipart/form-data' } }
            );
            setMySubmissions(prev => {
                const newAssign = [...prev.assignments];
                const existIdx = newAssign.findIndex(a => a.assignmentIndex === assignmentIndex);
                if (existIdx >= 0) newAssign[existIdx] = res.data.submission;
                else newAssign.push(res.data.submission);
                return { ...prev, assignments: newAssign };
            });
            toast.success('Assignment uploaded!');
        } catch (err) {
            toast.error('Failed to upload assignment');
        } finally {
            setAssignSubmitting(prev => ({ ...prev, [assignmentIndex]: false }));
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
                        </div>
                    )}
                    {modules.map((module, mIdx) => (
                        <div key={module._id} className="mb-2">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider px-3 py-2 mb-1">
                                Module {mIdx + 1}: {module.title}
                            </h3>
                            <div className="space-y-1">
                                {module.topics.map((topic, tIdx) => {
                                    const unlocked = isTopicUnlocked(topic);
                                    return (
                                        <button
                                            key={topic._id}
                                            onClick={() => {
                                                if (!unlocked) { toast.error('This lesson is not unlocked yet'); return; }
                                                setActiveTopic(topic);
                                                setActiveTab('description');
                                                if (window.innerWidth < 768) setSidebarOpen(false);
                                            }}
                                            className={`w-full text-left p-3 rounded-lg flex items-start gap-3 transition-colors ${!unlocked
                                                ? 'opacity-50 cursor-not-allowed bg-gray-50'
                                                : activeTopic?._id === topic._id
                                                    ? 'bg-indigo-50 border-indigo-200'
                                                    : 'hover:bg-gray-50'
                                                }`}
                                        >
                                            <div className="mt-0.5">
                                                {!unlocked ? (
                                                    <Lock size={16} className="text-gray-400" />
                                                ) : progress[topic._id]?.completed ? (
                                                    <CheckCircle size={16} className="text-green-500 fill-green-50" />
                                                ) : (
                                                    <PlayCircle size={16} className={activeTopic?._id === topic._id ? 'text-indigo-600' : 'text-gray-400'} />
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className={`text-sm font-medium truncate ${!unlocked ? 'text-gray-400' : activeTopic?._id === topic._id ? 'text-indigo-700' : 'text-gray-700'}`}>
                                                    {tIdx + 1}. {topic.title}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-xs text-gray-400 flex items-center gap-1">
                                                        <Clock size={10} /> {topic.duration}m
                                                    </span>
                                                    {!unlocked && <span className="text-[10px] text-orange-500 font-medium">Locked</span>}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
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
                                    {['Description', 'Notes', 'Quiz', 'Tasks', 'Assignment', 'Discussion'].map((tab) => (
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
                                                            <div className="p-2 bg-red-50 text-red-600 rounded-lg"><FileText size={20} /></div>
                                                            <div>
                                                                <p className="font-medium text-gray-700 line-clamp-1">{note.name || `Note ${idx + 1}`}</p>
                                                                <p className="text-xs text-gray-400">PDF Document</p>
                                                            </div>
                                                        </div>
                                                        <a href={note.url} target="_blank" rel="noopener noreferrer"
                                                            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
                                                            <Download size={16} /> Download
                                                        </a>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-gray-500 italic p-4 bg-gray-50 rounded-lg text-sm text-center">No notes attached to this lesson.</div>
                                            )}
                                        </div>
                                    )}

                                    {/* ────── MCQ QUIZ TAB ────── */}
                                    {activeTab === 'quiz' && (() => {
                                        const test = topicContent?.mcqTest?.testId;
                                        const rawQuestions = test?.questions || [];
                                        // Use shuffled copy during active quiz, raw for result breakdown
                                        const activeQuestions = quizPhase === 'active' ? shuffledQuestions : rawQuestions;
                                        const q = activeQuestions[currentQIdx];

                                        if (contentLoading) return (
                                            <div className="flex items-center justify-center py-16 text-gray-400">
                                                <div className="animate-spin w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full" />
                                            </div>
                                        );

                                        if (!topicContent?.mcqTest?.enabled || !test) return (
                                            <div className="text-center py-14 text-gray-400">
                                                <BookOpen size={44} className="mx-auto mb-3 opacity-30" />
                                                <p className="font-medium">No quiz assigned to this lesson.</p>
                                            </div>
                                        );

                                        // ── Helper: toggle checkbox answer ──
                                        const toggleCheckbox = (opt) => {
                                            setMcqAnswers(prev => {
                                                const cur = prev[String(currentQIdx)];
                                                const arr = Array.isArray(cur) ? cur : [];
                                                return {
                                                    ...prev,
                                                    [String(currentQIdx)]: arr.includes(opt)
                                                        ? arr.filter(x => x !== opt)
                                                        : [...arr, opt]
                                                };
                                            });
                                        };

                                        // ── Already submitted or passed: show result ──
                                        if (mySubmissions.mcq || quizPhase === 'submitted') {
                                            const attempt = quizResult || mySubmissions.mcq;
                                            const score = attempt?.score ?? 0;
                                            const total = attempt?.total ?? rawQuestions.length;
                                            const scorePct = Math.round((score / (total || 1)) * 100);
                                            const isPerfect = scorePct === 100;
                                            const isPass = scorePct >= 75;

                                            // Build answer lookup from stored attempt.answers
                                            const answerLookup = {};
                                            (attempt?.answers || []).forEach(a => {
                                                answerLookup[a.questionId] = Array.isArray(a.selected) ? a.selected : [a.selected];
                                            });

                                            return (
                                                <div className="space-y-5">
                                                    {/* Score card */}
                                                    <div className={`rounded-2xl p-8 text-center ${isPerfect ? 'bg-gradient-to-br from-yellow-400 to-orange-500'
                                                        : isPass ? 'bg-gradient-to-br from-green-400 to-emerald-600'
                                                            : 'bg-gradient-to-br from-red-400 to-rose-600'
                                                        } text-white shadow-lg`}>
                                                        <div className="flex justify-center mb-3">
                                                            {isPerfect
                                                                ? <Trophy size={48} className="text-white drop-shadow" />
                                                                : isPass
                                                                    ? <Award size={48} className="text-white drop-shadow" />
                                                                    : <XCircle size={48} className="text-white drop-shadow" />}
                                                        </div>
                                                        <div className="text-6xl font-black mb-1">{scorePct}%</div>
                                                        <div className="text-xl font-bold mb-1">
                                                            {isPerfect ? 'Perfect Score!' : isPass ? 'Passed!' : 'Below 75% — Retake Required'}
                                                        </div>
                                                        <div className="text-white/90 text-sm">
                                                            {score} / {total} correct &nbsp;·&nbsp; Pass mark: 75%
                                                        </div>
                                                    </div>

                                                    {/* Score bar */}
                                                    <div className="bg-white border border-gray-200 rounded-xl p-4">
                                                        <div className="flex justify-between text-sm font-medium text-gray-600 mb-2">
                                                            <span>Your Score</span>
                                                            <span className={isPass ? 'text-green-600' : 'text-red-500'}>{score}/{total}</span>
                                                        </div>
                                                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden relative">
                                                            <div
                                                                className={`h-full rounded-full transition-all duration-700 ${isPerfect ? 'bg-orange-400' : isPass ? 'bg-emerald-500' : 'bg-red-500'}`}
                                                                style={{ width: `${scorePct}%` }}
                                                            />
                                                            {/* 75% marker */}
                                                            <div className="absolute top-0 bottom-0 w-0.5 bg-gray-400" style={{ left: '75%' }} />
                                                        </div>
                                                        <p className="text-xs text-gray-400 mt-1 text-right">75% pass mark</p>
                                                    </div>

                                                    {/* Retake button (only if failed) */}
                                                    {!isPass && (
                                                        <button onClick={retakeQuiz}
                                                            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow shadow-indigo-200 flex items-center justify-center gap-2">
                                                            <RotateCcw size={18} />
                                                            Retake Quiz
                                                        </button>
                                                    )}

                                                    {/* Per-question breakdown */}
                                                    <div className="space-y-3">
                                                        <h4 className="font-semibold text-gray-700 text-sm">Question Breakdown</h4>
                                                        {rawQuestions.map((qs, idx) => {
                                                            const ansArr = answerLookup[String(idx)] || [];
                                                            const correct = qs.correctAnswers || [];
                                                            const correctSet = new Set(correct);
                                                            const isCorrect = ansArr.length > 0 &&
                                                                ansArr.length === correct.length &&
                                                                ansArr.every(a => correctSet.has(a));
                                                            const skipped = ansArr.length === 0;
                                                            return (
                                                                <div key={idx} className={`flex items-start gap-3 p-3 rounded-xl border text-sm ${skipped ? 'border-gray-200 bg-gray-50'
                                                                    : isCorrect ? 'border-green-200 bg-green-50'
                                                                        : 'border-red-200 bg-red-50'
                                                                    }`}>
                                                                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${skipped ? 'bg-gray-200 text-gray-500'
                                                                        : isCorrect ? 'bg-green-500 text-white'
                                                                            : 'bg-red-500 text-white'
                                                                        }`}>{idx + 1}</span>
                                                                    <div className="min-w-0 flex-1">
                                                                        <p className="font-medium text-gray-800 leading-snug">{qs.questionText || qs.question}</p>
                                                                        <div className={`flex items-center gap-1 text-xs mt-1.5 font-medium ${skipped ? 'text-gray-400'
                                                                            : isCorrect ? 'text-green-600'
                                                                                : 'text-red-500'
                                                                            }`}>
                                                                            {skipped
                                                                                ? <><SkipForward size={13} /> <span>Not answered</span></>
                                                                                : isCorrect
                                                                                    ? <><CheckCircle size={13} /> <span>Correct</span></>
                                                                                    : <><XCircle size={13} /> <span>Wrong</span></>}
                                                                        </div>
                                                                        {/* Show what student selected (only for wrong answers) */}
                                                                        {!skipped && !isCorrect && (
                                                                            <div className="mt-1.5">
                                                                                <p className="text-xs text-red-400">Your answer: <span className="font-medium">{ansArr.join(', ')}</span></p>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            );
                                        }

                                        // ── Idle: show start screen ──
                                        if (quizPhase === 'idle') return (
                                            <div className="text-center py-10 space-y-4">
                                                <BookOpen size={52} className="mx-auto text-indigo-500" />
                                                <h3 className="text-xl font-bold text-gray-800">{test.title}</h3>
                                                <p className="text-gray-500 text-sm">{rawQuestions.length} questions &nbsp;·&nbsp; 1 min per question &nbsp;·&nbsp; Pass: 75%</p>
                                                {test.instructions && (
                                                    <p className="text-sm text-gray-600 bg-indigo-50 rounded-xl p-3 text-left">{test.instructions}</p>
                                                )}
                                                <button onClick={startQuiz}
                                                    className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all">
                                                    Start Quiz →
                                                </button>
                                            </div>
                                        );

                                        // ── Active: one question at a time ──
                                        const timerPct = (timeLeft / 60) * 100;
                                        const timerColor = timeLeft > 20 ? '#6366f1' : timeLeft > 10 ? '#f59e0b' : '#ef4444';
                                        const isMultiple = q?.isMultiple;
                                        const currentAnswers = mcqAnswers[String(currentQIdx)];
                                        const selectedArr = Array.isArray(currentAnswers) ? currentAnswers : currentAnswers ? [currentAnswers] : [];

                                        return (
                                            <div className="space-y-5">
                                                {/* Header: progress + timer */}
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <span className="text-sm font-medium text-gray-500">Question {currentQIdx + 1} of {activeQuestions.length}</span>
                                                        {isMultiple && <span className="ml-2 text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-medium">Multiple Choice</span>}
                                                    </div>
                                                    {/* Circular timer */}
                                                    <div className="relative w-12 h-12">
                                                        <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                                                            <circle cx="24" cy="24" r="20" fill="none" stroke="#e5e7eb" strokeWidth="4" />
                                                            <circle cx="24" cy="24" r="20" fill="none" stroke={timerColor} strokeWidth="4"
                                                                strokeDasharray={`${2 * Math.PI * 20}`}
                                                                strokeDashoffset={`${2 * Math.PI * 20 * (1 - timerPct / 100)}`}
                                                                strokeLinecap="round"
                                                                style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
                                                            />
                                                        </svg>
                                                        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold"
                                                            style={{ color: timerColor }}>{timeLeft}</span>
                                                    </div>
                                                </div>

                                                {/* Progress bar */}
                                                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                                                        style={{ width: `${(currentQIdx / activeQuestions.length) * 100}%` }} />
                                                </div>

                                                {/* Question card */}
                                                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                                                    <p className="font-semibold text-gray-900 text-base leading-relaxed mb-1">
                                                        {currentQIdx + 1}. {q?.questionText || q?.question}
                                                    </p>
                                                    {isMultiple && <p className="text-xs text-indigo-500 mb-4">Select all that apply</p>}
                                                    <div className="space-y-2.5 mt-4">
                                                        {q?.options?.map((opt, oIdx) => {
                                                            const selected = isMultiple
                                                                ? selectedArr.includes(opt)
                                                                : currentAnswers === opt;
                                                            return (
                                                                <button
                                                                    key={oIdx}
                                                                    onClick={() => isMultiple
                                                                        ? toggleCheckbox(opt)
                                                                        : setMcqAnswers(prev => ({ ...prev, [String(currentQIdx)]: opt }))
                                                                    }
                                                                    className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all font-medium text-sm ${selected
                                                                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                                                        : 'border-gray-200 hover:border-indigo-300 text-gray-700'
                                                                        }`}
                                                                >
                                                                    {/* Checkbox or Radio indicator */}
                                                                    <span className={`shrink-0 flex items-center justify-center text-xs font-bold ${isMultiple
                                                                        ? `w-5 h-5 rounded border-2 ${selected ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-gray-300'}`
                                                                        : `w-6 h-6 rounded-full border-2 ${selected ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-gray-300'}`
                                                                        }`}>
                                                                        {selected ? '✓' : isMultiple ? '' : String.fromCharCode(65 + oIdx)}
                                                                    </span>
                                                                    {opt}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>

                                                {/* Navigation */}
                                                <button
                                                    onClick={handleNextQuestion}
                                                    disabled={mcqSubmitting}
                                                    className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all"
                                                >
                                                    {currentQIdx < activeQuestions.length - 1 ? 'Next Question →' : mcqSubmitting ? 'Submitting...' : 'Finish Quiz ✓'}
                                                </button>
                                            </div>
                                        );
                                    })()}




                                    {/* ────── TASKS TAB ────── */}
                                    {activeTab === 'tasks' && (
                                        <div className="space-y-6">
                                            {contentLoading ? (
                                                <p className="text-sm text-gray-400">Loading tasks...</p>
                                            ) : !topicContent?.tasks || topicContent.tasks.length === 0 ? (
                                                <div className="text-center py-10 text-gray-400">
                                                    <FileText size={40} className="mx-auto mb-3 opacity-40" />
                                                    <p>No tasks for this lesson.</p>
                                                </div>
                                            ) : (
                                                topicContent.tasks.map((task, idx) => {
                                                    const existing = mySubmissions.tasks.find(s => s.taskIndex === idx);
                                                    return (
                                                        <div key={idx} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
                                                            <div>
                                                                <h4 className="font-semibold text-gray-800">{task.title}</h4>
                                                                {task.description && <p className="text-sm text-gray-600 mt-1">{task.description}</p>}
                                                                {task.fileUrl && (
                                                                    <a href={task.fileUrl} target="_blank" rel="noopener noreferrer"
                                                                        className="inline-flex items-center gap-2 mt-2 text-sm text-indigo-600 hover:underline">
                                                                        <Download size={14} /> Download resource file
                                                                    </a>
                                                                )}
                                                            </div>
                                                            {existing ? (
                                                                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                                                    <p className="text-green-700 text-sm font-medium flex items-center gap-2">
                                                                        <CheckCircle size={16} /> Task submitted
                                                                    </p>
                                                                    {existing.answerText && <p className="text-gray-600 text-sm mt-1">{existing.answerText}</p>}
                                                                    {existing.fileUrl && <a href={existing.fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:underline">View submitted file</a>}
                                                                </div>
                                                            ) : (
                                                                <div className="space-y-3">
                                                                    <textarea
                                                                        value={taskText[idx] || ''}
                                                                        onChange={e => setTaskText(prev => ({ ...prev, [idx]: e.target.value }))}
                                                                        rows="3" placeholder="Type your answer here..."
                                                                        className="w-full p-3 border border-gray-200 rounded-lg focus:border-indigo-400 outline-none text-sm resize-none"
                                                                    />
                                                                    <div className="flex items-center gap-3">
                                                                        <label className="flex items-center gap-2 cursor-pointer px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                                                                            <Upload size={14} /> Attach File
                                                                            <input type="file" className="hidden" onChange={e => setTaskFile(prev => ({ ...prev, [idx]: e.target.files[0] }))} />
                                                                        </label>
                                                                        {taskFile[idx] && <span className="text-xs text-gray-500 truncate max-w-[150px]">{taskFile[idx].name}</span>}
                                                                        <button
                                                                            onClick={() => handleTaskSubmit(idx)}
                                                                            disabled={taskSubmitting[idx]}
                                                                            className="ml-auto px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
                                                                        >
                                                                            {taskSubmitting[idx] ? 'Submitting...' : 'Submit'}
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    )}

                                    {/* ────── ASSIGNMENT TAB ────── */}
                                    {activeTab === 'assignment' && (
                                        <div className="space-y-6">
                                            {contentLoading ? (
                                                <p className="text-sm text-gray-400">Loading assignments...</p>
                                            ) : !topicContent?.assignments || topicContent.assignments.length === 0 ? (
                                                <div className="text-center py-10 text-gray-400">
                                                    <FileText size={40} className="mx-auto mb-3 opacity-40" />
                                                    <p>No assignments for this lesson.</p>
                                                </div>
                                            ) : (
                                                topicContent.assignments.map((assign, idx) => {
                                                    const existing = mySubmissions.assignments.find(s => s.assignmentIndex === idx);
                                                    return (
                                                        <div key={idx} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
                                                            <h4 className="font-semibold text-gray-800">{assign.title}</h4>
                                                            {assign.questionUrl && (
                                                                <a href={assign.questionUrl} target="_blank" rel="noopener noreferrer"
                                                                    className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:underline">
                                                                    <Download size={14} /> Download Question Paper
                                                                </a>
                                                            )}
                                                            {existing ? (
                                                                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                                                    <p className="text-green-700 text-sm font-medium flex items-center gap-2">
                                                                        <CheckCircle size={16} /> Assignment submitted
                                                                    </p>
                                                                    <a href={existing.fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:underline">View your submission</a>
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center gap-3">
                                                                    <label className="flex items-center gap-2 cursor-pointer px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                                                                        <Upload size={14} /> Choose Answer File
                                                                        <input type="file" className="hidden" onChange={e => setAssignFile(prev => ({ ...prev, [idx]: e.target.files[0] }))} />
                                                                    </label>
                                                                    {assignFile[idx] && <span className="text-xs text-gray-500 truncate max-w-[150px]">{assignFile[idx].name}</span>}
                                                                    <button
                                                                        onClick={() => handleAssignmentSubmit(idx)}
                                                                        disabled={assignSubmitting[idx] || !assignFile[idx]}
                                                                        className="ml-auto px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
                                                                    >
                                                                        {assignSubmitting[idx] ? 'Uploading...' : 'Upload'}
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })
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
