import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    PlayCircle, CheckCircle, FileText, MessageSquare, Star,
    ChevronDown, ChevronRight, Download, Menu, ArrowLeft, Clock,
    Edit2, Trash2, Lock, AlertCircle, Upload, BookOpen,
    Trophy, XCircle, SkipForward, RotateCcw, Award,
    Play, Pause, Volume2, VolumeX, Maximize2, Globe, ShieldCheck
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
    const [expandedModules, setExpandedModules] = useState({});

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
    const [timeLeft, setTimeLeft] = useState(30);
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

    // ─── YouTube Custom Player State ─────────────────────────────
    const [ytReady, setYtReady] = useState(false);
    const [ytPlaying, setYtPlaying] = useState(false);
    const [ytCurrentTime, setYtCurrentTime] = useState(0);
    const [ytDuration, setYtDuration] = useState(0);
    const [ytVolume, setYtVolume] = useState(80);
    const [ytMuted, setYtMuted] = useState(false);
    const ytPlayerRef = useRef(null);
    const ytPollRef = useRef(null);
    const playerWrapRef = useRef(null);

    // ─── Quiz Timer ───────────────────────────────────────────────
    useEffect(() => {
        if (quizPhase !== 'active') return;

        // Timer countdown
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) return 0;
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [currentQIdx, quizPhase]);

    // Handle auto-advance when time reaches zero
    useEffect(() => {
        if (quizPhase === 'active' && timeLeft === 0) {
            handleNextQuestion();
        }
    }, [timeLeft, quizPhase]);

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
        setTimeLeft(30);
        setQuizPhase('active');
    };

    const retakeQuiz = () => {
        // Reset result and restart
        setQuizResult(null);
        setMySubmissions(prev => ({ ...prev, mcq: null }));
        startQuiz();
    };

    const handleNextQuestion = () => {
        if (quizPhase !== 'active') return;

        const isLastQuestion = currentQIdx >= shuffledQuestions.length - 1;
        if (isLastQuestion) {
            submitQuiz();
        } else {
            setCurrentQIdx(prev => prev + 1);
            setTimeLeft(30); // Reset timer for next question
        }
    };

    const submitQuiz = async () => {
        if (quizPhase === 'submitted' || mcqSubmitting) return;

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
            // Already attempted or failed
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
                if (modulesWithTopics.length > 0) {
                    setExpandedModules({ [modulesWithTopics[0]._id]: true });
                }

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
                setTopicContent(contentRes.data.content || {});
                setMySubmissions(submissionsRes.data.submissions);
            } catch (e) {
                console.error('Content fetch failed', e);
            } finally {
                setContentLoading(false);
            }
        };
        loadContent();
    }, [activeTopic?._id]);

    // ─── Load YouTube IFrame API script once ──────────────────────────
    useEffect(() => {
        if (document.getElementById('yt-api-script')) return;
        const s = document.createElement('script');
        s.id = 'yt-api-script';
        s.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(s);
    }, []);

    // ─── Init YouTube Player when activeTopic changes ─────────────────
    const destroyYtPlayer = useCallback(() => {
        clearInterval(ytPollRef.current);
        if (ytPlayerRef.current) {
            try { ytPlayerRef.current.destroy(); } catch (_) { }
            ytPlayerRef.current = null;
        }
        setYtReady(false);
        setYtPlaying(false);
        setYtCurrentTime(0);
        setYtDuration(0);
    }, []);

    useEffect(() => {
        if (!activeTopic?.videoUrl) return;
        const isYT = activeTopic.videoUrl.includes('youtube.com') || activeTopic.videoUrl.includes('youtu.be');
        if (!isYT) return;

        destroyYtPlayer();

        let cancelled = false;
        let attempts = 0;

        const tryInit = () => {
            if (cancelled) return;
            const container = document.getElementById('yt-player-container');
            if (!container || !window.YT?.Player) {
                if (attempts++ < 30) setTimeout(tryInit, 300);
                return;
            }
            const videoId = getYouTubeVideoId(activeTopic.videoUrl);
            if (!videoId) return;
            ytPlayerRef.current = new window.YT.Player('yt-player-container', {
                width: '100%',
                height: '100%',
                videoId,
                playerVars: {
                    controls: 0,
                    modestbranding: 1,
                    rel: 0,
                    playsinline: 1,
                    iv_load_policy: 3,
                    origin: window.location.origin,
                },
                events: {
                    onReady: (e) => {
                        if (cancelled) return;
                        setYtReady(true);
                        setYtDuration(e.target.getDuration());
                        e.target.setVolume(80);
                    },
                    onStateChange: (e) => {
                        if (cancelled) return;
                        const playing = e.data === window.YT?.PlayerState?.PLAYING;
                        setYtPlaying(playing);
                        const d = e.target.getDuration?.() || 0;
                        if (d > 0) setYtDuration(d);
                    },
                },
            });
        };

        // Give iframe a frame to render, then try
        const t = setTimeout(tryInit, 400);
        return () => {
            cancelled = true;
            clearTimeout(t);
            destroyYtPlayer();
        };
    }, [activeTopic?._id, destroyYtPlayer]);

    // ─── Poll current time while playing ────────────────────────────
    useEffect(() => {
        if (ytPlaying) {
            ytPollRef.current = setInterval(() => {
                const ct = ytPlayerRef.current?.getCurrentTime?.();
                if (ct !== undefined) setYtCurrentTime(ct);
            }, 500);
        } else {
            clearInterval(ytPollRef.current);
        }
        return () => clearInterval(ytPollRef.current);
    }, [ytPlaying]);

    // ─── YouTube player helpers ─────────────────────────────────
    const ytFormatTime = (s) => {
        if (!s || isNaN(s)) return '0:00';
        const m = Math.floor(s / 60);
        const sec = Math.floor(s % 60);
        return `${m}:${sec.toString().padStart(2, '0')}`;
    };
    const ytTogglePlay = () => {
        if (!ytPlayerRef.current) return;
        if (ytPlaying) ytPlayerRef.current.pauseVideo();
        else ytPlayerRef.current.playVideo();
    };
    const ytSeek = (e) => {
        const v = parseFloat(e.target.value);
        setYtCurrentTime(v);
        ytPlayerRef.current?.seekTo(v, true);
    };
    const ytHandleVolume = (e) => {
        const v = parseInt(e.target.value);
        setYtVolume(v);
        setYtMuted(v === 0);
        ytPlayerRef.current?.setVolume(v);
        if (v === 0) ytPlayerRef.current?.mute();
        else ytPlayerRef.current?.unMute();
    };
    const ytToggleMute = () => {
        if (ytMuted) {
            ytPlayerRef.current?.unMute();
            ytPlayerRef.current?.setVolume(ytVolume || 80);
            setYtMuted(false);
        } else {
            ytPlayerRef.current?.mute();
            setYtMuted(true);
        }
    };
    const ytFullscreen = () => {
        const el = playerWrapRef.current;
        if (!el) return;
        if (document.fullscreenElement) document.exitFullscreen();
        else el.requestFullscreen?.();
    };

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

    const checkTopicCompletionRequirements = () => {
        // Prevent bypassing checks if content is still loading or hasn't loaded
        if (contentLoading || topicContent === null) return { allowed: false, message: 'Please wait for lesson content to load before marking as complete.' };

        const subs = mySubmissions || { tasks: [], assignments: [], mcq: null };

        // 1. Check MCQ Test
        const hasMcq = topicContent.mcqTest && topicContent.mcqTest.enabled && topicContent.mcqTest.testId;
        if (hasMcq) {
            const attempt = quizResult || subs.mcq;
            if (!attempt) return { allowed: false, message: 'You must pass the quiz (75% score) to mark this lesson as completed.' };
            const scorePct = Math.round((attempt.score / (attempt.total || 1)) * 100);
            if (scorePct < 75) return { allowed: false, message: 'You must pass the quiz (75% score) to mark this lesson as completed.' };
        }

        // 2. Check Tasks
        if (topicContent.tasks && topicContent.tasks.length > 0) {
            if (!subs.tasks || subs.tasks.length < topicContent.tasks.length) {
                return { allowed: false, message: 'Please submit all tasks to finish this lesson.' };
            }
        }

        // 3. Check Assignments
        if (topicContent.assignments && topicContent.assignments.length > 0) {
            if (!subs.assignments || subs.assignments.length < topicContent.assignments.length) {
                return { allowed: false, message: 'Please submit all assignments to finish this lesson.' };
            }
        }

        return { allowed: true };
    };

    const updateProgress = async (completed, watchedDuration) => {
        const storedUser = JSON.parse(localStorage.getItem('studentUser'));
        if (!storedUser || !activeTopic) return;

        // Ensure we only block when transitioning from uncompleted -> completed
        if (completed && !progress[activeTopic._id]?.completed) {
            const req = checkTopicCompletionRequirements();
            if (!req.allowed) {
                toast.error(req.message);
                return;
            }
        }

        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/student/progress/update`, {
                studentId: storedUser._id,
                courseId: courseId,
                topicId: activeTopic._id,
                completed: completed,
                watchedDuration: watchedDuration
            });
            setProgress(prev => ({ ...prev, [activeTopic._id]: { ...prev[activeTopic._id], completed, watchedDuration } }));
            if (completed && !progress[activeTopic._id]?.completed) {
                toast.success('Lesson Completed!');
            }
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
        <div className="flex h-screen bg-[#f3f4f6] flex-col md:flex-row overflow-hidden relative">
            {/* Sidebar Code (Timeline / Platform Flat UI Style) */}
            <div className={`
                w-full md:w-[320px] lg:w-[320px]
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                bg-[#1B2538] border-r border-[#152040] flex-shrink-0 transition-transform duration-300 flex flex-col z-30 absolute md:static h-full overflow-hidden shadow-2xl font-sans
            `}>
                {/* Header Section */}
                <div className="px-5 py-5 border-b border-[#0f1523] bg-[#0E1524] shrink-0">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                            <h2 className="font-semibold text-white text-[16px] leading-snug pr-2 tracking-wide font-sans" title={course?.title}>{course?.title || 'Course Player'}</h2>
                        </div>
                        <button onClick={() => setSidebarOpen(false)} className="md:hidden p-1.5 rounded-md hover:bg-[#1f2937] text-white/70 hover:text-white transition-colors shrink-0">
                            <ArrowLeft size={16} />
                        </button>
                    </div>
                    {/* Overall Progress Bar */}
                    <div className="mt-4">
                        <div className="flex justify-between items-end mb-1.5">
                            <span className="text-[12px] text-[#9ca3af]">Overall Progress</span>
                            <span className="text-[12px] font-bold text-[#60A5FA]">
                                {(() => {
                                    let total = 0, comp = 0;
                                    modules.forEach(m => {
                                        total += (m.topics || []).length;
                                        comp += (m.topics || []).filter(t => progress[t._id]?.completed).length;
                                    });
                                    return total > 0 ? Math.round((comp / total) * 100) : 0;
                                })()}%
                            </span>
                        </div>
                        <div className="h-2 w-full bg-[#0F172A] overflow-hidden shadow-inner relative border border-[#1e293b] rounded-full">
                            {/* The filled bar with gradient and glow */}
                            <div className="h-full bg-gradient-to-r from-[#059669] via-[#10B981] to-[#6EE7B7] rounded-full transition-all duration-700 relative shadow-[0_0_16px_rgba(52,211,153,0.8)]" style={{
                                width: `${(() => {
                                    let total = 0, comp = 0;
                                    modules.forEach(m => {
                                        total += (m.topics || []).length;
                                        comp += (m.topics || []).filter(t => progress[t._id]?.completed).length;
                                    });
                                    return total > 0 ? Math.round((comp / total) * 100) : 0;
                                })()}%`
                            }}>
                                {/* Intense glowing animated head */}
                                <div className="absolute top-0 right-0 w-8 h-full bg-white blur-[2px] opacity-80 rounded-full animate-pulse"></div>
                                {/* Shimmer Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/50 to-white/0 opacity-50 w-full animate-pulse mix-blend-overlay"></div>
                            </div>

                            {/* Ambient bar glow (track fill effect) */}
                            <div className="absolute inset-0 bg-[#34D399] blur-[8px] opacity-25 select-none pointer-events-none transition-all duration-700" style={{
                                width: `${(() => {
                                    let total = 0, comp = 0;
                                    modules.forEach(m => {
                                        total += (m.topics || []).length;
                                        comp += (m.topics || []).filter(t => progress[t._id]?.completed).length;
                                    });
                                    return total > 0 ? Math.round((comp / total) * 100) : 0;
                                })()}%`
                            }}></div>
                        </div>
                    </div>
                </div>

                <div className="overflow-y-auto flex-1 pb-10 m-0 space-y-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] bg-[#1B2538]">
                    {modules.length === 0 && (
                        <div className="p-8 mt-10 text-center text-[#9CA3AF]">
                            <BookOpen size={24} className="mx-auto mb-3 opacity-50" />
                            <p className="text-sm">No curriculum available.</p>
                        </div>
                    )}
                    {modules.map((module, mIdx) => {
                        const isExpanded = expandedModules[module._id];
                        // Calculate module progress
                        const modTopics = module.topics || [];
                        const completedTopics = modTopics.filter(t => progress[t._id]?.completed).length;
                        const totalTopics = modTopics.length;

                        return (
                            <div key={module._id} className="transition-all duration-0 outline-none">
                                {/* Accordion Header (Flat dark or blue based on image) */}
                                <button
                                    onClick={() => setExpandedModules(prev => prev[module._id] ? {} : { [module._id]: true })}
                                    className={`w-full flex items-start justify-between px-5 py-4 transition-colors focus:outline-none group ${isExpanded ? 'bg-[#436BB5] hover:bg-[#436BB5] border-b border-[#3b5e9e]' : 'bg-[#1B2538] hover:bg-[#25324b] border-b border-[#2d3a54]'}`}
                                >
                                    <div className="flex-1 text-left pr-3 min-w-0">
                                        <h3 className={`text-[15px] transition-colors leading-tight ${isExpanded ? 'text-white font-semibold' : 'text-[#e2e8f0] font-medium'}`}>
                                            {module.title}
                                        </h3>
                                        <div className="mt-1.5 flex items-center gap-1.5 opacity-90">
                                            <Clock size={12} className={isExpanded ? 'text-white/80' : 'text-[#94a3b8]'} />
                                            <span className={`text-[12px] font-normal ${isExpanded ? 'text-white/90' : 'text-[#94a3b8]'}`}>{completedTopics}/{totalTopics} lessons</span>
                                        </div>
                                    </div>
                                    <div className={`transition-transform duration-300 ease-in-out p-1 pt-0 ${isExpanded ? 'rotate-180 text-white' : 'text-[#94a3b8]'}`}>
                                        <ChevronDown size={18} strokeWidth={2} />
                                    </div>
                                </button>

                                {/* Accordion Content: Timeline Style */}
                                <div className={`overflow-hidden transition-all duration-300 ease-in-out bg-[#1B2538] ${isExpanded ? 'max-h-[3000px] opacity-100 border-b-4 border-[#0F1522]' : 'max-h-0 opacity-0 border-transparent'}`}>
                                    <div className="flex flex-col pt-3 pb-3 relative">
                                        {module.topics.map((topic, tIdx) => {
                                            const unlocked = isTopicUnlocked(topic);
                                            const isActive = activeTopic?._id === topic._id;
                                            const isCompleted = progress[topic._id]?.completed;
                                            const isLast = tIdx === module.topics.length - 1;

                                            return (
                                                <button
                                                    key={topic._id}
                                                    onClick={() => {
                                                        if (!unlocked) { toast.error('This lesson is locked', { icon: '🔒', style: { background: '#1c263c', color: '#fff' } }); return; }
                                                        setActiveTopic(topic);
                                                        setActiveTab('description');
                                                        if (window.innerWidth < 768) setSidebarOpen(false);
                                                    }}
                                                    className={`w-full text-left relative px-5 py-4 flex items-start group ${!unlocked
                                                        ? 'opacity-40 cursor-not-allowed'
                                                        : isActive
                                                            ? 'bg-[#1e345e]/30 border-l border-transparent border-r-0'
                                                            : 'hover:bg-[#202b40]'
                                                        }`}
                                                >
                                                    {/* Vertical Connecting Line */}
                                                    {!isLast && (
                                                        <div className="absolute left-[31px] top-[34px] w-[2px] h-[calc(100%+8px)] bg-[#60A5FA] opacity-50 z-0"></div>
                                                    )}

                                                    {/* Timeline Node Icon */}
                                                    <div className="mt-0 flex-shrink-0 w-6 flex justify-center items-center z-10 bg-[#1B2538]">
                                                        {!unlocked ? (
                                                            <div className="w-[18px] h-[18px] rounded-full border-2 border-[#475569] flex items-center justify-center bg-[#1B2538]"><Lock size={8} className="text-[#475569]" /></div>
                                                        ) : isCompleted ? (
                                                            <CheckCircle size={20} fill="#10B981" color="#1B2538" strokeWidth={1.5} className="z-10 shadow-sm" />
                                                        ) : isActive ? (
                                                            <div className="w-[18px] h-[18px] rounded-full border-2 border-[#10B981] bg-[#10B981]/20 flex justify-center items-center z-10 shadow-[0_0_8px_rgba(16,185,129,0.4)]">
                                                                <div className="w-[8px] h-[8px] rounded-full bg-[#10B981]"></div>
                                                            </div>
                                                        ) : (
                                                            <div className="w-[18px] h-[18px] rounded-full border-2 border-[#1B2538] ring-2 ring-[#10B981] bg-[#1B2538] z-10"></div>
                                                        )}
                                                    </div>

                                                    {/* Content & Action Icon */}
                                                    <div className="min-w-0 flex-1 ml-4 pr-10">
                                                        <p className={`text-[14px] leading-snug ${isActive ? 'font-medium text-white' : 'font-normal text-[#94a3b8] group-hover:text-[#cbd5e1]'}`}>
                                                            {topic.title}
                                                        </p>
                                                        <div className="flex flex-wrap items-center gap-2 mt-2">
                                                            <span className={`text-[12px] flex items-center gap-1.5 ${isActive ? 'text-[#94a3b8]' : 'text-[#64748b]'}`}>
                                                                <Clock size={12} /> {topic.duration} mins
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Right Side Resource Icon (Book/Pencil style) */}
                                                    <div className="absolute right-5 top-5 flex justify-center items-center h-[20px]">
                                                        {topic?.type === 'assignment' || topic?.type === 'mcq' || topic?.title?.toLowerCase().includes('practice')
                                                            ? <BookOpen size={20} className="text-[#64748b] opacity-80" />
                                                            : <BookOpen size={20} className="text-[#64748b] opacity-80" />
                                                        }
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
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

                            {/* ── YouTube Player + Custom Controls ── */}
                            {(activeTopic.videoUrl?.includes('youtube.com') || activeTopic.videoUrl?.includes('youtu.be')) ? (
                                <div ref={playerWrapRef} className="rounded-none md:rounded-xl overflow-hidden shadow-xl sticky top-0 md:static z-10 bg-black">
                                    {/* Video area — div placeholder: YT API creates the iframe here */}
                                    <div className="relative w-full aspect-video bg-black overflow-hidden group">

                                        {/* Scale iframe vertically to push YouTube UI into hidden overflow area */}
                                        <div className="absolute top-1/2 left-0 w-full h-[300%] -translate-y-1/2 pointer-events-none z-0">
                                            <div
                                                id="yt-player-container"
                                                className="w-full h-full"
                                            />
                                        </div>

                                        {/* Transparent overlay to catch clicks for play/pause */}
                                        <div
                                            className="absolute inset-0 z-10 cursor-pointer"
                                            onClick={ytTogglePlay}
                                        />

                                        {/* Branded play icon — covers everything before video starts / when paused */}
                                        {!ytPlaying && (
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">

                                                {/* Floating Glow Ring */}
                                                <div className="absolute w-24 h-24 rounded-full bg-orange-500/30 animate-ping"></div>

                                                {/* Floating Play Button */}
                                                <div className="w-20 h-20 rounded-full bg-orange-500 flex items-center justify-center shadow-[0_15px_40px_rgba(0,0,0,0.35)] animate-[float_3s_ease-in-out_infinite]">
                                                    <Play size={30} className="text-white ml-1" fill="white" />
                                                </div>

                                            </div>
                                        )}
                                    </div>

                                    {/* Custom Control Bar */}
                                    <div className="bg-gray-950 px-4 pt-2 pb-3 space-y-2">
                                        {/* Seek bar */}
                                        <div className="relative group/seek">
                                            <input
                                                type="range"
                                                min="0"
                                                max={ytDuration || 100}
                                                step="0.5"
                                                value={ytCurrentTime}
                                                onChange={ytSeek}
                                                disabled={!ytReady}
                                                className="w-full h-1 rounded-full appearance-none cursor-pointer bg-gray-700 accent-indigo-500"
                                                style={{
                                                    background: ytDuration
                                                        ? `linear-gradient(to right, #6366f1 ${(ytCurrentTime / ytDuration) * 100}%, #374151 ${(ytCurrentTime / ytDuration) * 100}%)`
                                                        : '#374151'
                                                }}
                                            />
                                        </div>

                                        {/* Controls row */}
                                        <div className="flex items-center justify-between">
                                            {/* Left: play, volume, time */}
                                            <div className="flex items-center gap-3">
                                                {/* Play / Pause */}
                                                <button
                                                    onClick={ytTogglePlay}
                                                    disabled={!ytReady}
                                                    className="text-white hover:text-indigo-400 transition-colors disabled:opacity-40"
                                                    title={ytPlaying ? 'Pause' : 'Play'}
                                                >
                                                    {ytPlaying
                                                        ? <Pause size={20} />
                                                        : <Play size={20} />}
                                                </button>

                                                {/* Mute toggle */}
                                                <button
                                                    onClick={ytToggleMute}
                                                    disabled={!ytReady}
                                                    className="text-white hover:text-indigo-400 transition-colors disabled:opacity-40"
                                                    title={ytMuted ? 'Unmute' : 'Mute'}
                                                >
                                                    {ytMuted || ytVolume === 0
                                                        ? <VolumeX size={18} />
                                                        : <Volume2 size={18} />}
                                                </button>

                                                {/* Volume slider */}
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="100"
                                                    value={ytMuted ? 0 : ytVolume}
                                                    onChange={ytHandleVolume}
                                                    disabled={!ytReady}
                                                    className="w-20 h-1 rounded-full appearance-none cursor-pointer accent-indigo-500 hidden sm:block disabled:opacity-40"
                                                />

                                                {/* Time display */}
                                                <span className="text-xs text-gray-400 tabular-nums select-none">
                                                    {ytFormatTime(ytCurrentTime)}
                                                    <span className="text-gray-600 mx-1">/</span>
                                                    {ytFormatTime(ytDuration)}
                                                </span>
                                            </div>

                                            {/* Right: fullscreen */}
                                            <button
                                                onClick={ytFullscreen}
                                                className="text-white hover:text-indigo-400 transition-colors"
                                                title="Fullscreen"
                                            >
                                                <Maximize2 size={17} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : activeTopic.videoUrl ? (
                                <div className="bg-black aspect-video w-full rounded-none md:rounded-xl overflow-hidden shadow-lg sticky top-0 md:static z-10">
                                    <video
                                        ref={videoRef}
                                        src={activeTopic.videoUrl}
                                        controls
                                        controlsList="nodownload"
                                        onContextMenu={(e) => e.preventDefault()}
                                        className="w-full h-full"
                                        onTimeUpdate={handleVideoProgress}
                                        onEnded={() => updateProgress(true, videoRef.current.duration)}
                                    >
                                        Your browser does not support the video tag.
                                    </video>
                                </div>
                            ) : (
                                <div className="bg-black aspect-video w-full rounded-none md:rounded-xl overflow-hidden shadow-lg flex items-center justify-center text-gray-500">
                                    <p>No video available for this lesson.</p>
                                </div>
                            )}

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
                                                activeTopic.notes.map((note, idx) => note.type === 'google_doc' ? (
                                                    <div key={idx} className="mt-4 space-y-4">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                                                    <Globe size={20} />
                                                                </div>
                                                                <div>
                                                                    <p className="font-bold text-slate-800 leading-none">{note.name || `Note ${idx + 1}`}</p>
                                                                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1">Document Preview</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-2 py-1 rounded-md border border-amber-100">
                                                                <Lock size={12} />
                                                                <span className="text-[10px] font-bold uppercase">View Only</span>
                                                            </div>
                                                        </div>

                                                        {/* Iframe Preview Container - Long Iframe Scroll Hack */}
                                                        {/* We set a large height and scroll the parent, while blocking pointer events on the iframe to prevent copy */}
                                                        <div className="relative w-full h-[600px] bg-slate-100 rounded-2xl overflow-y-auto border border-slate-200 shadow-inner group/preview select-none"
                                                            onContextMenu={(e) => e.preventDefault()}
                                                        >
                                                            <div className="pointer-events-none w-full">
                                                                <iframe
                                                                    src={(() => {
                                                                        try {
                                                                            let url = note.url;
                                                                            if (url.includes('/edit')) url = url.split('/edit')[0] + '/preview';
                                                                            else if (url.includes('/view')) url = url.split('/view')[0] + '/preview';
                                                                            else if (!url.includes('/preview')) {
                                                                                url = url.endsWith('/') ? url + 'preview' : url + '/preview';
                                                                            }
                                                                            return url;
                                                                        } catch (e) { return note.url; }
                                                                    })()}
                                                                    className="w-full h-[12000px] border-none"
                                                                    title={note.name}
                                                                    loading="lazy"
                                                                ></iframe>
                                                            </div>
                                                            {/* Floating deterrent badge */}
                                                            <div className="sticky top-4 right-4 z-10 flex items-center gap-1.5 bg-white/90 backdrop-blur shadow-sm px-3 py-1.5 rounded-full border border-slate-200 text-slate-500 font-bold text-[10px] uppercase pointer-events-none">
                                                                <ShieldCheck size={12} className="text-indigo-600" />
                                                                Protected Content
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
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
                                                <div className="space-y-6">
                                                    {/* Premium Score card */}
                                                    <div className={`relative overflow-hidden rounded-[2rem] p-8 text-center shadow-2xl transition-all duration-500 ${isPerfect ? 'bg-slate-900 border border-amber-500/30'
                                                        : isPass ? 'bg-slate-900 border border-emerald-500/30'
                                                            : 'bg-slate-900 border border-rose-500/30'
                                                        }`}>

                                                        {/* Animated background elements */}
                                                        <div className={`absolute -top-24 -right-24 w-64 h-64 rounded-full blur-[80px] opacity-20 ${isPerfect ? 'bg-amber-400' : isPass ? 'bg-emerald-400' : 'bg-rose-400'}`}></div>
                                                        <div className={`absolute -bottom-24 -left-24 w-64 h-64 rounded-full blur-[80px] opacity-20 ${isPerfect ? 'bg-orange-500' : isPass ? 'bg-teal-500' : 'bg-red-500'}`}></div>

                                                        <div className="relative z-10">
                                                            <div className="flex justify-center mb-6">
                                                                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center transform rotate-6 shadow-xl ${isPerfect ? 'bg-gradient-to-br from-amber-400 to-orange-500'
                                                                    : isPass ? 'bg-gradient-to-br from-emerald-400 to-teal-600'
                                                                        : 'bg-gradient-to-br from-rose-400 to-red-600'
                                                                    }`}>
                                                                    {isPerfect
                                                                        ? <Trophy size={40} className="text-white drop-shadow" />
                                                                        : isPass
                                                                            ? <Award size={40} className="text-white drop-shadow" />
                                                                            : <XCircle size={40} className="text-white drop-shadow" />}
                                                                </div>
                                                            </div>

                                                            <div className="flex flex-col items-center">
                                                                <div className={`text-7xl font-black mb-1 tracking-tighter ${isPerfect ? 'text-amber-400' : isPass ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                                    {scorePct}<span className="text-3xl opacity-60">%</span>
                                                                </div>
                                                                <div className="text-2xl font-bold text-white mb-2 tracking-tight">
                                                                    {isPerfect ? 'Absolutely Perfect!' : isPass ? 'Great Job, Passed!' : 'Requires Attention'}
                                                                </div>
                                                                <p className="text-slate-400 text-sm font-medium tracking-wide">
                                                                    You answered <span className="text-white font-bold">{score}</span> out of <span className="text-white font-bold">{total}</span> questions correctly.
                                                                </p>
                                                            </div>

                                                            {/* Enhanced Score bar */}
                                                            <div className="mt-8 max-w-sm mx-auto">
                                                                <div className="flex justify-between text-[11px] font-bold text-slate-500 uppercase tracking-[0.1em] mb-2 px-1">
                                                                    <span>Proficiency Level</span>
                                                                    <span className={isPerfect ? 'text-amber-500' : isPass ? 'text-emerald-500' : 'text-rose-500'}>{scorePct}% COMPLETED</span>
                                                                </div>
                                                                <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden relative border border-slate-700/50 p-0.5">
                                                                    <div
                                                                        className={`h-full rounded-full transition-all duration-[1.5s] ease-out shadow-[0_0_15px_rgba(0,0,0,0.5)] ${isPerfect ? 'bg-gradient-to-r from-amber-300 to-orange-500' : isPass ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 'bg-gradient-to-r from-rose-400 to-red-500'}`}
                                                                        style={{ width: `${scorePct}%` }}
                                                                    />
                                                                    {/* 75% marker */}
                                                                    <div className="absolute top-0 bottom-0 w-[3px] bg-white/20 blur-[1px]" style={{ left: '75%' }} title="Required: 75%" />
                                                                </div>
                                                                <div className="flex justify-between mt-1.5 px-1">
                                                                    <span className="text-[9px] text-slate-500 font-bold uppercase">Beginner</span>
                                                                    <span className="text-[9px] text-white/40 font-bold uppercase">Target: 75%</span>
                                                                    <span className="text-[9px] text-slate-500 font-bold uppercase">Expert</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Retake button (only if failed) */}
                                                    {!isPass && (
                                                        <button onClick={retakeQuiz}
                                                            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-[0_4px_20px_-5px_rgba(79,70,229,0.4)] flex items-center justify-center gap-3 group">
                                                            <RotateCcw size={20} className="group-hover:rotate-[-180deg] transition-transform duration-500" />
                                                            <span>Try Again to Pass</span>
                                                        </button>
                                                    )}

                                                    {/* Question Breakdown Section */}
                                                    <div className="pt-4">
                                                        <div className="flex items-center justify-between mb-5 px-1">
                                                            <h4 className="font-bold text-gray-900 tracking-tight flex items-center gap-2">
                                                                Detailed Breakdown
                                                                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md font-medium">{rawQuestions.length} Items</span>
                                                            </h4>
                                                            <div className="flex gap-4">
                                                                <div className="flex items-center gap-1.5">
                                                                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Correct</span>
                                                                </div>
                                                                <div className="flex items-center gap-1.5">
                                                                    <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Incorrect</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="overflow-x-auto -mx-1">
                                                            <table className="w-full border-separate border-spacing-y-3">
                                                                <thead>
                                                                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-left">
                                                                        <th className="px-5 py-2 w-16">No.</th>
                                                                        <th className="px-5 py-2">Question Description</th>
                                                                        <th className="px-5 py-2 w-32 text-center">Status</th>
                                                                        <th className="px-5 py-2 text-right">Your Choice</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {rawQuestions.map((qs, idx) => {
                                                                        const ansArr = answerLookup[String(idx)] || [];
                                                                        const correct = qs.correctAnswers || [];
                                                                        const correctSet = new Set(correct);
                                                                        const isCorrect = ansArr.length > 0 &&
                                                                            ansArr.length === correct.length &&
                                                                            ansArr.every(a => correctSet.has(a));
                                                                        const skipped = ansArr.length === 0;

                                                                        return (
                                                                            <tr key={idx} className={`group transition-all duration-300 hover:scale-[1.01] ${skipped ? 'opacity-70' : ''}`}>
                                                                                <td className="px-5 py-4 bg-white border-y border-l border-gray-100 rounded-l-2xl text-xs font-black text-gray-400">
                                                                                    {String(idx + 1).padStart(2, '0')}
                                                                                </td>
                                                                                <td className="px-5 py-4 bg-white border-y border-gray-100 text-sm font-bold text-gray-800">
                                                                                    <span className="line-clamp-2 leading-relaxed">{qs.questionText || qs.question}</span>
                                                                                </td>
                                                                                <td className="px-5 py-4 bg-white border-y border-gray-100 text-center">
                                                                                    {skipped ? (
                                                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-[10px] font-black uppercase tracking-wider">
                                                                                            <SkipForward size={12} strokeWidth={3} /> Skipped
                                                                                        </span>
                                                                                    ) : isCorrect ? (
                                                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-wider">
                                                                                            <CheckCircle size={12} strokeWidth={3} /> Perfect
                                                                                        </span>
                                                                                    ) : (
                                                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-100 text-rose-600 rounded-full text-[10px] font-black uppercase tracking-wider">
                                                                                            <XCircle size={12} strokeWidth={3} /> Incorrect
                                                                                        </span>
                                                                                    )}
                                                                                </td>
                                                                                <td className="px-5 py-4 bg-white border-y border-r border-gray-100 rounded-r-2xl text-right">
                                                                                    {(!skipped && !isCorrect) ? (
                                                                                        <div className="flex flex-col items-end gap-1">
                                                                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">You Selected</span>
                                                                                            <span className="text-[11px] font-black text-rose-500 bg-rose-50 px-2.5 py-1 rounded-lg inline-block max-w-[150px] truncate border border-rose-100">
                                                                                                {ansArr.join(', ')}
                                                                                            </span>
                                                                                        </div>
                                                                                    ) : isCorrect ? (
                                                                                        <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-tight">Matched Correct</span>
                                                                                    ) : (
                                                                                        <span className="text-[10px] text-gray-400 font-bold italic">No response</span>
                                                                                    )}
                                                                                </td>
                                                                            </tr>
                                                                        );
                                                                    })}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        }

                                        // ── Idle: show start screen ──
                                        if (quizPhase === 'idle') return (
                                            <div className="text-center py-12 px-4 space-y-8 bg-white border border-gray-100 rounded-2xl shadow-sm">
                                                <div className="space-y-4">
                                                    <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                                                        <BookOpen size={40} className="text-indigo-600" />
                                                    </div>
                                                    <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">{test.title}</h3>

                                                    {/* Pill badges row */}
                                                    <div className="flex flex-wrap justify-center gap-3 mt-6">
                                                        <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-100 rounded-full">
                                                            <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                                                            <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">{rawQuestions.length} Questions</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-100 rounded-full">
                                                            <Clock size={14} className="text-amber-500" />
                                                            <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">30s / Question</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-100 rounded-full">
                                                            <Award size={14} className="text-emerald-500" />
                                                            <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">75% Passing Score</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {test.instructions && (
                                                    <div className="max-w-md mx-auto">
                                                        <p className="text-sm text-gray-500 italic leading-relaxed">
                                                            "{test.instructions}"
                                                        </p>
                                                    </div>
                                                )}

                                                <div className="pt-4">
                                                    <button onClick={startQuiz}
                                                        className="group relative inline-flex items-center justify-center px-10 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] shadow-[0_10px_30px_-10px_rgba(79,70,229,0.5)] transition-all duration-300">
                                                        <span className="mr-2">Start Quiz</span>
                                                        <ArrowLeft className="rotate-180 group-hover:translate-x-1 transition-transform" size={20} />
                                                        <div className="absolute inset-0 rounded-2xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                    </button>
                                                    <p className="text-[11px] text-gray-400 mt-4 font-medium uppercase tracking-[0.2em]">Ready to test your knowledge?</p>
                                                </div>
                                            </div>
                                        );

                                        // ── Active: one question at a time ──
                                        const timerPct = (timeLeft / 30) * 100;
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
                                                                        <Download size={14} /> View resource
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
                                                                    <Download size={14} /> View Question Paper
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
