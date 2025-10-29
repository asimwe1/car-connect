import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import { api } from '@/services/api';
import { adminRealtimeService } from '@/services/adminRealtimeService';
import { ActivityData, getActivityService } from '@/services/activityService';
import { Eye, Users, Calendar, MessageCircle } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import StatsCards from '@/components/StatsCards';
import RealtimeMetrics from '@/components/RealtimeMetrics';
import QuickActions from '@/components/QuickActions';
import RecentActivity from '@/components/RecentActivity';
import CustomerMessagesSupport from '@/components/CustomerMessagesSupport';

interface Stats {
  totalCars: number;
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  recentBookings: number;
  carViewsToday: number;
  newUsersThisWeek: number;
  pendingBookings: number;
  unreadMessages: number;
}

const AdminDashboard = () => {
  const activityServiceRef = useRef(getActivityService());
  const [stats, setStats] = useState<Stats>({
    totalCars: 0,
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    recentBookings: 0,
    carViewsToday: 0,
    newUsersThisWeek: 0,
    pendingBookings: 0,
    unreadMessages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [recentMessages, setRecentMessages] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityData[]>([]);
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
    const initializeServices = async () => {
      try {
        await fetchDashboardData();
        await fetchActivities();
      } catch (error) {
        console.error('Error initializing services:', error);
        setErrorMessage('Failed to initialize dashboard data');
      }
    };

    initializeServices();

    const unsubscribeCarViews = adminRealtimeService.subscribe('car_views', (data) => {
      setStats((prev) => ({ ...prev, carViewsToday: data.count }));
      // Track car view activity
      activityServiceRef.current.trackCarView(data.carId, data.userId);
    });

    const unsubscribeNewUsers = adminRealtimeService.subscribe('new_users', (data) => {
      setStats((prev) => ({ ...prev, newUsersThisWeek: data.count }));
      // Track new user activity
      activityServiceRef.current.trackNewUser(data.userId, data.userInfo);
    });

    const unsubscribeBookings = adminRealtimeService.subscribe('bookings', (data) => {
      setStats((prev) => ({ ...prev, pendingBookings: data.pending }));
      // Track booking activity
      activityServiceRef.current.trackBooking(data.bookingId, data.carId, data.userId);
    });

    const unsubscribeMessages = adminRealtimeService.subscribe('messages', (data) => {
      setStats((prev) => ({ ...prev, unreadMessages: data.unread }));
      setRecentMessages((prev) => [data.message, ...prev.slice(0, 4)]);
      // Track message activity
      activityServiceRef.current.trackMessage(data.messageId, data.senderId, data.recipientId);
    });

    const unsubscribeActivity = adminRealtimeService.subscribe('activity', (data) => {
      // Let the activity service handle this
      activityServiceRef.current.createActivity(data);
    });

    const unsubscribeStats = adminRealtimeService.subscribe('stats', (data) => {
      setStats((prev) => ({ ...prev, ...data }));
    });

    const unsubscribeConnection = adminRealtimeService.subscribe('connection_status', (data) => {
      setIsRealtimeConnected(data.connected);
      if (data.connected) {
        adminRealtimeService.requestCarViews();
        adminRealtimeService.requestNewUsers();
        adminRealtimeService.requestBookings();
        adminRealtimeService.requestMessages();
        adminRealtimeService.requestActivity();
        adminRealtimeService.requestStats();
      }
    });

    // Subscribe to activity service updates
    const service = getActivityService();
    const unsubscribeActivityUpdates = service.subscribe('activities_updated', (activities) => {
      setRecentActivity(activities.slice(0, 15));
    });

    const unsubscribeActivityCreated = activityServiceRef.current.subscribe('activity_created', (activity) => {
      setRecentActivity((prev) => [activity, ...prev.slice(0, 14)]);
    });

    if (chatContext) {
      const { conversations } = chatContext;
      const unreadCount = conversations.reduce((total, conv) => total + conv.unreadCount, 0);
      setStats((prev) => ({ ...prev, unreadMessages: unreadCount }));
      const allMessages = conversations.flatMap((conv) => (conv as any).messages || []);
      const sortedMessages = allMessages
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);
      setRecentMessages(sortedMessages);
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      unsubscribeCarViews();
      unsubscribeNewUsers();
      unsubscribeBookings();
      unsubscribeMessages();
      unsubscribeActivity();
      unsubscribeStats();
      unsubscribeConnection();
      unsubscribeActivityUpdates();
      unsubscribeActivityCreated();
    };
  }, [isAuthenticated, user, navigate, chatContext]);

  const fetchActivities = async (silent = false) => {
    if (!silent) {
      setLoading(true);
    }
    try {
      const activities = await activityServiceRef.current.fetchActivities(silent);
      setRecentActivity(activities.slice(0, 15));
    } catch (error) {
      console.error('Failed to fetch activities:', error);
      if (!silent) {
        toast({
          title: "Activity Update Failed",
          description: "Could not fetch latest activity data",
          variant: "destructive"
        });
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  const fetchDashboardData = async (silent = false) => {
    try {
      if (!silent) {
        setErrorMessage(null);
        setLoading(true);
      } else {
        setIsRefreshing(true);
      }

      const [
        carsRes,
        usersRes,
        ordersRes,
        bookingsRes,
        conversationsRes,
        activityService
      ] = await Promise.all([
        api.getCars({ page: 1, limit: 1 }),
        api.getUsers({ page: 1, limit: 1 }),
        api.getAdminOrders({ page: 1, limit: 1 }),
        api.getAdminBookings({ page: 1, limit: 1 }),
        api.getAdminConversations().catch(() => ({ data: [] })),
        Promise.resolve(getActivityService()),
      ]);

      const carsData = carsRes?.data;
      const usersData = usersRes?.data;
      const ordersData = ordersRes?.data;
      const bookingsData = bookingsRes?.data;
      const conversationsData = conversationsRes?.data || [];

      const totalCars = carsData?.total || 0;
      const totalUsers = usersData?.total || 0;
      const totalOrders = ordersData?.total || 0;
      const recentBookings = bookingsData?.total || 0;
      const unreadMessages = conversationsData.reduce((acc: number, conv: any) => acc + (conv.unreadCount || 0), 0);

      // Calculate real metrics from actual data
      // These values will be updated via WebSocket
      const carViewsToday = 0;
      const newUsersThisWeek = 0;
      const pendingBookings = bookingsData?.pendingCount || 0;
      const totalRevenue = ordersData?.totalRevenue || 0;

      setStats({
        totalCars,
        totalUsers,
        totalOrders,
        totalRevenue,
        recentBookings,
        carViewsToday,
        newUsersThisWeek,
        pendingBookings,
        unreadMessages,
      });

      // Activity data is now handled by the activity service
      // No need to generate hardcoded activities here

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-primary/10">
      <div className="flex flex-col md:flex-row">
        <Sidebar handleSignOut={handleSignOut} />
        <div className="flex-1 md:ml-64 p-3 sm:p-4 md:p-8">
          <div className="mx-auto w-full max-w-7xl">
          <Header
            user={user}
            lastUpdate={lastUpdate}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            isRealtimeConnected={isRealtimeConnected}
            isRefreshing={isRefreshing}
            handleManualRefresh={handleManualRefresh}
            errorMessage={errorMessage}
            fetchDashboardData={fetchDashboardData}
            loading={loading}
            unreadMessages={stats.unreadMessages}
          />
          {errorMessage && (
            <div className="mb-3 sm:mb-6">
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 sm:px-4 py-2 text-sm">
                {errorMessage}
              </div>
            </div>
          )}
          {/* KPI cards - tighter gaps on mobile */}
          <div className="space-y-3 sm:space-y-4">
            <StatsCards stats={stats} />
            <RealtimeMetrics stats={stats} />
            <QuickActions />
          </div>
          {/* Two-column section collapses to single column on small screens */}
          <div className="mt-4 sm:mt-6 grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2 lg:gap-6">
            <RecentActivity recentActivity={recentActivity} />
            <CustomerMessagesSupport />
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;