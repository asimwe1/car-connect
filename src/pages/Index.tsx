import React from 'react';
import { Helmet } from 'react-helmet-async';
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
  // Clear any remembered demo/session data when landing page loads (fresh start)
  React.useEffect(() => {
    localStorage.removeItem('rememberPhone');
    // Do not clear actual user session here; only remembered phone.
  }, []);

  const handleBrowseCars = () => {
    setLoading(true);
    setTimeout(() => navigate('/buy-cars'), 150);
  };

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>connectify – Find Your Perfect Car</title>
        <meta name="description" content="Explore premium brands, buy or rent cars, and book test drives on connectify." />
        <link rel="canonical" href="https://CarConnect-rw.vercel.app/" />
      </Helmet>
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
    </div>
  );
};

export default Index;
