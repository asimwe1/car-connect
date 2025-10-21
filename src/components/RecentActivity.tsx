import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Zap, Eye, Users, Calendar, MessageCircle, ShoppingCart, Settings } from 'lucide-react';
import { ActivityData } from '@/services/activityService';

// Icon mapping for activity types
const getActivityIcon = (type: ActivityData['type']) => {
  const iconMap = {
    'car_view': Eye,
    'new_user': Users,
    'booking': Calendar,
    'message': MessageCircle,
    'order': ShoppingCart,
    'system': Settings
  };
  return iconMap[type] || Activity;
};

interface RecentActivityProps {
  recentActivity: ActivityData[];
}

const RecentActivity: React.FC<RecentActivityProps> = ({ recentActivity }) => {
  const getActivityEmoji = (type: ActivityData['type']) => {
    const emojiMap = {
      'car_view': '👁️',
      'new_user': '👤',
      'booking': '📅',
      'message': '💬',
      'order': '🛒',
      'system': '⚙️'
    };
    return emojiMap[type] || '📊';
  };

  const getActivityColor = (type: ActivityData['type']) => {
    const colorMap = {
      'car_view': 'from-cyan-50 to-cyan-100 dark:from-cyan-950/20 dark:to-cyan-900/20 border-cyan-200 dark:border-cyan-800',
      'new_user': 'from-emerald-50 to-emerald-100 dark:from-emerald-950/20 dark:to-emerald-900/20 border-emerald-200 dark:border-emerald-800',
      'booking': 'from-amber-50 to-amber-100 dark:from-amber-950/20 dark:to-amber-900/20 border-amber-200 dark:border-amber-800',
      'message': 'from-violet-50 to-violet-100 dark:from-violet-950/20 dark:to-violet-900/20 border-violet-200 dark:border-violet-800',
      'order': 'from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 border-purple-200 dark:border-purple-800',
      'system': 'from-slate-50 to-slate-100 dark:from-slate-950/20 dark:to-slate-900/20 border-slate-200 dark:border-slate-800'
    };
    return colorMap[type] || 'from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200 dark:border-blue-800';
  };

  const getActivityTextColor = (type: ActivityData['type']) => {
    const colorMap = {
      'car_view': 'text-cyan-800 dark:text-cyan-200',
      'new_user': 'text-emerald-800 dark:text-emerald-200',
      'booking': 'text-amber-800 dark:text-amber-200',
      'message': 'text-violet-800 dark:text-violet-200',
      'order': 'text-purple-800 dark:text-purple-200',
      'system': 'text-slate-800 dark:text-slate-200'
    };
    return colorMap[type] || 'text-blue-800 dark:text-blue-200';
  };

  const getActivitySubTextColor = (type: ActivityData['type']) => {
    const colorMap = {
      'car_view': 'text-cyan-600 dark:text-cyan-400',
      'new_user': 'text-emerald-600 dark:text-emerald-400',
      'booking': 'text-amber-600 dark:text-amber-400',
      'message': 'text-violet-600 dark:text-violet-400',
      'order': 'text-purple-600 dark:text-purple-400',
      'system': 'text-slate-600 dark:text-slate-400'
    };
    return colorMap[type] || 'text-blue-600 dark:text-blue-400';
  };

  return (
    <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950/20 dark:to-slate-900/20 backdrop-blur-sm border border-slate-200 dark:border-slate-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
              <Activity className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              📊 Real-time Activity
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">Live system updates and user actions</CardDescription>
          </div>
          <Badge variant="outline" className="text-xs animate-pulse bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300">
            <Zap className="w-3 h-3 mr-1 text-green-600 dark:text-green-400" />
            🔴 Live
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {recentActivity.length === 0 ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>📭 No recent activity</p>
            </div>
          ) : (
            recentActivity.map((activity) => {
              const IconComponent = getActivityIcon(activity.type);
              const emoji = getActivityEmoji(activity.type);
              return (
                <div
                  key={activity.id}
                  className={`flex items-center gap-4 p-4 rounded-lg transition-all duration-300 hover:shadow-md bg-gradient-to-r ${getActivityColor(activity.type)}`}
                >
                  <div className="flex-shrink-0">
                    <div className="w-3 h-3 bg-gradient-to-r from-current to-current rounded-full animate-pulse opacity-60"></div>
                  </div>
                  <div className="flex-shrink-0 text-lg">
                    {emoji}
                  </div>
                  <IconComponent className="w-4 h-4 text-current opacity-70" />
                  <div className="flex-1">
                    <p className={`font-medium text-sm ${getActivityTextColor(activity.type)}`}>{activity.message}</p>
                    <p className={`text-xs ${getActivitySubTextColor(activity.type)}`}>
                      {activity.type === 'car_view' && '👁️ Car listing views'}
                      {activity.type === 'new_user' && '👤 User registration'}
                      {activity.type === 'booking' && '📅 Test drive booking'}
                      {activity.type === 'message' && '💬 Customer inquiry'}
                      {activity.type === 'order' && '🛒 Order created'}
                      {activity.type === 'system' && '⚙️ System activity'}
                    </p>
                  </div>
                  <span className={`text-xs ${getActivitySubTextColor(activity.type)}`}>
                    {new Date(activity.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;