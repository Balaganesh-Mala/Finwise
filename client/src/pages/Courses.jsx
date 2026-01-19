import React from 'react';
import SEO from '../components/SEO';
import CourseCard from '../components/CourseCard';

const Courses = () => {
    // Todo: Fetch from API (Shared logic or Context)
    const courses = [
        {
          _id: '1',
          title: 'Full Stack Web Development',
          description: 'Master MERN stack and build modern web applications from scratch.',
          duration: '6 Months',
          fee: '$999',
          skillLevel: 'Beginner',
          imageUrl: 'https://images.unsplash.com/photo-1593720213428-28a5b9e94613?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        },
        {
           _id: '2',
          title: 'Data Science & Machine Learning',
          description: 'Analyze data and build predictive models using Python and ML libraries.',
          duration: '8 Months',
          fee: '$1299',
          skillLevel: 'Intermediate',
          imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        },
        {
           _id: '3',
          title: 'Digital Marketing Mastery',
          description: 'Learn SEO, SEM, Social Media Marketing and grow any business online.',
          duration: '3 Months',
          fee: '$499',
          skillLevel: 'Beginner',
          imageUrl: 'https://images.unsplash.com/photo-1533750516457-a7f992034fec?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        },
        {
           _id: '4',
          title: 'Graphic Design Professional',
          description: 'Create stunning visuals using Photoshop, Illustrator and InDesign.',
          duration: '4 Months',
          fee: '$699',
          skillLevel: 'Beginner',
          imageUrl: 'https://images.unsplash.com/photo-1626785774573-4b799312c95d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        },
        {
            _id: '5',
            title: 'Cloud Computing with AWS',
            description: 'Become a certified AWS solutions architect and master cloud infrastructure.',
            duration: '5 Months',
            fee: '$899',
            skillLevel: 'Advanced',
            imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1352&q=80',
        },
        {
            _id: '6',
            title: 'Cyber Security Essentials',
            description: 'Learn to protect networks and systems from cyber attacks and threats.',
            duration: '6 Months',
            fee: '$1099',
            skillLevel: 'Intermediate',
            imageUrl: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        }
      ];

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
