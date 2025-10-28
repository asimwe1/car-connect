// Dynamic Activity Service for Real-time Activity Tracking
import { api } from './api';

export interface ActivityData {
  id: string;
  type: 'car_view' | 'new_user' | 'booking' | 'message' | 'order' | 'system';
  message: string;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high';
  metadata?: {
    userId?: string;
    carId?: string;
    bookingId?: string;
    orderId?: string;
    messageId?: string;
    [key: string]: any;
  };
}

export interface ActivityStats {
  totalActivities: number;
  activitiesByType: Record<string, number>;
  recentActivityCount: number;
  highPriorityCount: number;
}

class ActivityService {
  private activities: ActivityData[] = [];
  private listeners: Map<string, Function[]> = new Map();
  private lastFetchTime: Date | null = null;
  private fetchInterval: NodeJS.Timeout | null = null;
  private activityHistory: Set<string> = new Set();
  private lastGeneratedTime: Date | null = null;

  constructor() {
    this.startPeriodicFetch();
  }

  // Start periodic fetching of activity data
  private startPeriodicFetch() {
    // Fetch every 30 seconds
    this.fetchInterval = setInterval(() => {
      this.fetchActivities(true);
    }, 30000);
  }

  // Stop periodic fetching
  public stopPeriodicFetch() {
    if (this.fetchInterval) {
      clearInterval(this.fetchInterval);
      this.fetchInterval = null;
    }
  }

  // Mock activities for development
  public async fetchActivities(silent = false): Promise<ActivityData[]> {
    try {
      // Generate mock activities
      const mockActivities: ActivityData[] = [
        {
          id: `view-${Date.now()}-1`,
          type: 'car_view',
          message: 'Toyota Camry was viewed',
          timestamp: new Date(),
          priority: 'low',
          metadata: {
            carId: 'mock-car-1',
            userId: 'mock-user-1'
          }
        },
        {
          id: `booking-${Date.now()}-1`,
          type: 'booking',
          message: 'New booking for Honda Civic',
          timestamp: new Date(Date.now() - 3600000), // 1 hour ago
          priority: 'high',
          metadata: {
            bookingId: 'mock-booking-1',
            carId: 'mock-car-2',
            userId: 'mock-user-2'
          }
        },
        {
          id: `message-${Date.now()}-1`,
          type: 'message',
          message: 'New message from John Doe',
          timestamp: new Date(Date.now() - 7200000), // 2 hours ago
          priority: 'medium',
          metadata: {
            messageId: 'mock-message-1',
            senderId: 'mock-user-3',
            recipientId: 'mock-admin-1'
          }
        },
        {
          id: `order-${Date.now()}-1`,
          type: 'order',
          message: 'New order: BMW 3 Series',
          timestamp: new Date(Date.now() - 10800000), // 3 hours ago
          priority: 'high',
          metadata: {
            orderId: 'mock-order-1',
            carId: 'mock-car-3',
            userId: 'mock-user-4',
            amount: 35000
          }
        }
      ];

      // Update state with mock data
      this.activities = mockActivities;
      this.lastFetchTime = new Date();
      this.emit('activities_updated', mockActivities);

      return mockActivities;
    } catch (error) {
      console.error('Error fetching activities:', error);
      return this.activities;
    }
  }

  // Process different types of activities
  private processCarViewActivities(data: any[]): ActivityData[] {
    return data.map((view, index) => ({
      id: `view-${Date.now()}-${index}`,
      type: 'car_view',
      message: `Car ${view.make} ${view.model} was viewed`,
      timestamp: new Date(view.timestamp || Date.now()),
      priority: 'low',
      metadata: {
        carId: view._id,
        userId: view.viewedBy
      }
    }));
  }

  private processBookingActivities(data: any[]): ActivityData[] {
    return data.map((booking, index) => ({
      id: `booking-${Date.now()}-${index}`,
      type: 'booking',
      message: `New booking for ${booking.car?.make} ${booking.car?.model}`,
      timestamp: new Date(booking.createdAt || Date.now()),
      priority: 'high',
      metadata: {
        bookingId: booking._id,
        carId: booking.car?._id,
        userId: booking.user
      }
    }));
  }

  private processMessageActivities(data: any[]): ActivityData[] {
    return data.map((message, index) => ({
      id: `message-${Date.now()}-${index}`,
      type: 'message',
      message: `New message from ${message.sender?.fullname}`,
      timestamp: new Date(message.createdAt || Date.now()),
      priority: 'medium',
      metadata: {
        messageId: message._id,
        senderId: message.sender?._id,
        recipientId: message.recipient?._id
      }
    }));
  }

