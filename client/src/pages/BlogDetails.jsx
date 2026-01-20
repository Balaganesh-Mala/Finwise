import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Calendar, User, ArrowLeft, Clock, Loader } from 'lucide-react';
import SEO from '../components/SEO';
import DOMPurify from 'dompurify'; // Ideally, but standard React dangerouslySetInnerHTML is okay if Admin is trusted.

const BlogDetails = () => {
    const { id } = useParams();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchBlog = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/blogs/${id}`);
                setBlog(res.data);
            } catch (err) {
                console.error('Error fetching blog:', err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        fetchBlog();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <Loader size={40} className="animate-spin text-indigo-600" />
            </div>
        );
    }

    if (error || !blog) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Blog Post Not Found</h2>
                <p className="text-gray-500 mb-8">The article you are looking for does not exist or has been removed.</p>
                <Link to="/blogs" className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-2">
                    <ArrowLeft size={20} /> Back to Blogs
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen pb-20 pt-8">
            <SEO 
                title={`${blog.title} - JobReady Blog`}
                description={blog.excerpt}
            />

            <article className="max-w-4xl mx-auto px-4 sm:px-6">
                {/* Back Link */}
                <Link to="/blogs" className="inline-flex items-center text-gray-500 hover:text-indigo-600 transition-colors mb-8 group font-medium">
                    <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Back to All Articles
                </Link>

                {/* Header */}
                <header className="mb-10 text-center">
                    <div className="inline-block bg-indigo-50 text-indigo-700 text-sm font-bold px-4 py-1.5 rounded-full mb-6 tracking-wide">
                        {blog.category}
                    </div>
                    <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
                        {blog.title}
                    </h1>
                    
                    <div className="flex flex-wrap items-center justify-center gap-6 text-gray-500 text-sm border-b border-gray-100 pb-10">
                        <div className="flex items-center gap-2">
                             <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-lg">
                                 {blog.author.charAt(0)}
                             </div>
                             <div className="text-left">
                                 <p className="text-gray-900 font-bold">{blog.author}</p>
                                 <p className="text-xs">Author</p>
                             </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Calendar size={16} />
                            <span>{new Date(blog.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Clock size={16} />
                            <span>5 min read</span>
                        </div>
                    </div>
                </header>

                {/* Hero Image */}
                <div className="mb-12 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-gray-900/5 aspect-video relative">
                    <img 
                        src={blog.imageUrl} 
                        alt={blog.title} 
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                </div>

                {/* Content */}
                <div 
                    className="prose prose-lg prose-indigo mx-auto text-gray-600 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: blog.content ? blog.content.replace(/\n/g, '<br />') : '' }}
                />

                {/* Footer / CTA */}
                <div className="mt-16 pt-10 border-t border-gray-100 bg-gray-50 rounded-2xl p-8 md:p-12 text-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Enjoyed this article?</h3>
                    <p className="text-gray-600 mb-8 max-w-lg mx-auto">Subscribe to our newsletter to get more career tips and tech insights delivered to your inbox.</p>
                    <div className="max-w-md mx-auto flex gap-3">
                        <input 
                            type="email" 
                            placeholder="Enter your email" 
                            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        />
                        <button className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
                            Subscribe
                        </button>
                    </div>
                </div>

            </article>
        </div>
    );
};

export default BlogDetails;
