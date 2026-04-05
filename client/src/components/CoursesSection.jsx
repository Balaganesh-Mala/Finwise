import React, { useState, useEffect } from 'react';
import Slider from 'react-slick';
import CourseCard from './CourseCard';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import axios from 'axios';

const CoursesSection = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Manual responsive logic to bypass potential Slick issues
  const [slidesToShow, setSlidesToShow] = useState(3);
  const [showArrows, setShowArrows] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setSlidesToShow(1);
        setShowArrows(false);
      } else if (width < 1024) {
        setSlidesToShow(2);
        setShowArrows(true);
      } else {
        // Ensure we don't try to show more slides than we have items
        const count = courses.length > 0 ? courses.length : 3;
        setSlidesToShow(Math.min(3, count));
        setShowArrows(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [courses.length]);

  const fetchCourses = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/courses`);
      // Filter out any courses marked explicitly as Bonus Courses
      const filteredCourses = res.data.filter(course => !course.isBonus);
      setCourses(filteredCourses);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setLoading(false);
    }
  };

  const settings = {
    dots: true,
    infinite: courses.length > slidesToShow, // Only infinite if enough items
    speed: 500,
    slidesToShow: Math.min(slidesToShow, courses.length), // Ensure we don't try to show more than available
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    arrows: showArrows,
  };

  if (loading) {
    return (
      <section className="py-20 bg-gray-50 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="h-4 w-32 bg-gray-200 rounded mx-auto mb-4 animate-pulse"></div>
            <div className="h-10 w-64 md:w-96 bg-gray-200 rounded mx-auto mt-2 animate-pulse"></div>
            <div className="mt-4 max-w-2xl mx-auto h-6 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:px-10">
            {[1, 2, 3].map((item) => (
              <div key={item} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse min-h-[420px]">
                <div className="w-full h-[200px] bg-gray-200"></div>
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <div className="w-20 h-5 bg-gray-100 rounded-full"></div>
                    <div className="w-12 h-5 bg-gray-100 rounded"></div>
                  </div>
                  <div className="w-full h-6 bg-gray-200 rounded mb-3"></div>
                  <div className="w-3/4 h-6 bg-gray-200 rounded mb-6"></div>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-20 h-4 bg-gray-100 rounded"></div>
                    <div className="w-20 h-4 bg-gray-100 rounded"></div>
                  </div>
                  <div className="w-full h-10 bg-gray-100 rounded-xl"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // If no courses, hide the section
  if (courses.length === 0) return null;

  return (
    <section className="py-20 bg-gray-50 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-indigo-600 font-semibold tracking-wider uppercase mb-2">Our Courses</h2>
          <h3 className="text-3xl md:text-4xl font-bold text-gray-900">Explore Courses</h3>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
            Choose from our wide range of industry-aligned courses and start your journey today.
          </p>
        </div>

        {/* Adding explicit key to force re-render when slides count changes */}
        <Slider key={`${slidesToShow}-${courses.length}`} {...settings} className="w-full md:px-10">
          {courses.map((course) => (
            <div key={course._id} className="px-3 py-4 h-full">
              <CourseCard course={course} />
            </div>
          ))}
        </Slider>
      </div>
    </section>
  );
};

export default CoursesSection;
