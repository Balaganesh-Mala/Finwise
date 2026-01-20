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
      setCourses(res.data);
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
      <section className="py-20 bg-gray-50 min-h-[400px] flex items-center justify-center">
        <div className="text-gray-500 text-lg">Loading courses...</div>
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
          <h3 className="text-3xl md:text-4xl font-bold text-gray-900">Explore Popular Courses</h3>
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
