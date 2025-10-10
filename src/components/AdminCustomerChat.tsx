import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Send, User, MessageCircle, Wifi, WifiOff, Car, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';

interface AdminCustomerChatProps {
  carId: string;
  customerId: string;
  customerName: string;
  carDetails: {
    make: string;
    model: string;
    year: number;
    price: number;
    primaryImage?: string;
  };
}

const AdminCustomerChat: React.FC<AdminCustomerChatProps> = ({
  carId,
  customerId,
  customerName,
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
  const [isTyping, setIsTyping] = useState(false);
  const [isCustomerTyping, setIsCustomerTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load messages when component mounts
  useEffect(() => {
    if (user && carId && customerId) {
      loadMessages(carId, customerId);
    }
  }, [user, carId, customerId, loadMessages]);

  // Monitor typing indicators
  useEffect(() => {
    if (currentConversation) {
      const isTyping = typingUsers.has(customerId);
      setIsCustomerTyping(isTyping);
    }
  }, [typingUsers, customerId, currentConversation]);

  // Auto scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Mark messages as read when messages change
  useEffect(() => {
    if (messages.length > 0 && user) {
      const unreadMessages = messages.filter(msg => 
        !msg.isRead && msg.sender._id !== user.id
      );
      
      if (unreadMessages.length > 0) {
        const messageIds = unreadMessages.map(msg => msg._id);
        markAsRead(messageIds, customerId).catch(console.error);
      }
    }
  }, [messages, user, customerId, markAsRead]);

  const handleSendMessage = async () => {
    if (!user || !inputMessage.trim() || user.role !== 'admin') return;

    const messageContent = inputMessage.trim();
    setInputMessage('');
    setIsTyping(true);

    try {
      console.log('Admin sending message:', { customerId, carId, content: messageContent });
      await sendChatMessage(customerId, carId, messageContent);
      setIsTyping(false);
    } catch (error) {
      console.error('Failed to send message:', error);
      setIsTyping(false);
      alert('Failed to send message. Please try again.');
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);

    if (e.target.value.length > 0) {
      startTyping(customerId, carId);
    } else {
      stopTyping(customerId, carId);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const isMine = (msg: any) => msg.sender._id === user?.id;

  // Only show for admins
  if (!user || user.role !== 'admin') {
    return null;
  }

  const unreadCount = messages.filter(msg => 
    !msg.isRead && msg.sender._id !== user.id
  ).length;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-primary/10">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <div className="font-medium">{customerName}</div>
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <Car className="h-4 w-4" />
                {carDetails.make} {carDetails.model} {carDetails.year}
              </div>
            </div>
          </CardTitle>
          <div className="flex items-center gap-2">
            {isConnected && (
              <Badge variant="outline" className="text-green-600 border-green-600">
                <Wifi className="h-3 w-3 mr-1" />
                Online
              </Badge>
            )}
            {!isConnected && (
              <Badge variant="outline" className="text-orange-600 border-orange-600">
                <WifiOff className="h-3 w-3 mr-1" />
                Offline
              </Badge>
            )}
            {unreadCount > 0 && (
              <Badge variant="destructive">
                {unreadCount} unread
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Messages */}
        <div className="h-96 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No messages yet</p>
                <p className="text-sm">Start the conversation with {customerName}</p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message._id}
                className={`flex ${isMine(message) ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    isMine(message)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <div className={`text-xs mt-1 flex items-center gap-1 ${
                    isMine(message) ? 'text-primary-foreground/70' : 'text-muted-foreground'
                  }`}>
                    <Clock className="h-3 w-3" />
                    {new Date(message.createdAt).toLocaleTimeString()}
                    {isMine(message) && message.isRead && (
                      <span className="ml-1">✓</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          
          {/* Typing indicator */}
          {isCustomerTyping && (
            <div className="flex justify-start">
              <div className="bg-muted px-4 py-2 rounded-lg">
                <div className="flex items-center gap-1">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                  <span className="text-xs text-muted-foreground ml-2">{customerName} is typing...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={handleTyping}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={isTyping}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping}
              className="bg-primary hover:bg-primary/90 flex-shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          {!isConnected && (
            <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
              <WifiOff className="h-3 w-3" />
              Offline - Messages will be sent when connection is restored
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminCustomerChat;
