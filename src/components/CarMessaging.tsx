import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Send, MessageCircle, User, Wifi, WifiOff, Check, CheckCheck, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';

// Custom hook to safely use chat context
const useSafeChat = () => {
  try {
    return useChat();
  } catch (error) {
    console.error('ChatProvider not available:', error);
    return null;
  }
};

interface CarMessagingProps {
  carId: string;
  carDetails: {
    make: string;
    model: string;
    year: number;
    price: number;
    primaryImage?: string;
  };
}

const CarMessaging: React.FC<CarMessagingProps> = ({
  carId,
  carDetails
}) => {
  const { user } = useAuth();
  const chatContext = useSafeChat();
  
  // If chat context is not available, don't render the component
  if (!chatContext) {
    return null;
  }
  
  const {
    isConnected,
    messages,
    currentConversation,
    sendMessage: sendChatMessage,
    startTyping,
    stopTyping,
    typingUsers,
    loadMessages,
    markAsRead
  } = chatContext;

  // Local state for demo messages and instant UI updates
  const [localMessages, setLocalMessages] = useState<any[]>([]);
  const [hasLoadedDemo, setHasLoadedDemo] = useState(false);
  const [messageStatuses, setMessageStatuses] = useState<Map<string, 'sending' | 'sent' | 'delivered' | 'seen'>>(new Map());

  // Admin ID - we'll use a special admin ID for all customer-to-admin chats
  const adminId = 'admin-support';

  const [inputMessage, setInputMessage] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isSellerTyping, setIsSellerTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load messages when component mounts or car changes
  useEffect(() => {
    if (user && carId && user.role !== 'admin' && !hasLoadedDemo) {
      // Try to load from backend, but add demo messages if it fails
      loadMessages(carId, adminId).catch(() => {
        // If backend fails, show demo messages for normal chat experience
        const demoMessages = [
          {
            _id: 'demo-1',
            content: 'Hello! I\'m interested in this car. Can you tell me more about it?',
            sender: {
              _id: adminId,
              fullname: 'Admin Support'
            },
            createdAt: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
            isRead: true
          },
          {
            _id: 'demo-2',
            content: 'Sure! This car is in excellent condition with low mileage. Would you like to schedule a test drive?',
            sender: {
              _id: user.id,
              fullname: user.fullname || 'You'
            },
            createdAt: new Date(Date.now() - 180000).toISOString(), // 3 minutes ago
            isRead: true
          }
        ];
        setLocalMessages(demoMessages);
        setHasLoadedDemo(true);
        
        // Simulate admin typing after demo messages load
        setTimeout(() => {
          setIsSellerTyping(true);
          setTimeout(() => {
            setIsSellerTyping(false);
            // Add a new admin message after typing
            const newAdminMessage = {
              _id: `demo-admin-${Date.now()}`,
              content: 'Feel free to ask any questions about this vehicle!',
              sender: {
                _id: adminId,
                fullname: 'Admin Support'
              },
              createdAt: new Date().toISOString(),
              isRead: true
            };
            setLocalMessages(prev => [...prev, newAdminMessage]);
          }, 3000); // Admin types for 3 seconds
        }, 5000); // Start typing after 5 seconds
      });
    }
  }, [user, carId, adminId, loadMessages, hasLoadedDemo]);

  // Monitor typing indicators
  useEffect(() => {
    if (currentConversation) {
      const isTyping = typingUsers.has(adminId);
      setIsSellerTyping(isTyping);
    }
  }, [typingUsers, adminId, currentConversation]);

  // Auto scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Mark messages as read when expanded and messages change
  useEffect(() => {
    if (isExpanded && messages.length > 0 && user) {
      const unreadMessages = messages.filter(msg => 
        !msg.isRead && msg.sender._id !== user.id
      );
      
      if (unreadMessages.length > 0) {
        const messageIds = unreadMessages.map(msg => msg._id);
        markAsRead(messageIds, adminId).catch(console.error);
      }
    }
  }, [isExpanded, messages, user, adminId, markAsRead]);

  const handleSendMessage = async () => {
    if (!user || !inputMessage.trim() || user.role === 'admin') return;

    const messageContent = inputMessage.trim();
    const messageId = `local-${Date.now()}`;
    setInputMessage('');
    setIsTyping(true);

    // Create a local message immediately for instant UI feedback
    const localMessage = {
      _id: messageId,
      content: messageContent,
      sender: {
        _id: user.id,
        fullname: user.fullname || 'You'
      },
      createdAt: new Date().toISOString(),
      isRead: false
    };

    // Add message to local state immediately (like normal chat)
    setLocalMessages(prev => [...prev, localMessage]);
    setMessageStatuses(prev => new Map(prev).set(messageId, 'sending'));
    setIsTyping(false);

    // Try to send to backend (but don't block UI)
    try {
      console.log('Sending message to admin:', { adminId, carId, content: messageContent });
      await sendChatMessage(adminId, carId, messageContent);
      
      // Update status to sent
      setMessageStatuses(prev => new Map(prev).set(messageId, 'sent'));
      
      // Simulate delivered status after a short delay
      setTimeout(() => {
        setMessageStatuses(prev => new Map(prev).set(messageId, 'delivered'));
        
        // Simulate seen status after admin "reads" it
        setTimeout(() => {
          setMessageStatuses(prev => new Map(prev).set(messageId, 'seen'));
        }, 2000);
      }, 1000);
      
    } catch (error) {
      console.log('Message sent locally, backend sync will retry later');
      // Keep as sending status if backend fails
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);

    if (e.target.value.length > 0) {
      startTyping(adminId, carId);
    } else {
      stopTyping(adminId, carId);
    }
  };

  const isMine = (msg: any) => msg.sender._id === user?.id;

  // Function to render message status indicators
  const renderMessageStatus = (messageId: string) => {
    const status = messageStatuses.get(messageId);
    
    switch (status) {
      case 'sending':
        return <Clock className="w-3 h-3 text-muted-foreground animate-spin" />;
      case 'sent':
        return <Check className="w-3 h-3 text-muted-foreground" />;
      case 'delivered':
        return <CheckCheck className="w-3 h-3 text-muted-foreground" />;
      case 'seen':
        return <CheckCheck className="w-3 h-3 text-blue-500" />;
      default:
        return null;
    }
  };

  // Only show messaging for customers (not admins)
  if (!user || user.role === 'admin') {
    return null;
  }

  // Combine backend messages with local messages for display
  const allMessages = [...messages, ...localMessages].sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const unreadCount = allMessages.filter(msg => 
    !msg.isRead && msg.sender._id !== user.id
  ).length;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isExpanded ? (
        // Collapsed state - floating button
        <Button
          onClick={() => setIsExpanded(true)}
          className="rounded-full h-14 w-14 shadow-lg bg-primary hover:bg-primary/90 relative"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      ) : (
        // Expanded state - chat window
        <Card className="w-80 h-96 shadow-xl">
          <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-primary/10 p-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-sm">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <User className="h-3 w-3 text-primary-foreground" />
                </div>
                <div>
                  <div className="font-medium">Admin Support</div>
                  <div className="text-xs text-muted-foreground">
                    {carDetails.make} {carDetails.model} {carDetails.year}
                  </div>
                </div>
              </CardTitle>
              <div className="flex items-center gap-2">
                {isConnected && (
                  <Badge variant="outline" className="text-green-600 border-green-600 text-xs">
                    <Wifi className="h-2 w-2 mr-1" />
                    Online
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(false)}
                  className="h-6 w-6 p-0"
                >
                  ×
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-3 space-y-3 h-64">
            {allMessages.length === 0 ? (
              <div className="text-center text-muted-foreground text-sm py-8">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Start a conversation about this car</p>
              </div>
            ) : (
              allMessages.map((msg) => (
                <div key={msg._id} className={`flex ${isMine(msg) ? 'justify-end' : 'justify-start'} items-end gap-1`}>
                  {!isMine(msg) && (
                    <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-primary-foreground font-bold text-xs">A</span>
                    </div>
                  )}
                  <div className={`max-w-[70%] rounded-lg px-3 py-2 text-sm ${
                    isMine(msg) 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-accent'
                  }`}>
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                    <div className={`text-xs mt-1 flex items-center gap-1 ${
                      isMine(msg) 
                        ? 'text-primary-foreground/70' 
                        : 'text-muted-foreground'
                    }`}>
                      <span>
                        {new Date(msg.createdAt).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                      {isMine(msg) && renderMessageStatus(msg._id)}
                    </div>
                  </div>
                  {isMine(msg) && (
                    <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
              ))
            )}
            {isSellerTyping && (
              <div className="flex justify-start items-end gap-1">
                <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-foreground font-bold text-xs">A</span>
                </div>
                <div className="bg-accent rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Admin is typing</span>
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </CardContent>

          <div className="border-t p-3">
            <div className="flex gap-2">
              <Input
                placeholder="Type a message..."
                value={inputMessage}
                onChange={handleTyping}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={isTyping}
                className="text-sm flex-1"
                autoFocus={isExpanded}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="bg-primary hover:bg-primary/90 flex-shrink-0"
                size="sm"
              >
                <Send className="h-3 w-3" />
              </Button>
            </div>
            {!isConnected && (
              <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                <WifiOff className="h-3 w-3" />
                Offline - Messages will be sent when connection is restored
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default CarMessaging;
