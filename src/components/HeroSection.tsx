import React from 'react';
import { Button } from '@/components/ui/button';
import { Search, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import heroImage from '@/assets/hero-land-cruiser.jpg';

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center mt-[-2rem] overflow-hidden safe-area-top">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${heroImage})`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary-dark/80 via-primary/60 to-primary-dark/80" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto safe-area-left safe-area-right">
        <div className="space-y-6 md:space-y-8 fade-in-up">
          <div className="space-y-3 md:space-y-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight">
              Premium Cars
              <span className="block bg-gradient-to-r from-accent to-primary-light bg-clip-text text-transparent">
                Await You
              </span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-white/90 max-w-2xl mx-auto px-2">
              Discover luxury vehicles from the world's most prestigious brands. 
              Your perfect car is just a click away.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center fade-in-up stagger-delay-2">
            <Link to="/buy-cars" className="w-full sm:w-auto">
              <Button className="btn-hero text-base md:text-lg px-6 md:px-8 py-3 md:py-4 w-full sm:w-auto touch-action-manipulation mobile-tap-highlight-transparent">
                <Search className="w-4 md:w-5 h-4 md:h-5 mr-2" />
                Browse Cars
              </Button>
            </Link>
            <Link to="/signin" className="w-full sm:w-auto">
              <Button className="btn-secondary text-base md:text-lg px-6 md:px-8 py-3 md:py-4 text-white border-white/30 hover:bg-white/10 w-full sm:w-auto touch-action-manipulation mobile-tap-highlight-transparent">
                Sign In
                <ArrowRight className="w-4 md:w-5 h-4 md:h-5 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-16 fade-in-up stagger-delay-3">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">500+</div>
              <div className="text-white/80">Premium Cars</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">8</div>
              <div className="text-white/80">Luxury Brands</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">24/7</div>
              <div className="text-white/80">Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white rounded-full mt-2"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;