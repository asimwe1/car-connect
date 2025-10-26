import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { FaWhatsapp, FaFacebookF, FaInstagram, FaXTwitter } from 'react-icons/fa6';

const Footer = () => {
  return (
    <footer className="bg-[#0B2559] text-white py-8">
      <div className="container mx-auto px-4">
        {/* Newsletter Section */}
        <div className="bg-[#12306E]/60 rounded-lg p-8 mb-12 text-center">
          <h2 className="text-2xl font-bold mb-4">CarConnect</h2>
          <p className="text-blue-100 mb-6">
            We help you to buy or sell your car at suitable terms
          </p>
          <div className="flex max-w-md mx-auto gap-2">
            <Input
              type="tel"
              placeholder="Enter phone (optional)"
              className="bg-white/10 border-white/20 text-white placeholder:text-blue-200"
            />
            <Button className="btn-hero" asChild>
              <a href="/signup">Sign Up</a>
            </Button>
          </div>
        </div>

        {/* Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-2">
          {/* Company */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-white hover:text-blue-200 transition-colors">About Us</Link></li>
              <li><Link to="/blog" className="text-white hover:text-blue-200 transition-colors">Blog</Link></li>
              <li><Link to="/services" className="text-white hover:text-blue-200 transition-colors">Services</Link></li>
              <li><Link to="/faq" className="text-white hover:text-blue-200 transition-colors">FAQs</Link></li>
              <li><Link to="/terms" className="text-white hover:text-blue-200 transition-colors">Terms</Link></li>
              <li><Link to="/contact" className="text-white hover:text-blue-200 transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/buy-cars" className="text-white hover:text-blue-200 transition-colors">Buy Cars</Link></li>
              <li><Link to="/list-car?sell" className="text-white hover:text-blue-200 transition-colors">Sell My Car</Link></li>
              <li><Link to="/list-car?rent" className="text-white hover:text-blue-200 transition-colors">Rent My Car</Link></li>
              <li><Link to="/contact" className="text-white hover:text-blue-200 transition-colors">Get in Touch</Link></li>
              {/* <li><Link to="/support" className="text-white hover:text-blue-200 transition-colors">Help center</Link></li> */}
              {/* <li><Link to="/support" className="text-white hover:text-blue-200 transition-colors">Live chat</Link></li> */}
              <li><Link to="/how-it-works" className="text-white hover:text-blue-200 transition-colors">How it works</Link></li>
            </ul>
          </div>

          {/* Our Brands */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Our Brands</h3>
            <ul className="space-y-2">
              <li><Link to="/buy-cars?brand=Toyota" className="text-white hover:text-blue-200 transition-colors">Toyota</Link></li>
              <li><Link to="/buy-cars?brand=Porsche" className="text-white hover:text-blue-200 transition-colors">Porsche</Link></li>
              <li><Link to="/buy-cars?brand=Audi" className="text-white hover:text-blue-200 transition-colors">Audi</Link></li>
              <li><Link to="/buy-cars?brand=BMW" className="text-white hover:text-blue-200 transition-colors">BMW</Link></li>
              <li><Link to="/buy-cars?brand=Ford" className="text-white hover:text-blue-200 transition-colors">Ford</Link></li>
              <li><Link to="/buy-cars?brand=Nissan" className="text-white hover:text-blue-200 transition-colors">Nissan</Link></li>
              <li><Link to="/buy-cars?brand=Mercedes-Benz" className="text-white hover:text-blue-200 transition-colors">Mercedes-Benz</Link></li>
              <li><Link to="/buy-cars?brand=Kia" className="text-white hover:text-blue-200 transition-colors">Kia</Link></li>
            </ul>
          </div>

          {/* Vehicles Type */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Vehicles Type</h3>
            <ul className="space-y-2">
              <li><Link to="/buy-cars" className="text-white hover:text-blue-200 transition-colors">Sedan</Link></li>
              <li><Link to="/buy-cars" className="text-white hover:text-blue-200 transition-colors">Hatchback</Link></li>
              <li><Link to="/buy-cars" className="text-white hover:text-blue-200 transition-colors">SUV</Link></li>
              <li><Link to="/buy-cars" className="text-white hover:text-blue-200 transition-colors">Hybrid</Link></li>
              <li><Link to="/buy-cars" className="text-white hover:text-blue-200 transition-colors">Electric</Link></li>
              <li><Link to="/buy-cars" className="text-white hover:text-blue-200 transition-colors">Coupe</Link></li>
              <li><Link to="/buy-cars" className="text-white hover:text-blue-200 transition-colors">Truck</Link></li>
              <li><Link to="/buy-cars" className="text-white hover:text-blue-200 transition-colors">Convertible</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t h-4 border-white/20 pt-8 flex flex-col items-center justify-center space-y-4">
          

          <div className="flex items-center gap-4">
            <a
              href="https://wa.me/250788881400"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="flex items-center gap-2 text-white hover:text-green-400 transition-colors"
            >
              <FaWhatsapp className="h-5 w-5" />
              <span className="hidden sm:inline">+250 788 881 400</span>
            </a>
            <a
              href="https://www.facebook.com/haruna.nyamushanja/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="text-white hover:text-blue-400 transition-colors"
            >
              <FaFacebookF className="h-5 w-5" />
            </a>
            <a
              href="https://www.instagram.com/car.connect.rw/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="text-white hover:text-pink-400 transition-colors"
            >
              <FaInstagram className="h-5 w-5" />
            </a>
            <a
              href="https://x.com/CarconnectRw"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X"
              className="text-white hover:text-white/80 transition-colors"
            >
              <FaXTwitter className="h-5 w-5" />
            </a>
          </div>
          <p className="text-blue-200">© 2025 car.connect.rw. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;