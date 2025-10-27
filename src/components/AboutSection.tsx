import React from 'react';
import { useInView } from 'react-intersection-observer';
import carconnectImg from '@/assets/carconnect.jpg';

const AboutSection = () => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section ref={ref} className="py-16 bg-black text-white">
      <div className="container mx-auto px-4">
        <div className={`max-w-6xl mx-auto transition-all duration-700 ${inView ? 'animate-fade-in' : 'opacity-0'}`}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className={`transition-all duration-700 delay-200 ${inView ? 'animate-slide-up' : 'opacity-0'}`}>
              <h2 className="text-3xl font-bold mb-6 text-white">Who Are We?</h2>
              <p className="text-gray-300 leading-relaxed mb-6">
                CarConnect is Rwanda's premier automotive marketplace, connecting car buyers and sellers across the country. 
                We believe that finding your perfect vehicle should be simple, transparent, and enjoyable.
              </p>
              <p className="text-gray-300 leading-relaxed mb-6">
                Our platform offers a comprehensive range of vehicles from trusted dealers and private sellers, 
                ensuring you have access to the best cars at competitive prices. With our rigorous verification 
                process and expert support team, we make car buying safe and reliable.
              </p>
              <div className="grid grid-cols-2 gap-6 mt-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-2">500+</div>
                  <div className="text-gray-400 text-sm">Verified Cars</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-2">1000+</div>
                  <div className="text-gray-400 text-sm">Happy Customers</div>
                </div>
              </div>
            </div>
            
            <div className={`relative transition-all duration-700 delay-400 ${inView ? 'animate-zoom-in' : 'opacity-0'}`}>
              <div className="flex justify-center items-center">
                <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl shadow-2xl">
                  <img
                    src={carconnectImg}
                    alt="Car Connect Logo"
                    className="w-full max-w-md h-auto rounded-lg"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;