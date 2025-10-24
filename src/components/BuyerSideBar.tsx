import { Link, useNavigate } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
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


const { user, logout, isAuthenticated } = useAuth();
const navigate = useNavigate();
const menuItems = [
    { icon: User, label: 'Dashboard', href: '/buyer-dashboard', active: true },
    { icon: Heart, label: 'Wishlist', href: '/wishlist' },
    { icon: Calendar, label: 'Bookings', href: '/bookings' },
    { icon: Car, label: 'Buy Cars', href: '/buy-cars' },
    // { icon: MessageCircle, label: 'Support', href: '/support' },
];


  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }
    fetchDashboardData();
  }, [isAuthenticated, navigate]);


const BuyerSidebar = () => {
    return (
        <div className="hidden top-0 md:block w-64 bg-card/80 backdrop-blur-sm border-r border-border max-h-screen relative">
            <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center text-muted-foreground hover:text-primary transition-colors text-sm"
                    >
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back to Home
                    </button>
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
                    CarConnect
                </h1>
                <p className="text-sm text-muted-foreground mt-1">Buyer Dashboard</p>
            </div>

            <nav className="px-4 space-y-1">
                {menuItems.map((item) => (
                    <Link
                        key={item.label}
                        to={item.href}
                        className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${item.active
                                ? 'bg-primary/10 text-primary border border-primary/20'
                                : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                            }`}
                    >
                        <item.icon className="w-4 h-4" />
                        {item.label}
                    </Link>
                ))}
            </nav>

            <div className="absolute bottom-4 left-4 right-4 space-y-2">
                {/* <Link
                      to="/settings"
                      className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </Link> */}
                {/* <Link
                      to="/support"
                      className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Support
                    </Link> */}
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button
                            variant="ghost"
                            className="w-full justify-start text-muted-foreground hover:text-foreground"
                        >
                            <LogOut className="w-5 h-5 mr-3" />
                            Log out
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Log out?</AlertDialogTitle>
                            <AlertDialogDescription>
                                You will be signed out of your session.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleSignOut}>Log out</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>

    )
}

export default BuyerSidebar;