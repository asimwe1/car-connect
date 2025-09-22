import React from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '@/components/LoadingSpinner';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import BrandSection from '@/components/BrandSection';
import ExploreSection from '@/components/ExploreSection';
import AboutSection from '@/components/AboutSection';
import FeaturesSection from '@/components/FeaturesSection';
import PopularMakesSection from '@/components/PopularMakesSection';
import Footer from '@/components/Footer';

const Index = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);

  const handleBrowseCars = () => {
    setLoading(true);
    setTimeout(() => navigate('/buy-cars'), 150);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <BrandSection />
      <div className="container mx-auto px-4 py-6 flex justify-end">
        <button onClick={handleBrowseCars} className="btn-hero px-6 py-2 rounded-md">
          {loading ? <LoadingSpinner size="sm" /> : 'Browse Cars'}
        </button>
      </div>
      <ExploreSection />
      <AboutSection />
      <FeaturesSection />
      <PopularMakesSection />
      <Footer />
    </div>
  );
};

export default Index;
