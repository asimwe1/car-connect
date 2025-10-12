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
  );
};

export default RealtimeMetrics;