import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogFooter,
} from '@/components/ui/alert-dialog';
import { BarChart3, Car, Plus, DollarSign, MessageCircle, LogOut, ArrowLeft, Tag, CheckCircle } from 'lucide-react';

interface SidebarProps {
  handleSignOut: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ handleSignOut }) => {
  const location = useLocation();

  const menuItems = [
    { icon: BarChart3, label: 'Dashboard', href: '/admin-dashboard' },
    { icon: Car, label: 'Manage Cars', href: '/admin/cars' },
    { icon: Plus, label: 'Add New Car', href: '/admin/add-car' },
    { icon: Tag, label: 'Brand Management', href: '/admin/brand-management' },
    { icon: CheckCircle, label: 'Car Review', href: '/admin/car-review' },
    { icon: DollarSign, label: 'Orders', href: '/admin/orders' },
    { icon: MessageCircle, label: 'Manage Users', href: '/admin/manage-users' },
  ];

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden bg-card/80 backdrop-blur-sm border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
              CarConnect
            </h1>
            <p className="text-xs text-muted-foreground">Admin Dashboard</p>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Home
            </Link>
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden bg-card/80 backdrop-blur-sm border-b border-border">
        <div className="px-4 py-2">
          <div className="flex space-x-1 overflow-x-auto scrollbar-hide">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                  location.pathname === item.href
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                }`}
              >
                <item.icon className="w-3 h-3" />
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:block fixed w-64 bg-card/80 backdrop-blur-sm border-r border-border h-screen flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
            CarConnect
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Admin Dashboard</p>
        </div>
        <nav className="px-4 space-y-1 flex-1">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === item.href
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 mt-[9rem] border-t border-border space-y-2">
          {/* <Link
            to="/admin/support-chat"
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
                  You will be signed out of your admin session.
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
    </>
  );
};

export default Sidebar;