import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Send, User, MessageCircle, Wifi, Bot } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useChat } from "@/contexts/ChatContext";
import { api } from "@/services/api";
import { notificationService } from "@/services/notifications";
import { notify } from "@/components/Notifier";

interface SupportMessage {
  _id: string;
  content: string;
  sender: string;
  createdAt: string;
  read: boolean;
  isTyping?: boolean;
}

interface SupportConversation {
  lastMessage: SupportMessage;
  unreadCount: number;
  otherUser: {
    _id: string;
    fullname: string;
    email: string;
    phone: string;
  };
  car: {
    _id: string;
    make: string;
    model: string;
    year: number;
    primaryImage: string;
  };
  userId: string;
  carId: string;
}

const Support = () => {
  const { user } = useAuth();
  const { isConnected } = useChat();
  
  const [inputMessage, setInputMessage] = useState("");
  const [supportMessages, setSupportMessages] = useState<SupportMessage[]>([]);
  const [conversations, setConversations] = useState<SupportConversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<SupportConversation | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    fetchConversations();
    initializeSupport();
  }, [user]);

  const initializeSupport = () => {
    const welcomeMessage: SupportMessage = {
      _id: 'welcome-1',
      content: `Hello ${user?.fullname || 'there'}! 👋

Welcome to CarConnect Support! Our support team is here to help you with:

• Questions about buying or selling cars
• Account and profile assistance  
• Booking and order inquiries
• Technical support and troubleshooting
• General platform guidance

How can we assist you today?`,
      sender: 'support',
      createdAt: new Date().toISOString(),
      read: true
    };

    setSupportMessages([welcomeMessage]);
  };

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await api.getAdminConversations();
      
      if (response.data) {
        const data = response.data;
        setConversations(data);
        
        // Find or create support conversation
        const supportConv = data.find((conv: SupportConversation) => 
          conv.car.make === 'Support' || conv.carId === 'support-general'
        );
        
        if (supportConv) {
          setCurrentConversation(supportConv);
          await fetchMessages(supportConv.carId, supportConv.otherUser._id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
      notify.error('Connection Error', 'Failed to load conversations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (carId: string, recipientId: string) => {
    try {
      const response = await api.getMessages(carId, recipientId);
      if (response.data) {
        setSupportMessages(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [supportMessages]);

  const handleSend = async () => {
    if (!user || !inputMessage.trim()) return;

    const userMessage = inputMessage.trim();
    
    // Validate message length
    if (userMessage.length > 1000) {
      notify.error('Message too long', 'Please keep your message under 1000 characters.');
      return;
    }

    // Add user message to local state immediately for better UX
    const userMsg: SupportMessage = {
      _id: `temp-${Date.now()}`,
      content: userMessage,
      sender: user.id,
      createdAt: new Date().toISOString(),
      read: false
    };

    setSupportMessages(prev => [...prev, userMsg]);
    setInputMessage("");
    setIsTyping(false);

    try {
      // Use the existing API service which handles the correct base URL
      const result = await api.sendMessage({
        recipientId: 'admin-support', // Support team ID
        carId: 'support-general', // Support conversation ID
        content: userMessage
      });

      if (result.data) {
        notify.success('Message sent', 'Your message has been sent to our support team.');
        
        // Update the local message with the real ID from server
        if (result.data.message) {
          setSupportMessages(prev => 
            prev.map(msg => 
              msg._id === userMsg._id ? { ...result.data.message, read: false } : msg
            )
          );
        }
        
        // Refresh conversations to update unread counts
        await fetchConversations();
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Failed to send support message:', error);
      notify.error('Message failed', 'Failed to send your message. Please try again.');
      
      // Remove the temporary message on error
      setSupportMessages(prev => prev.filter(msg => msg._id !== userMsg._id));
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputMessage(e.target.value);
  };

  const markMessagesAsRead = async (messageIds: string[]) => {
    try {
      const result = await api.markMessagesAsRead(messageIds);
      
      if (result.data && result.data.success) {
        // Update local state to mark messages as read
        setSupportMessages(prev => 
          prev.map(msg => 
            messageIds.includes(msg._id) ? { ...msg, read: true } : msg
          )
        );
      }
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
    }
  };

  // Mark messages as read when component mounts or messages change
  useEffect(() => {
    const unreadMessages = supportMessages.filter(msg => 
      !msg.read && msg.sender !== user?.id && msg.sender !== 'user'
    );
    
    if (unreadMessages.length > 0) {
      const messageIds = unreadMessages.map(msg => msg._id);
      markMessagesAsRead(messageIds);
    }
  }, [supportMessages, user]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/buyer-dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <MessageCircle className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Support</h1>
            </div>
          </div>

          {/* Connection Status - Only show when connected */}
          <div className="flex items-center gap-2">
            {isConnected && (
              <Badge variant="outline" className="text-green-600 border-green-600">
                <Wifi className="h-3 w-3 mr-1" />
                Connected
              </Badge>
            )}
          </div>
        </div>

        <Card className="h-[70vh] flex flex-col">
          <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-primary/10">
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">S</span>
              </div>
              Support Team
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="text-muted-foreground">Loading messages...</div>
              </div>
            ) : (
              supportMessages.map((message) => {
                const isUserMessage = message.sender === user?.id || message.sender === 'user';
                return (
                  <div key={message._id} className={`flex ${isUserMessage ? 'justify-end' : 'justify-start'} items-end gap-2`}>
                    {!isUserMessage && (
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="h-3 w-3 text-primary-foreground" />
                      </div>
                    )}
                    <div className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                      isUserMessage 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-white border shadow-sm'
                    }`}>
                      <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                      <div className={`text-xs mt-1 ${
                        isUserMessage 
                          ? 'text-primary-foreground/70' 
                          : 'text-muted-foreground'
                      }`}>
                        {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    {isUserMessage && (
                      <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>
                );
              })
            )}
            {isTyping && (
              <div className="flex justify-start items-end gap-2">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="h-3 w-3 text-primary-foreground" />
                </div>
                <div className="bg-white border shadow-sm rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </CardContent>
          <div className="border-t p-4">
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <Textarea
                  placeholder="Type your message here... (Press Enter to send, Shift+Enter for new line)"
                  value={inputMessage}
                  onChange={handleTyping}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  disabled={isTyping}
                  className="min-h-[60px] max-h-[120px] resize-none"
                  rows={2}
                />
                <div className="flex justify-between items-center mt-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {isConnected && (
                      <span className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Connected
                      </span>
                    )}
                    {isTyping && <span className="text-blue-500">Support is typing...</span>}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {inputMessage.length}/1000
                  </div>
                </div>
              </div>
              <Button
                onClick={handleSend}
                disabled={!inputMessage.trim() || isTyping || inputMessage.length > 1000}
                className="bg-primary hover:bg-primary/90 transition-all duration-200 hover:scale-105 h-[60px] w-[60px]"
                size="icon"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Support;