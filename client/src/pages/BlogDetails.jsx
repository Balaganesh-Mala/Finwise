import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Calendar, User, ArrowLeft, Clock, Loader, Share2, MessageCircle, Heart, Bookmark, ChevronLeft, Check } from 'lucide-react';
import SEO from '../components/SEO';
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const BlogDetails = () => {
    const { id } = useParams();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [settings, setSettings] = useState(null);

    // Interaction States
    const [likes, setLikes] = useState(0);
    const [hasLiked, setHasLiked] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isSubscribing, setIsSubscribing] = useState(false);
    const [email, setEmail] = useState('');

    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    const getAuthorName = (author) => {
        const companyTitle = settings?.siteTitle || 'Finwise';
        const systemAuthors = ['Admin', 'JobReady Team', 'JobReady', 'Finwise Team'];
        if (!author || systemAuthors.includes(author)) {
            return companyTitle;
        }
        return author;
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                const [blogRes, settingsRes] = await Promise.all([
                    axios.get(`${API_URL}/api/blogs/${id}`),
                    axios.get(`${API_URL}/api/settings`)
                ]);
                setBlog(blogRes.data);
                setSettings(settingsRes.data);
                setLikes(blogRes.data.likes || 0);

                const likedPosts = JSON.parse(localStorage.getItem('liked_posts') || '[]');
                if (likedPosts.includes(id)) setHasLiked(true);
            } catch (err) {
                console.error('Error fetching blog details:', err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
        window.scrollTo(0, 0);
    }, [id]);

    const handleLike = async () => {
        if (hasLiked) return;
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const res = await axios.patch(`${API_URL}/api/blogs/${id}/like`);
            setLikes(res.data.likes);
            setHasLiked(true);
            const likedPosts = JSON.parse(localStorage.getItem('liked_posts') || '[]');
            likedPosts.push(id);
            localStorage.setItem('liked_posts', JSON.stringify(likedPosts));
            toast.success('Favorite added!', { icon: '❤️', style: { borderRadius: '20px', background: '#333', color: '#fff' } });
        } catch (err) {
            console.error('Error liking post:', err);
        }
    };

    const handleShare = async () => {
        const shareData = { title: blog.title, text: blog.excerpt, url: window.location.href };
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            await axios.patch(`${API_URL}/api/blogs/${id}/share`);
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(window.location.href);
                toast.success('Link copied!', { icon: '📎' });
            }
        } catch (err) {
            console.error('Error sharing:', err);
        }
    };

    const handleSubscribe = async (e) => {
        e.preventDefault();
        if (!email) return;
        setIsSubscribing(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            await axios.post(`${API_URL}/api/newsletter/subscribe`, { email });
            toast.success('Welcome to the circle!', { icon: '✨' });
            setEmail('');
        } catch (err) {
            toast.error(err.response?.data?.msg || 'Something went wrong');
        } finally {
            setIsSubscribing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#F9FAFB]">
                <div className="w-12 h-12 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin mb-4" />
                <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">Preparing Story</p>
            </div>
        );
    }

    if (error || !blog) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#F9FAFB] px-4">
                <div className="w-24 h-24 bg-white rounded-[2.5rem] shadow-xl flex items-center justify-center mb-8 border border-slate-50">
                    <Bookmark size={32} className="text-slate-200" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Article unavailable.</h2>
                <Link to="/blogs" className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200">
                    Return to Journal
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-[#F9FAFB] min-h-screen relative overflow-x-hidden text-slate-900">
            <SEO title={`${blog.title} - The Journal`} description={blog.excerpt} />

            {/* Top Progress Bar */}
            <motion.div className="fixed top-0 left-0 right-0 h-[5px] bg-indigo-600 z-[100] origin-left shadow-[0_0_15px_rgba(79,70,229,0.5)]" style={{ scaleX }} />

            {/* Minimal Header */}
            <nav className="fixed top-0 left-0 right-0 z-[90] bg-white/80 backdrop-blur-xl border-b border-slate-100 px-8 md:px-12 lg:px-20 py-4">
                <div className="container mx-auto flex items-center justify-between">
                    <Link to="/blogs" className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">
                        <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all">
                            <ChevronLeft size={16} />
                        </div>
                        Back
                    </Link>
                    <div className="hidden lg:block text-[11px] font-black uppercase tracking-[0.4em] text-slate-900">
                        {blog.title.length > 40 ? blog.title.substring(0, 40) + '...' : blog.title}
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={handleLike} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${hasLiked ? 'bg-rose-50 text-rose-500 shadow-sm' : 'bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-500'}`}>
                            <Heart size={18} fill={hasLiked ? "currentColor" : "none"} />
                        </button>
                        <button onClick={handleShare} className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-indigo-50 hover:text-indigo-600 transition-all">
                            <Share2 size={18} />
                        </button>
                    </div>
                </div>
            </nav>

            <article className="pb-40 relative">
                {/* Cinematic Hero Section */}
                <div className="relative bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 pt-32 pb-16 mb-8 overflow-hidden shadow-2xl">
                    {/* Subtle Grid Pattern */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
                    
                    {/* Animated Cinematic Blobs */}
                    <motion.div
                        animate={{
                            x: [-400, 600, -400],
                            y: [-200, 200, -200],
                            opacity: [0.1, 0.25, 0.1]
                        }}
                        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-0 left-0 w-[800px] h-[800px] bg-indigo-500 rounded-full blur-[150px] pointer-events-none"
                    />
                    <motion.div
                        animate={{
                            x: [600, -300, 600],
                            y: [100, -100, 100],
                            opacity: [0.08, 0.2, 0.08]
                        }}
                        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-500 rounded-full blur-[130px] pointer-events-none"
                    />

                    <div className="container mx-auto px-8 md:px-12 lg:px-20 max-w-7xl relative z-10">
                        <header className="max-w-5xl">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/10 text-indigo-300 text-[10px] font-black uppercase tracking-widest mb-10 shadow-xl"
                            >
                                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                                {blog.category}
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[1.05] tracking-tight mb-12"
                            >
                                {blog.title}
                            </motion.h1>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="flex flex-wrap items-center gap-8"
                            >
                                <div className="flex items-center gap-4 group">
                                    <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white text-xl font-black shadow-2xl group-hover:bg-indigo-600 transition-all duration-500">
                                        {getAuthorName(blog.author).charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-white font-black text-sm mb-1 uppercase tracking-wider">{getAuthorName(blog.author)}</p>
                                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Industry Contributor</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-start bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-50">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                                        <Calendar size={12} className="text-indigo-500" /> Published
                                    </span>
                                    <span className="text-slate-900 font-bold text-sm">
                                        {new Date(blog.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </motion.div>
                        </header>
                    </div>
                </div>

                <div className="container mx-auto px-8 md:px-12 lg:px-20 max-w-7xl">
                    {/* Content Area */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        {/* Main Interaction Sidebar (Desktop) */}
                        <aside className="hidden lg:block lg:col-span-1">
                            <div className="sticky top-32 flex flex-col gap-4">
                                <button
                                    onClick={handleLike}
                                    className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center transition-all ${hasLiked ? 'bg-rose-50 text-rose-500 shadow-lg shadow-rose-100' : 'bg-white border border-slate-100 text-slate-400 hover:text-rose-500 hover:shadow-xl'}`}
                                >
                                    <Heart size={20} fill={hasLiked ? "currentColor" : "none"} />
                                    <span className="text-[10px] font-black mt-1">{likes}</span>
                                </button>
                                <button
                                    onClick={() => {
                                        setIsSaving(!isSaving);
                                        if (!isSaving) toast.success('Saved to list');
                                    }}
                                    className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isSaving ? 'bg-indigo-50 text-indigo-600 shadow-lg shadow-indigo-100' : 'bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 hover:shadow-xl'}`}
                                >
                                    <Bookmark size={20} fill={isSaving ? "currentColor" : "none"} />
                                </button>
                                <button
                                    onClick={handleShare}
                                    className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:shadow-xl transition-all"
                                >
                                    <Share2 size={20} />
                                </button>
                            </div>
                        </aside>

                        {/* Article Column */}
                        <div className="lg:col-span-8">
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-white rounded-[1rem] p-10 md:p-16 lg:p-20 shadow-2xl shadow-slate-200/50 border border-white relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-50 rounded-bl-full opacity-50" />

                                <div className="relative aspect-video rounded-[2rem] overflow-hidden mb-16 shadow-2xl">
                                    <img src={blog.imageUrl} alt={blog.title} className="w-full h-full object-cover" />
                                </div>

                                <div
                                    className="bento-content prose-custom text-slate-700"
                                    dangerouslySetInnerHTML={{ __html: blog.content ? blog.content.replace(/\n/g, '<br />') : '' }}
                                />

                                {/* Social Interactions Strip */}
                                <div className="mt-20 pt-16 border-t border-slate-100 flex flex-wrap items-center justify-between gap-6">
                                    <div className="flex flex-wrap items-center gap-4">
                                        <button
                                            onClick={handleLike}
                                            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs transition-all ${hasLiked ? 'bg-rose-50 text-rose-500' : 'bg-slate-50 text-slate-400 hover:text-rose-500'}`}
                                        >
                                            <Heart size={18} fill={hasLiked ? "currentColor" : "none"} /> {likes} LIKES
                                        </button>
                                        <button
                                            onClick={handleShare}
                                            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-50 text-slate-400 hover:bg-indigo-600 hover:text-white font-black text-xs transition-all"
                                        >
                                            <Share2 size={18} /> SHARE ARTICLE
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => setIsSaving(!isSaving)}
                                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs transition-all ${isSaving ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white'}`}
                                    >
                                        <Bookmark size={18} fill={isSaving ? "currentColor" : "none"} /> {isSaving ? 'SAVED' : 'SAVE FOR LATER'}
                                    </button>
                                </div>
                            </motion.div>

                            {/* Cinematic Newsletter Bento */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                className="mt-8 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 rounded-[1.5rem] p-8 md:p-10 shadow-2xl shadow-indigo-200/20 relative overflow-hidden"
                            >
                                {/* Decorative elements */}
                                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
                                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

                                <div className="relative z-10 max-w-2xl mx-auto text-center">
                                    <motion.h3
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight"
                                    >
                                        The Weekly Brief.
                                    </motion.h3>
                                    <motion.p
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                        className="text-slate-400 text-lg md:text-xl font-medium mb-12"
                                    >
                                        Deep dives and career insights delivered to your inbox every Thursday.
                                    </motion.p>

                                    <form className="relative flex flex-col sm:flex-row gap-4 p-2 bg-white/5 backdrop-blur-2xl rounded-[2rem] border border-white/10 shadow-2xl" onSubmit={handleSubscribe}>
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="your@email.com"
                                            className="flex-1 bg-transparent px-8 py-5 outline-none text-white font-medium placeholder:text-slate-500 text-lg"
                                        />
                                        <button
                                            disabled={isSubscribing}
                                            className="bg-white text-slate-950 px-10 py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-[0.2em] hover:bg-indigo-500 hover:text-white transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-white/10"
                                        >
                                            {isSubscribing ? '...' : 'Join'}
                                        </button>
                                    </form>

                                    <p className="mt-8 text-slate-500 text-xs font-bold uppercase tracking-[0.3em]">
                                        Join 2,500+ ambitious professionals
                                    </p>
                                </div>
                            </motion.div>
                        </div>

                        {/* Side Widgets (Desktop) */}
                        <aside className="hidden lg:block lg:col-span-3 h-full">
                            <div className="sticky top-32 space-y-8">
                                <div className="bg-white p-8 rounded-[1.5rem] shadow-xl shadow-slate-200/50 border border-white">
                                    <h4 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 mb-6">About Author</h4>
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-lg font-black uppercase shadow-lg shadow-indigo-100">
                                            {getAuthorName(blog.author).charAt(0)}
                                        </div>
                                        <p className="text-slate-900 font-black text-sm">{getAuthorName(blog.author)}</p>
                                    </div>
                                    <p className="text-slate-500 text-xs leading-relaxed font-medium">Contributes expert perspectives on technical strategy and professional development at {settings?.siteTitle || 'Finwise'}.</p>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </article>

            {/* Custom Content Styling */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .bento-content {
                    font-size: 1.125rem;
                    line-height: 1.9;
                }
                .bento-content h2 {
                    font-size: 2.25rem;
                    font-weight: 900;
                    margin-top: 5rem;
                    margin-bottom: 2rem;
                    color: #0f172a;
                    letter-spacing: -0.02em;
                    line-height: 1.1;
                }
                .bento-content h3 {
                    font-size: 1.75rem;
                    font-weight: 900;
                    margin-top: 4rem;
                    margin-bottom: 1.5rem;
                    color: #0f172a;
                }
                .bento-content p {
                    margin-bottom: 2rem;
                    font-weight: 500;
                    color: #475569;
                }
                .bento-content blockquote {
                    background-color: #f8fafc;
                    border-radius: 2rem;
                    padding: 3rem;
                    margin: 4rem 0;
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: #334155;
                    border-left: 8px solid #4f70e5;
                    position: relative;
                }
                .bento-content ul {
                    list-style: none;
                    margin: 3rem 0;
                }
                .bento-content li {
                    position: relative;
                    margin-bottom: 1.25rem;
                    padding-left: 2.5rem;
                    font-weight: 600;
                    color: #475569;
                }
                .bento-content li::before {
                    content: "✓";
                    position: absolute;
                    left: 0;
                    width: 20px;
                    height: 20px;
                    background-color: #eef2ff;
                    color: #4f46e5;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 6px;
                    font-size: 10px;
                    font-weight: 900;
                }
            `}} />
        </div>
    );
};

export default BlogDetails;
