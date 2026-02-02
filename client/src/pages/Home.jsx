import React from 'react';
import SEO from '../components/SEO';
import HeroBanner from '../components/HeroBanner';
import CompanyLogos from '../components/CompanyLogos';
import TechLogos from '../components/TechLogos';
import AboutSection from '../components/AboutSection';
import CoursesSection from '../components/CoursesSection';
import CertificateSection from '../components/CertificateSection';
import ReviewsSection from '../components/ReviewsSection';
import FaqSection from '../components/FaqSection';
import StudentSuccessDashboard from '../components/StudentSuccessDashboard';
import LocationSection from '../components/LocationSection';


const Home = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      <SEO
        title="Home"
        description="Launch your career with Skill Up Academy. Expert-led courses in MERN Stack, Data Science, and Digital Marketing."
      />

      {/* Hero Section */}
      <HeroBanner />

      {/* About Section */}
      <AboutSection />

      {/* Tech Logos Section */}
      <TechLogos />

      {/* Courses Section */}
      <CoursesSection />



      {/* Certificate Section */}
      <CertificateSection />

      {/* Student Success Dashboard */}
      <StudentSuccessDashboard />

      {/* Company Logos Section */}
      <CompanyLogos />

      {/* Reviews Section */}
      <ReviewsSection />

      {/* FAQ Section */}
      <FaqSection />

      {/* Location Section */}
      <LocationSection />
    </div>

  );
};

export default Home;
