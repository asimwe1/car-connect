import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Send,
  User,
  MessageCircle,
  Users,
  Search,
  Clock,
  Shield,
  Bell
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import { api } from '@/services/api';
import { boltAI } from '@/services/boltAI';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/admin-dashboard');
      return;
    }
    fetchSystemStats();
    loadConversations();
  }, [user, navigate]);

  useEffect(() => {
    // Auto-select first conversation if available
    if (conversations.length > 0 && !currentConversation) {
      const firstConversation = conversations[0];
      setCurrentConversation(firstConversation);
      loadMessages(firstConversation.carId, firstConversation.userId);
    }
  }, [conversations, currentConversation]);

  // Monitor typing indicators
  useEffect(() => {
    if (currentConversation) {
      const isTyping = typingUsers.has(currentConversation.userId);
      setIsUserTyping(isTyping);
    }
  }, [typingUsers, currentConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchSystemStats = async () => {
    try {
      const [carsRes, usersRes, ordersRes, bookingsRes] = await Promise.all([
        api.getCars({ page: 1, limit: 1 }),
        api.getUsers({ page: 1, limit: 1 }),
        api.getAdminOrders({ page: 1, limit: 1 }),
        api.getAdminBookings({ page: 1, limit: 1 }),
      ]);

      const carsRaw: any = (carsRes as any)?.data;
      const usersRaw: any = (usersRes as any)?.data;
      const ordersRaw: any = (ordersRes as any)?.data;
      const bookingsRaw: any = (bookingsRes as any)?.data;

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
    setInputMessage('');
    setIsTyping(true);

    try {
      // Send admin message
      await sendChatMessage(
        currentConversation.userId,
        currentConversation.carId,
        userMessage
      );

      // Generate AI response with system context
      const aiResponse = await boltAI.generateResponse(userMessage, systemStats, true);

      // Send AI response
      setTimeout(async () => {
        await sendChatMessage(
          currentConversation.userId,
          currentConversation.carId,
          aiResponse.response
        );
        setIsTyping(false);
      }, 1000);
    } catch (error) {
      console.error('Failed to send message:', error);
      setIsTyping(false);
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    conversation.otherUser.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conversation.lastMessage?.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              <div className="bg-primary-foreground/10 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-white">{systemStats.totalUsers}</div>
                <div className="text-xs text-primary-foreground/80">Users</div>
              </div>
              <div className="bg-primary-foreground/10 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-white">{systemStats.totalCars}</div>
                <div className="text-xs text-primary-foreground/80">Cars</div>
              </div>
              <div className="bg-primary-foreground/10 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-white">{systemStats.totalOrders}</div>
                <div className="text-xs text-primary-foreground/80">Orders</div>
              </div>
              <div className="bg-primary-foreground/10 rounded-lg p-3 text-center">
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
              <div className="space-y-2">
                {filteredConversations.map((conversation) => (
                  <div
                    key={`${conversation.userId}-${conversation.carId}`}
                    className={`cursor-pointer transition-all duration-200 hover:bg-primary-foreground/10 rounded-lg p-3 ${currentConversation?.userId === conversation.userId &&
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
                      <span className="text-sm font-medium text-white">{conversation.otherUser.fullname}</span>
                      {conversation.unreadCount > 0 && (
                        <Badge variant="secondary" className="text-xs bg-red-500 text-white">
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-primary-foreground/70 truncate">
                      <p className="font-medium">{conversation.car.make} {conversation.car.model} {conversation.car.year}</p>
                      {conversation.lastMessage && (
                        <p className="truncate">{conversation.lastMessage.content}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
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
                  <User className="h-4 w-4 text-white" />
                </div>
              </div>
            </div>
          </div>

          {currentConversation ? (
            <>
              {/* Chat Header */}
              <div className="border-b p-4 bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-sm">S</span>
                  </div>
                  <div>
                    <h2 className="font-semibold">{currentConversation.otherUser.fullname}</h2>
                    <p className="text-sm text-muted-foreground">
                      {currentConversation.car.make} {currentConversation.car.model} {currentConversation.car.year}
                    </p>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    {isConnected ? (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        <Wifi className="h-3 w-3 mr-1" />
                        Connected
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-red-600 border-red-600">
                        <WifiOff className="h-3 w-3 mr-1" />
                        Disconnected
                      </Badge>
                    )}
                    <Badge variant="outline">
                      <Shield className="h-3 w-3 mr-1" />
                      Admin View
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.map((message) => (
                  <div key={message._id} className={`flex ${message.sender._id === user?.id ? 'justify-end' : 'justify-start'} items-end gap-2`}>
                    {message.sender._id !== user?.id && (
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-primary-foreground font-bold text-xs">S</span>
                      </div>
                    )}
                    <div className={`max-w-[70%] rounded-2xl px-4 py-3 ${message.sender._id === user?.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-white border'
                      }`}>
                      <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                      <div className={`text-xs mt-1 ${message.sender._id === user?.id
                          ? 'text-primary-foreground/70'
                          : 'text-muted-foreground'
                        }`}>
                        {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    {message.sender._id === user?.id && (
                      <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>
                ))}
                {(isTyping || isUserTyping) && (
                  <div className="flex justify-start items-end gap-2">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-primary-foreground font-bold text-xs">S</span>
                    </div>
                    <div className="bg-white border rounded-2xl px-4 py-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t p-4 bg-white">
                <div className="flex gap-2">
                  <Input
                    placeholder="Ask any question..."
                    value={inputMessage}
                    onChange={handleTyping}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    disabled={!isConnected || isTyping}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || !isConnected || isTyping}
                    className="bg-primary hover:bg-primary/90 transition-all duration-200 hover:scale-105"
                    size="icon"
                  >
                    <Send className="h-4 w-4" />
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

