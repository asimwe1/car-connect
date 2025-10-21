import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Users, Clock, MessageCircle } from 'lucide-react';

interface Stats {
  carViewsToday: number;
  newUsersThisWeek: number;
  pendingBookings: number;
  unreadMessages: number;
}

interface RealtimeMetricsProps {
  stats: Stats;
}

const RealtimeMetrics: React.FC<RealtimeMetricsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
      <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-950/20 dark:to-cyan-900/20 backdrop-blur-sm border border-cyan-200 dark:border-cyan-800 hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-cyan-700 dark:text-cyan-300">👁️ Car Views Today</CardTitle>
          <Eye className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-cyan-800 dark:text-cyan-200">{stats.carViewsToday}</div>
          <p className="text-xs text-cyan-600 dark:text-cyan-400">Live views</p>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/20 dark:to-emerald-900/20 backdrop-blur-sm border border-emerald-200 dark:border-emerald-800 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-300">🆕 New Users This Week</CardTitle>
          <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-800 dark:text-emerald-200">{stats.newUsersThisWeek}</div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400">Recent signups</p>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/20 dark:to-amber-900/20 backdrop-blur-sm border border-amber-200 dark:border-amber-800 hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-300">⏳ Pending Bookings</CardTitle>
          <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-amber-800 dark:text-amber-200">{stats.pendingBookings}</div>
          <p className="text-xs text-amber-600 dark:text-amber-400">Awaiting approval</p>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-950/20 dark:to-violet-900/20 backdrop-blur-sm border border-violet-200 dark:border-violet-800 hover:shadow-lg hover:shadow-violet-500/10 transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-violet-700 dark:text-violet-300">💬 Unread Messages</CardTitle>
          <MessageCircle className="h-4 w-4 text-violet-600 dark:text-violet-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-violet-800 dark:text-violet-200">{stats.unreadMessages}</div>
          <p className="text-xs text-violet-600 dark:text-violet-400">Customer inquiries</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default RealtimeMetrics;