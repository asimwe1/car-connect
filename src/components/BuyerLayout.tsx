import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import BuyerSideBar from '@/components/BuyerSideBar';

const BuyerLayout: React.FC = () => {
  const location = useLocation();
  const showSidebar = location.pathname.startsWith('/buyer') || location.pathname === '/buyer-dashboard' || location.pathname.startsWith('/list-car');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-primary/10">
      <div className="flex">
        {showSidebar && (
          <aside className="hidden md:block w-64 bg-card/80 backdrop-blur-sm border-r border-border min-h-screen">
            <BuyerSideBar />
          </aside>
        )}
        <main className="flex-1 p-4 md:p-8">
          {!showSidebar && (
            <Card className="md:hidden mb-4 p-3">Use a wider screen to see the sidebar.</Card>
          )}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default BuyerLayout;


