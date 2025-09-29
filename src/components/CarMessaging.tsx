import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Send, MessageCircle, User, Wifi, WifiOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';

interface CarMessagingProps {
  carId: string;
  sellerId: string;
  sellerName: string;
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
  sellerId,
  sellerName,
  carDetails
}) => {
  const { user } = useAuth();
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
  } = useChat();

  const [inputMessage, setInputMessage] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isSellerTyping, setIsSellerTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load messages when component mounts or car changes
  useEffect(() => {
    if (user && carId && sellerId && user.id !== sellerId) {
      loadMessages(carId, sellerId);
    }
  }, [user, carId, sellerId, loadMessages]);

  // Monitor typing indicators
  useEffect(() => {
    if (currentConversation) {
      const isTyping = typingUsers.has(sellerId);
      setIsSellerTyping(isTyping);
    }
  }, [typingUsers, sellerId, currentConversation]);

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
        markAsRead(messageIds, sellerId);
      }
    }
  }, [isExpanded, messages, user, sellerId, markAsRead]);

  const handleSendMessage = async () => {
    if (!user || !inputMessage.trim() || user.id === sellerId) return;

    const messageContent = inputMessage.trim();
    setInputMessage('');
    setIsTyping(true);

    try {
      await sendChatMessage(sellerId, carId, messageContent);
      setIsTyping(false);
    } catch (error) {
      console.error('Failed to send message:', error);
      setIsTyping(false);
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);

    if (e.target.value.length > 0) {
      startTyping(sellerId, carId);
    } else {
      stopTyping(sellerId, carId);
    }
  };

  const isMine = (msg: any) => msg.sender._id === user?.id;

  // Don't show messaging if user is the seller
  if (!user || user.id === sellerId) {
    return null;
  }

  const unreadCount = messages.filter(msg => 
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
                  <div className="font-medium">{sellerName}</div>
                  <div className="text-xs text-muted-foreground">
                    {carDetails.make} {carDetails.model} {carDetails.year}
                  </div>
                </div>
              </CardTitle>
              <div className="flex items-center gap-2">
                {isConnected ? (
                  <Badge variant="outline" className="text-green-600 border-green-600 text-xs">
                    <Wifi className="h-2 w-2 mr-1" />
                    Online
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-red-600 border-red-600 text-xs">
                    <WifiOff className="h-2 w-2 mr-1" />
                    Offline
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
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground text-sm py-8">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Start a conversation about this car</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg._id} className={`flex ${isMine(msg) ? 'justify-end' : 'justify-start'} items-end gap-1`}>
                  {!isMine(msg) && (
                    <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-primary-foreground font-bold text-xs">S</span>
                    </div>
                  )}
                  <div className={`max-w-[70%] rounded-lg px-3 py-2 text-sm ${
                    isMine(msg) 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-accent'
                  }`}>
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                    <div className={`text-xs mt-1 ${
                      isMine(msg) 
                        ? 'text-primary-foreground/70' 
                        : 'text-muted-foreground'
                    }`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
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
            {(isTyping || isSellerTyping) && (
              <div className="flex justify-start items-end gap-1">
                <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-foreground font-bold text-xs">S</span>
                </div>
                <div className="bg-accent rounded-lg px-3 py-2">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
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
                disabled={!isConnected || isTyping}
                className="text-sm"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || !isConnected || isTyping}
                className="bg-primary hover:bg-primary/90"
                size="sm"
              >
                <Send className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default CarMessaging;
