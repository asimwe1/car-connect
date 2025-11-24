import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Bell, Check, Trash2, AlertCircle, CheckCircle, Info, AlertTriangle, Car } from 'lucide-react';
import { notificationService, Notification, NotificationState } from '@/services/notifications';
import { useNavigate } from 'react-router-dom';

const NotificationBell: React.FC = () => {
  const [notificationState, setNotificationState] = useState<NotificationState>({
    notifications: [],
    unreadCount: 0,
    isConnected: false
  });
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = notificationService.subscribe(setNotificationState);
    return unsubscribe;
  }, []);

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getCategoryColor = (category: Notification['category']) => {
    switch (category) {
      case 'user':
        return 'bg-blue-100 text-blue-800';
      case 'order':
        return 'bg-green-100 text-green-800';
      case 'booking':
        return 'bg-purple-100 text-purple-800';
      case 'chat':
        return 'bg-orange-100 text-orange-800';
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'car_listing':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const handleNotificationClick = (notification: Notification) => {
    notificationService.markAsRead(notification.id);

    // Handle different notification types
    if (notification.category === 'car_listing') {
      navigate('/admin/car-review');
    } else if (notification.category === 'chat') {
      navigate('/admin/support-chat');
    } else if (notification.category === 'order') {
      navigate('/admin/orders');
    } else if (notification.category === 'booking') {
      navigate('/admin/bookings');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {notificationState.unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {notificationState.unreadCount > 99 ? '99+' : notificationState.unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="font-semibold">Notifications</h3>
          <div className="flex items-center gap-2">
            {notificationState.isConnected ? (
              <div className="w-2 h-2 bg-green-500 rounded-full" title="Connected" />
            ) : (
              <div className="w-2 h-2 bg-red-500 rounded-full" title="Disconnected" />
            )}
            {notificationState.unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => notificationService.markAllAsRead()}
                className="text-xs"
              >
                <Check className="h-3 w-3 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {notificationState.notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            notificationState.notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`p-3 cursor-pointer ${!notification.read ? 'bg-accent/50' : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start gap-3 w-full">
                  {getNotificationIcon(notification.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-medium truncate">{notification.title}</h4>
                      <Badge
                        variant="secondary"
                        className={`text-xs ${getCategoryColor(notification.category)}`}
                      >
                        {notification.category}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">{notification.message}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {formatTimestamp(notification.timestamp)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          notificationService.clearNotification(notification.id);
                        }}
                        className="h-6 w-6 p-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>

        {notificationState.notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => notificationService.clearAllNotifications()}
              className="text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear all notifications
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBell;
