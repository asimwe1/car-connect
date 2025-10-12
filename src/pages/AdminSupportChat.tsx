import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Send,
  User,
  MessageCircle,
  Search,
  Shield,
  Bell,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import { api } from '@/services/api';
import { notificationService } from '@/services/notifications';
import { notify } from '@/components/Notifier';

const AdminSupportChat = () => {
  const { user } = useAuth();
  const {
    isConnected,
    conversations,
    currentConversation,
    messages,
    typingUsers,
    sendMessage: sendChatMessage,
    startTyping,
    stopTyping,
    loadConversations,
    loadMessages,
    setCurrentConversation
  } = useChat();

  const navigate = useNavigate();
  const [inputMessage, setInputMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    totalCars: 0,
    totalOrders: 0,
    activeBookings: 0
  });
  const [isTyping, setIsTyping] = useState(false);
  const [isUserTyping, setIsUserTyping] = useState(false);
  const [isSystemChatMode, setIsSystemChatMode] = useState(false);
  const [systemChatMessages, setSystemChatMessages] = useState<any[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [conversationError, setConversationError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/admin-dashboard');
      return;
    }
    fetchSystemStats();
    loadAdminConversations();
  }, [user, navigate]);

  const loadAdminConversations = async (retryCount = 0) => {
    if (conversations.length > 0) return; // Prevent duplicate loading
    setIsLoadingConversations(true);
    setConversationError(null);

    try {
      const result = await api.getAdminConversations();
      if (result.data) {
        loadConversations(result.data); // Pass API data to loadConversations
      } else {
        loadConversations(); // Fallback to context's default loading
        console.warn('No conversation data received, falling back to default loadConversations');
      }
    } catch (error) {
      console.error('Failed to load admin conversations:', error);
      if (retryCount < 3) {
        // Retry up to 3 times with exponential backoff
        setTimeout(() => loadAdminConversations(retryCount + 1), 1000 * (2 ** retryCount));
      } else {
        setConversationError('Failed to load conversations. Please try again later.');
        notify.error('Load Failed', 'Unable to fetch conversations. Please refresh the page.');
        loadConversations(); // Fallback to context's default loading
      }
    } finally {
      setIsLoadingConversations(false);
    }
  };

  useEffect(() => {
    if (conversations.length > 0 && !currentConversation && !isSystemChatMode) {
      const firstConversation = conversations[0];
      setCurrentConversation(firstConversation);
      loadMessages(firstConversation.carId, firstConversation.userId);
    }
  }, [conversations, currentConversation, isSystemChatMode, setCurrentConversation, loadMessages]);

  // Monitor typing indicators
  useEffect(() => {
    if (currentConversation) {
      const isTyping = typingUsers.has(currentConversation.userId);
      setIsUserTyping(isTyping);
    }
  }, [typingUsers, currentConversation]);

  // Scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, systemChatMessages]);

  // Notify for new messages
  useEffect(() => {
    if (messages.length > 0 && !isSystemChatMode) {
      const latestMessage = messages[messages.length - 1];
      if (latestMessage.sender._id !== user?.id) {
        notificationService.notifyNewChatMessage(latestMessage.sender._id);
        notify.info(
          'New Message',
          `${latestMessage.sender.fullname}: ${latestMessage.content.substring(0, 50)}${latestMessage.content.length > 50 ? '...' : ''}`
        );
      }
    }
  }, [messages, user?.id, isSystemChatMode]);

  const fetchSystemStats = async () => {
    try {
      const [carsRes, usersRes, ordersRes, bookingsRes] = await Promise.all([
        api.getCars({ page: 1, limit: 1 }),
        api.getUsers({ page: 1, limit: 1 }),
        api.getAdminOrders({ page: 1, limit: 1 }),
        api.getAdminBookings({ page: 1, limit: 1 }),
      ]);

      const carsRaw = carsRes?.data;
      const usersRaw = usersRes?.data;
      const ordersRaw = ordersRes?.data;
      const bookingsRaw = bookingsRes?.data;

      setSystemStats({
        totalUsers: typeof usersRaw?.total === 'number' ? usersRaw.total : Array.isArray(usersRaw?.items) ? usersRaw.items.length : Array.isArray(usersRaw) ? usersRaw.length : 0,
        totalCars: typeof carsRaw?.total === 'number' ? carsRaw.total : Array.isArray(carsRaw?.items) ? carsRaw.items.length : Array.isArray(carsRaw) ? carsRaw.length : 0,
        totalOrders: typeof ordersRaw?.total === 'number' ? ordersRaw.total : Array.isArray(ordersRaw?.items) ? ordersRaw.items.length : Array.isArray(ordersRaw) ? ordersRaw.length : 0,
        activeBookings: typeof bookingsRaw?.total === 'number' ? bookingsRaw.total : Array.isArray(bookingsRaw?.items) ? bookingsRaw.items.length : Array.isArray(bookingsRaw) ? bookingsRaw.length : 0,
      });
    } catch (error) {
      console.error('Failed to fetch system stats:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!currentConversation || !user || !inputMessage.trim()) return;

    const userMessage = inputMessage.trim();
    if (userMessage.length > 1000) {
      notify.error('Message too long', 'Please keep your message under 1000 characters.');
      return;
    }

    setInputMessage('');
    setIsTyping(true);

    try {
      await sendChatMessage(
        currentConversation.userId,
        currentConversation.carId,
        userMessage
      );
      notify.success('Message sent', 'Your message has been delivered successfully.');
      // Reload messages after sending to ensure the latest messages are displayed
      loadMessages(currentConversation.userId, currentConversation.carId);
    } catch (error) {
      console.error('Failed to send message:', error);
      notify.error('Message Failed', 'Failed to send your message. Please try again.');
    } finally {
      setIsTyping(false);
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputMessage(e.target.value);

    if (currentConversation) {
      if (e.target.value.length > 0) {
        startTyping(currentConversation.userId, currentConversation.carId);
      } else {
        stopTyping(currentConversation.userId, currentConversation.carId);
      }
    }
  };

  const filteredConversations = conversations.filter(conversation =>
    conversation.otherUser?.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conversation.lastMessage?.content?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // System chat functions
  const handleStatClick = (statType: string, statValue: number) => {
    setIsSystemChatMode(true);
    setCurrentConversation(null);

    const welcomeMessage = {
      _id: Date.now().toString(),
      content: `Hello! I'm your CarConnect system assistant. You clicked on ${statType} (${statValue}). What would you like to know about ${statType.toLowerCase()}? I can help you with:

• Detailed statistics and analytics
• System performance insights
• Data trends and patterns
• Administrative actions
• Reports and summaries

Just ask me anything!`,
      sender: { _id: 'system', fullname: 'System Assistant' },
      createdAt: new Date().toISOString(),
      isSystem: true
    };

    setSystemChatMessages([welcomeMessage]);
    notify.info('System Chat', `Opened system chat for ${statType}`);
  };

  const handleSystemMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage.trim();
    if (userMessage.length > 1000) {
      notify.error('Message too long', 'Please keep your message under 1000 characters.');
      return;
    }

    const newUserMessage = {
      _id: Date.now().toString(),
      content: userMessage,
      sender: { _id: user?.id || 'admin', fullname: user?.fullname || 'Admin' },
      createdAt: new Date().toISOString(),
      isSystem: false
    };

    setSystemChatMessages(prev => [...prev, newUserMessage]);
    setInputMessage('');
    setIsTyping(false);
    notify.success('Message sent', 'Your query has been sent to the system assistant.');
  };

  const exitSystemChat = () => {
    setIsSystemChatMode(false);
    setSystemChatMessages([]);
    notify.info('System Chat', 'Exited system chat mode');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-80 bg-primary text-primary-foreground flex flex-col">
          <div className="p-6 border-b border-primary-foreground/20">
            <div className="flex items-center gap-4 mb-4">
              <Button variant="ghost" onClick={() => navigate('/admin-dashboard')} className="text-primary-foreground hover:bg-primary-foreground/10">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </div>
            <h1 className="text-xl font-bold text-white">Support Chat</h1>
            <p className="text-sm text-primary-foreground/80">Manage user conversations</p>
          </div>

          {/* System Stats */}
          <div className="p-4 border-b border-primary-foreground/20">
            <h3 className="text-sm font-medium mb-3 text-white">System Overview</h3>
            <div className="grid grid-cols-2 gap-2">
              <div 
                className="bg-primary-foreground/10 rounded-lg p-3 text-center cursor-pointer hover:bg-primary-foreground/20 transition-all duration-200 hover:scale-105"
                onClick={() => handleStatClick('Users', systemStats.totalUsers)}
                title="Click to chat about users"
              >
                <div className="text-lg font-bold text-white">{systemStats.totalUsers}</div>
                <div className="text-xs text-primary-foreground/80">Users</div>
              </div>
              <div 
                className="bg-primary-foreground/10 rounded-lg p-3 text-center cursor-pointer hover:bg-primary-foreground/20 transition-all duration-200 hover:scale-105"
                onClick={() => handleStatClick('Cars', systemStats.totalCars)}
                title="Click to chat about cars"
              >
                <div className="text-lg font-bold text-white">{systemStats.totalCars}</div>
                <div className="text-xs text-primary-foreground/80">Cars</div>
              </div>
              <div 
                className="bg-primary-foreground/10 rounded-lg p-3 text-center cursor-pointer hover:bg-primary-foreground/20 transition-all duration-200 hover:scale-105"
                onClick={() => handleStatClick('Orders', systemStats.totalOrders)}
                title="Click to chat about orders"
              >
                <div className="text-lg font-bold text-white">{systemStats.totalOrders}</div>
                <div className="text-xs text-primary-foreground/80">Orders</div>
              </div>
              <div 
                className="bg-primary-foreground/10 rounded-lg p-3 text-center cursor-pointer hover:bg-primary-foreground/20 transition-all duration-200 hover:scale-105"
                onClick={() => handleStatClick('Bookings', systemStats.activeBookings)}
                title="Click to chat about bookings"
              >
                <div className="text-lg font-bold text-white">{systemStats.activeBookings}</div>
                <div className="text-xs text-primary-foreground/80">Bookings</div>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-primary-foreground/20">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-primary-foreground/60" />
              <Input
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-primary-foreground/10 border-primary-foreground/20 text-white placeholder:text-primary-foreground/60"
              />
            </div>
          </div>

          {/* Rooms List */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <h3 className="text-sm font-medium mb-3 text-white">Active Conversations</h3>
              {isLoadingConversations ? (
                <div className="text-center text-primary-foreground/80">
                  Loading conversations...
                </div>
              ) : conversationError ? (
                <div className="text-center text-red-400">
                  {conversationError}
                  <Button
                    variant="ghost"
                    className="mt-2 text-primary-foreground hover:bg-primary-foreground/10"
                    onClick={() => loadAdminConversations()}
                  >
                    Retry
                  </Button>
                </div>
              ) : conversations.length === 0 ? (
                <div className="text-center text-primary-foreground/80">
                  No conversations available
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredConversations.map((conversation) => (
                    <div
                      key={`${conversation.userId}-${conversation.carId}`}
                      className={`cursor-pointer transition-all duration-200 hover:bg-primary-foreground/10 rounded-lg p-3 ${
                        currentConversation?.userId === conversation.userId &&
                        currentConversation?.carId === conversation.carId
                          ? 'bg-primary-foreground/20'
                          : ''
                      }`}
                      onClick={() => {
                        setCurrentConversation(conversation);
                        loadMessages(conversation.carId, conversation.userId);
                      }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <User className="h-4 w-4 text-primary-foreground/80" />
                        <span className="text-sm font-medium text-white">
                          {conversation.otherUser?.fullname || 'Unknown User'}
                        </span>
                        {conversation.unreadCount > 0 && (
                          <Badge variant="secondary" className="text-xs bg-red-500 text-white">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-primary-foreground/70 truncate">
                        <p className="font-medium">
                          {conversation.car?.make || 'Unknown'} {conversation.car?.model || ''} {conversation.car?.year || ''}
                        </p>
                        {conversation.lastMessage && (
                          <p className="truncate">{conversation.lastMessage.content}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-gray-50">
          {/* Top Header */}
          <div className="bg-white border-b p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search or type"
                    className="pl-10 w-64"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                    3
                  </span>
                </Button>
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {user?.fullname?.charAt(0).toUpperCase() || 'A'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {(currentConversation || isSystemChatMode) ? (
            <>
              {/* Chat Header */}
              <div className="border-b p-4 bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-sm">
                      {isSystemChatMode ? 'AI' : 'S'}
                    </span>
                  </div>
                  <div>
                    <h2 className="font-semibold">
                      {isSystemChatMode ? 'System Assistant' : currentConversation?.otherUser?.fullname || 'Unknown User'}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {isSystemChatMode 
                        ? 'System analytics and insights'
                        : `${currentConversation?.car?.make || 'Unknown'} ${currentConversation?.car?.model || ''} ${currentConversation?.car?.year || ''}`
                      }
                    </p>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    {isConnected ? (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        <Wifi className="h-3 w-3 mr-1" />
                        Connected
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-orange-600 border-orange-600">
                        <WifiOff className="h-3 w-3 mr-1" />
                        Offline
                      </Badge>
                    )}
                    <Badge variant="outline">
                      <Shield className="h-3 w-3 mr-1" />
                      {isSystemChatMode ? 'System Chat' : 'Admin View'}
                    </Badge>
                    {isSystemChatMode && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={exitSystemChat}
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        Exit System Chat
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
{(isSystemChatMode ? systemChatMessages : messages).map((message) => (
  <div
    key={message._id}
    className={`flex items-end gap-2 ${
      message.sender._id === user?.id ? 'justify-end' : 'justify-start'
    }`}
  >
    {/* Client (left) avatar */}
    {message.sender._id !== user?.id && (
      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0 order-1">
        <span className="text-gray-800 font-bold text-sm">
          {isSystemChatMode && message.sender._id === 'system' 
            ? 'AI' 
            : message.sender.fullname?.charAt(0).toUpperCase() || 'C'}
        </span>
      </div>
    )}

    {/* Message bubble */}
    <div
      className={`max-w-[70%] rounded-2xl px-4 py-3 shadow-sm ${
        message.sender._id === user?.id
          ? 'bg-primary text-primary-foreground order-2'
          : 'bg-white border border-gray-200 text-gray-800 order-2'
      }`}
    >
      <div className="text-sm whitespace-pre-wrap">{message.content}</div>
      <div
        className={`text-xs mt-1 ${
          message.sender._id === user?.id 
            ? 'text-primary-foreground/70' 
            : 'text-gray-500'
        }`}
      >
        {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
    </div>

    {/* Admin (right) avatar */}
    {message.sender._id === user?.id && (
      <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 order-3">
        <span className="text-white font-bold text-sm">
          {user?.fullname?.charAt(0).toUpperCase() || 'A'}
        </span>
      </div>
    )}
  </div>
))}
                {(isTyping || isUserTyping) && (
                  <div className="flex justify-start items-end gap-2">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-gray-800 font-bold text-sm">
                        {isSystemChatMode ? 'AI' : 'C'}
                      </span>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="border-t p-4 bg-white">
                <div className="flex gap-3 items-end">
                  <div className="flex-1">
                    <Textarea
                      placeholder="Type your message here... (Press Enter to send, Shift+Enter for new line)"
                      value={inputMessage}
                      onChange={handleTyping}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          isSystemChatMode ? handleSystemMessage() : handleSendMessage();
                        }
                      }}
                      disabled={isTyping}
                      className="min-h-[60px] max-h-[120px] resize-none border-gray-300"
                      rows={2}
                    />
                    <div className="flex justify-between items-center mt-2">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {isSystemChatMode ? (
                          <span className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            System Chat Active
                          </span>
                        ) : isConnected ? (
                          <span className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            Connected
                          </span>
                        ) : (
                          <span className="text-orange-500">Offline - Messages will be sent when connection is restored</span>
                        )}
                        {isTyping && (
                          <span className="text-blue-500">{isSystemChatMode ? 'System is typing...' : 'User is typing...'}</span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {inputMessage.length}/1000
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={isSystemChatMode ? handleSystemMessage : handleSendMessage}
                    disabled={!inputMessage.trim() || isTyping || inputMessage.length > 1000}
                    className="bg-primary hover:bg-primary/90 transition-all duration-200 hover:scale-105 h-[60px] w-[60px]"
                    size="icon"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
                <p className="text-muted-foreground">Choose a user conversation from the sidebar to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSupportChat;