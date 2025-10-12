import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Zap } from 'lucide-react';

interface Activity {
  id: string;
  type: string;
  message: string;
  timestamp: Date;
  icon: React.ComponentType<{ className?: string }>;
  priority: string;
}

interface RecentActivityProps {
  recentActivity: Activity[];
}

const RecentActivity: React.FC<RecentActivityProps> = ({ recentActivity }) => {
  return (
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
              <div
                key={activity.id}
                className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
                  activity.priority === 'high'
                    ? 'bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800'
                    : activity.priority === 'medium'
                    ? 'bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800'
                    : 'bg-accent/20'
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    activity.priority === 'high'
                      ? 'bg-red-500 animate-pulse'
                      : activity.priority === 'medium'
                      ? 'bg-yellow-500'
                      : 'bg-primary'
                  }`}
                ></div>
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
                    minute: '2-digit',
                  })}
                </span>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;