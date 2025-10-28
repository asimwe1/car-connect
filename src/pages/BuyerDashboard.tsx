// BuyerDashboard.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import {
  User,
  Heart,
  Calendar,
  Car,
  Bell,
  LogOut,
  Star,
  MapPin,
  MessageCircle,
  ArrowLeft,
  Settings,
} from 'lucide-react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import NotificationBell from '@/components/NotificationBell';
import ErrorBoundary from '@/components/ErrorBoundary';

const BuyerDashboard: React.FC = () => {
  const [stats, setStats] = useState({ wishlist: 0, bookings: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      setAuthError('User not authenticated. Redirecting to sign-in page...');
      navigate('/signin', { replace: true });
      return;
    }
    let isMounted = true; // Track mount status to prevent state updates on unmounted component

    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const [bookingsRes, wishlistRes] = await Promise.all([api.getMyBookings(), api.getWishlist()]);
        if (!isMounted) return; // Exit if unmounted

        console.log('Bookings Response:', bookingsRes); // Debug log
        console.log('Bookings Response Data:', bookingsRes.data); // Debug log
        console.log('Wishlist Response:', wishlistRes); // Debug log
        
        if (bookingsRes.error) {
          console.error('Bookings error:', bookingsRes.error);
          throw new Error(`Bookings fetch failed: ${bookingsRes.error}`);
        }
        if (wishlistRes.error) {
          console.error('Wishlist error:', wishlistRes.error);
          throw new Error(`Wishlist fetch failed: ${wishlistRes.error}`);
        }

        // API layer normalization:
        // - getWishlist(): returns { wishlist: { cars: [] } }
        // - getMyBookings(): data is an array of bookings
        const wishlistCount = wishlistRes.data?.wishlist?.cars?.length || 0;
        const bookingsCount = Array.isArray(bookingsRes.data) ? bookingsRes.data.length : 0;

        console.log('Stats calculated:', { wishlist: wishlistCount, bookings: bookingsCount }); // Debug log
        setStats({ wishlist: wishlistCount, bookings: bookingsCount });
      } catch (error) {
        if (!isMounted) return; // Exit if unmounted
        const errorMessage = error instanceof Error ? error.message : 'Failed to load dashboard data.';
        toast({ variant: 'destructive', title: 'Error', description: errorMessage });
      } finally {
        if (!isMounted) return; // Exit if unmounted
        setIsLoading(false);
      }
    };

    // Initial fetch of dashboard data
    fetchDashboardData();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, navigate, location.pathname]);

  const handleSignOut = async () => {
    try {
      await logout();
      navigate('/');
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to sign out. Please try again.' });
    }
  };

  const menuItems = [
    { icon: User, label: 'Dashboard', href: '/buyer-dashboard', active: true },
    { icon: Heart, label: 'Wishlist', href: '/buyer/wishlist' },
    { icon: Calendar, label: 'Bookings', href: '/buyer/bookings' },
    { icon: Car, label: 'Buy Cars', href: '/buy-cars' },
    { icon: Car, label: 'Rent Car', href: '/rent-cars' },
  ];

  const sellMenuItems = [
    { icon: Car, label: 'Sell My Car', href: '/list-car?sell' },
    { icon: Car, label: 'Rent My Car', href: '/list-car?rent' },
  ];

  if (authError) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-lg text-red-600">{authError}</p></div>;
  }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-lg text-muted-foreground">Loading dashboard...</p></div>;
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-primary/10">
        <div className="flex flex-col md:flex-row">
          <div className="md:hidden bg-card/80 backdrop-blur-sm border-b border-border p-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">CarConnect</h1>
                <p className="text-xs text-muted-foreground">Buyer Dashboard</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
                <ArrowLeft className="w-4 h-4 mr-1" /> Home
              </Button>
            </div>
          </div>

          <div className="md:hidden bg-card/80 backdrop-blur-sm border-b border-border">
            <div className="px-4 py-2">
              <div className="flex space-x-1 overflow-x-auto scrollbar-hide">
                {menuItems.map((item) => (
                  <Link
                    key={item.label}
                    to={item.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                      item.active ? 'bg-primary/10 text-primary border border-primary/20' : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                    }`}
                  >
                    <item.icon className="w-3 h-3" />
                    {item.label}
                  </Link>
                ))}
                {sellMenuItems.map((item) => (
                  <Link
                    key={item.label}
                    to={item.href}
                    className="flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-colors whitespace-nowrap text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  >
                    <item.icon className="w-3 h-3" />
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="hidden top-0 md:block w-64 bg-card/80 backdrop-blur-sm border-r border-border max-h-screen relative">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <button onClick={() => navigate('/')} className="flex items-center text-muted-foreground hover:text-primary transition-colors text-sm">
                  <ArrowLeft className="h-4 w-4 mr-1" /> Back to Home
                </button>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">CarConnect</h1>
              <p className="text-sm text-muted-foreground mt-1">Buyer Dashboard</p>
            </div>
            
            <nav className="px-4 space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    item.active ? 'bg-primary/10 text-primary border border-primary/20' : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              ))}
              
              {/* Separator line */}
              <div className="border-t border-border my-4"></div>
              
              {sellMenuItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors text-muted-foreground hover:text-foreground hover:bg-accent/50"
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="absolute bottom-4 left-4 right-4 space-y-2">
              {/* Add some spacing before logout */}
              <div className="h-4"></div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground">
                    <LogOut className="w-5 h-5 mr-3" /> Log out
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Log out?</AlertDialogTitle>
                    <AlertDialogDescription>You will be signed out of your session.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleSignOut}>Log out</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          <div className="flex-1 p-4 md:p-8">
            <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 mb-6 md:mb-8">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">
                  Welcome back, <span className="text-primary">{user?.fullname || 'User'}</span>! 👋
                </h1>
                <p className="text-sm md:text-base text-muted-foreground">Here's what's happening with your car search</p>
              </div>
              
              <div className="flex items-center gap-2">
                <NotificationBell />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
              <Card className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950/20 dark:to-pink-900/20 backdrop-blur-sm border border-pink-200 dark:border-pink-800 hover:shadow-lg hover:shadow-pink-500/10 transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-pink-700 dark:text-pink-300">💖 Wishlist Items</CardTitle>
                  <Heart className="h-4 w-4 text-pink-600 dark:text-pink-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-pink-800 dark:text-pink-200">{stats.wishlist}</div>
                  <p className="text-xs text-pink-600 dark:text-pink-400">Saved cars</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 backdrop-blur-sm border border-blue-200 dark:border-blue-800 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">📅 Bookings</CardTitle>
                  <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">{stats.bookings}</div>
                  <p className="text-xs text-blue-600 dark:text-blue-400">Test drives scheduled</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Link to="/buy-cars">
                <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/20 dark:to-emerald-900/20 backdrop-blur-sm border border-emerald-200 dark:border-emerald-800 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300 cursor-pointer group">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                      <Car className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold mb-1 text-emerald-800 dark:text-emerald-200">🚗 Browse Cars</h3>
                    <p className="text-sm text-emerald-600 dark:text-emerald-400">Find your dream car</p>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/buyer/wishlist">
                <Card className="bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-950/20 dark:to-rose-900/20 backdrop-blur-sm border border-rose-200 dark:border-rose-800 hover:shadow-lg hover:shadow-rose-500/10 transition-all duration-300 cursor-pointer group">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-rose-600 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                      <Heart className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold mb-1 text-rose-800 dark:text-rose-200">💖 My Wishlist</h3>
                    <p className="text-sm text-rose-600 dark:text-rose-400">Saved favorites</p>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/buyer/bookings">
                <Card className="bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-950/20 dark:to-violet-900/20 backdrop-blur-sm border border-violet-200 dark:border-violet-800 hover:shadow-lg hover:shadow-violet-500/10 transition-all duration-300 cursor-pointer group">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-violet-600 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold mb-1 text-violet-800 dark:text-violet-200">📅 Book Test Drive</h3>
                    <p className="text-sm text-violet-600 dark:text-violet-400">Schedule viewing</p>
                  </CardContent>
                </Card>
              </Link>
            </div>

            <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950/20 dark:to-slate-900/20 backdrop-blur-sm border border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-slate-800 dark:text-slate-200">📊 Recent Activity</CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">Your latest interactions and updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full animate-pulse"></div>
                    <div className="flex-1">
                      <p className="font-medium text-blue-800 dark:text-blue-200">🎉 Welcome to CarConnect!</p>
                      <p className="text-sm text-blue-600 dark:text-blue-400">Start browsing our extensive car collection</p>
                    </div>
                    <span className="text-sm text-blue-500 dark:text-blue-400">Just now</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default BuyerDashboard;