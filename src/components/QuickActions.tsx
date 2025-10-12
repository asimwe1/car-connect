import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Plus, Car, DollarSign } from 'lucide-react';

const QuickActions: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 md:mb-8">
      <Link to="/admin/add-car">
        <Card className="bg-card/80 backdrop-blur-sm border border-border hover:shadow-card transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <Plus className="w-8 h-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-1">Add New Car</h3>
            <p className="text-sm text-muted-foreground">Create listing</p>
          </CardContent>
        </Card>
      </Link>
      <Link to="/admin/cars">
        <Card className="bg-card/80 backdrop-blur-sm border border-border hover:shadow-card transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <Car className="w-8 h-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-1">Manage Cars</h3>
            <p className="text-sm text-muted-foreground">Edit listings</p>
          </CardContent>
        </Card>
      </Link>
      <Link to="/admin/orders">
        <Card className="bg-card/80 backdrop-blur-sm border border-border hover:shadow-card transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <DollarSign className="w-8 h-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-1">View Orders</h3>
            <p className="text-sm text-muted-foreground">Sales tracking</p>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
};

export default QuickActions;