import React from 'react';
import { FaWhatsapp } from 'react-icons/fa';

const FloatingActions: React.FC = () => {
  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col gap-3">
      <a
        href="https://wa.me/250788881400"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="group inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500 text-white shadow-lg hover:bg-green-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-400"
      >
        <FaWhatsapp className="h-6 w-6" />
      </a>
    </div>
  );
};

export default FloatingActions;


