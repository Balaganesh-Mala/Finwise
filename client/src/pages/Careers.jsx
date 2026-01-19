import React from 'react';
import SEO from '../components/SEO';
import { MapPin, Briefcase, DollarSign, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Career = () => {
  // Todo: Fetch from API
  const jobs = [
    {
      _id: '1',
      title: 'Senior React Developer',
      company: 'TechSolutions Inc',
      location: 'New York, NY (Remote)',
      type: 'Full-time',
      salary: '$120k - $150k',
      description: 'We are looking for an experienced React developer to lead our frontend team.',
      skills: ['React', 'Node.js', 'Redux', 'AWS']
    },
    {
      _id: '2',
      title: 'Digital Marketing Specialist',
      company: 'GrowthHackers',
      location: 'Austin, TX',
      type: 'Contract',
      salary: '$60k - $80k',
      description: 'Join our dynamic marketing team and drive growth for our clients.',
      skills: ['SEO', 'SEM', 'Google Ads', 'Content Marketing']
    },
    {
      _id: '3',
      title: 'UI/UX Designer',
      company: 'Creative Studio',
      location: 'San Francisco, CA',
      type: 'Full-time',
      salary: '$90k - $110k',
      description: 'Design beautiful and intuitive user interfaces for web and mobile apps.',
      skills: ['Figma', 'Adobe XD', 'Prototyping', 'User Research']
    }
  ];

  return (
    <div className="bg-gray-50 min-h-screen py-16">
      <SEO 
        title="Careers | We Design Your Future" 
        description="Find your dream job with our hiring partners. We connect skilled graduates with top tech companies."
      />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Career Opportunities</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find your dream job with our hiring partners. We connect our skilled students with top companies.
          </p>
        </div>

        {/* Job List */}
        <div className="space-y-6 max-w-4xl mx-auto">
          {jobs.map((job) => (
            <motion.div 
              key={job._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-100"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-grow">
                  <h3 className="text-xl font-bold text-indigo-600 mb-1">{job.title}</h3>
                  <div className="flex flex-wrap items-center text-sm text-gray-500 gap-4 mb-3">
                    <span className="flex items-center"><Briefcase size={16} className="mr-1"/> {job.company}</span>
                    <span className="flex items-center"><MapPin size={16} className="mr-1"/> {job.location}</span>
                    <span className="flex items-center"><DollarSign size={16} className="mr-1"/> {job.salary}</span>
                  </div>
                  <p className="text-gray-600 mb-4">{job.description}</p>
                  
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill, index) => (
                      <span key={index} className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex-shrink-0">
                  <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center">
                    Apply Now <ArrowRight size={16} className="ml-2" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center bg-indigo-600 rounded-2xl p-12 text-white shadow-xl">
          <h2 className="text-3xl font-bold mb-4">Hire Our Graduates</h2>
          <p className="text-indigo-100 text-lg mb-8 max-w-2xl mx-auto">
            Looking for skilled talent? Our graduates are industry-ready and trained in the latest technologies.
          </p>
          <a href="/contact" className="bg-white text-indigo-600 px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition-colors inline-block">
            Partner With Us
          </a>
        </div>

      </div>
    </div>
  );
};

export default Career;
