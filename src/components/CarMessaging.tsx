import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Send, MessageCircle, User, Wifi, WifiOff, Check, CheckCheck, Clock, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import { useToast } from '@/hooks/use-toast';

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

interface ChatMessage {
  _id: string;
  sender: { _id: string; fullname: string };
  recipient: { _id: string; fullname: string };
  content: string;
  car: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

const CarMessaging: React.FC<CarMessagingProps> = ({ carId, carDetails }) => {
  const { user, isAuthenticated } = useAuth();
  const chatContext = useSafeChat();
  const { toast } = useToast();

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
    markAsRead,
    connect,
  } = chatContext;

  // Local state for demo messages and instant UI updates
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const [hasLoadedDemo, setHasLoadedDemo] = useState(false);
  const [messageStatuses, setMessageStatuses] = useState<Map<string, 'sending' | 'sent' | 'delivered' | 'seen'>>(
    new Map()
  );

  // Admin ID - use the actual admin user ID from successful curl command
  const adminId = '68d5498abc621c37fe2b5fab';

  const [inputMessage, setInputMessage] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isSellerTyping, setIsSellerTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Handle reconnection
  const handleReconnect = async () => {
    try {
      await connect();
      toast({
        title: 'Reconnected',
        description: 'Successfully reconnected to the chat service.',
      });
    } catch (error) {
      console.error('Reconnection failed:', error);
      toast({
        title: 'Reconnection Failed',
        description: 'Could not reconnect to the chat service. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Load messages when component mounts or carId changes
  useEffect(() => {
    if (isAuthenticated && user && carId) {
      loadMessages(carId, adminId).catch((error) => {
        console.error('Failed to load messages:', error);
        toast({
          title: 'Error',
          description: 'Failed to load messages. Please try again later.',
          variant: 'destructive',
        });
      });
    }
  }, [carId, isAuthenticated, user, loadMessages, toast]);

  // Update local messages and statuses when messages change
  useEffect(() => {
    setLocalMessages(messages);
    // Update statuses for new messages
    const newStatuses = new Map(messageStatuses);
    messages.forEach((msg) => {
      if (!newStatuses.has(msg._id)) {
        newStatuses.set(msg._id, msg.read ? 'seen' : 'delivered');
      }
    });
    setMessageStatuses(newStatuses);
  }, [messages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [localMessages]);

  // Typing indicator logic
  useEffect(() => {
    const typingUser = Array.from(typingUsers)[0]; // Assuming single typing user for simplicity
    setIsSellerTyping(typingUser === adminId);
  }, [typingUsers]);

  // Handle input change for typing
  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);
    if (!isTyping && e.target.value.trim()) {
      startTyping(adminId, carId);
      setIsTyping(true);
    } else if (isTyping && !e.target.value.trim()) {
      stopTyping(adminId, carId);
      setIsTyping(false);
    }
  };

  // Handle message send with retry logic
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !isAuthenticated || !user) {
      toast({
        title: 'Error',
        description: 'Please log in to send a message.',
        variant: 'destructive',
      });
      return;
    }

    const tempId = Date.now().toString(); // Temporary ID for local message
    const newMessage: ChatMessage = {
      _id: tempId,
      sender: { _id: user._id, fullname: user.fullname },
      recipient: { _id: adminId, fullname: 'Admin One' },
      content: inputMessage,
      car: carId,
      read: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setLocalMessages((prev) => [...prev, newMessage]);
    setMessageStatuses((prev) => new Map(prev).set(tempId, 'sending'));
    setInputMessage('');
    if (isTyping) {
      stopTyping(adminId, carId);
      setIsTyping(false);
    }

    try {
      await sendChatMessage(adminId, carId, inputMessage);
      setMessageStatuses((prev) => new Map(prev).set(tempId, 'sent'));
      toast({
        title: 'Success',
        description: 'Message sent successfully.',
      });
    } catch (error) {
      console.error('Message send failed:', error);
      setMessageStatuses((prev) => new Map(prev).set(tempId, 'failed'));
      toast({
        title: 'Message Failed',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
      // Retry once after 5 seconds
      setTimeout(async () => {
        try {
          await sendChatMessage(adminId, carId, inputMessage);
          setMessageStatuses((prev) => new Map(prev).set(tempId, 'sent'));
          toast({
            title: 'Success',
            description: 'Message sent successfully after retry.',
          });
        } catch (retryError) {
          console.error('Retry failed:', retryError);
        }
      }, 5000);
    }
  };

  // Mark messages as read when viewed
  useEffect(() => {
    if (messages.length > 0 && currentConversation && isAuthenticated && user) {
      const unreadMessageIds = messages
        .filter((msg) => !msg.read && msg.sender._id !== user._id)
        .map((msg) => msg._id);
      if (unreadMessageIds.length > 0) {
        markAsRead(unreadMessageIds, adminId).catch((error) => {
          console.error('Failed to mark messages as read:', error);
        });
      }
    }
  }, [messages, currentConversation, isAuthenticated, user, markAsRead]);

  // Add demo messages if no real messages (for development)
  useEffect(() => {
    if (messages.length === 0 && !hasLoadedDemo && isAuthenticated && user) {
      const demoMessages: ChatMessage[] = [
        {
          _id: '1',
          sender: { _id: adminId, fullname: 'Admin One' },
          recipient: { _id: user._id, fullname: user.fullname },
          content: 'Hello! How can I help you with this car?',
          car: carId,
          read: false,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          updatedAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          _id: '2',
          sender: { _id: user._id, fullname: user.fullname },
          recipient: { _id: adminId, fullname: 'Admin One' },
          content: "I'm interested in this vehicle.",
          car: carId,
          read: true,
          createdAt: new Date(Date.now() - 1800000).toISOString(),
          updatedAt: new Date(Date.now() - 1800000).toISOString(),
        },
      ];
      setLocalMessages(demoMessages);
      setHasLoadedDemo(true);
    }
  }, [messages, hasLoadedDemo, isAuthenticated, user]);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">
            {carDetails.make} {carDetails.model} ({carDetails.year})
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Minimize' : <MessageCircle className="h-4 w-4" />}
          </Button>
        </CardHeader>
        {isExpanded && (
          <CardContent className="p-0">
            <div className="h-96 overflow-y-auto p-4 space-y-4">
              {localMessages.map((msg) => (
                <div
                  key={msg._id}
                  className={`flex ${msg.sender._id === user?._id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs p-3 rounded-lg ${
                      msg.sender._id === user?._id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <User className="h-3 w-3" />
                      <span className="text-xs font-semibold">
                        {msg.sender.fullname}
                      </span>
                    </div>
                    <p className="text-sm">{msg.content}</p>
                    <div className="flex items-center gap-1 mt-1 justify-end">
                      <span className="text-xs text-muted-foreground">
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {msg.sender._id === user?._id && (
                        <>
                          {messageStatuses.get(msg._id) === 'sending' && (
                            <Clock className="h-3 w-3" />
                          )}
                          {messageStatuses.get(msg._id) === 'sent' && (
                            <Check className="h-3 w-3" />
                          )}
                          {messageStatuses.get(msg._id) === 'delivered' && (
                            <CheckCheck className="h-3 w-3" />
                          )}
                          {messageStatuses.get(msg._id) === 'seen' && (
                            <CheckCheck className="h-3 w-3 text-blue-500" />
                          )}
                          {messageStatuses.get(msg._id) === 'failed' && (
                            <span className="text-xs text-red-500">Failed</span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {isSellerTyping && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    Admin is typing
                  </span>
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce"></div>
                    <div
                      className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce"
                      style={{ animationDelay: '0.1s' }}
                    ></div>
                    <div
                      className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce"
                      style={{ animationDelay: '0.2s' }}
                    ></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
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
                  disabled={isTyping && !inputMessage.trim()}
                  className="text-sm flex-1"
                  autoFocus={isExpanded}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || !isAuthenticated}
                  className="bg-primary hover:bg-primary/90 flex-shrink-0"
                  size="sm"
                >
                  <Send className="h-3 w-3" />
                </Button>
              </div>
              {!isConnected && (
                <div className="mt-2 text-xs text-muted-foreground flex items-center gap-2">
                  <WifiOff className="h-3 w-3" />
                  <span>Offline - Messages will be sent when connection is restored</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReconnect}
                    className="p-1"
                  >
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default CarMessaging;