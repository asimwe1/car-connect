// Real-time Notifications Service using WebSockets
// This service handles real-time notifications across the system

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  category: 'system' | 'user' | 'order' | 'booking' | 'chat' | 'admin' | 'car_listing';
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
  private maxReconnectAttempts = 3; // Reduced from 5 to fail faster
  private reconnectDelay = 1000;
  // De-duplication structures
  private recentlySeenIds: Set<string> = new Set();
  private recentContentKeyToTimestampMs: Map<string, number> = new Map();
  private dedupeWindowMs = 10_000; // suppress identical notifications seen within 10s
  private maxTrackedRecent = 200; // cap memory used by dedupe caches
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
      // Skip WebSocket connection in development/production if backend doesn't support it
      const isDev = import.meta.env.DEV;
      if (isDev) {
        console.log('WebSocket disabled in development mode, using demo notifications');
        this.useDemoNotifications();
        return;
      }

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
        // Always attempt reconnect; do not seed demo notifications
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('Notifications WebSocket error:', error);
        this.state.isConnected = false;
        this.notifyListeners();
        // Try to reconnect; do not seed demo notifications
        this.attemptReconnect();
      };
    } catch (error) {
      console.error('Failed to connect to notifications WebSocket:', error);
      // Attempt to reconnect regardless of environment; do not seed demo notifications
      this.attemptReconnect();
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      // Reduce maximum delay and attempts for faster fallback
      const delay = Math.min(1000 * this.reconnectAttempts, 5000); // Max 5 seconds
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
    // Demo notifications disabled to avoid misleading default messages
    this.state.notifications = [];
    this.state.unreadCount = 0;
    this.notifyListeners();
  }

  private handleNotification(data: any) {
    // Build canonical fields with safe fallbacks
    const canonical = {
      id: String(data?.id || ''),
      type: (data?.type as Notification['type']) || 'info',
      title: String(data?.title || 'Notification'),
      message: String(data?.message || ''),
      category: (data?.category as Notification['category']) || 'system',
      data: data?.data ?? undefined,
      timestamp: typeof data?.timestamp === 'number' || typeof data?.timestamp === 'string'
        ? new Date(data.timestamp)
        : new Date(),
    };

    // Compute dedupe keys
    const idKey = canonical.id.trim();
    const contentKey = this.buildContentKey(canonical.type, canonical.title, canonical.message, canonical.category, canonical.data);
    const now = Date.now();

    // Drop if same id seen recently
    if (idKey) {
      if (this.recentlySeenIds.has(idKey)) {
        return; // duplicate by id
      }
    }

    // Drop if identical content within dedupe window
    const lastSeen = this.recentContentKeyToTimestampMs.get(contentKey) || 0;
    if (now - lastSeen < this.dedupeWindowMs) {
      return; // duplicate by content cooldown
    }

    // Record as seen before enqueue
    if (idKey) {
      this.recentlySeenIds.add(idKey);
      if (this.recentlySeenIds.size > this.maxTrackedRecent) {
        // best-effort prune: rebuild with last N from current notifications
        const keep = new Set<string>();
        for (const n of this.state.notifications.slice(0, 100)) {
          if (n.id) keep.add(n.id);
        }
        this.recentlySeenIds = keep;
      }
    }
    this.recentContentKeyToTimestampMs.set(contentKey, now);
    if (this.recentContentKeyToTimestampMs.size > this.maxTrackedRecent) {
      // prune oldest entries
      const entries = Array.from(this.recentContentKeyToTimestampMs.entries()).sort((a, b) => a[1] - b[1]);
      const toRemove = entries.slice(0, Math.max(0, entries.length - this.maxTrackedRecent + 20));
      for (const [k] of toRemove) this.recentContentKeyToTimestampMs.delete(k);
    }

    const notification: Notification = {
      id: idKey || Date.now().toString(),
      type: canonical.type,
      title: canonical.title,
      message: canonical.message,
      timestamp: canonical.timestamp,
      read: false,
      category: canonical.category,
      data: canonical.data
    };

    this.state.notifications.unshift(notification);
    this.state.unreadCount++;
    
    // Keep only last 50 notifications
    if (this.state.notifications.length > 50) {
      this.state.notifications = this.state.notifications.slice(0, 50);
    }

    this.notifyListeners();
  }

  private buildContentKey(
    type: Notification['type'],
    title: string,
    message: string,
    category: Notification['category'],
    data?: any
  ): string {
    // Stable stringify without functions/undefined & avoid large payloads
    let dataString = '';
    try {
      if (data != null) {
        dataString = JSON.stringify(data, (_key, value) => (
          typeof value === 'function' || value === undefined ? null : value
        ));
        if (dataString.length > 500) dataString = dataString.slice(0, 500);
      }
    } catch {
      dataString = '';
    }
    return `${type}|${category}|${title}|${message}|${dataString}`;
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

  notifyCarListing(carData: { id: string; make: string; model: string; year: number; type: 'sell' | 'rent'; sellerName: string }) {
    const listingType = carData.type === 'sell' ? 'selling' : 'renting';
    this.simulateNotification('info', 'car_listing', 'New Car Listing', `${carData.sellerName} has listed their ${carData.year} ${carData.make} ${carData.model} for ${listingType}`);
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
