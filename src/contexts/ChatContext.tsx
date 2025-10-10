import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { realTimeChatService, ChatMessage, Conversation, TypingIndicator } from '../services/realTimeChat';
import { useAuth } from './AuthContext';
import { api } from '../services/api';
import { notificationService } from '../services/notifications';
import { notify } from '../components/Notifier';

interface ChatContextType {
  // Connection status
  isConnected: boolean;

  // Data
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: ChatMessage[];
  typingUsers: Set<string>;

  // Actions
  connect: () => Promise<void>;
  disconnect: () => void;
  loadConversations: () => Promise<void>;
  loadMessages: (carId: string, recipientId: string) => Promise<void>;
  sendMessage: (recipientId: string, carId: string, content: string) => Promise<void>;
  startTyping: (recipientId: string, carId: string) => void;
  stopTyping: (recipientId: string, carId: string) => void;
  markAsRead: (messageIds: string[], recipientId: string) => Promise<void>;

  // UI state
  setCurrentConversation: (conversation: Conversation | null) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

  // Connect to chat service when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [isAuthenticated, user]);

  // Setup event listeners
  useEffect(() => {
    if (!isConnected) return;

    // Listen for new messages
    realTimeChatService.onNewMessage((message: ChatMessage) => {
      console.log('📨 New message received:', message);

      // Update conversations list
      loadConversations();

      // If this is the current conversation, add the message
      if (currentConversation &&
        message.car._id === currentConversation.carId &&
        message.sender._id === currentConversation.userId) {
        setMessages(prev => [...prev, message]);
      }

      // Trigger notifications for new messages (only if not from current user)
      if (user && message.sender._id !== user.id) {
        // Add to notification service
        notificationService.notifyNewChatMessage(message.sender._id);
        
        // Show toast notification if not in current conversation
        if (!currentConversation || 
            message.car._id !== currentConversation.carId || 
            message.sender._id !== currentConversation.userId) {
          notify.info(
            'New Message',
            `${message.sender.fullname}: ${message.content.substring(0, 50)}${message.content.length > 50 ? '...' : ''}`
          );
        }
      }
    });

    // Listen for typing indicators
    realTimeChatService.onUserTyping((data: TypingIndicator) => {
      console.log('⌨️ User typing:', data);

      // Ignore our own typing events; only track other users (e.g., admin)
      if (user && data.userId === user.id) {
        return;
      }

      if (data.isTyping) {
        setTypingUsers(prev => new Set([...prev, data.userId]));
      } else {
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(data.userId);
          return newSet;
        });
      }
    });

    // Listen for read receipts
    realTimeChatService.onMessagesRead((data) => {
      console.log('✅ Messages read:', data);
      // Update message read status in current conversation
      if (currentConversation && data.userId === currentConversation.userId) {
        setMessages(prev => prev.map(msg =>
          data.messageIds.includes(msg._id)
            ? { ...msg, isRead: true }
            : msg
        ));
      }
    });

    // Listen for user online status
    realTimeChatService.onUserOnline((data) => {
      console.log('🟢 User online status:', data);
      // You can use this to show online indicators
    });

  }, [isConnected, currentConversation]);

  const connect = async (): Promise<void> => {
    if (!user) {
      console.error('No user found for chat connection');
      return;
    }

    try {
      // Get the actual auth token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No auth token found');
        setIsConnected(false);
        return;
      }

      await realTimeChatService.connect(token);
      setIsConnected(true);
      console.log('✅ Chat service connected');

      // Load initial data
      await loadConversations();
    } catch (error) {
      console.error('❌ Failed to connect to chat service:', error);
      setIsConnected(false);
      
      // Retry connection after a delay
      setTimeout(() => {
        if (isAuthenticated && user) {
          console.log('🔄 Retrying chat connection...');
          connect();
        }
      }, 10000);
    }
  };

  const disconnect = (): void => {
    realTimeChatService.disconnect();
    setIsConnected(false);
    setConversations([]);
    setCurrentConversation(null);
    setMessages([]);
    setTypingUsers(new Set());
  };

  const loadConversations = async (): Promise<void> => {
    try {
      const result = await api.getConversations();
      if (result.data) {
        setConversations(result.data);
      } else {
        console.error('Failed to load conversations:', result.error);
        setConversations([]);
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
      setConversations([]);
    }
  };

  const loadMessages = async (carId: string, recipientId: string): Promise<void> => {
    try {
      const result = await api.getMessages(carId, recipientId);
      if (result.data) {
        setMessages(result.data);

        // Find the conversation
        const conversation = conversations.find(conv =>
          conv.carId === carId && conv.userId === recipientId
        );
        setCurrentConversation(conversation || null);
      } else {
        console.error('Failed to load messages:', result.error);
        setMessages([]);
        setCurrentConversation(null);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
      setMessages([]);
      setCurrentConversation(null);
    }
  };

  const sendMessage = async (recipientId: string, carId: string, content: string): Promise<void> => {
    try {
      console.log('ChatContext: Sending message via API:', { recipientId, carId, content });
      
      // Send via API first (persistent storage)
      const result = await api.sendMessage({ recipientId, carId, content });
      
      console.log('ChatContext: API response:', result);
      
      if (result.data) {
        // Handle different response structures
        const message = result.data.message || result.data;
        
        if (message) {
          // Add message to current conversation if it matches
          if (currentConversation &&
            carId === currentConversation.carId &&
            recipientId === currentConversation.userId) {
            setMessages(prev => [...prev, message]);
          }

          // Also send via real-time service for instant delivery (if connected)
          if (isConnected) {
            try {
              await realTimeChatService.sendMessage(recipientId, carId, content);
            } catch (realTimeError) {
              console.warn('Real-time message failed, but message was saved:', realTimeError);
              notify.info('Message Sent', 'Your message was saved but may not be delivered instantly.');
            }
          } else {
            notify.info('Message Saved', 'Your message was saved and will be delivered when connection is restored.');
          }

          // Refresh conversations to update last message
          await loadConversations();
        } else {
          throw new Error(result.error || 'Invalid response format');
        }
      } else {
        throw new Error(result.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      notify.error('Message Failed', 'Failed to send your message. Please try again.');
      throw error;
    }
  };

  const startTyping = (recipientId: string, carId: string): void => {
    if (isConnected) {
      realTimeChatService.startTyping(recipientId, carId);
    }
  };

  const stopTyping = (recipientId: string, carId: string): void => {
    if (isConnected) {
      realTimeChatService.stopTyping(recipientId, carId);
    }
  };

  const markAsRead = async (messageIds: string[], recipientId: string): Promise<void> => {
    try {
      // Mark as read via API
      const result = await api.markMessagesAsRead(messageIds);
      
      if (result.data) {
        // Update local message state
        setMessages(prev => prev.map(msg =>
          messageIds.includes(msg._id)
            ? { ...msg, isRead: true }
            : msg
        ));

        // Also mark via real-time service if connected
        if (isConnected) {
          realTimeChatService.markAsRead(messageIds, recipientId);
        }
      }
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
    }
  };

  const value: ChatContextType = {
    isConnected,
    conversations,
    currentConversation,
    messages,
    typingUsers,
    connect,
    disconnect,
    loadConversations,
    loadMessages,
    sendMessage,
    startTyping,
    stopTyping,
    markAsRead,
    setCurrentConversation
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
