import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Plus, Car, DollarSign } from 'lucide-react';

const QuickActions: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 md:mb-8">
      <Link to="/admin/add-car">
        <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950/20 dark:to-indigo-900/20 backdrop-blur-sm border border-indigo-200 dark:border-indigo-800 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300 cursor-pointer group">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold mb-1 text-indigo-800 dark:text-indigo-200">➕ Add New Car</h3>
            <p className="text-sm text-indigo-600 dark:text-indigo-400">Create listing</p>
          </CardContent>
        </Card>
      </Link>
      
      <Link to="/admin/cars">
        <Card className="bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-950/20 dark:to-teal-900/20 backdrop-blur-sm border border-teal-200 dark:border-teal-800 hover:shadow-lg hover:shadow-teal-500/10 transition-all duration-300 cursor-pointer group">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
              <Car className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold mb-1 text-teal-800 dark:text-teal-200">🚗 Manage Cars</h3>
            <p className="text-sm text-teal-600 dark:text-teal-400">Edit listings</p>
          </CardContent>
        </Card>
      </Link>
      
      <Link to="/admin/orders">
        <Card className="bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-950/20 dark:to-rose-900/20 backdrop-blur-sm border border-rose-200 dark:border-rose-800 hover:shadow-lg hover:shadow-rose-500/10 transition-all duration-300 cursor-pointer group">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-rose-600 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold mb-1 text-rose-800 dark:text-rose-200">💰 View Orders</h3>
            <p className="text-sm text-rose-600 dark:text-rose-400">Sales tracking</p>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
};

export default QuickActions;