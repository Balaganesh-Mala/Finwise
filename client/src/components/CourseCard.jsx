import React from 'react';
import { Clock, BookOpen, IndianRupee, ArrowUpRight, BarChart } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const CourseCard = ({ course }) => {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-1xl transition-all duration-300 border border-gray-100 h-full flex flex-col relative"
    >
      {/* Top Gradient Line */}
      <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />

      {/* Image Area */}
      <div className="relative h-52 overflow-hidden bg-gray-100 group">
        <img 
          src={course.imageUrl} 
          alt={course.title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {/* Overlay Action */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
            <Link 
                to={`/courses/${course._id}`}
                className="bg-white text-indigo-600 px-6 py-2 rounded-full font-bold transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hover:bg-indigo-50"
            >
                View Details
            </Link>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-4">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-xs font-semibold uppercase tracking-wide">
                {course.skillLevel}
            </span>
            <div className="flex items-center gap-1 text-gray-400 text-xs">
                <Clock size={14} /> {course.duration}
            </div>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight group-hover:text-indigo-600 transition-colors">
            {course.title}
        </h3>
        
        <p className="text-gray-500 text-sm mb-6 line-clamp-2">
            {course.description}
        </p>

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between pt-4 border-t border-dashed border-gray-200">
            <div className="flex flex-col">
                <span className="text-xs text-gray-400 font-medium">Course Fee</span>
                <span className="text-lg font-bold text-gray-900 flex items-center">
                    <IndianRupee size={16} /> {course.fee}
                </span>
            </div>
            
            <Link 
                to="/contact"
                className="w-10 h-10 rounded-full bg-gray-50 hover:bg-indigo-600 text-indigo-600 hover:text-white flex items-center justify-center transition-all duration-300 group/btn"
            >
                <ArrowUpRight size={20} className="transform group-hover/btn:rotate-45 transition-transform" />
            </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default CourseCard;
