import React from 'react';
import axios from 'axios';
import SEO from '../components/SEO';
import CourseCard from '../components/CourseCard';

const Courses = () => {
    const [courses, setCourses] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/courses`);
                setCourses(res.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching courses:', err);
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

  return (
    <div className="bg-gray-50 min-h-screen py-16">
      <SEO 
        title="Our Courses" 
        description="Explore our range of job-ready courses including MERN Stack, Data Science, Digital Marketing, and more."
      />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
           <h2 className="text-indigo-600 font-semibold tracking-wider uppercase mb-2">All Courses</h2>
           <h1 className="text-4xl font-bold text-gray-900 mb-4">Upgrade Your Skills</h1>
           <p className="text-xl text-gray-600 max-w-2xl mx-auto">
             Explore our comprehensive range of courses designed to get you job-ready.
           </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map(course => (
                 <div key={course._id} className="h-full">
                    {/* Reuse CourseCard but ensure height is handled */}
                    <CourseCard course={course} />
                 </div>
            ))}
        </div>

      </div>
    </div>
  );
};

export default Courses;
