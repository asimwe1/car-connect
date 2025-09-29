import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Send, User, MessageCircle, Wifi, WifiOff, Bot } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useChat } from "@/contexts/ChatContext";
import { boltAI, SystemContext } from "@/services/boltAI";
import { api } from "@/services/api";
import { notificationService } from "@/services/notifications";
import { notify } from "@/components/Notifier";

interface SupportMessage {
  id: string;
  content: string;
  sender: 'user' | 'support';
  timestamp: Date;
  isTyping?: boolean;
}

const Support = () => {
  const { user } = useAuth();
  const { isConnected } = useChat();
  
  const [inputMessage, setInputMessage] = useState("");
  const [supportMessages, setSupportMessages] = useState<SupportMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [systemContext, setSystemContext] = useState<SystemContext>({
    totalUsers: 0,
    totalCars: 0,
    totalOrders: 0,
    activeBookings: 0
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    fetchSystemContext();
    initializeSupport();
  }, [user]);

  const initializeSupport = () => {
    const welcomeMessage: SupportMessage = {
      id: '1',
      content: `Hello ${user?.fullname || 'there'}! 👋

Welcome to CarHub Support! I'm your AI assistant and I'm here to help you with:

• Questions about buying or selling cars
• Account and profile assistance  
• Booking and order inquiries
• Technical support and troubleshooting
• General platform guidance

How can I assist you today?`,
      sender: 'support',
      timestamp: new Date()
    };

    setSupportMessages([welcomeMessage]);
  };

  const fetchSystemContext = async () => {
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

      setSystemContext({
        totalUsers: typeof usersRaw?.total === 'number' ? usersRaw.total : Array.isArray(usersRaw?.items) ? usersRaw.items.length : Array.isArray(usersRaw) ? usersRaw.length : 0,
        totalCars: typeof carsRaw?.total === 'number' ? carsRaw.total : Array.isArray(carsRaw?.items) ? carsRaw.items.length : Array.isArray(carsRaw) ? carsRaw.length : 0,
        totalOrders: typeof ordersRaw?.total === 'number' ? ordersRaw.total : Array.isArray(ordersRaw?.items) ? ordersRaw.items.length : Array.isArray(ordersRaw) ? ordersRaw.length : 0,
        activeBookings: typeof bookingsRaw?.total === 'number' ? bookingsRaw.total : Array.isArray(bookingsRaw?.items) ? bookingsRaw.items.length : Array.isArray(bookingsRaw) ? bookingsRaw.length : 0,
      });
    } catch (error) {
      console.error('Failed to fetch system context:', error);
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

    // Add user message
    const userMsg: SupportMessage = {
      id: Date.now().toString(),
      content: userMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setSupportMessages(prev => [...prev, userMsg]);
    setInputMessage("");
    setIsTyping(true);

    try {
      // Simulate sending to backend (you can integrate real API here)
      notify.success('Message sent', 'Your message has been sent to support.');

      // Generate AI response
      const aiResponse = await boltAI.generateResponse(userMessage, systemContext, false);

      // Add AI response after delay
      setTimeout(() => {
        const supportMsg: SupportMessage = {
          id: (Date.now() + 1).toString(),
          content: aiResponse.response,
          sender: 'support',
          timestamp: new Date()
        };

        setSupportMessages(prev => [...prev, supportMsg]);
        setIsTyping(false);

        // Trigger notification for support response
        notificationService.simulateNotification(
          'success',
          'chat',
          'Support Response',
          'You received a response from our support team'
        );
      }, 1500 + Math.random() * 1000);

    } catch (error) {
      console.error('Failed to get support response:', error);
      notify.error('Support Error', 'Failed to get response from support. Please try again.');
      setIsTyping(false);
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputMessage(e.target.value);
  };

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
            {supportMessages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} items-end gap-2`}>
                {message.sender === 'support' && (
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="h-3 w-3 text-primary-foreground" />
                  </div>
                )}
                <div className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                  message.sender === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-white border shadow-sm'
                }`}>
                  <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                  <div className={`text-xs mt-1 ${
                    message.sender === 'user' 
                      ? 'text-primary-foreground/70' 
                      : 'text-muted-foreground'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                {message.sender === 'user' && (
                  <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>
            ))}
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