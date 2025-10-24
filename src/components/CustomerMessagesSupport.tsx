import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { MessageCircle, User, Clock } from 'lucide-react';
import { api } from '@/services/api';

interface Message {
  _id: string;
  sender: { _id: string; fullname: string };
  content: string;
  isRead: boolean;
  carDetails?: { make: string; model: string };
  createdAt: string;
}

interface CustomerMessagesSupportProps {
  // This component will fetch its own data
}

const CustomerMessagesSupport: React.FC<CustomerMessagesSupportProps> = () => {
  const [recentMessages, setRecentMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchCustomerMessages();
  }, []);

  const fetchCustomerMessages = async () => {
    try {
      setLoading(true);
      const response = await api.getAdminConversations();
      
      if (response.data) {
        const conversations = response.data;
        
        // Filter for support conversations and extract messages
        const supportConversations = conversations.filter((conv: any) => 
          conv.carId === 'support-general' || conv.car?.make === 'Support'
        );
        
        const allMessages: Message[] = [];
        let totalUnread = 0;
        
        supportConversations.forEach((conv: any) => {
          // Add the last message from each support conversation
          if (conv.lastMessage) {
            allMessages.push({
              _id: conv.lastMessage._id,
              sender: { _id: conv.lastMessage.sender, fullname: conv.otherUser.fullname },
              content: conv.lastMessage.content,
              isRead: conv.lastMessage.read,
              carDetails: { make: 'Support', model: 'General' },
              createdAt: conv.lastMessage.createdAt
            });
            
            if (!conv.lastMessage.read && conv.lastMessage.sender !== 'admin-support') {
              totalUnread++;
            }
          }
          
          totalUnread += conv.unreadCount || 0;
        });
        
        // Sort by creation date and take the most recent 5
        const sortedMessages = allMessages
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5);
        
        setRecentMessages(sortedMessages);
        setUnreadCount(totalUnread);
      }
    } catch (error) {
      console.error('Failed to fetch customer messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <Card className="bg-card/80 backdrop-blur-sm border border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Customer Messages
            </CardTitle>
            <CardDescription>Latest customer inquiries and support requests</CardDescription>
          </div>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="animate-pulse">
              {unreadCount} new
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Loading messages...</p>
            </div>
          ) : recentMessages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No recent messages</p>
              <p className="text-xs mt-1">Customer messages will appear here</p>
            </div>
          ) : (
            recentMessages.map((message) => (
              <div
                key={message._id}
                className="flex items-start gap-3 p-3 bg-accent/10 rounded-lg hover:bg-accent/20 transition-colors cursor-pointer"
                onClick={() => {
                  // Navigate to the specific conversation
                  window.location.href = `/admin/support-chat?conversation=${message.sender._id}`;
                }}
              >
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm truncate">
                      {message.sender.fullname}
                    </p>
                    {!message.isRead && (
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{message.content}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">
                      {message.carDetails?.make} {message.carDetails?.model}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{formatTime(message.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        {recentMessages.length > 0 && (
          <div className="mt-4 pt-3 border-t">
            <Link to="/admin/support-chat">
              <Button variant="outline" size="sm" className="w-full">
                <MessageCircle className="w-4 h-4 mr-2" />
                View All Messages
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CustomerMessagesSupport;
