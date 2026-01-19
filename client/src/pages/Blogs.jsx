import React from 'react';
import SEO from '../components/SEO';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Blogs = () => {
    // Todo: Fetch from API
  const blogs = [
    {
      _id: '1',
      title: 'Top 5 Skills High in Demand in 2024',
      excerpt: 'Discover the most sought-after skills that employers are looking for this year.',
      image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-1.2.1&auto=format&fit=crop&w=1352&q=80',
      author: 'John Doe',
      date: 'Jan 15, 2024',
      category: 'Career Advice'
    },
    {
      _id: '2',
      title: 'How to Build a Portfolio that Stands Out',
      excerpt: 'Learn the secrets to creating a portfolio that gets you hired instantly.',
      image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1355&q=80',
      author: 'Jane Smith',
      date: 'Feb 02, 2024',
      category: 'Design'
    },
    {
        _id: '3',
        title: 'The Future of Web Development with AI',
        excerpt: 'How Artificial Intelligence is reshaping the landscape of web development.',
        image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        author: 'Mike Johnson',
        date: 'Mar 10, 2024',
        category: 'Technology'
    }
  ];

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog) => (
                <div key={blog._id} className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-xl transition-shadow flex flex-col">
                    <div className="h-48 overflow-hidden relative">
                        <img 
                            src={blog.image} 
                            alt={blog.title} 
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                        />
                         <div className="absolute top-4 left-4 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                            {blog.category}
                        </div>
                    </div>
                    <div className="p-6 flex flex-col flex-grow">
                        <div className="flex items-center text-sm text-gray-500 mb-3 space-x-4">
                            <span className="flex items-center"><User size={14} className="mr-1"/> {blog.author}</span>
                            <span className="flex items-center"><Calendar size={14} className="mr-1"/> {blog.date}</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 hover:text-indigo-600 transition-colors">
                            <Link to={`/blogs/${blog._id}`}>{blog.title}</Link>
                        </h3>
                        <p className="text-gray-600 mb-4 line-clamp-3 flex-grow">{blog.excerpt}</p>
                        <Link to={`/blogs/${blog._id}`} className="inline-flex items-center text-indigo-600 font-semibold hover:text-indigo-800 mt-auto">
                            Read More <ArrowRight size={16} className="ml-2" />
                        </Link>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Blogs;
