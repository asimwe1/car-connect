import { Link, useNavigate, useLocation } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, Heart, Calendar, Car, LogOut, Settings, MessageCircle, Sun, Moon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
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

const BuyerSidebar = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { icon: User, label: 'Dashboard', href: '/buyer-dashboard' },
        { icon: Heart, label: 'Wishlist', href: '/wishlist' },
        { icon: Calendar, label: 'Bookings', href: '/bookings' },
        { icon: Car, label: 'Buy Cars', href: '/buy-cars' },
        // { icon: Car, label: 'Rent Car', href: '/rent-cars' },
    ];

    const isActive = (path: string) => location.pathname === path;

    const handleSignOut = async () => {
        await logout();
        navigate('/');
    };

    // Placeholder for dashboard data fetch if needed, or remove if logic belongs elsewhere
    const fetchDashboardData = () => {
        // Logic to fetch dashboard data
        console.log("Fetching dashboard data...");
    };

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/signin');
            return;
        }
        fetchDashboardData();
    }, [isAuthenticated, navigate]);

    return (
        <div className="hidden top-0 md:block w-64 bg-card/80 backdrop-blur-sm border-r border-border max-h-screen relative h-screen flex flex-col">
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
                    connectify
                </h1>
                <p className="text-sm text-muted-foreground mt-1">Buyer Dashboard</p>
            </div>

            <nav className="px-4 space-y-1 flex-1">
                {menuItems.map((item) => (
                    <Link
                        key={item.label}
                        to={item.href}
                        className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive(item.href)
                            ? 'bg-primary/10 text-primary border border-primary/20'
                            : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                            }`}
                    >
                        <item.icon className="w-4 h-4" />
                        {item.label}
                    </Link>
                ))}
            </nav>

            <div className="p-4 space-y-2 border-t border-border">
                <Button
                    variant="ghost"
                    className="w-full justify-start text-muted-foreground hover:text-foreground"
                    onClick={toggleTheme}
                >
                    {theme === 'light' ? <Sun className="w-5 h-5 mr-3" /> : <Moon className="w-5 h-5 mr-3" />}
                    {theme === 'light' ? 'Light Mode' : 'Dark Mode'}
                </Button>

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