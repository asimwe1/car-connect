import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, RefreshCw, Activity } from 'lucide-react';
import NotificationBell from '@/components/NotificationBell';

interface HeaderProps {
  user: any;
  lastUpdate: Date | null; // Allow null to handle undefined cases
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  isRealtimeConnected: boolean;
  isRefreshing: boolean;
  handleManualRefresh: () => void;
  errorMessage: string | null;
  fetchDashboardData: () => void;
  loading: boolean;
  unreadMessages: number;
}

const Header: React.FC<HeaderProps> = ({
  user,
  lastUpdate,
  searchTerm,
  setSearchTerm,
  isRealtimeConnected,
  isRefreshing,
  handleManualRefresh,
  errorMessage,
  fetchDashboardData,
  loading,
  unreadMessages,
}) => {
  // Format lastUpdate with fallback
  const lastUpdateString = lastUpdate
    ? lastUpdate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'N/A';

  return (
    <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 mb-6 md:mb-8">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl md:text-3xl font-bold">Admin Dashboard</h1>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div
                className={`w-2 h-2 rounded-full animate-pulse ${
                  isRealtimeConnected ? 'bg-green-500' : 'bg-yellow-500'
                }`}
              ></div>
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
          Welcome back, {user?.fullname || 'Admin'} • Last updated: {lastUpdateString}
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
          {unreadMessages > 0 && (
            <Badge variant="destructive" className="animate-pulse">
              {unreadMessages} new
            </Badge>
          )}
          {errorMessage && (
            <Button
              variant="destructive"
              onClick={() => fetchDashboardData()}
              disabled={loading}
              className="text-xs md:text-sm"
            >
              Retry Sync
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;