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
  );
};

export default StatsCards;