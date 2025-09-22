import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, Bookmark, Gauge, Fuel, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { api } from '@/services/api';

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

const PopularMakesSection = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMake, setActiveMake] = useState('audi');
  const [currentPage, setCurrentPage] = useState(0);
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  const navigate = useNavigate();

  const makes = [
    { id: 'audi', label: 'Audi' },
    { id: 'ford', label: 'Ford' },
    { id: 'mercedes-benz', label: 'Mercedes Benz' },
  ];

  useEffect(() => {
    fetchCars();
  }, [activeMake]);

  const fetchCars = async () => {
    try {
      setLoading(true);
      const response = await api.getCars({
        status: 'available',
        page: 1,
        limit: 20
      });

      if (response.data?.items) {
        setCars(response.data.items);
      } else {
        setCars([]);
      }
      setCurrentPage(0);
    } catch (error) {
      console.error('Error fetching cars:', error);
      setCars([]);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(price);

  const currentCars = useMemo(() => {
    return cars.filter(car => car.make.toLowerCase().includes(activeMake.replace('-', ' ')));
  }, [cars, activeMake]);
  const carsPerPage = 2;
  const totalPages = Math.max(1, Math.ceil(currentCars.length / carsPerPage));
  const displayedCars = currentCars.slice(currentPage * carsPerPage, (currentPage + 1) * carsPerPage);

  return (
    <section ref={ref} className="px-6 py-8 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className={`flex items-center justify-between mb-8 transition-all duration-700 ${inView ? 'animate-fade-in' : 'opacity-0'}`}>
          <h2 className="text-3xl font-bold text-foreground">Popular Makes</h2>
          <Button variant="ghost" onClick={() => navigate('/buy-cars')} className="text-primary hover:text-primary-hover flex items-center gap-2">
            View All
            <ArrowUpRight className="h-4 w-4" />
          </Button>
        </div>

        <div className={`flex space-x-8 mb-8 transition-all duration-700 delay-200 ${inView ? 'animate-slide-up' : 'opacity-0'}`}>
          {makes.map((make) => (
            <button
              key={make.id}
              onClick={() => setActiveMake(make.id)}
              className={cn(
                'pb-3 border-b-2 font-medium transition-colors',
                activeMake === make.id ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              {make.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-64 bg-muted rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 transition-all duration-700 delay-400 ${inView ? 'animate-zoom-in' : 'opacity-0'}`}>
            {displayedCars.map((car) => (
              <Card key={car._id} className="overflow-hidden group cursor-pointer">
                <div className="flex">
                  <div className="relative flex-shrink-0 w-1/2">
                    <img
                      src={car.primaryImage || car.images[0] || '/placeholder.svg'}
                      alt={`${car.make} ${car.model}`}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {car.status === 'available' && (
                      <div className="absolute top-4 left-4">
                        <Badge variant="secondary" className="bg-green-500 text-white">
                          Available
                        </Badge>
                      </div>
                    )}
                    <div className="absolute top-4 right-4">
                      <Button variant="ghost" size="icon" className="h-8 w-8 bg-background/80 hover:bg-background">
                        <Bookmark className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardContent className="flex-1 p-6 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xl font-semibold text-foreground">{car.make} {car.model} – {car.year}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{car.bodyType || 'Vehicle'}</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Gauge className="h-4 w-4" />
                          <span>{car.mileage.toLocaleString()} Miles</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Fuel className="h-4 w-4" />
                          <span>{car.fuelType}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Settings className="h-4 w-4" />
                          <span>{car.transmission}</span>
                        </div>
                      </div>
                    </div>
                    <div className="pt-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-foreground">{formatPrice(car.price)}</span>
                      </div>
                      <Button variant="ghost" onClick={() => navigate(`/car/${car._id}`)} className="text-primary hover:text-primary-hover flex items-center gap-2 p-0">
                        View Details
                        <ArrowUpRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className={`flex justify-center gap-4 mt-8 transition-all duration-700 delay-600 ${inView ? 'animate-fade-in' : 'opacity-0'}`}>
            <Button variant="outline" size="icon" onClick={() => setCurrentPage((p) => (p - 1 + totalPages) % totalPages)} className="rounded-full">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => setCurrentPage((p) => (p + 1) % totalPages)} className="rounded-full">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default PopularMakesSection;