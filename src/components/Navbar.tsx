import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, User, Settings } from 'lucide-react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuthPrompt } from '@/contexts/AuthPromptContext';
import { useAuth } from '@/contexts/AuthContext';
import NotificationBell from '@/components/NotificationBell';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const authPrompt = useAuthPrompt();
  const { user, isAuthenticated } = useAuth();

  const navLinks: Array<{ name: string; path: string; tab?: 'sell' | 'rent'; protected?: boolean }> = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Buy Cars', path: '/buy-cars' },
    { name: 'Sell My Car', path: '/list-car?sell', tab: 'sell', protected: true },
    { name: 'Rent My Car', path: '/list-car?rent', tab: 'rent', protected: true },
    { name: 'Contact', path: '/contact' },
  ];

  const isActiveLink = (link: { path: string; tab?: 'sell' | 'rent' }) => {
    const { path, tab } = link;
    const searchParams = new URLSearchParams(location.search);
    const currentTab = searchParams.get('tab');

    if (path.startsWith('/list-car')) {
      if (location.pathname !== '/list-car') return false;
      if (!tab) return false;
      return currentTab === tab;
    }

    if (path === '/') {
      return location.pathname === '/';
    }

    if (location.pathname === path) return true;
    if (location.pathname.startsWith(path)) return true;

    return false;
  };

  const handleProtectedClick = (e: React.MouseEvent, to: string, isProtected?: boolean) => {
    if (!isProtected) return;
    if (!isAuthenticated) {
      e.preventDefault();
      authPrompt.showPrompt({ redirectTo: to });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 h-[4rem] backdrop-blur-md border-b border-border supports-[backdrop-filter]:bg-background/60 safe-area-top">
      <div className="max-w-7xl mx-auto px-4 safe-area-left safe-area-right">
        <div className="flex items-center justify-between h-16 touch-action-manipulation">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-primary rounded-md">
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
              car.connect
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                onClick={(e) => handleProtectedClick(e, link.path, link.protected)}
                className={() => {
                  const active = isActiveLink(link);
                  return `relative text-sm font-medium transition-colors duration-200 ${
                    active ? 'text-primary' : 'text-muted-foreground hover:text-primary'
                  } ${link.name === 'Home' ? 'hidden lg:inline-block' : ''} after:content-[''] after:absolute after:left-0 after:-bottom-2 after:h-[2px] after:bg-primary after:transition-all after:duration-300 after:origin-left ${
                    active ? 'after:w-full after:scale-x-100 after:opacity-100' : 'after:w-0 after:scale-x-0 after:opacity-0 hover:after:w-full hover:after:scale-x-100 hover:after:opacity-100'
                  }`;
                }}
              >
                {link.name}
              </NavLink>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <NotificationBell />
                <Link to="/buyer-dashboard">
                  <Button variant="ghost" size="sm">
                    <User className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                {user?.role === 'admin' && (
                  <Link to="/admin-dashboard">
                    <Button variant="ghost" size="sm">
                      <Settings className="w-4 h-4 mr-2" />
                      Admin
                    </Button>
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link to="/signin">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="btn-hero text-sm px-4 py-2">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-3 rounded-lg hover:bg-accent transition-colors touch-action-manipulation mobile-tap-highlight-transparent"
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>  

        {/* Mobile Navigation moved below for full-width background */}
      </div>
      {isOpen && (
        <div className="md:hidden text-center bg-white w-full w-100% rounded-b-lg border-t border-border safe-area-bottom">
          <div className="flex flex-col space-y-1 pt-4 px-4">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                onClick={(e) => {
                  handleProtectedClick(e, link.path, link.protected);
                  setIsOpen(false);
                }}
                className={() => {
                  const active = isActiveLink(link);
                  return `relative px-4 py-3 rounded-lg text-sm font-medium transition-colors touch-action-manipulation mobile-tap-highlight-transparent ${
                    active ? 'text-primary bg-primary/5' : 'text-muted-foreground hover:text-primary hover:bg-accent'
                  } after:content-[''] after:absolute after:left-4 after:bottom-2 after:h-0.5 after:bg-primary after:transition-transform after:duration-300 after:origin-left ${
                    active ? 'after:w-8 after:scale-x-100' : 'after:w-8 after:scale-x-0 group-hover:after:scale-x-100'
                  }`;
                }}
              >
                {link.name}
              </NavLink>
            ))}
            <div className="pt-4 border-t border-border">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/buyer-dashboard"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-primary hover:bg-accent touch-action-manipulation mobile-tap-highlight-transparent"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Dashboard
                  </Link>
                  {user?.role === 'admin' && (
                    <Link
                      to="/admin-dashboard"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-primary hover:bg-accent touch-action-manipulation mobile-tap-highlight-transparent"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Admin
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <Link
                    to="/signin"
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-primary hover:bg-accent touch-action-manipulation mobile-tap-highlight-transparent"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-3 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary-light touch-action-manipulation mobile-tap-highlight-transparent"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;