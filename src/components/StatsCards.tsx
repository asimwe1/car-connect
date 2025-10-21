import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Car, Users, DollarSign, TrendingUp, Calendar } from 'lucide-react';

interface Stats {
  totalCars: number;
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  recentBookings: number;
}

interface StatsCardsProps {
  stats: Stats;
}

const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6 mb-6 md:mb-8">
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 backdrop-blur-sm border border-blue-200 dark:border-blue-800 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">🚗 Total Cars</CardTitle>
          <Car className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">{stats.totalCars}</div>
          <p className="text-xs text-blue-600 dark:text-blue-400">Active listings</p>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 backdrop-blur-sm border border-green-200 dark:border-green-800 hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">👥 Total Users</CardTitle>
          <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-800 dark:text-green-200">{stats.totalUsers}</div>
          <p className="text-xs text-green-600 dark:text-green-400">Registered buyers</p>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 backdrop-blur-sm border border-purple-200 dark:border-purple-800 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">💰 Total Orders</CardTitle>
          <DollarSign className="h-4 w-4 text-purple-600 dark:text-purple-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-800 dark:text-purple-200">{stats.totalOrders}</div>
          <p className="text-xs text-purple-600 dark:text-purple-400">Completed sales</p>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20 backdrop-blur-sm border border-orange-200 dark:border-orange-800 hover:shadow-lg hover:shadow-orange-500/10 transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">📈 Revenue</CardTitle>
          <TrendingUp className="h-4 w-4 text-orange-600 dark:text-orange-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-800 dark:text-orange-200">{stats.totalRevenue.toLocaleString()} RWF</div>
          <p className="text-xs text-orange-600 dark:text-orange-400">Total earnings</p>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950/20 dark:to-pink-900/20 backdrop-blur-sm border border-pink-200 dark:border-pink-800 hover:shadow-lg hover:shadow-pink-500/10 transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-pink-700 dark:text-pink-300">📅 Recent Bookings</CardTitle>
          <Calendar className="h-4 w-4 text-pink-600 dark:text-pink-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-pink-800 dark:text-pink-200">{stats.recentBookings}</div>
          <p className="text-xs text-pink-600 dark:text-pink-400">This week</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsCards;