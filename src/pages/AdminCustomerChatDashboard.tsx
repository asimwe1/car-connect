import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  Search, 
  Users, 
  Car, 
  Clock, 
  User,
  ArrowLeft,
  Filter
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import AdminCustomerChat from '@/components/AdminCustomerChat';

interface CustomerConversation {
  customerId: string;
  customerName: string;
  carId: string;
  carDetails: {
    make: string;
    model: string;
    year: number;
    price: number;
    primaryImage?: string;
  };
  lastMessage?: {
    content: string;
    createdAt: string;
    sender: string;
  };
  unreadCount: number;
}

const AdminCustomerChatDashboard = () => {
  const { user } = useAuth();
  const {
    conversations,
    loadConversations
  } = useChat();

  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<CustomerConversation | null>(null);
  const [customerConversations, setCustomerConversations] = useState<CustomerConversation[]>([]);

  // Load conversations when component mounts
  useEffect(() => {
    if (user && user.role === 'admin') {
      loadConversations();
    }
  }, [user, loadConversations]);

  // Process conversations to show customer-to-admin chats
  useEffect(() => {
    if (conversations) {
      const customerChats: CustomerConversation[] = conversations
        .filter(conv => conv.participants.some(p => p._id === 'admin-support'))
        .map(conv => {
          const customer = conv.participants.find(p => p._id !== 'admin-support');
          const lastMessage = conv.lastMessage;
          
          return {
            customerId: customer?._id || '',
            customerName: customer?.fullname || 'Unknown Customer',
            carId: conv.carId || '',
            carDetails: {
              make: 'Car',
              model: 'Details',
              year: 2024,
              price: 0,
              primaryImage: '/placeholder.svg'
            },
            lastMessage: lastMessage ? {
              content: lastMessage.content,
              createdAt: lastMessage.createdAt,
              sender: lastMessage.sender._id
            } : undefined,
            unreadCount: conv.unreadCount || 0
          };
        });
      
      setCustomerConversations(customerChats);
    }
  }, [conversations]);

  // Filter conversations based on search term
  const filteredConversations = customerConversations.filter(conv =>
    conv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.carDetails.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.carDetails.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Only show for admins
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
              <p className="text-muted-foreground">You need admin privileges to access this page.</p>
              <Button onClick={() => navigate('/')} className="mt-4">
                Go Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/admin')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Customer Support Chat</h1>
              <p className="text-muted-foreground">Manage customer inquiries and support requests</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-green-600 border-green-600">
              <Users className="h-3 w-3 mr-1" />
              {customerConversations.length} Conversations
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversations List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Customer Conversations
              </CardTitle>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search customers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-96 overflow-y-auto">
                {filteredConversations.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No conversations found</p>
                  </div>
                ) : (
                  filteredConversations.map((conv) => (
                    <div
                      key={`${conv.customerId}-${conv.carId}`}
                      className={`p-4 border-b cursor-pointer hover:bg-muted/50 ${
                        selectedConversation?.customerId === conv.customerId && 
                        selectedConversation?.carId === conv.carId 
                          ? 'bg-primary/10 border-primary' 
                          : ''
                      }`}
                      onClick={() => setSelectedConversation(conv)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-medium text-sm truncate">{conv.customerName}</h3>
                            {conv.unreadCount > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {conv.unreadCount}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                            <Car className="h-3 w-3" />
                            <span className="truncate">{conv.carDetails.make} {conv.carDetails.model}</span>
                          </div>
                          {conv.lastMessage && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span className="truncate">{conv.lastMessage.content}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Chat Interface */}
          <Card className="lg:col-span-2">
            {selectedConversation ? (
              <AdminCustomerChat
                carId={selectedConversation.carId}
                customerId={selectedConversation.customerId}
                customerName={selectedConversation.customerName}
                carDetails={selectedConversation.carDetails}
              />
            ) : (
              <CardContent className="p-8 text-center">
                <MessageCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h2 className="text-xl font-semibold mb-2">Select a Conversation</h2>
                <p className="text-muted-foreground">
                  Choose a customer conversation from the list to start chatting
                </p>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminCustomerChatDashboard;
