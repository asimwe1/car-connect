import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { realTimeChatService, ChatMessage, Conversation, TypingIndicator } from '../services/realTimeChat';
import { useAuth } from './AuthContext';
import { api } from '../services/api';

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
  markAsRead: (messageIds: string[], recipientId: string) => void;

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
    });

    // Listen for typing indicators
    realTimeChatService.onUserTyping((data: TypingIndicator) => {
      console.log('⌨️ User typing:', data);

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
      // For now, we'll use a mock token since your backend expects JWT
      // In production, you'd get this from your auth system
      const mockToken = `mock-token-${user.id}`;

      await realTimeChatService.connect(mockToken);
      setIsConnected(true);
      console.log('✅ Chat service connected');

      // Load initial data
      await loadConversations();
    } catch (error) {
      console.error('❌ Failed to connect to chat service:', error);
      setIsConnected(false);
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
      // Use your existing API to get conversations
      const response = await fetch('/api/messages/conversations', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      } else {
        // Fallback to mock data for development
        console.log('Using mock conversations data');
        setConversations([]);
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
      // Use empty array as fallback
      setConversations([]);
    }
  };

  const loadMessages = async (carId: string, recipientId: string): Promise<void> => {
    try {
      const response = await fetch(`/api/messages/${carId}/${recipientId}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data);

        // Find the conversation
        const conversation = conversations.find(conv =>
          conv.carId === carId && conv.userId === recipientId
        );
        setCurrentConversation(conversation || null);
      } else {
        // Fallback to mock data
        console.log('Using mock messages data');
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
    if (!isConnected) {
      throw new Error('Not connected to chat service');
    }

    try {
      const message = await realTimeChatService.sendMessage(recipientId, carId, content);

      // Add message to current conversation if it matches
      if (currentConversation &&
        carId === currentConversation.carId &&
        recipientId === currentConversation.userId) {
        setMessages(prev => [...prev, message]);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
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

  const markAsRead = (messageIds: string[], recipientId: string): void => {
    if (isConnected) {
      realTimeChatService.markAsRead(messageIds, recipientId);
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
