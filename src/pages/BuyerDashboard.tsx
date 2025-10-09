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
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  User,
  Heart,
  Calendar,
  Car,
  Search,
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
  const [searchTerm, setSearchTerm] = useState('');
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

        console.log('Wishlist Response:', wishlistRes); // Debug log
        if (bookingsRes.error) throw new Error(`Bookings fetch failed: ${bookingsRes.error}`);
        if (wishlistRes.error) throw new Error(`Wishlist fetch failed: ${wishlistRes.error}`);

        // API layer normalization:
        // - getWishlist(): data is an array of cars
        // - getMyBookings(): data expected to be an array of bookings
        const wishlistCount = Array.isArray(wishlistRes.data) ? wishlistRes.data.length : 0;
        const bookingsCount = Array.isArray(bookingsRes.data) ? bookingsRes.data.length : 0;

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

    fetchDashboardData();

    // Refresh on window focus for near real-time updates
    const handleFocus = () => {
      fetchDashboardData();
    };
    window.addEventListener('focus', handleFocus);

    // Periodic refresh every 30 seconds
    const intervalId = window.setInterval(() => {
      fetchDashboardData();
    }, 30000);

    // Cleanup function to prevent memory leaks
    return () => {
      isMounted = false;
      window.removeEventListener('focus', handleFocus);
      window.clearInterval(intervalId);
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
    { icon: MessageCircle, label: 'Support', href: '/support' },
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
            </nav>

            <div className="absolute bottom-4 left-4 right-4 space-y-2">
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
                <h1 className="text-2xl md:text-3xl font-bold">Welcome back, {user?.fullname || 'User'}!</h1>
                <p className="text-sm md:text-base text-muted-foreground">Here's what's happening with your car search</p>
              </div>
              
              <div className="flex flex-col space-y-3 md:flex-row md:items-center md:space-y-0 md:gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search cars..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input pl-10 w-full md:w-80"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <NotificationBell />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
              <Card className="bg-card/80 backdrop-blur-sm border border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Wishlist Items</CardTitle>
                  <Heart className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.wishlist}</div>
                  <p className="text-xs text-muted-foreground">Saved cars</p>
                </CardContent>
              </Card>

              <Card className="bg-card/80 backdrop-blur-sm border border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Bookings</CardTitle>
                  <Calendar className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.bookings}</div>
                  <p className="text-xs text-muted-foreground">Test drives scheduled</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Link to="/cars">
                <Card className="bg-card/80 backdrop-blur-sm border border-border hover:shadow-card transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <Car className="w-8 h-8 text-primary mx-auto mb-3" />
                    <h3 className="font-semibold mb-1">Browse Cars</h3>
                    <p className="text-sm text-muted-foreground">Find your dream car</p>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/buyer/wishlist">
                <Card className="bg-card/80 backdrop-blur-sm border border-border hover:shadow-card transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <Heart className="w-8 h-8 text-primary mx-auto mb-3" />
                    <h3 className="font-semibold mb-1">My Wishlist</h3>
                    <p className="text-sm text-muted-foreground">Saved favorites</p>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/buyer/bookings">
                <Card className="bg-card/80 backdrop-blur-sm border border-border hover:shadow-card transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <Calendar className="w-8 h-8 text-primary mx-auto mb-3" />
                    <h3 className="font-semibold mb-1">Book Test Drive</h3>
                    <p className="text-sm text-muted-foreground">Schedule viewing</p>
                  </CardContent>
                </Card>
              </Link>
            </div>

            <Card className="bg-card/80 backdrop-blur-sm border border-border">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest interactions and updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-accent/20 rounded-lg">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <div className="flex-1">
                      <p className="font-medium">Welcome to CarConnect!</p>
                      <p className="text-sm text-muted-foreground">Start browsing our extensive car collection</p>
                    </div>
                    <span className="text-sm text-muted-foreground">Just now</span>
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