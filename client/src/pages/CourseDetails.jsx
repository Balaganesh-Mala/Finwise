import React, { useEffect, useState } from 'react';
import SEO from '../components/SEO';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Clock, IndianRupee, CheckCircle, Download, FileText, ChevronDown, ChevronUp } from 'lucide-react';

const CourseDetails = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openModuleIndex, setOpenModuleIndex] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/courses/${id}`);
        setCourse(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  const toggleModule = (index) => {
    setOpenModuleIndex(openModuleIndex === index ? null : index);
  };

  const handleDownload = (type) => {
     // Direct link to the backend secure redirect endpoint
     window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/courses/${id}/download/${type}`;
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!course) return <div className="min-h-screen flex items-center justify-center">Course not found</div>;

  return (
    <div className="bg-white min-h-screen pb-16">
      <SEO 
        title={course.title} 
        description={course.description ? course.description.substring(0, 160) : course.title}
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
                     <span className="flex items-center"><IndianRupee className="mr-2" /> {course.fee}</span>
                 </div>
             </div>
         </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                  
                  {/* Overview */}
                  {/* Overview */}
                  {(course.overview || course.description) && (
                      <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                          <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Overview</h2>
                          <div className="text-gray-600 leading-relaxed text-lg whitespace-pre-wrap">
                              {course.overview || course.description}
                          </div>
                          
                          {course.highlights && course.highlights.length > 0 && (
                              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {course.highlights.map((item, index) => (
                                      <div key={index} className="flex items-start text-gray-700">
                                          <CheckCircle className="text-green-500 mr-2 flex-shrink-0 mt-1" size={20} />
                                          <span>{item}</span>
                                      </div>
                                  ))}
                              </div>
                          )}
                      </div>
                  )}

                  {/* Syllabus */}
                  {course.syllabus && course.syllabus.length > 0 && (
                      <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                          <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Course Syllabus</h2>
                            {course.syllabusPdf && course.syllabusPdf.url && (
                                <button 
                                    onClick={() => handleDownload('syllabus')}
                                    className="flex items-center text-indigo-600 font-semibold hover:text-indigo-800"
                                >
                                    <Download size={20} className="mr-2" /> Download Syllabus
                                </button>
                            )}
                          </div>
                          
                          <div className="space-y-4">
                              {course.syllabus.map((module, index) => (
                                  <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                                      <button 
                                        onClick={() => toggleModule(index)}
                                        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                                      >
                                          <div className="flex items-center gap-4">
                                              <div className="bg-indigo-100 text-indigo-600 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                                                  {index + 1}
                                              </div>
                                              <h3 className="font-semibold text-gray-900">{module.title}</h3>
                                          </div>
                                          {openModuleIndex === index ? <ChevronUp size={20} className="text-gray-500"/> : <ChevronDown size={20} className="text-gray-500"/>}
                                      </button>
                                      
                                      {openModuleIndex === index && (
                                          <div className="p-4 bg-white border-t border-gray-200">
                                              <ul className="space-y-2 ml-12 list-disc text-gray-600">
                                                  {module.modules.map((topic, i) => (
                                                      <li key={i}>{topic}</li>
                                                  ))}
                                              </ul>
                                          </div>
                                      )}
                                  </div>
                              ))}
                          </div>
                      </div>
                  )}

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
                          <Link to="/contact" className="block w-full bg-indigo-600 text-white text-center font-bold py-3 rounded-lg hover:bg-indigo-700 transition-colors shadow-md">
                              Enroll Now
                          </Link>
                          
                          {course.brochurePdf && course.brochurePdf.url && (
                              <button 
                                onClick={() => handleDownload('brochure')}
                                className="block w-full border border-indigo-600 text-indigo-600 text-center font-bold py-3 rounded-lg hover:bg-indigo-50 transition-colors"
                              >
                                  Download Brochure
                              </button>
                          )}
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
