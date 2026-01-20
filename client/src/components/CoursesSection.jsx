import React, { useState, useEffect } from 'react';
import Slider from 'react-slick';
import CourseCard from './CourseCard';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const CoursesSection = () => {
  // Manual responsive logic to bypass potential Slick issues
  const [slidesToShow, setSlidesToShow] = useState(3);
  const [showArrows, setShowArrows] = useState(true);

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
        setSlidesToShow(3);
        setShowArrows(true);
      }
    };

    // Initial check
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: slidesToShow, // Dynamic value from state
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    arrows: showArrows, // Dynamic value from state
    // Removed 'responsive' array to rely entirely on manual state
  };

  // Todo: Fetch from API
  const courses = [
    {
      _id: '1',
      title: 'Full Stack Web Development',
      description: 'Master MERN stack and build modern web applications from scratch.',
      duration: '6 Months',
      fee: '45,000',
      skillLevel: 'Beginner',
      imageUrl: 'https://images.unsplash.com/photo-1593720213428-28a5b9e94613?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    },
    {
      _id: '2',
      title: 'Data Science & Machine Learning',
      description: 'Analyze data and build predictive models using Python and ML libraries.',
      duration: '8 Months',
      fee: '55,000',
      skillLevel: 'Intermediate',
      imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    },
    {
      _id: '3',
      title: 'Digital Marketing Mastery',
      description: 'Learn SEO, SEM, Social Media Marketing and grow any business online.',
      duration: '3 Months',
      fee: '25,000',
      skillLevel: 'Beginner',
      imageUrl: 'https://images.unsplash.com/photo-1533750516457-a7f992034fec?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    },
    {
      _id: '4',
      title: 'Graphic Design Professional',
      description: 'Create stunning visuals using Photoshop, Illustrator and InDesign.',
      duration: '4 Months',
      fee: '30,000',
      skillLevel: 'Beginner',
      imageUrl: 'https://images.unsplash.com/photo-1626785774573-4b799312c95d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    }
  ];

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
        <Slider key={slidesToShow} {...settings} className="w-full md:px-10">
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
