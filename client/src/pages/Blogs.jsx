import React, { useState, useEffect } from 'react';
import SEO from '../components/SEO';
import { Calendar, User, ArrowRight, Loader } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/blogs`);
            setBlogs(res.data);
        } catch (err) {
            console.error('Error fetching blogs:', err);
        } finally {
            setLoading(false);
        }
    };
    fetchBlogs();
  }, []);

  return (
    <div className="bg-white min-h-screen py-16">
      <SEO 
        title="Blog & Insights" 
        description="Stay updated with the latest industry trends, career tips, and tech tutorials from JobReady Skills Center."
      />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Latest Insights</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Stay updated with the latest industry trends, career tips, and tutorials.
          </p>
        </div>

        {loading ? (
            <div className="flex justify-center items-center h-64">
                <Loader size={40} className="animate-spin text-indigo-600" />
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {blogs.map((blog) => (
                    <div key={blog._id} className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-xl transition-shadow flex flex-col h-full">
                        <div className="h-48 overflow-hidden relative">
                            <img 
                                src={blog.imageUrl} 
                                alt={blog.title} 
                                className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                            />
                             <div className="absolute top-4 left-4 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                                {blog.category}
                            </div>
                        </div>
                        <div className="p-6 flex flex-col flex-grow">
                            <div className="flex items-center text-sm text-gray-500 mb-3 space-x-4">
                                <span className="flex items-center gap-1"><User size={14} className="text-indigo-500"/> {blog.author}</span>
                                <span className="flex items-center gap-1"><Calendar size={14} className="text-indigo-500"/> {new Date(blog.createdAt).toLocaleDateString()}</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 hover:text-indigo-600 transition-colors">
                                <Link to={`/blogs/${blog._id}`}>{blog.title}</Link>
                            </h3>
                            <p className="text-gray-600 mb-4 line-clamp-3 text-sm flex-grow">{blog.excerpt}</p>
                            <Link to={`/blogs/${blog._id}`} className="inline-flex items-center text-indigo-600 font-bold hover:text-indigo-800 mt-auto group text-sm uppercase tracking-wide">
                                Read More <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                ))}
                
                {blogs.length === 0 && (
                     <div className="col-span-full text-center py-20 bg-gray-50 rounded-2xl">
                        <p className="text-gray-400">No articles posted yet. Check back soon!</p>
                     </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default Blogs;
