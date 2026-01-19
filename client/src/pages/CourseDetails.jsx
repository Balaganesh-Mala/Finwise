import React from 'react';
import SEO from '../components/SEO';
import { useParams, Link } from 'react-router-dom';
import { Clock, DollarSign, BarChart, CheckCircle, FileText, Download } from 'lucide-react';

const CourseDetails = () => {
  const { id } = useParams();

  // Mock Data (In real app, fetch based on ID)
  const course = {
      _id: id,
      title: 'Full Stack Web Development',
      description: 'Master MERN stack (MongoDB, Express, React, Node.js) and build modern, scalable web applications from scratch. This comprehensive course takes you from basics to advanced concepts with real-world projects.',
      duration: '6 Months',
      fee: '$999',
      skillLevel: 'Beginner to Advanced',
      imageUrl: 'https://images.unsplash.com/photo-1593720213428-28a5b9e94613?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80', // Same as list
      syllabus: [
          'Introduction to Web & HTML5/CSS3',
          'JavaScript Essentials & ES6+',
          'React.js: Components, Hooks, Router',
          'Node.js & Express Framework',
          'MongoDB Database Design',
          'Authentication & Security',
          'Deployment & DevOps Basics',
          'Capstone Project'
      ],
      highlights: [
          '100+ Hours of Live Classes',
          '10+ Real-World Projects',
          'One-on-One Mentorship',
          'Interview Preparation'
      ]
  };

  return (
    <div className="bg-white min-h-screen pb-16">
      <SEO 
        title={course.title} 
        description={course.description.substring(0, 160)}
      />
      {/* Header / Hero */}
      <div className="relative h-96 bg-gray-900 text-white">
         <img 
            src={course.imageUrl} 
            alt={course.title} 
            className="w-full h-full object-cover opacity-30"
         />
         <div className="absolute inset-0 flex items-center justify-center">
             <div className="container mx-auto px-4 text-center">
                 <span className="bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wide mb-4 inline-block">
                     {course.skillLevel}
                 </span>
                 <h1 className="text-4xl md:text-5xl font-bold mb-6">{course.title}</h1>
                 <div className="flex justify-center flex-wrap gap-6 text-lg">
                     <span className="flex items-center"><Clock className="mr-2" /> {course.duration}</span>
                     <span className="flex items-center"><DollarSign className="mr-2" /> {course.fee}</span>
                 </div>
             </div>
         </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                  
                  {/* Overview */}
                  <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Overview</h2>
                      <p className="text-gray-600 leading-relaxed text-lg">
                          {course.description}
                      </p>
                      
                      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                          {course.highlights.map((item, index) => (
                              <div key={index} className="flex items-center text-gray-700">
                                  <CheckCircle className="text-green-500 mr-2 flex-shrink-0" />
                                  <span>{item}</span>
                              </div>
                          ))}
                      </div>
                  </div>

                  {/* Syllabus */}
                  <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Course Syllabus</h2>
                        <button className="flex items-center text-indigo-600 font-semibold hover:text-indigo-800">
                            <Download size={20} className="mr-2" /> Download Syllabus
                        </button>
                      </div>
                      
                      <div className="space-y-4">
                          {course.syllabus.map((topic, index) => (
                              <div key={index} className="flex items-start p-4 bg-gray-50 rounded-lg">
                                  <div className="bg-indigo-100 text-indigo-600 w-8 h-8 rounded-full flex items-center justify-center font-bold mr-4 flex-shrink-0">
                                      {index + 1}
                                  </div>
                                  <div>
                                      <h3 className="font-semibold text-gray-900">{topic}</h3>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>

              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                  <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 sticky top-24">
                      <h3 className="text-xl font-bold text-gray-900 mb-6">Interested in this course?</h3>
                      
                      <div className="space-y-4 mb-8">
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                              <span className="text-gray-600">Duration</span>
                              <span className="font-semibold text-gray-900">{course.duration}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                              <span className="text-gray-600">Level</span>
                              <span className="font-semibold text-gray-900">{course.skillLevel}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                              <span className="text-gray-600">Total Fee</span>
                              <span className="font-bold text-indigo-600 text-xl">{course.fee}</span>
                          </div>
                      </div>

                      <div className="space-y-4">
                          <Link to="/contact" className="block w-full bg-indigo-600 text-white text-center font-bold py-4 rounded-lg hover:bg-indigo-700 transition-colors shadow-md">
                              Enroll Now
                          </Link>
                          <button className="block w-full border border-indigo-600 text-indigo-600 text-center font-bold py-4 rounded-lg hover:bg-indigo-50 transition-colors">
                              Download Brochure
                          </button>
                      </div>

                      <p className="text-xs text-center text-gray-500 mt-6">
                          * EMI options available. Contact us for more details.
                      </p>
                  </div>
              </div>

          </div>
      </div>
    </div>
  );
};

export default CourseDetails;
