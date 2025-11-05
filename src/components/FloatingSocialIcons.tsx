import React from 'react';
import { MessageCircle, Facebook } from 'lucide-react';

const FloatingSocialIcons = () => {
  const handleWhatsApp = () => {
    // Replace with your WhatsApp business number (format: +countrycodephonenumber)
    const phoneNumber = "+250788881400"; // Update this with your actual WhatsApp business number
    const message = "Hello! I'm interested in learning more about CarConnect services.";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleFacebook = () => {
    // Replace with your Facebook page URL
    const facebookUrl = "https://facebook.com/carconnectrwanda"; // Update with your actual Facebook page
    window.open(facebookUrl, '_blank');
  };

  return (
    <div className="fixed bottom-20 right-4 z-40 flex flex-col space-y-3 hidden sm:flex">
      {/* WhatsApp Icon */}
      <div
        onClick={handleWhatsApp}
        className="group relative bg-green-500 hover:bg-green-600 text-white p-3 rounded-full shadow-lg cursor-pointer transition-all duration-300 hover:scale-110 animate-pulse hover:animate-none"
        title="Chat on WhatsApp"
      >
        <MessageCircle className="h-6 w-6" />
        
        {/* Tooltip */}
        <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-sm px-3 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          Chat on WhatsApp
          <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-gray-800"></div>
        </div>
      </div>

      {/* Facebook Icon */}
      <div
        onClick={handleFacebook}
        className="group relative bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg cursor-pointer transition-all duration-300 hover:scale-110 animate-pulse hover:animate-none"
        title="Follow us on Facebook"
      >
        <Facebook className="h-6 w-6" />
        
        {/* Tooltip */}
        <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-sm px-3 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          Follow us on Facebook
          <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-gray-800"></div>
        </div>
      </div>
    </div>
  );
};

export default FloatingSocialIcons;