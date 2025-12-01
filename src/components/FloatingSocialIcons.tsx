import React from 'react';
import { MessageCircle, Facebook } from 'lucide-react';
import { useState } from 'react'

const FloatingSocialIcons = () => {
  const handleWhatsApp = () => {
    // Replace with your WhatsApp business number (format: +countrycodephonenumber)
    const phoneNumber = "+250788881400"; // Update this with your actual WhatsApp business number
    const message = "Hello! I'm interested in learning more about connectify services.";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };
  
  const [showWhatsApp, setShowWhatsApp] = useState(false);

  const handleFacebook = () => {
    // Replace with your Facebook page URL
    const facebookUrl = "https://facebook.com/carconnectrwanda"; // Update with your actual Facebook page
    window.open(facebookUrl, '_blank');
  };

  return (
 <div className="fixed bottom-32 right-4 z-50 flex flex-col items-end space-y-4">
  {/* WhatsApp – Two Numbers */}
  <div className="flex flex-col items-end space-y-3">

    {/* Support Button */}
    <a
      href="https://wa.me/250788572481?text=Hi%2C%20I%20need%20support"
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full shadow-2xl transition-all duration-300 ${
        showWhatsApp
          ? "translate-x-0 opacity-100"
          : "translate-x-20 opacity-0 pointer-events-none"
      }`}
    >
      <MessageCircle className="h-5 w-5" />
      <span className="font-medium">Support</span>
    </a>

    {/* Sales Button */}
    <a
      href="https://wa.me/250788881400?text=Hello%2C%20I'm%20interested"
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full shadow-2xl transition-all duration-300 ${
        showWhatsApp
          ? "translate-x-0 opacity-100 delay-75"
          : "-translate-x-20 opacity-0 pointer-events-none"
      }`}
    >
      <MessageCircle className="h-5 w-5" />
      <span className="font-medium">Sales</span>
    </a>

    {/* Main WhatsApp Button (toggle) */}
    <div
      onClick={() => setShowWhatsApp(!showWhatsApp)}
      className="group relative bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-2xl cursor-pointer transition-all duration-300 hover:scale-110"
    >
      <MessageCircle className="h-7 w-7" />

      {/* Tooltip */}
      <div className="pointer-events-none absolute right-full top-1/2 -translate-y-1/2 -translate-x-3 whitespace-nowrap rounded-lg bg-gray-800 px-4 py-2 text-sm text-white opacity-0 transition-opacity group-hover:opacity-100">
        Chat on WhatsApp
        <div className="absolute left-full top-1/2 -translate-y-1/2 border-8 border-transparent border-l-gray-800" />
      </div>
    </div>
  </div>

  {/* Facebook – unchanged */}
  <div
    onClick={handleFacebook}
    className="group relative bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-2xl cursor-pointer transition-all duration-300 hover:scale-110"
  >
    <Facebook className="h-7 w-7" />

    <div className="pointer-events-none absolute right-full top-1/2 -translate-y-1/2 -translate-x-3 whitespace-nowrap rounded-lg bg-gray-800 px-4 py-2 text-sm text-white opacity-0 transition-opacity group-hover:opacity-100">
      Follow us on Facebook
      <div className="absolute left-full top-1/2 -translate-y-1/2 border-8 border-transparent border-l-gray-800" />
    </div>
  </div>
</div>
  );
};

export default FloatingSocialIcons;