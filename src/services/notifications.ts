// Real-time Notifications Service using WebSockets
// This service handles real-time notifications across the system

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  category: 'system' | 'user' | 'order' | 'booking' | 'chat' | 'admin';
  data?: any;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
}

class NotificationService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private listeners: ((state: NotificationState) => void)[] = [];
  private state: NotificationState = {
    notifications: [],
    unreadCount: 0,
    isConnected: false
  };

  constructor() {
    this.connect();
  }

  private connect() {
    try {
      // In production, this would connect to your WebSocket server
      const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/notifications';
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('Notifications WebSocket connected');
        this.state.isConnected = true;
        this.reconnectAttempts = 0;
        this.notifyListeners();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleNotification(data);
        } catch (error) {
          console.error('Error parsing notification:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('Notifications WebSocket disconnected');
        this.state.isConnected = false;
        this.notifyListeners();
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('Notifications WebSocket error:', error);
        this.state.isConnected = false;
        this.notifyListeners();
      };
    } catch (error) {
      console.error('Failed to connect to notifications WebSocket:', error);
      this.attemptReconnect();
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }

  private handleNotification(data: any) {
    const notification: Notification = {
      id: data.id || Date.now().toString(),
      type: data.type || 'info',
      title: data.title || 'Notification',
      message: data.message || '',
      timestamp: new Date(data.timestamp || Date.now()),
      read: false,
      category: data.category || 'system',
      data: data.data
    };

    this.state.notifications.unshift(notification);
    this.state.unreadCount++;
    
    // Keep only last 50 notifications
    if (this.state.notifications.length > 50) {
      this.state.notifications = this.state.notifications.slice(0, 50);
    }

    this.notifyListeners();
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener({ ...this.state }));
  }

  // Public API
  subscribe(listener: (state: NotificationState) => void) {
    this.listeners.push(listener);
    // Immediately call with current state
    listener({ ...this.state });
    
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  markAsRead(notificationId: string) {
    const notification = this.state.notifications.find(n => n.id === notificationId);
    if (notification && !notification.read) {
      notification.read = true;
      this.state.unreadCount--;
      this.notifyListeners();
    }
  }

  markAllAsRead() {
    this.state.notifications.forEach(notification => {
      notification.read = true;
    });
    this.state.unreadCount = 0;
    this.notifyListeners();
  }

  clearNotification(notificationId: string) {
    this.state.notifications = this.state.notifications.filter(n => n.id !== notificationId);
    this.notifyListeners();
  }

  clearAllNotifications() {
    this.state.notifications = [];
    this.state.unreadCount = 0;
    this.notifyListeners();
  }

  // Simulate notifications for demo purposes
  simulateNotification(type: Notification['type'], category: Notification['category'], title: string, message: string) {
    const notification: Notification = {
      id: Date.now().toString(),
      type,
      title,
      message,
      timestamp: new Date(),
      read: false,
      category,
      data: {}
    };

    this.state.notifications.unshift(notification);
    this.state.unreadCount++;
    this.notifyListeners();
  }

  // System event notifications
  notifyUserRegistered(userName: string) {
    this.simulateNotification('success', 'user', 'New User Registration', `${userName} has joined the platform`);
  }

  notifyNewOrder(orderId: string, amount: number) {
    this.simulateNotification('success', 'order', 'New Order', `Order #${orderId} for ${amount} RWF has been placed`);
  }

  notifyNewBooking(bookingId: string, carName: string) {
    this.simulateNotification('info', 'booking', 'New Test Drive Booking', `Test drive booked for ${carName}`);
  }

  notifyNewChatMessage(userId: string) {
    this.simulateNotification('info', 'chat', 'New Support Message', `User ${userId.slice(-6)} sent a message`);
  }

  notifySystemAlert(message: string) {
    this.simulateNotification('warning', 'system', 'System Alert', message);
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
export type { Notification, NotificationState };
