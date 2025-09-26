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
    // Always try to connect to WebSocket server
    // Will fallback to demo notifications if connection fails in development
    this.connect();
  }

  private connect() {
    try {
      // Connect to production WebSocket server or development fallback
      const wsUrl = import.meta.env.VITE_WS_URL || 'wss://localhost:5000/messages';
      console.log(`Attempting to connect to WebSocket: ${wsUrl}`);
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('Notifications WebSocket connected to:', wsUrl);
        this.state.isConnected = true;
        this.reconnectAttempts = 0;
        this.notifyListeners();
        
        // Send authentication if user is logged in
        const user = localStorage.getItem('user');
        if (user) {
          try {
            const userData = JSON.parse(user);
            this.ws?.send(JSON.stringify({
              type: 'auth',
              userId: userData._id,
              token: localStorage.getItem('token')
            }));
          } catch (e) {
            console.warn('Failed to send auth data:', e);
          }
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleNotification(data);
        } catch (error) {
          console.error('Error parsing notification:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('Notifications WebSocket disconnected:', event.code, event.reason);
        this.state.isConnected = false;
        this.notifyListeners();
        
        // Always attempt reconnect in production, and in development if explicitly configured
        if (import.meta.env.PROD || import.meta.env.VITE_WS_URL) {
          this.attemptReconnect();
        } else {
          console.log('WebSocket connection closed - using demo notifications in development');
          this.addDemoNotifications();
        }
      };

      this.ws.onerror = (error) => {
        console.error('Notifications WebSocket error:', error);
        this.state.isConnected = false;
        this.notifyListeners();
        
        // In production, always try to reconnect. In development, use demo notifications
        if (!import.meta.env.PROD && !import.meta.env.VITE_WS_URL) {
          console.log('WebSocket connection failed - using demo notifications in development');
          this.addDemoNotifications();
        }
      };
    } catch (error) {
      console.error('Failed to connect to notifications WebSocket:', error);
      
      // In production, always try to reconnect. In development, use demo notifications
      if (import.meta.env.PROD || import.meta.env.VITE_WS_URL) {
        this.attemptReconnect();
      } else {
        console.log('WebSocket connection failed - using demo notifications in development');
        this.addDemoNotifications();
      }
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), 30000); // Max 30 seconds
      setTimeout(() => {
        console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms`);
        this.connect();
      }, delay);
    } else {
      console.log('Max reconnection attempts reached. Using demo notifications.');
      this.addDemoNotifications();
    }
  }

  private addDemoNotifications() {
    // Add some demo notifications for development
    const demoNotifications: Notification[] = [
      {
        id: '1',
        type: 'info',
        title: 'Welcome to CarHub',
        message: 'Your account has been successfully created!',
        timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
        read: false,
        category: 'system'
      },
      {
        id: '2',
        type: 'success',
        title: 'Car Listed Successfully',
        message: 'Your Toyota Camry has been listed for sale.',
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        read: true,
        category: 'user'
      }
    ];

    this.state.notifications = demoNotifications;
    this.state.unreadCount = demoNotifications.filter(n => !n.read).length;
    this.notifyListeners();
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