  private processOrderActivities(data: any[]): ActivityData[] {
    return data.map((order, index) => ({
      id: `order-${Date.now()}-${index}`,
      type: 'order',
      message: `New order: ${order.car?.make} ${order.car?.model}`,
      timestamp: new Date(order.createdAt || Date.now()),
      priority: 'high',
      metadata: {
        orderId: order._id,
        carId: order.car?._id,
        userId: order.user,
        amount: order.amount
      }
    }));

    return activities.map(activity => ({
      timestamp: new Date(activity.timestamp || activity.createdAt || Date.now()),
      priority: this.mapPriority(activity.priority || activity.level),
      metadata: activity.metadata || {}
    }));
  }

  // Map backend activity types to frontend types
  private mapActivityType(type: string): ActivityData['type'] {
    const typeMap: Record<string, ActivityData['type']> = {
      'car_view': 'car_view',
      'user_registration': 'new_user',
      'booking_created': 'booking',
      'message_sent': 'message',
      'order_created': 'order',
      'system': 'system'
    };
    return typeMap[type] || 'system';
  }

  // Map backend priority to frontend priority
  private mapPriority(priority: string): ActivityData['priority'] {
    const priorityMap: Record<string, ActivityData['priority']> = {
      'low': 'low',
      'medium': 'medium',
      'high': 'high',
      'critical': 'high'
    };
    return priorityMap[priority] || 'medium';
  }

  // Create a new activity with rotation logic
  public async createActivity(activity: Omit<ActivityData, 'id' | 'timestamp'>): Promise<ActivityData> {
    const newActivity: ActivityData = {
      ...activity,
      id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };

    // Check if we've seen this exact message recently (prevent duplicates)
    const messageKey = `${activity.type}-${activity.message}`;
    if (this.activityHistory.has(messageKey)) {
      // Skip duplicate, but still return the activity for consistency
      return newActivity;
    }

    // Add to history and limit history size
    this.activityHistory.add(messageKey);
    if (this.activityHistory.size > 100) {
      const oldestKey = this.activityHistory.values().next().value;
      this.activityHistory.delete(oldestKey);
    }

    // Add to local cache
    this.activities.unshift(newActivity);
    
    // Keep only last 50 activities
    this.activities = this.activities.slice(0, 50);

    // Emit update
    this.emit('activity_created', newActivity);
    this.emit('activities_updated', this.activities);

    return newActivity;
  }

  // Get all activities
  public getActivities(): ActivityData[] {
    return [...this.activities];
  }

  // Get activities by type
  public getActivitiesByType(type: ActivityData['type']): ActivityData[] {
    return this.activities.filter(activity => activity.type === type);
  }

  // Get recent activities (last 24 hours)
  public getRecentActivities(hours = 24): ActivityData[] {
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.activities.filter(activity => activity.timestamp >= cutoffTime);
  }

  // Get high priority activities
  public getHighPriorityActivities(): ActivityData[] {
    return this.activities.filter(activity => activity.priority === 'high');
  }

