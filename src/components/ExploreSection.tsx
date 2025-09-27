import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUpRight, Bookmark, Gauge, Fuel, Settings } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { api } from '@/services/api';
import LazyImage from '@/components/LazyImage';

interface Car {
  _id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuelType: string;
  transmission: string;
  status: string;
  description?: string;
  images: string[];
  primaryImage: string;
  location?: string;
  bodyType?: string;
  color?: string;
}

const ExploreSection = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('in-stock');
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchCars();
  }, [activeTab]);

  const fetchCars = async () => {
    try {
      setLoading(true);
      const params: {
        status: string;
        page: number;
        limit: number;
        year?: string;
      } = {
        status: 'available',
        page: 1,
        limit: 8,
      };

      // Adjust query parameters based on activeTab
      if (activeTab === 'new-cars') {
        params.year = `gte:${new Date().getFullYear()}`; // Assuming new cars are from the current year or later
      } else if (activeTab === 'used-cars') {
        params.year = `lt:${new Date().getFullYear()}`; // Assuming used cars are older than the current year
      }

      const response = await api.getCars(params);

      if (response.data?.items && Array.isArray(response.data.items)) {
        setCars(response.data.items);
      } else {
        setCars([]);
      }
    } catch (error) {
      console.error('Error fetching cars:', error);
      setCars([]);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);

  if (loading) {
    return (
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Explore All Vehicles</h2>
            <div className="flex justify-center gap-4 mb-8">
              <div className="h-4 bg-muted rounded w-20 animate-pulse"></div>
              <div className="h-4 bg-muted rounded w-20 animate-pulse"></div>
              <div className="h-4 bg-muted rounded w-20 animate-pulse"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-80 bg-muted rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} className="px-6 py-8">
      <div className="container mx-auto px-4">
        <div className={`flex items-center justify-between mb-8 transition-all duration-700 ${inView ? 'animate-fade-in' : 'opacity-0'}`}>
          <h2 className="text-3xl font-bold text-foreground">Explore All Vehicles</h2>
          <Button variant="ghost" onClick={() => navigate('/buy-cars')} className="text-primary hover:text-primary-hover flex items-center gap-2">
            View All
            <ArrowUpRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex space-x-8 mb-8">
          {['in-stock', 'new-cars', 'used-cars'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'pb-3 border-b-2 font-medium transition-colors',
                activeTab === tab ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              {tab === 'in-stock' ? 'In Stock' : tab === 'new-cars' ? 'New Cars' : 'Used Cars'}
            </button>
          ))}
        </div>

        <div className={`flex gap-6 overflow-x-auto pb-4 transition-all duration-700 delay-200 ${inView ? 'animate-slide-up' : 'opacity-0'}`}>
          {cars.length === 0 ? (
            <div className="text-center w-full py-8">
              <h3 className="text-lg font-semibold mb-2">No Cars Found</h3>
              <p className="text-muted-foreground">No vehicles match the selected criteria.</p>
            </div>
          ) : (
            cars.map((car) => (
              <Card key={car._id} className="flex-shrink-0 w-80 overflow-hidden group cursor-pointer">
                <div className="relative">
                  <LazyImage
                    src={car.primaryImage || car.images[0]}
                    alt={`${car.make} ${car.model}`}
                    containerClassName="w-full h-48"
                    className="group-hover:scale-105"
                  />
                  {car.status === 'available' && (
                    <div className="absolute top-4 left-4">
                      <Badge className="text-xs bg-green-500 text-white">Available</Badge>
                    </div>
                  )}
                  <div className="absolute top-4 right-4">
                    <Button variant="ghost" size="icon" className="h-8 w-8 bg-background/80 hover:bg-background">
                      <Bookmark className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-semibold text-foreground">
                        {car.make} {car.model} – {car.year}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">{car.bodyType || 'Vehicle'}</p>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Gauge className="h-4 w-4" />
                        <span>{car.mileage.toLocaleString()} Miles</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Fuel className="h-4 w-4" />
                        <span>{car.fuelType}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Settings className="h-4 w-4" />
                        <span>{car.transmission}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <div className="text-2xl font-bold text-foreground">{formatPrice(car.price)}</div>
                      <Button
                        variant="ghost"
                        onClick={() => navigate(`/car/${car._id}`)}
                        className="text-primary hover:text-primary-hover flex items-center gap-2"
                      >
                        View Details
                        <ArrowUpRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default ExploreSection;