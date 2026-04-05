import React, { useState, useEffect } from 'react';
import SEO from '../components/SEO';
import { Calendar, User, ArrowRight, Loader, Clock, Bookmark, Heart, Share2, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Career Advice', 'Technology', 'Success Stories'];

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
            const [blogsRes, settingsRes] = await Promise.all([
                axios.get(`${API_URL}/api/blogs`),
                axios.get(`${API_URL}/api/settings`)
            ]);
            setBlogs(blogsRes.data);
            setSettings(settingsRes.data);
        } catch (err) {
            console.error('Error fetching blogs:', err);
        } finally {
            setLoading(false);
        }
    };
    fetchData();
  }, []);

  const filteredBlogs = activeCategory === 'All' 
    ? blogs 
    : blogs.filter(blog => blog.category === activeCategory);

  return (
    <div className="bg-[#F9FAFB] min-h-screen relative overflow-hidden text-slate-900">
      <SEO 
        title={`Journal - ${settings?.siteTitle || 'Finwise'}`} 
        description={`Explore insights on professional finance growth, investment strategies, and accounting trends.`}
      />

      {/* Cinematic Header Section */}
      <div className="pt-36 pb-12 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 border-b border-white/5 relative overflow-hidden shadow-2xl">
          {/* Subtle Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
          
          {/* Animated Header Specific Blobs - Traveling Effect */}
          <motion.div 
            animate={{ 
                x: [-200, 800, -200],
                y: [-200, 200, -200],
                opacity: [0.1, 0.3, 0.1]
            }}
            transition={{ 
                duration: 25, 
                repeat: Infinity, 
                ease: "easeInOut" 
            }}
            className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500 rounded-full blur-[140px] pointer-events-none" 
          />
          <motion.div 
            animate={{ 
                x: [800, -200, 800],
                y: [200, -200, 200],
                opacity: [0.1, 0.25, 0.1]
            }}
            transition={{ 
                duration: 30, 
                repeat: Infinity, 
                ease: "easeInOut" 
            }}
            className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500 rounded-full blur-[120px] pointer-events-none" 
          />
 
          <div className="container mx-auto px-8 md:px-12 lg:px-20 relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <div className="relative">
                      <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/10 text-indigo-300 text-xs font-black uppercase tracking-widest mb-6 relative z-10 shadow-xl"
                      >
                          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                          The Bento Journal
                      </motion.div>
                      <motion.h1 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                          className="text-5xl md:text-7xl font-black text-white leading-none tracking-tight mb-8 relative z-10"
                      >
                          Stay <span className="text-indigo-400">Ahead</span> of the curve.
                      </motion.h1>
                      <motion.p 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                          className="text-lg text-slate-400 max-w-xl font-medium relative z-10"
                      >
                          Curated insights on career excellence, technical innovation, and the future of professional work.
                      </motion.p>
                  </div>
                  
                  {/* Category Filter Bento - Cinematic Style */}
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white/5 backdrop-blur-2xl p-8 rounded-[2rem] border border-white/10 flex flex-wrap gap-3 shadow-2xl"
                  >
                      {categories.map((cat) => (
                          <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg ${
                                activeCategory === cat 
                                ? 'bg-white text-slate-950 shadow-white/10' 
                                : 'bg-white/5 text-slate-400 border border-white/10 hover:border-indigo-400 hover:text-white'
                            }`}
                          >
                              {cat}
                          </button>
                      ))}
                  </motion.div>
              </div>
          </div>
      </div>

      <main className="container mx-auto px-8 md:px-12 lg:px-20 py-24 relative z-10">
        {loading ? (
            <div className="flex flex-col justify-center items-center h-80 bg-white rounded-[3rem] shadow-xl shadow-slate-200/50">
                <div className="w-12 h-12 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin mb-4" />
                <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px]">Curating your feed</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence mode="popLayout">
                    {filteredBlogs.map((blog, index) => (
                        <motion.div 
                            key={blog._id} 
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                            className="group bg-white rounded-[2.5rem] overflow-hidden shadow-lg shadow-slate-200/30 border border-slate-50 hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-500 flex flex-col"
                        >
                            <Link to={`/blogs/${blog._id}`} state={{ blog }} className="block relative aspect-[16/10] overflow-hidden">
                                <img 
                                    src={blog.imageUrl} 
                                    alt={blog.title} 
                                    className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110"
                                />
                                <div className="absolute top-6 left-6 flex gap-2">
                                    <span className="bg-white/95 backdrop-blur-md px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-900 rounded-xl shadow-lg border border-slate-100">
                                        {blog.category}
                                    </span>
                                </div>
                                <div className="absolute bottom-6 right-6 flex gap-2">
                                    <div className="bg-white/80 backdrop-blur-md p-2 rounded-xl text-indigo-600 shadow-sm border border-white">
                                        <Heart size={14} fill={blog.likes > 0 ? "currentColor" : "none"} />
                                    </div>
                                </div>
                            </Link>

                            <div className="p-10 flex flex-col flex-grow">
                                <div className="flex items-center gap-6 text-[10px] font-bold text-slate-400 mb-6 uppercase tracking-widest">
                                    <span className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                        {getAuthorName(blog.author)}
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <Clock size={12} className="text-slate-300" />
                                        5 MIN READ
                                    </span>
                                </div>

                                <h3 className="text-2xl font-black text-slate-900 mb-5 leading-tight group-hover:text-indigo-600 transition-colors">
                                    <Link to={`/blogs/${blog._id}`} state={{ blog }}>{blog.title}</Link>
                                </h3>
                                
                                <p className="text-slate-500 mb-10 line-clamp-2 text-sm leading-relaxed flex-grow">
                                    {blog.excerpt}
                                </p>

                                <div className="pt-8 border-t border-slate-50 mt-auto flex items-center justify-between">
                                    <Link 
                                        to={`/blogs/${blog._id}`} 
                                        state={{ blog }}
                                        className="flex items-center gap-3 text-slate-900 font-black text-[11px] uppercase tracking-[0.2em] group/btn"
                                    >
                                        Full Story
                                        <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center group-hover/btn:bg-indigo-600 group-hover/btn:text-white transition-all duration-300">
                                            <ArrowRight size={16} className="group-hover/btn:translate-x-0.5 transition-transform" />
                                        </div>
                                    </Link>
                                    <div className="flex items-center gap-2 text-slate-300">
                                        <span className="text-[10px] font-bold">SAVED</span>
                                        <Bookmark size={16} className="hover:text-indigo-500 cursor-pointer transition-colors" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {filteredBlogs.length === 0 && (
                     <div className="col-span-full py-40 bg-white rounded-[3rem] text-center border-2 border-dashed border-slate-100">
                        <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-white">
                            <Filter size={32} className="text-slate-200" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">No results in this section.</h3>
                        <p className="text-slate-400 max-w-xs mx-auto text-sm font-medium">Try another category to find the insights you're looking for.</p>
                        <button 
                            onClick={() => setActiveCategory('All')}
                            className="mt-10 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all"
                        >
                            Reset Filter
                        </button>
                     </div>
                )}
            </div>
        )}
      </main>
    </div>
  );
};

export default Blogs;
