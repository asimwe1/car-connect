import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, User, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ensureUserRoom, subscribeToMessages, sendMessage, ChatMessage } from "@/services/chat";
import { boltAI, SystemContext } from "@/services/boltAI";
import { api } from "@/services/api";

const Support = () => {
  const { user } = useAuth();
  const [roomId, setRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [systemContext, setSystemContext] = useState<SystemContext>({
    totalUsers: 0,
    totalCars: 0,
    totalOrders: 0,
    activeBookings: 0
  });
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    ensureUserRoom(user._id).then((id) => setRoomId(id));
    fetchSystemContext();
  }, [user]);

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
    if (!roomId) return;
    const unsub = subscribeToMessages(roomId, setMessages);
    return () => unsub();
  }, [roomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!roomId || !user || !inputMessage.trim()) return;
    
    // Send user message
    await sendMessage(roomId, {
      content: inputMessage.trim(),
      senderId: user._id,
      senderName: user.fullname,
    });
    
    const userMessage = inputMessage.trim();
    setInputMessage("");
    setIsTyping(true);

    // Generate AI response
    try {
      const aiResponse = await boltAI.generateResponse(userMessage, systemContext, false);
      
      // Send AI response
      setTimeout(async () => {
        await sendMessage(roomId, {
          content: aiResponse.response,
          senderId: 'ai-assistant',
          senderName: 'AI Assistant',
        });
        setIsTyping(false);
      }, 1000 + Math.random() * 1000);
    } catch (error) {
      console.error('AI response error:', error);
      setIsTyping(false);
    }
  };

  const isMine = (m: ChatMessage) => m.senderId === user?._id;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => navigate('/buyer-dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <MessageCircle className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Support</h1>
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
            {messages.map((m) => (
              <div key={m.id} className={`flex ${isMine(m) ? 'justify-end' : 'justify-start'} items-end gap-2`}>
                {!isMine(m) && (
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary-foreground font-bold text-xs">S</span>
                  </div>
                )}
                <div className={`max-w-[70%] rounded-2xl px-4 py-3 ${isMine(m) ? 'bg-primary text-primary-foreground' : 'bg-accent'}`}>
                  <div className="text-sm whitespace-pre-wrap">{m.content}</div>
                  <div className={`text-xs mt-1 ${isMine(m) ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                    {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                {isMine(m) && (
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
          </CardContent>
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                placeholder="Ask any question..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                disabled={!roomId}
              />
              <Button 
                onClick={handleSend} 
                disabled={!inputMessage.trim() || !roomId || isTyping}
                className="bg-primary hover:bg-primary/90 transition-all duration-200 hover:scale-105"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Support;