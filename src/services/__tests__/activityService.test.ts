// Test file for ActivityService
import { activityService, ActivityData } from '../activityService';

describe('ActivityService', () => {
  beforeEach(() => {
    // Reset the service before each test
    activityService.destroy();
  });

  afterEach(() => {
    // Clean up after each test
    activityService.destroy();
  });

  describe('Activity Creation', () => {
    it('should create a new activity', async () => {
      const activityData = {
        type: 'car_view' as const,
        message: 'Car viewed by user',
        priority: 'medium' as const,
        metadata: { carId: 'car-123', userId: 'user-456' }
      };

      const activity = await activityService.createActivity(activityData);

      expect(activity).toBeDefined();
      expect(activity.id).toBeDefined();
      expect(activity.type).toBe('car_view');
      expect(activity.message).toBe('Car viewed by user');
      expect(activity.priority).toBe('medium');
      expect(activity.timestamp).toBeInstanceOf(Date);
      expect(activity.metadata).toEqual({ carId: 'car-123', userId: 'user-456' });
    });

    it('should track car view activity', async () => {
      const activity = await activityService.trackCarView('car-123', 'user-456');

      expect(activity.type).toBe('car_view');
      expect(activity.message).toContain('Car viewed by');
      expect(activity.metadata.carId).toBe('car-123');
      expect(activity.metadata.userId).toBe('user-456');
    });

    it('should track new user activity', async () => {
      const userInfo = { fullname: 'John Doe', phone: '+1234567890' };
      const activity = await activityService.trackNewUser('user-456', userInfo);

      expect(activity.type).toBe('new_user');
      expect(activity.message).toContain('New user registered');
      expect(activity.metadata.userId).toBe('user-456');
      expect(activity.metadata.userInfo).toEqual(userInfo);
    });

    it('should track booking activity', async () => {
      const activity = await activityService.trackBooking('booking-789', 'car-123', 'user-456');

      expect(activity.type).toBe('booking');
      expect(activity.message).toContain('New test drive booking created');
      expect(activity.priority).toBe('high');
      expect(activity.metadata.bookingId).toBe('booking-789');
    });

    it('should track message activity', async () => {
      const activity = await activityService.trackMessage('msg-101', 'user-456', 'admin-001');

      expect(activity.type).toBe('message');
      expect(activity.message).toContain('New message sent');
      expect(activity.priority).toBe('high');
      expect(activity.metadata.messageId).toBe('msg-101');
    });

    it('should track order activity', async () => {
      const activity = await activityService.trackOrder('order-202', 'car-123', 'user-456', 25000);

      expect(activity.type).toBe('order');
      expect(activity.message).toContain('New order created for $25000');
      expect(activity.priority).toBe('high');
      expect(activity.metadata.amount).toBe(25000);
    });
  });

  describe('Activity Retrieval', () => {
    beforeEach(async () => {
      // Create some test activities
      await activityService.createActivity({
        type: 'car_view',
        message: 'Car viewed',
        priority: 'medium',
        metadata: { carId: 'car-1' }
      });

      await activityService.createActivity({
        type: 'new_user',
        message: 'New user registered',
        priority: 'medium',
        metadata: { userId: 'user-1' }
      });

      await activityService.createActivity({
        type: 'booking',
        message: 'New booking',
        priority: 'high',
        metadata: { bookingId: 'booking-1' }
      });
    });

    it('should get all activities', () => {
      const activities = activityService.getActivities();
      expect(activities).toHaveLength(3);
    });

    it('should get activities by type', () => {
      const carViewActivities = activityService.getActivitiesByType('car_view');
      expect(carViewActivities).toHaveLength(1);
      expect(carViewActivities[0].type).toBe('car_view');

      const bookingActivities = activityService.getActivitiesByType('booking');
      expect(bookingActivities).toHaveLength(1);
      expect(bookingActivities[0].type).toBe('booking');
    });

    it('should get high priority activities', () => {
      const highPriorityActivities = activityService.getHighPriorityActivities();
      expect(highPriorityActivities).toHaveLength(1);
      expect(highPriorityActivities[0].priority).toBe('high');
    });

    it('should get activity statistics', () => {
      const stats = activityService.getActivityStats();
      
      expect(stats.totalActivities).toBe(3);
      expect(stats.activitiesByType.car_view).toBe(1);
      expect(stats.activitiesByType.new_user).toBe(1);
      expect(stats.activitiesByType.booking).toBe(1);
      expect(stats.highPriorityCount).toBe(1);
    });
  });

  describe('Event Subscription', () => {
    it('should subscribe to activity updates', () => {
      const callback = jest.fn();
      const unsubscribe = activityService.subscribe('activities_updated', callback);

      expect(typeof unsubscribe).toBe('function');
      
      // Clean up
      unsubscribe();
    });

    it('should emit activity created events', async () => {
      const callback = jest.fn();
      activityService.subscribe('activity_created', callback);

      await activityService.createActivity({
        type: 'system',
        message: 'System activity',
        priority: 'low'
      });

      expect(callback).toHaveBeenCalled();
    });
  });

  describe('Activity Filtering', () => {
    beforeEach(async () => {
      // Create activities with different timestamps
      const now = Date.now();
      
      // Recent activity (within 1 hour)
      await activityService.createActivity({
        type: 'car_view',
        message: 'Recent car view',
        priority: 'medium',
        metadata: {}
      });

      // Old activity (more than 24 hours ago)
      const oldActivity = await activityService.createActivity({
        type: 'new_user',
        message: 'Old user registration',
        priority: 'medium',
        metadata: {}
      });
      
      // Manually set old timestamp
      oldActivity.timestamp = new Date(now - 25 * 60 * 60 * 1000);
    });

    it('should get recent activities', () => {
      const recentActivities = activityService.getRecentActivities(24);
      expect(recentActivities.length).toBeGreaterThan(0);
    });
  });
});
