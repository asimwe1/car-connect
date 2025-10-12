import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Search, Filter, Car, Clock, User } from 'lucide-react';

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

interface ConversationListProps {
  conversations: CustomerConversation[];
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedConversation: CustomerConversation | null;
  setSelectedConversation: (conversation: CustomerConversation | null) => void;
  loading: boolean;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  searchTerm,
  setSearchTerm,
  selectedConversation,
  setSelectedConversation,
  loading,
}) => {
  const filteredConversations = conversations.filter(conv =>
    conv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.carDetails.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.carDetails.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
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
          {loading ? (
            <div className="p-4 text-center text-muted-foreground">
              <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50 animate-spin" />
              <p>Loading conversations...</p>
            </div>
          ) : filteredConversations.length === 0 ? (
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
  );
};

export default ConversationList;