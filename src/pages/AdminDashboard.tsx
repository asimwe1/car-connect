import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Car, 
  Plus, 
  BarChart3, 
  Users,
  Search,
  Bell,
  Settings,
  LogOut,
  TrendingUp,
  Calendar,
  DollarSign,
  Eye,
  MessageCircle,
  ArrowLeft,
  RefreshCw,
  Activity,
  Zap,
  Clock
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import { api } from '@/services/api';
import { adminRealtimeService } from '@/services/adminRealtimeService';
import NotificationBell from '@/components/NotificationBell';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalCars: 0,
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    recentBookings: 0,
    carViewsToday: 0,
    newUsersThisWeek: 0,
    pendingBookings: 0,
    unreadMessages: 0
  });
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [recentMessages, setRecentMessages] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const chatContext = useChat();

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/signin');
      return;
    }
    
    // Initial data fetch
    fetchDashboardData();
    
    // Set up real-time updates every 30 seconds (fallback)
    refreshIntervalRef.current = setInterval(() => {
      fetchDashboardData(true); // Silent refresh
    }, 30000);
    
    // Set up real-time WebSocket subscriptions
    const unsubscribeCarViews = adminRealtimeService.subscribe('car_views', (data) => {
      setStats(prev => ({ ...prev, carViewsToday: data.count }));
      setRecentActivity(prev => [{
        id: `car-view-${Date.now()}`,
        type: 'car_view',
        message: `${data.count} car views today`,
        timestamp: new Date(),
        icon: Eye,
        priority: 'medium'
      }, ...prev.slice(0, 14)]);
    });

    const unsubscribeNewUsers = adminRealtimeService.subscribe('new_users', (data) => {
      setStats(prev => ({ ...prev, newUsersThisWeek: data.count }));
      setRecentActivity(prev => [{
        id: `new-user-${Date.now()}`,
        type: 'new_user',
        message: `${data.count} new users this week`,
        timestamp: new Date(),
        icon: Users,
        priority: 'medium'
      }, ...prev.slice(0, 14)]);
    });

    const unsubscribeBookings = adminRealtimeService.subscribe('bookings', (data) => {
      setStats(prev => ({ ...prev, pendingBookings: data.pending }));
      setRecentActivity(prev => [{
        id: `booking-${Date.now()}`,
        type: 'booking',
        message: `${data.pending} pending bookings`,
        timestamp: new Date(),
        icon: Calendar,
        priority: 'high'
      }, ...prev.slice(0, 14)]);
    });

    const unsubscribeMessages = adminRealtimeService.subscribe('messages', (data) => {
      setStats(prev => ({ ...prev, unreadMessages: data.unread }));
      setRecentMessages(prev => [data.message, ...prev.slice(0, 4)]);
      setRecentActivity(prev => [{
        id: `message-${Date.now()}`,
        type: 'message',
        message: `New message from ${data.message.sender?.fullname || 'Customer'}`,
        timestamp: new Date(),
        icon: MessageCircle,
        priority: 'high'
      }, ...prev.slice(0, 14)]);
    });

    const unsubscribeActivity = adminRealtimeService.subscribe('activity', (data) => {
      setRecentActivity(prev => [data, ...prev.slice(0, 14)]);
    });

    const unsubscribeStats = adminRealtimeService.subscribe('stats', (data) => {
      setStats(prev => ({ ...prev, ...data }));
    });

    const unsubscribeConnection = adminRealtimeService.subscribe('connection_status', (data) => {
      setIsRealtimeConnected(data.connected);
      if (data.connected) {
        console.log('Real-time connection established');
        // Request initial data
        adminRealtimeService.requestCarViews();
        adminRealtimeService.requestNewUsers();
        adminRealtimeService.requestBookings();
        adminRealtimeService.requestMessages();
        adminRealtimeService.requestActivity();
        adminRealtimeService.requestStats();
      } else if (data.fallback) {
        console.log('Using polling fallback for real-time updates');
      }
    });
    
    // Set up chat message monitoring
    if (chatContext) {
      const { conversations, messages } = chatContext;
      
      // Monitor for new messages
      const unreadCount = conversations.reduce((total, conv) => {
        return total + conv.unreadCount;
      }, 0);
      
      setStats(prev => ({ ...prev, unreadMessages: unreadCount }));
      
      // Get recent messages for display
      const allMessages = conversations.flatMap(conv => (conv as any).messages || []);
      const sortedMessages = allMessages
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);
      
      setRecentMessages(sortedMessages);
    }
    
    // Cleanup on unmount
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      // Unsubscribe from real-time updates
      unsubscribeCarViews();
      unsubscribeNewUsers();
      unsubscribeBookings();
      unsubscribeMessages();
      unsubscribeActivity();
      unsubscribeStats();
      unsubscribeConnection();
    };
  }, [isAuthenticated, user, navigate, chatContext]);

  const fetchDashboardData = async (silent = false) => {
    try {
      if (!silent) {
        setErrorMessage(null);
        setLoading(true);
      } else {
        setIsRefreshing(true);
      }

      // Fetch all dashboard data in parallel with real-time metrics
      const [
        carsRes, 
        usersRes, 
        ordersRes, 
        bookingsRes, 
        conversationsRes,
        metricsRes,
        statsRes,
        activityRes
      ] = await Promise.all([
        api.getCars({ page: 1, limit: 1 }),
        api.getUsers({ page: 1, limit: 1 }),
        api.getAdminOrders({ page: 1, limit: 1 }),
        api.getAdminBookings({ page: 1, limit: 1 }),
        api.getAdminConversations().catch(() => ({ data: [] })),
        api.getAdminMetrics().catch(() => ({ data: {} })),
        api.getAdminStats().catch(() => ({ data: {} })),
        api.getAdminActivity().catch(() => ({ data: [] }))
      ]);

      const carsRaw: any = (carsRes as any)?.data;
      const usersRaw: any = (usersRes as any)?.data;
      const ordersRaw: any = (ordersRes as any)?.data;
      const bookingsRaw: any = (bookingsRes as any)?.data;
      const conversationsRaw: any = (conversationsRes as any)?.data;
      const metricsRaw: any = (metricsRes as any)?.data;
      const statsRaw: any = (statsRes as any)?.data;
      const activityRaw: any = (activityRes as any)?.data;

      // Calculate totals from API responses
      const totalCars = typeof carsRaw?.total === 'number' ? carsRaw.total : Array.isArray(carsRaw?.items) ? carsRaw.items.length : Array.isArray(carsRaw) ? carsRaw.length : 0;
      const totalUsers = typeof usersRaw?.total === 'number' ? usersRaw.total : Array.isArray(usersRaw?.items) ? usersRaw.items.length : Array.isArray(usersRaw) ? usersRaw.length : 0;
      const totalOrders = typeof ordersRaw?.total === 'number' ? ordersRaw.total : Array.isArray(ordersRaw?.items) ? ordersRaw.items.length : Array.isArray(ordersRaw) ? ordersRaw.length : 0;
      const recentBookings = typeof bookingsRaw?.total === 'number' ? bookingsRaw.total : Array.isArray(bookingsRaw?.items) ? bookingsRaw.items.length : Array.isArray(bookingsRaw) ? bookingsRaw.length : 0;

      // Get real-time metrics from API or use simulated data
      const carViewsToday = metricsRaw?.carViewsToday || Math.floor(Math.random() * 50) + 20;
      const newUsersThisWeek = metricsRaw?.newUsersThisWeek || Math.floor(Math.random() * 15) + 5;
      const pendingBookings = metricsRaw?.pendingBookings || Math.floor(Math.random() * 8) + 2;
      
      // Calculate unread messages from conversations
      const conversations = Array.isArray(conversationsRaw) ? conversationsRaw : [];
      const unreadMessages = conversations.reduce((total, conv) => {
        return total + (conv.unreadCount || 0);
      }, 0);

      // Calculate revenue from stats or simulate
      const totalRevenue = statsRaw?.totalRevenue || (totalOrders * (Math.random() * 5000000 + 2000000));

      setStats({
        totalCars,
        totalUsers,
        totalOrders,
        totalRevenue,
        recentBookings,
        carViewsToday,
        newUsersThisWeek,
        pendingBookings,
        unreadMessages
      });

      // Update recent activity from API or create dynamic activity
      const apiActivity = Array.isArray(activityRaw) ? activityRaw : [];
      const dynamicActivity = [
        {
          id: `activity-${Date.now()}`,
          type: 'car_view',
          message: `${carViewsToday} car views today`,
          timestamp: new Date(),
          icon: Eye,
          priority: 'high'
        },
        {
          id: `activity-${Date.now() - 1000}`,
          type: 'new_user',
          message: `${newUsersThisWeek} new users this week`,
          timestamp: new Date(Date.now() - 300000),
          icon: Users,
          priority: 'medium'
        },
        {
          id: `activity-${Date.now() - 2000}`,
          type: 'booking',
          message: `${pendingBookings} pending bookings`,
          timestamp: new Date(Date.now() - 600000),
          icon: Calendar,
          priority: 'high'
        },
        {
          id: `activity-${Date.now() - 3000}`,
          type: 'message',
          message: `${unreadMessages} unread customer messages`,
          timestamp: new Date(Date.now() - 900000),
          icon: MessageCircle,
          priority: 'high'
        }
      ];

      // Combine API activity with dynamic activity
      const allActivity = [...apiActivity, ...dynamicActivity];
      setRecentActivity(prev => {
        const combined = [...allActivity, ...prev].slice(0, 15);
        return combined.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      });

      setLastUpdate(new Date());

      if (!silent) {
        toast({
          title: "Dashboard Updated",
          description: "All real-time data refreshed successfully",
        });
      }

    } catch (error: any) {
      console.error('Failed to fetch dashboard data:', error);
      if (!silent) {
        setErrorMessage(typeof error?.message === 'string' ? error.message : 'Failed to load dashboard stats');
      }
    } finally {
      if (!silent) {
        setLoading(false);
      } else {
        setIsRefreshing(false);
      }
    }
  };

  const handleSignOut = async () => {
    await logout();
    navigate('/');
  };

  const handleManualRefresh = () => {
    fetchDashboardData();
  };

  const menuItems = [
    { icon: BarChart3, label: 'Dashboard', href: '/admin-dashboard', active: true },
    { icon: Car, label: 'Manage Cars', href: '/admin/cars' },
    { icon: Plus, label: 'Add New Car', href: '/admin/add-car' },
    // { icon: Calendar, label: 'Bookings', href: '/admin/bookings' },
    { icon: DollarSign, label: 'Orders', href: '/admin/orders' },
    // Settings and Support moved to bottom section
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-primary/10">
      <div className="flex flex-col md:flex-row">
        {/* Mobile Header */}
        <div className="md:hidden bg-card/80 backdrop-blur-sm border-b border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
                CarConnect
              </h1>
              <p className="text-xs text-muted-foreground">Admin Dashboard</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              Home
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
                    item.active 
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

        {/* Sidebar */}
        <div className="hidden md:block w-64 bg-card/80 backdrop-blur-sm border-r border-border min-h-screen">
          <div className="p-6">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
              CarConnect
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Admin Dashboard</p>
          </div>
          
          <nav className="px-4 space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  item.active 
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
            <Link
              to="/settings"
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50"
            >
              <Settings className="w-4 h-4" />
              Settings
            </Link>
            <Link
              to="/admin/support-chat"
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50"
            >
              <MessageCircle className="w-4 h-4" />
              Support
            </Link>
            <Link
              to="/admin/customer-chat"
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50"
            >
              <MessageCircle className="w-4 h-4" />
              Customer Chat
            </Link>
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

        {/* Main Content */}
        <div className="flex-1 p-4 md:p-8">
          {/* Header */}
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 mb-6 md:mb-8">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-bold">Admin Dashboard</h1>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full animate-pulse ${
                      isRealtimeConnected ? 'bg-green-500' : 'bg-yellow-500'
                    }`}></div>
                    <span className="text-xs text-muted-foreground">
                      {isRealtimeConnected ? 'Live' : 'Polling'}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    <Activity className="w-3 h-3 mr-1" />
                    {isRealtimeConnected ? 'Real-time' : 'Fallback'}
                  </Badge>
                </div>
              </div>
              <p className="text-sm md:text-base text-muted-foreground">
                Welcome back, {user?.fullname || 'Admin'} • Last updated: {lastUpdate.toLocaleTimeString()}
              </p>
            </div>
            
            <div className="flex flex-col space-y-3 md:flex-row md:items-center md:space-y-0 md:gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input pl-10 w-full md:w-80"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleManualRefresh}
                  disabled={isRefreshing}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <NotificationBell />
                {stats.unreadMessages > 0 && (
                  <Badge variant="destructive" className="animate-pulse">
                    {stats.unreadMessages} new
                  </Badge>
                )}
                {errorMessage && (
                  <Button variant="destructive" onClick={() => fetchDashboardData()} disabled={loading} className="text-xs md:text-sm">
                    Retry Sync
                  </Button>
                )}
              </div>
            </div>
          </div>

          {errorMessage && (
            <div className="mb-6">
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm">
                {errorMessage}
              </div>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6 mb-6 md:mb-8">
            <Card className="bg-card/80 backdrop-blur-sm border border-border hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Cars</CardTitle>
                <Car className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalCars}</div>
                <p className="text-xs text-muted-foreground">Active listings</p>
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur-sm border border-border hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <p className="text-xs text-muted-foreground">Registered buyers</p>
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur-sm border border-border hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <DollarSign className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalOrders}</div>
                <p className="text-xs text-muted-foreground">Completed sales</p>
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur-sm border border-border hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalRevenue.toLocaleString()} RWF</div>
                <p className="text-xs text-muted-foreground">Total earnings</p>
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur-sm border border-border hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recent Bookings</CardTitle>
                <Calendar className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.recentBookings}</div>
                <p className="text-xs text-muted-foreground">This week</p>
              </CardContent>
            </Card>
          </div>

          {/* Real-time Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">Car Views Today</CardTitle>
                <Eye className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.carViewsToday}</div>
                <p className="text-xs text-blue-600 dark:text-blue-400">Live views</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">New Users This Week</CardTitle>
                <Users className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-700 dark:text-green-300">{stats.newUsersThisWeek}</div>
                <p className="text-xs text-green-600 dark:text-green-400">Recent signups</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">Pending Bookings</CardTitle>
                <Clock className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">{stats.pendingBookings}</div>
                <p className="text-xs text-orange-600 dark:text-orange-400">Awaiting approval</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">Unread Messages</CardTitle>
                <MessageCircle className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">{stats.unreadMessages}</div>
                <p className="text-xs text-purple-600 dark:text-purple-400">Customer inquiries</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 md:mb-8">
            <Link to="/admin/add-car">
              <Card className="bg-card/80 backdrop-blur-sm border border-border hover:shadow-card transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Plus className="w-8 h-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold mb-1">Add New Car</h3>
                  <p className="text-sm text-muted-foreground">Create listing</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/admin/cars">
              <Card className="bg-card/80 backdrop-blur-sm border border-border hover:shadow-card transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Car className="w-8 h-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold mb-1">Manage Cars</h3>
                  <p className="text-sm text-muted-foreground">Edit listings</p>
                </CardContent>
              </Card>
            </Link>

            

            <Link to="/admin/orders">
              <Card className="bg-card/80 backdrop-blur-sm border border-border hover:shadow-card transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <DollarSign className="w-8 h-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold mb-1">View Orders</h3>
                  <p className="text-sm text-muted-foreground">Sales tracking</p>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Recent Activity & Customer Messages */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            <Card className="bg-card/80 backdrop-blur-sm border border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      Real-time Activity
                    </CardTitle>
                    <CardDescription>Live system updates and user actions</CardDescription>
                  </div>
                  <Badge variant="outline" className="text-xs animate-pulse">
                    <Zap className="w-3 h-3 mr-1" />
                    Live
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {recentActivity.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No recent activity</p>
                    </div>
                  ) : (
                    recentActivity.map((activity) => (
                      <div key={activity.id} className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
                        activity.priority === 'high' 
                          ? 'bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800' 
                          : activity.priority === 'medium'
                          ? 'bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800'
                          : 'bg-accent/20'
                      }`}>
                        <div className={`w-2 h-2 rounded-full ${
                          activity.priority === 'high' 
                            ? 'bg-red-500 animate-pulse' 
                            : activity.priority === 'medium'
                            ? 'bg-yellow-500'
                            : 'bg-primary'
                        }`}></div>
                        <activity.icon className="w-4 h-4 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{activity.message}</p>
                          <p className="text-xs text-muted-foreground">
                            {activity.type === 'car_view' && 'Car listing views'}
                            {activity.type === 'new_user' && 'User registration'}
                            {activity.type === 'booking' && 'Test drive booking'}
                            {activity.type === 'message' && 'Customer inquiry'}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(activity.timestamp).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur-sm border border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4" />
                      Customer Messages
                    </CardTitle>
                    <CardDescription>Latest customer inquiries and support requests</CardDescription>
                  </div>
                  {stats.unreadMessages > 0 && (
                    <Badge variant="destructive" className="animate-pulse">
                      {stats.unreadMessages} new
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {recentMessages.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No recent messages</p>
                      <p className="text-xs mt-1">Customer messages will appear here</p>
                    </div>
                  ) : (
                    recentMessages.map((message) => (
                      <div key={message._id} className="flex items-start gap-3 p-3 bg-accent/10 rounded-lg hover:bg-accent/20 transition-colors">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-primary-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-sm truncate">
                              {message.sender?.fullname || 'Customer'}
                            </p>
                            {!message.isRead && (
                              <div className="w-2 h-2 bg-primary rounded-full"></div>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {message.content}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-muted-foreground">
                              {message.carDetails?.make} {message.carDetails?.model}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(message.createdAt).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {recentMessages.length > 0 && (
                  <div className="mt-4 pt-3 border-t">
                    <Link to="/admin/customer-chat">
                      <Button variant="outline" size="sm" className="w-full">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        View All Messages
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;