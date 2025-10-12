import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { MessageCircle, User } from 'lucide-react';

interface Message {
  _id: string;
  sender?: { fullname?: string };
  content: string;
  isRead: boolean;
  carDetails?: { make: string; model: string };
  createdAt: string;
}

interface CustomerMessagesProps {
  recentMessages: Message[];
  unreadMessages: number;
}

const CustomerMessages: React.FC<CustomerMessagesProps> = ({ recentMessages, unreadMessages }) => {
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
          {unreadMessages > 0 && (
            <Badge variant="destructive" className="animate-pulse">
              {unreadMessages} new
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {recentMessages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No recent messages</p>
              <p className="text-xs mt-1">Customer messages will appear here</p>
            </div>
          ) : (
            recentMessages.map((message) => (
              <div
                key={message._id}
                className="flex items-start gap-3 p-3 bg-accent/10 rounded-lg hover:bg-accent/20 transition-colors"
              >
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm truncate">
                      {message.sender?.fullname || 'Customer'}
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
                    <span className="text-xs text-muted-foreground">
                      {new Date(message.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        {recentMessages.length > 0 && (
          <div className="mt-4 pt-3 border-t">
            <Link to="/admin/customer-chat">
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

export default CustomerMessages;