import React, { useEffect, useMemo, useState } from 'react';
type ListingType = 'sell' | 'rent';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SellCarTab, { SellCarTabProps } from '@/components/SellCarTab';
import RentCarTab from '@/components/RentCarTab';
import CarRentTab from '@/components/CarRentTab';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const ListCar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  const initialTab = useMemo(() => {
    const params = new URLSearchParams(location.search);
    // Check for explicit parameters first
    if (params.has('rent')) return 'rent';
    if (params.has('sell')) return 'sell';
    
    // Check for simple query strings
    if (location.search === '?rent') return 'rent';
    if (location.search === '?sell') return 'sell';
    
    // Check if rent or sell is in the search string
    if (location.search.includes('rent')) return 'rent';
    if (location.search.includes('sell')) return 'sell';
    
    // Default to sell
    return 'sell';
  }, [location.search]);

  const [tab, setTab] = useState<ListingType>(initialTab as ListingType);
  const [isLocked, setIsLocked] = useState<boolean>(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setIsLocked(
      params.has('rent') || params.has('sell') || 
      location.search === '?rent' || location.search === '?sell' ||
      location.search.includes('rent') || location.search.includes('sell')
    );
  }, [location.search]);

  useEffect(() => {
    setIsLoading(true);
    const t = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(t);
  }, [tab]);

  const handleTabChange = (value: string) => {
    const next = (value === 'rent' ? 'rent' : 'sell') as 'sell' | 'rent';
    setTab(next);
    navigate(`/list-car?${next}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-primary/10">
      <div className="container mx-auto px-4 py-10">
        <div className="mb-4">
          <Button variant="ghost" onClick={() => navigate(user?.role === 'admin' ? '/admin-dashboard' : '/buyer-dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
        <Card className="bg-card/80 backdrop-blur-sm border border-border">
          <CardContent className="p-6">
            <Tabs value={tab} onValueChange={handleTabChange} className="w-full">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">List Your Vehicle</h1>
                <TabsList>
                  <TabsTrigger value="sell">Sell</TabsTrigger>
                  <TabsTrigger value="rent">Rent</TabsTrigger>
                </TabsList>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <LoadingSpinner />
                </div>
              ) : (
                <>
                  <TabsContent value="sell" className="mt-0">
                    <SellCarTab listingType={tab} isLocked={isLocked} />
                  </TabsContent>
                  <TabsContent value="rent" className="mt-0">
                    <SellCarTab listingType={tab} isLocked={isLocked} />
                  </TabsContent>
                </>
              )}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ListCar;

