import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SellCarTab from '@/components/SellCarTab';
import CarRentTab from '@/components/CarRentTab';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useLocation, useNavigate } from 'react-router-dom';

const ListCar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  const initialTab = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const q = (params.get('sell') !== null || params.get('rent') !== null)
      ? (params.get('rent') !== null ? 'rent' : 'sell')
      : (location.search.includes('rent') ? 'rent' : location.search.includes('sell') ? 'sell' : 'sell');
    // Also support /list-car?sell and /list-car?rent shortcuts
    if (location.search === '?rent') return 'rent';
    if (location.search === '?sell') return 'sell';
    return q;
  }, [location.search]);

  const [tab, setTab] = useState<'sell' | 'rent'>(initialTab as 'sell' | 'rent');

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
                    <SellCarTab />
                  </TabsContent>
                  <TabsContent value="rent" className="mt-0">
                    <CarRentTab />
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


