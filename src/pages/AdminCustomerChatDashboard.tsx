import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ConversationList from '@/components/ConversationList';
import ChatInterface from '@/components/ChatInterface';
import Sidebar from '@/components/Sidebar';

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

const AdminCustomerChatDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { conversations, loadConversations } = useChat();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<CustomerConversation | null>(null);
  const [customerConversations, setCustomerConversations] = useState<CustomerConversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role === 'admin') {
      setLoading(true);
      loadConversations().finally(() => setLoading(false));
    }
  }, [user, loadConversations]);

  useEffect(() => {
    if (Array.isArray(conversations)) {
      const customerChats: CustomerConversation[] = conversations
        .filter(conv => Array.isArray(conv.participants) && conv.participants.some(p => p._id === 'admin-support'))
        .map(conv => {
          const customer = conv.participants.find(p => p._id !== 'admin-support');
          const lastMessage = conv.lastMessage;
          return {
            customerId: customer?._id || '',
            customerName: customer?.fullname || 'Unknown Customer',
            carId: conv.carId || '',
            carDetails: {
              make: conv.carDetails?.make || 'Car',
              model: conv.carDetails?.model || 'Details',
              year: conv.carDetails?.year || 2024,
              price: conv.carDetails?.price || 0,
              primaryImage: conv.carDetails?.primaryImage || '/placeholder.svg',
            },
            lastMessage: lastMessage ? {
              content: lastMessage.content,
              createdAt: lastMessage.createdAt,
              sender: lastMessage.sender._id,
            } : undefined,
            unreadCount: conv.unreadCount || 0,
          };
        });
      setCustomerConversations(customerChats);
    } else {
      setCustomerConversations([]);
    }
  }, [conversations]);

  const handleSignOut = async () => {
    await logout();
    navigate('/');
  };

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
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-primary/10">
      <div className="flex flex-col md:flex-row">
        <Sidebar handleSignOut={handleSignOut} />
        <div className="flex-1 md:ml-64 p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <ConversationList
                conversations={customerConversations}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                selectedConversation={selectedConversation}
                setSelectedConversation={setSelectedConversation}
                loading={loading}
              />
              <ChatInterface
                selectedConversation={selectedConversation}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCustomerChatDashboard;