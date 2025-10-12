import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle } from 'lucide-react';
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
}

interface ChatInterfaceProps {
  selectedConversation: CustomerConversation | null;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ selectedConversation }) => {
  return (
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
  );
};

export default ChatInterface;