// Real-time service for admin dashboard
import { io, Socket } from 'socket.io-client';

class AdminRealtimeService {
  private socket: Socket | null = null;
  private listeners: Map<string, Function[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor() {
    this.connect();
  }

  private connect() {
    try {
      const socketUrl = 'https://carhubconnect.onrender.com';
      
      this.socket = io(`${socketUrl}/admin`, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
        timeout: 20000,
      });

      this.socket.on('connect', () => {
        console.log('Admin real-time service connected');
        this.reconnectAttempts = 0;
        this.emit('connection_status', { connected: true });
      });

      this.socket.on('disconnect', () => {
        console.log('Admin real-time service disconnected');
        this.emit('connection_status', { connected: false });
      });

      this.socket.on('connect_error', (error) => {
        console.error('Admin real-time connection error:', error);
        this.reconnectAttempts++;
        
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.log('Max reconnection attempts reached, falling back to polling');
          this.emit('connection_status', { connected: false, fallback: true });
        }
      });

      // Listen for real-time updates
      this.socket.on('car_view_update', (data) => {
        this.emit('car_views', data);
      });

      this.socket.on('new_user_update', (data) => {
        this.emit('new_users', data);
      });

      this.socket.on('booking_update', (data) => {
        this.emit('bookings', data);
      });

      this.socket.on('message_update', (data) => {
        this.emit('messages', data);
      });

      this.socket.on('activity_update', (data) => {
        this.emit('activity', data);
      });

      this.socket.on('stats_update', (data) => {
        this.emit('stats', data);
      });

      // Additional real-time events for dynamic activity tracking
      this.socket.on('user_action', (data) => {
        this.emit('user_action', data);
      });

      this.socket.on('system_event', (data) => {
        this.emit('system_event', data);
      });

      this.socket.on('order_update', (data) => {
        this.emit('orders', data);
      });

      this.socket.on('car_interaction', (data) => {
        this.emit('car_interaction', data);
      });

    } catch (error) {
      console.error('Failed to initialize admin real-time service:', error);
      this.emit('connection_status', { connected: false, error: true });
    }
  }

  // Subscribe to real-time updates
  subscribe(event: string, callback: Function) {
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

  // Check connection status
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Disconnect
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.listeners.clear();
  }

  // Request specific data updates
  requestCarViews() {
    if (this.socket?.connected) {
      this.socket.emit('request_car_views');
    }
  }

  requestNewUsers() {
    if (this.socket?.connected) {
      this.socket.emit('request_new_users');
    }
  }

  requestBookings() {
    if (this.socket?.connected) {
      this.socket.emit('request_bookings');
    }
  }

  requestMessages() {
    if (this.socket?.connected) {
      this.socket.emit('request_messages');
    }
  }

  requestActivity() {
    if (this.socket?.connected) {
      this.socket.emit('request_activity');
    }
  }

  requestStats() {
    if (this.socket?.connected) {
      this.socket.emit('request_stats');
    }
  }

  requestUserActions() {
    if (this.socket?.connected) {
      this.socket.emit('request_user_actions');
    }
  }

  requestSystemEvents() {
    if (this.socket?.connected) {
      this.socket.emit('request_system_events');
    }
  }

  requestOrderUpdates() {
    if (this.socket?.connected) {
      this.socket.emit('request_order_updates');
    }
  }

  requestCarInteractions() {
    if (this.socket?.connected) {
      this.socket.emit('request_car_interactions');
    }
  }
}

// Create singleton instance
export const adminRealtimeService = new AdminRealtimeService();
export default adminRealtimeService;