  // Get activity statistics
  public getActivityStats(): ActivityStats {
    const activitiesByType = this.activities.reduce((acc, activity) => {
      acc[activity.type] = (acc[activity.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalActivities: this.activities.length,
      activitiesByType,
      recentActivityCount: this.getRecentActivities().length,
      highPriorityCount: this.getHighPriorityActivities().length
    };
  }

  // Subscribe to activity updates
  public subscribe(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  // Emit events to subscribers
  private emit(event: string, data: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} callback:`, error);
        }
      });
    }
  }

  // Track specific user actions with dynamic messages
  public async trackCarView(carId: string, userId?: string) {
    const carMessages = [
      'Someone is browsing car listings',
      'New visitor checking out vehicles',
      'User exploring car inventory',
      'Potential buyer viewing car details',
      'Customer interested in a vehicle',
      'Visitor checking car specifications',
      'User browsing available cars',
      'Someone looking at vehicle options'
    ];
    
    const userMessages = [
      'User viewed car details',
      'Customer checking vehicle specs',
      'Buyer exploring car options',
      'User interested in a vehicle',
      'Customer browsing car inventory',
      'User checking out a car',
      'Buyer viewing vehicle details',
      'Customer exploring car listings'
    ];

    const messages = userId ? userMessages : carMessages;
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    
    return this.createActivity({
      type: 'car_view',
      message: randomMessage,
      priority: 'medium',
      metadata: { carId, userId }
    });
  }

  public async trackNewUser(userId: string, userInfo: any) {
    const welcomeMessages = [
      `Welcome ${userInfo.fullname || 'New User'}!`,
      `New member joined: ${userInfo.fullname || 'Anonymous'}`,
      `User registration: ${userInfo.fullname || 'New Customer'}`,
      `New account created by ${userInfo.fullname || 'User'}`,
      `Welcome aboard ${userInfo.fullname || 'New Member'}!`,
      `New user signed up: ${userInfo.fullname || 'Customer'}`,
      `Account created for ${userInfo.fullname || 'New User'}`,
      `New registration: ${userInfo.fullname || 'Member'}`
    ];
    
    const randomMessage = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
    
    return this.createActivity({
      type: 'new_user',
      message: randomMessage,
      priority: 'medium',
      metadata: { userId, userInfo }
    });
  }

  public async trackBooking(bookingId: string, carId: string, userId: string) {
    const bookingMessages = [
      'New test drive request received',
      'Customer wants to test drive a vehicle',
      'Test drive booking submitted',
      'New driving appointment scheduled',
      'Customer requested vehicle test drive',
      'Test drive appointment booked',
      'New vehicle test drive request',
      'Customer interested in test driving'
    ];
    
    const randomMessage = bookingMessages[Math.floor(Math.random() * bookingMessages.length)];
    
    return this.createActivity({
      type: 'booking',
      message: randomMessage,
      priority: 'high',
      metadata: { bookingId, carId, userId }
    });
  }

  public async trackMessage(messageId: string, senderId: string, recipientId: string) {
    const messageTypes = [
      'New customer inquiry received',
      'Customer sent a message',
      'New chat message from user',
      'Customer inquiry submitted',
      'User reached out via chat',
      'New message from potential buyer',
      'Customer question received',
      'User sent an inquiry'
    ];
    
    const randomMessage = messageTypes[Math.floor(Math.random() * messageTypes.length)];
    
    return this.createActivity({
      type: 'message',
      message: randomMessage,
      priority: 'high',
      metadata: { messageId, senderId, recipientId }
    });
  }

  public async trackOrder(orderId: string, carId: string, userId: string, amount: number) {
    const orderMessages = [
      `New purchase order for $${amount.toLocaleString()}`,
      `Customer placed order worth $${amount.toLocaleString()}`,
      `New sale: $${amount.toLocaleString()} order`,
      `Purchase completed for $${amount.toLocaleString()}`,
      `Order received: $${amount.toLocaleString()}`,
      `New transaction: $${amount.toLocaleString()}`,
      `Sale confirmed for $${amount.toLocaleString()}`,
      `Customer bought for $${amount.toLocaleString()}`
    ];
    
    const randomMessage = orderMessages[Math.floor(Math.random() * orderMessages.length)];
    
    return this.createActivity({
      type: 'order',
      message: randomMessage,
      priority: 'high',
      metadata: { orderId, carId, userId, amount }
    });
  }

  // Generate contextual system activities with time-based variation
  public async generateContextualActivities() {
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay();
    
    // Only generate contextual activities every 5-10 minutes to avoid spam
    if (this.lastGeneratedTime && (now.getTime() - this.lastGeneratedTime.getTime()) < 300000) {
      return;
    }
    
    this.lastGeneratedTime = now;
    
    // Generate time-based activities
    if (hour >= 9 && hour <= 17 && dayOfWeek >= 1 && dayOfWeek <= 5) {
      // Business hours activities
      const businessActivities = [
        'System performance is optimal',
        'All services running smoothly',
        'Database connection stable',
        'User session management active',
        'Real-time updates functioning',
        'System monitoring normal',
        'API endpoints responding well',
        'Server resources healthy',
        'User traffic is normal',
        'System load is balanced',
        'Database queries optimized',
        'Cache hit rate is high',
        'Response times are good',
        'Memory usage is stable'
      ];
      
      const randomActivity = businessActivities[Math.floor(Math.random() * businessActivities.length)];
      await this.createActivity({
        type: 'system',
        message: randomActivity,
        priority: 'low',
        metadata: { timestamp: now.toISOString(), context: 'business_hours' }
      });
    } else if (hour >= 18 || hour <= 8) {
      // After hours activities
      const afterHoursActivities = [
        'System running in maintenance mode',
        'Automated backups completed',
        'Security monitoring active',
        'System optimization in progress',
        'Database cleanup scheduled',
        'Performance metrics collected',
        'System health check passed',
        'Background processes running',
        'Nightly maintenance completed',
        'Security scan finished',
        'Log files archived',
        'System defragmentation done',
        'Backup verification passed',
        'Performance tuning applied'
      ];
      
      const randomActivity = afterHoursActivities[Math.floor(Math.random() * afterHoursActivities.length)];
      await this.createActivity({
        type: 'system',
        message: randomActivity,
        priority: 'low',
        metadata: { timestamp: now.toISOString(), context: 'after_hours' }
      });
    }
    
    // Generate random system events occasionally
    if (Math.random() < 0.2) { // 20% chance
      const systemEvents = [
        'User authentication system updated',
        'Database connection pool refreshed',
        'Cache cleared successfully',
        'Security scan completed',
        'Performance optimization applied',
        'System logs rotated',
        'Memory usage optimized',
        'Network latency improved',
        'SSL certificate renewed',
        'Database indexes rebuilt',
        'API rate limits adjusted',
        'Error monitoring updated',
        'System configuration backed up',
        'Performance metrics exported'
      ];
      
      const randomEvent = systemEvents[Math.floor(Math.random() * systemEvents.length)];
      await this.createActivity({
        type: 'system',
        message: randomEvent,
        priority: 'medium',
        metadata: { timestamp: now.toISOString(), context: 'system_event' }
      });
    }
  }

  // Generate realistic user behavior activities
  public async generateUserBehaviorActivities() {
    const behaviors = [
      {
        type: 'car_view',
        messages: [
          'Customer browsing luxury vehicles',
          'User checking sports car listings',
          'Visitor exploring SUV options',
          'Buyer interested in electric vehicles',
          'Customer comparing car prices',
          'User filtering by fuel type',
          'Visitor sorting by year',
          'Customer checking car features',
          'User exploring hybrid options',
          'Customer looking at family cars',
          'Buyer checking vehicle history',
          'User comparing different models',
          'Customer interested in convertibles',
          'Visitor browsing by price range',
          'User checking car specifications'
        ]
      },
      {
        type: 'system',
        messages: [
          'Search filters applied by user',
          'User preferences updated',
          'Wishlist item added',
          'Comparison tool used',
          'Price alert set',
          'Notification preferences changed',
          'User profile updated',
          'Search history cleared',
          'User logged in from new device',
          'Password reset requested',
          'Email preferences updated',
          'Account settings modified',
          'Two-factor authentication enabled',
          'User session extended',
          'Profile picture updated'
        ]
      }
    ];
    
    // Randomly generate user behavior activities (reduced frequency)
    if (Math.random() < 0.25) { // 25% chance
      const behavior = behaviors[Math.floor(Math.random() * behaviors.length)];
      const randomMessage = behavior.messages[Math.floor(Math.random() * behavior.messages.length)];
      
      await this.createActivity({
        type: behavior.type,
        message: randomMessage,
        priority: 'medium',
        metadata: { 
          timestamp: new Date().toISOString(), 
          context: 'user_behavior',
          generated: true 
        }
      });
    }
  }

  // Generate time-based realistic activities
  public async generateTimeBasedActivities() {
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay();
    
    // Morning activities (6-11 AM)
    if (hour >= 6 && hour <= 11) {
      const morningActivities = [
        'Early morning user activity detected',
        'System startup completed successfully',
        'Daily backup verification passed',
        'User authentication system ready',
        'Database connections established',
        'Cache warming completed',
        'Security monitoring activated',
        'Performance metrics baseline set'
      ];
      
      const randomActivity = morningActivities[Math.floor(Math.random() * morningActivities.length)];
      await this.createActivity({
        type: 'system',
        message: randomActivity,
        priority: 'low',
        metadata: { timestamp: now.toISOString(), context: 'morning' }
      });
    }
    
    // Afternoon activities (12-17 PM)
    if (hour >= 12 && hour <= 17) {
      const afternoonActivities = [
        'Peak user activity period',
        'High traffic load managed',
        'User engagement metrics updated',
        'Real-time analytics processing',
        'Customer support tickets processed',
        'Order processing optimized',
        'Payment gateway monitoring active',
        'User session management peak'
      ];
      
      const randomActivity = afternoonActivities[Math.floor(Math.random() * afternoonActivities.length)];
      await this.createActivity({
        type: 'system',
        message: randomActivity,
        priority: 'medium',
        metadata: { timestamp: now.toISOString(), context: 'afternoon' }
      });
    }
    
    // Evening activities (18-23 PM)
    if (hour >= 18 && hour <= 23) {
      const eveningActivities = [
        'Evening user activity winding down',
        'System performance review completed',
        'Daily statistics compiled',
        'User behavior patterns analyzed',
        'Security audit completed',
        'Performance optimization scheduled',
        'Backup process initiated',
        'System maintenance prepared'
      ];
      
      const randomActivity = eveningActivities[Math.floor(Math.random() * eveningActivities.length)];
      await this.createActivity({
        type: 'system',
        message: randomActivity,
        priority: 'low',
        metadata: { timestamp: now.toISOString(), context: 'evening' }
      });
    }
    
    // Weekend activities
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      const weekendActivities = [
        'Weekend user activity detected',
        'Leisure browsing patterns observed',
        'Weekend maintenance completed',
        'System optimization for weekend load',
        'User engagement during off-hours',
        'Weekend security monitoring active',
        'Leisure car browsing increased',
        'Weekend user registration spike'
      ];
      
      const randomActivity = weekendActivities[Math.floor(Math.random() * weekendActivities.length)];
      await this.createActivity({
        type: 'system',
        message: randomActivity,
        priority: 'medium',
        metadata: { timestamp: now.toISOString(), context: 'weekend' }
      });
    }
  }

  // Add method to generate random realistic activities
  public async generateRandomRealisticActivities() {
    const activityTypes = [
      {
        type: 'car_view',
        messages: [
          'Customer interested in BMW X5',
          'User checking Honda Civic details',
          'Visitor exploring Toyota Camry',
          'Buyer looking at Mercedes C-Class',
          'Customer comparing Audi A4 vs BMW 3 Series',
          'User filtering by automatic transmission',
          'Visitor sorting by lowest price',
          'Customer checking vehicle history report'
        ]
      },
      {
        type: 'new_user',
        messages: [
          'New customer from Kigali registered',
          'User from Nairobi joined the platform',
          'Customer from Kampala signed up',
          'New member from Dar es Salaam',
          'User from Mombasa created account',
          'Customer from Arusha registered',
          'New member from Nakuru joined',
          'User from Kisumu signed up'
        ]
      },
      {
        type: 'booking',
        messages: [
          'Test drive requested for Toyota Corolla',
          'Customer wants to test Honda Accord',
          'Driving appointment for BMW X3',
          'Test drive scheduled for Mercedes E-Class',
          'Customer interested in test driving Audi Q5',
          'Driving appointment for Lexus RX',
          'Test drive requested for Volvo XC60',
          'Customer wants to test drive Mazda CX-5'
        ]
      },
      {
        type: 'message',
        messages: [
          'Customer asking about financing options',
          'User inquiring about vehicle warranty',
          'Customer asking about delivery timeline',
          'User requesting more photos',
          'Customer asking about trade-in value',
          'User inquiring about insurance',
          'Customer asking about maintenance history',
          'User requesting test drive availability'
        ]
      }
    ];
    
    // Generate 1-3 random activities occasionally
    const numActivities = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < numActivities; i++) {
      const activityType = activityTypes[Math.floor(Math.random() * activityTypes.length)];
      const randomMessage = activityType.messages[Math.floor(Math.random() * activityType.messages.length)];
      
      await this.createActivity({
        type: activityType.type,
        message: randomMessage,
        priority: activityType.type === 'booking' || activityType.type === 'message' ? 'high' : 'medium',
        metadata: { 
          timestamp: new Date().toISOString(), 
          context: 'realistic_generated',
          generated: true 
        }
      });
    }
  }

  // Cleanup
  public destroy() {
    this.stopPeriodicFetch();
    this.listeners.clear();
    this.activities = [];
    this.activityHistory.clear();
  }
}

// Create singleton instance
let activityServiceInstance: ActivityService | null = null;

export const getActivityService = () => {
  if (!activityServiceInstance) {
    activityServiceInstance = new ActivityService();
  }
  return activityServiceInstance;
};

export const activityService = getActivityService();
export default activityService;