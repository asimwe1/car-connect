import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, Car, Plus, DollarSign, MessageCircle, Settings, LogOut, Sun, Moon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const isActive = (href: string) => location.pathname === href;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-primary/10">
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:block w-64 bg-card/80 backdrop-blur-sm border-r border-border min-h-screen flex flex-col">
          <div className="p-6">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
              connectify
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Admin</p>
          </div>
          <nav className="px-4 space-y-1 flex-1">
            <Link to="/admin-dashboard" className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/admin-dashboard') ? 'bg-primary/10 text-primary border border-primary/20' : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'}`}>
              <BarChart3 className="w-4 h-4" /> Dashboard
            </Link>
            <Link to="/admin/cars" className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/admin/cars') ? 'bg-primary/10 text-primary border border-primary/20' : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'}`}>
              <Car className="w-4 h-4" /> Manage Cars
            </Link>
            <Link to="/admin/add-car" className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/admin/add-car') ? 'bg-primary/10 text-primary border border-primary/20' : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'}`}>
              <Plus className="w-4 h-4" /> Add Car
            </Link>
            <Link to="/admin/orders" className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/admin/orders') ? 'bg-primary/10 text-primary border border-primary/20' : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'}`}>
              <DollarSign className="w-4 h-4" /> Orders
            </Link>
            <Link to="/admin/support-chat" className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/admin/support-chat') ? 'bg-primary/10 text-primary border border-primary/20' : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'}`}>
              <MessageCircle className="w-4 h-4" /> Support
            </Link>
            <Link to="/admin/customer-chat" className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/admin/customer-chat') ? 'bg-primary/10 text-primary border border-primary/20' : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'}`}>
              <MessageCircle className="w-4 h-4" /> Manage Users
            </Link>
          </nav>
          <div className="p-4 space-y-2 border-t border-border">
            <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground" onClick={toggleTheme}>
              {theme === 'light' ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
              {theme === 'light' ? 'Light Mode' : 'Dark Mode'}
            </Button>
            <Link to="/settings" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50">
              <Settings className="w-4 h-4" /> Settings
            </Link>
            <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" /> Log out
            </Button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-4 md:p-8">
          <Card className="md:hidden mb-4 p-3">Use a wider screen to see the sidebar.</Card>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;


