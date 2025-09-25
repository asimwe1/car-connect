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
import { 
  subscribeToAllRoomsForSupport, 
  subscribeToMessages, 
  sendMessage, 
  ChatRoom, 
  ChatMessage 
} from '@/services/chat';
import { api } from '@/services/api';
import { boltAI } from '@/services/boltAI';

const AdminSupportChat = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    totalCars: 0,
    totalOrders: 0,
    activeBookings: 0
  });
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/admin-dashboard');
      return;
    }
    fetchSystemStats();
  }, [user, navigate]);

  useEffect(() => {
    // Auto-select first room if available
    if (rooms.length > 0 && !selectedRoom) {
      setSelectedRoom(rooms[0].id || null);
    }
  }, [rooms, selectedRoom]);

  useEffect(() => {
    const unsubscribe = subscribeToAllRoomsForSupport(setRooms);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!selectedRoom) return;
    const unsubscribe = subscribeToMessages(selectedRoom, setMessages);
    return () => unsubscribe();
  }, [selectedRoom]);

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
    if (!selectedRoom || !user || !inputMessage.trim()) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setIsTyping(true);

    // Send admin message
    await sendMessage(selectedRoom, {
      content: userMessage,
      senderId: user._id,
      senderName: `Admin: ${user.fullname}`,
    });

    // Generate AI response with system context
    try {
      const aiResponse = await boltAI.generateResponse(userMessage, systemStats, true);
      
      // Send AI response
      setTimeout(async () => {
        await sendMessage(selectedRoom, {
          content: aiResponse.response,
          senderId: 'ai-assistant',
          senderName: 'AI Assistant',
        });
        setIsTyping(false);
      }, 1000);
    } catch (error) {
      console.error('AI response error:', error);
      setIsTyping(false);
    }
  };

  const filteredRooms = rooms.filter(room => 
    room.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.lastMessage?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedRoomData = rooms.find(room => room.id === selectedRoom);

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-80 bg-card/80 backdrop-blur-sm border-r border-border flex flex-col">
          <div className="p-6 border-b">
            <div className="flex items-center gap-4 mb-4">
              <Button variant="ghost" onClick={() => navigate('/admin-dashboard')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </div>
            <h1 className="text-xl font-bold">Support Chat</h1>
            <p className="text-sm text-muted-foreground">Manage user conversations</p>
          </div>

          {/* System Stats */}
          <div className="p-4 border-b">
            <h3 className="text-sm font-medium mb-3">System Overview</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-accent/50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-primary">{systemStats.totalUsers}</div>
                <div className="text-xs text-muted-foreground">Users</div>
              </div>
              <div className="bg-accent/50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-primary">{systemStats.totalCars}</div>
                <div className="text-xs text-muted-foreground">Cars</div>
              </div>
              <div className="bg-accent/50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-primary">{systemStats.totalOrders}</div>
                <div className="text-xs text-muted-foreground">Orders</div>
              </div>
              <div className="bg-accent/50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-primary">{systemStats.activeBookings}</div>
                <div className="text-xs text-muted-foreground">Bookings</div>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Rooms List */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <h3 className="text-sm font-medium mb-3">Active Conversations</h3>
              <div className="space-y-2">
                {filteredRooms.map((room) => (
                  <Card 
                    key={room.id}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] ${
                      selectedRoom === room.id ? 'bg-primary/10 border-primary shadow-md' : 'hover:bg-accent/50 border-border'
                    }`}
                    onClick={() => setSelectedRoom(room.id || null)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">User {room.userId.slice(-6)}</span>
                        <Badge variant="secondary" className="text-xs">Active</Badge>
                      </div>
                      {room.lastMessage && (
                        <p className="text-xs text-muted-foreground truncate">
                          {room.lastMessage}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedRoom ? (
            <>
              {/* Chat Header */}
              <div className="border-b p-4 bg-gradient-to-r from-primary/5 to-primary/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-sm">S</span>
                  </div>
                  <div>
                    <h2 className="font-semibold">Support Team</h2>
                    <p className="text-sm text-muted-foreground">Chat with User {selectedRoomData?.userId.slice(-6)}</p>
                  </div>
                  <Badge variant="outline" className="ml-auto">
                    <Shield className="h-3 w-3 mr-1" />
                    Admin View
                  </Badge>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.senderId === user?._id ? 'justify-end' : 'justify-start'} items-end gap-2`}>
                    {message.senderId !== user?._id && (
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-primary-foreground font-bold text-xs">S</span>
                      </div>
                    )}
                    <div className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                      message.senderId === user?._id 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-accent'
                    }`}>
                      <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                      <div className={`text-xs mt-1 ${
                        message.senderId === user?._id 
                          ? 'text-primary-foreground/70' 
                          : 'text-muted-foreground'
                      }`}>
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    {message.senderId === user?._id && (
                      <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start items-end gap-2">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-primary-foreground font-bold text-xs">S</span>
                    </div>
                    <div className="bg-accent rounded-2xl px-4 py-3">
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
              <div className="border-t p-4 bg-card">
                <div className="flex gap-2">
                  <Input
                    placeholder="Ask any question..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    disabled={isTyping}
                  />
                  <Button 
                    onClick={handleSendMessage} 
                    disabled={!inputMessage.trim() || isTyping}
                    className="bg-primary hover:bg-primary/90 transition-all duration-200 hover:scale-105"
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

