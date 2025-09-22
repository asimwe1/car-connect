import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Car, Fuel, Settings, MapPin, Play } from 'lucide-react';
import { api } from '@/services/api';

interface CarData {
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
  owner: {
    _id: string;
    fullname: string;
    email: string;
  };
  sellEnabled?: boolean;
  rentEnabled?: boolean;
  rentPricePerDay?: number;
  rentDeposit?: number;
  rentMinDays?: number;
  rentMaxDays?: number;
}

const CarDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState<CarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        setLoading(true);
        const response = await api.getCarById(id);
        if (response.data) {
          setCar(response.data);
        } else {
          throw new Error('Car not found');
        }
      } catch (e) {
        console.error('Failed to load car', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const pricing = useMemo(() => {
    if (car) {
      return { current: car.price, original: car.price, hasDiscount: false };
    }
    return { current: 0, original: 0, hasDiscount: false };
  }, [car]);

  const images: string[] = useMemo(() => {
    if (car) {
      return car.images.length > 0 ? car.images : [car.primaryImage || '/placeholder.svg'];
    }
    return [];
  }, [car]);

  const formatPrice = (price: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(price);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="h-8 w-40 bg-muted rounded animate-pulse mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-96 bg-muted rounded animate-pulse" />
            <div className="h-96 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <p className="text-muted-foreground">Car not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Media / Gallery */}
          <Card className="lg:col-span-2 overflow-hidden">
            <CardContent className="p-0">
              <div className="relative">
                {images[activeImageIdx] ? (
                  <img src={images[activeImageIdx]} alt={`${car.make} ${car.model}`} className="w-full h-[420px] object-cover" />
                ) : (
                  <div className="w-full h-[420px] bg-muted flex items-center justify-center">
                    <Car className="h-10 w-10 text-muted-foreground" />
                  </div>
                )}
                {/* TODO: Add video support when implemented */}
              </div>
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-2 p-3">
                  {images.map((src, idx) => (
                    <button key={idx} onClick={() => setActiveImageIdx(idx)} className={`h-20 overflow-hidden rounded ${idx === activeImageIdx ? 'ring-2 ring-primary' : ''}`}>
                      <img src={src} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <div>
                <h1 className="text-2xl font-bold">{car.make} {car.model}</h1>
                <p className="text-sm text-muted-foreground">{car.year} • {car.bodyType || 'Vehicle'}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-primary">{formatPrice(pricing.current)}</span>
                {pricing.hasDiscount && (
                  <span className="text-muted-foreground line-through">{formatPrice(pricing.original)}</span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2"><Car className="h-4 w-4" />{car.mileage.toLocaleString()} Miles</div>
                <div className="flex items-center gap-2"><Fuel className="h-4 w-4" />{car.fuelType}</div>
                <div className="flex items-center gap-2"><Settings className="h-4 w-4" />{car.transmission}</div>
                <div className="flex items-center gap-2"><MapPin className="h-4 w-4" />{car.location || '—'}</div>
              </div>
              <div className="pt-2 space-y-2">
                <Button className="w-full" disabled={car.status !== 'available'}>
                  {car.status !== 'available' ? 'Not Available' : 'Buy Now'}
                </Button>
                {car.rentEnabled && (
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div>Per day: <span className="font-medium text-foreground">{car.rentPricePerDay ? `$${car.rentPricePerDay.toLocaleString()}` : '—'}</span></div>
                    <div>Deposit: <span className="font-medium text-foreground">{car.rentDeposit ? `$${car.rentDeposit.toLocaleString()}` : '—'}</span></div>
                    <div>Min days: <span className="font-medium text-foreground">{car.rentMinDays ?? '—'}</span></div>
                    <div>Max days: <span className="font-medium text-foreground">{car.rentMaxDays ?? '—'}</span></div>
                  </div>
                )}
                {car.rentEnabled && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <input type="date" className="border rounded px-3 py-2" disabled />
                      <input type="date" className="border rounded px-3 py-2" disabled />
                    </div>
                    <Button variant="outline" className="w-full" disabled title="Rental booking coming soon">
                      Select Dates & Rent (Coming Soon)
                    </Button>
                  </div>
                )}
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate(`/test-drive/${car._id}`)}
                >
                  Schedule Test Drive
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Description & Reviews */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <Card className="lg:col-span-2">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-3">Description</h2>
              <p className="text-sm text-muted-foreground">{car.description || 'No description provided.'}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Customer Reviews</h3>
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="w-4 h-4 text-yellow-400 fill-current">
                        ★
                      </div>
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">4.8 (12 reviews)</span>
                </div>
              </div>
              
              {/* Mock Reviews */}
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium">JD</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">John Doe</p>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="w-3 h-3 text-yellow-400 fill-current">
                            ★
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    "Excellent condition, exactly as described. The seller was very professional and the car runs perfectly. Highly recommended!"
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">2 days ago</p>
                </div>
                
                <div className="border-b pb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium">SM</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">Sarah Miller</p>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="w-3 h-3 text-yellow-400 fill-current">
                            ★
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    "Great value for money. The test drive was smooth and the car handles well. Very satisfied with my purchase."
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">1 week ago</p>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium">MJ</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">Mike Johnson</p>
                      <div className="flex items-center gap-1">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className="w-3 h-3 text-yellow-400 fill-current">
                            ★
                          </div>
                        ))}
                        <div className="w-3 h-3 text-gray-300 fill-current">★</div>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    "Good car overall, minor scratches as mentioned. Seller was honest about the condition. Would buy again."
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">2 weeks ago</p>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <Button variant="outline" size="sm" className="w-full">
                  Write a Review
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CarDetails;


