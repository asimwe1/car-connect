// Real-time chat service using Socket.IO
import { io, Socket } from 'socket.io-client';

export interface ChatMessage {
  _id: string;
  content: string;
  sender: {
    _id: string;
    fullname: string;
    phone: string;
  };
  recipient: {
    _id: string;
    fullname: string;
    phone: string;
  };
  car: {
    _id: string;
    make: string;
    model: string;
    year: number;
    price: number;
    primaryImage: string;
  };
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  _id: string;
  userId: string;
  carId: string;
  otherUser: {
    _id: string;
    fullname: string;
    phone: string;
  };
  car: {
    _id: string;
    make: string;
    model: string;
    year: number;
    price: number;
    primaryImage: string;
  };
  lastMessage: ChatMessage;
  unreadCount: number;
  updatedAt: string;
}

export interface TypingIndicator {
  userId: string;
  carId: string;
  isTyping: boolean;
}

class RealTimeChatService {
  private socket: Socket | null = null;
  private token: string | null = null;
  private isConnected: boolean = false;

  // Connection management
  connect(token: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.token = token;

      // Use your backend URL
      this.socket = io('wss://carhubconnect.onrender.com/messages', {
        auth: { token },
        transports: ['websocket'],
        timeout: 20000,
        forceNew: true
      });

      this.socket.on('connect', () => {
        console.log('✅ Connected to chat server');
        this.isConnected = true;
        resolve(true);
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ Connection error:', error);
        this.isConnected = false;
        reject(error);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('🔌 Disconnected from chat server:', reason);
        this.isConnected = false;
      });

      // Auto-reconnection
      this.socket.on('reconnect', () => {
        console.log('🔄 Reconnected to chat server');
        this.isConnected = true;
      });
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  // Message handling
  sendMessage(recipientId: string, carId: string, content: string): Promise<ChatMessage> {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.isConnected) {
        reject(new Error('Not connected to chat server'));
        return;
      }

      this.socket.emit('privateMessage', { recipientId, carId, content }, (response: any) => {
        if (response.success) {
          resolve(response.message);
        } else {
          reject(new Error(response.error || 'Failed to send message'));
        }
      });
    });
  }

  // Event listeners
  onNewMessage(callback: (message: ChatMessage) => void): void {
    if (this.socket) {
      this.socket.on('newMessage', callback);
    }
  }

  onUserTyping(callback: (data: TypingIndicator) => void): void {
    if (this.socket) {
      this.socket.on('userTyping', callback);
    }
  }

  onMessagesRead(callback: (data: { messageIds: string[], userId: string }) => void): void {
    if (this.socket) {
      this.socket.on('messagesRead', callback);
    }
  }

  onUserOnline(callback: (data: { userId: string, isOnline: boolean }) => void): void {
    if (this.socket) {
      this.socket.on('userOnline', callback);
    }
  }

  // Typing indicators
  startTyping(recipientId: string, carId: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing', { recipientId, carId });
    }
  }

  stopTyping(recipientId: string, carId: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('stopTyping', { recipientId, carId });
    }
  }

  // Read receipts
  markAsRead(messageIds: string[], recipientId: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('markAsRead', { messageIds, recipientId });
    }
  }

  // Remove event listeners
  removeAllListeners(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }

  // Get socket instance for advanced usage
  getSocket(): Socket | null {
    return this.socket;
  }
}

// Create singleton instance
export const realTimeChatService = new RealTimeChatService();
