import { useEffect, useMemo, useState } from 'react';
import SEO from '@/components/SEO';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Car, Fuel, Settings, MapPin, Play } from 'lucide-react';
import { api } from '@/services/api';
import { activityService } from '@/services/activityService';
import LazyImage from '@/components/LazyImage';
import CarMessaging from '@/components/CarMessaging';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface CarData {
  _id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage?: number;
  fuelType?: string;
  transmission?: string;
  status: string;
  description?: string;
  images: string[];
  primaryImage?: string;
  location?: string;
  bodyType?: string;
  color?: string;
  owner?: {
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
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}// No fallback car data - we'll show proper error states instead

const CarDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [car, setCar] = useState<CarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  useEffect(() => {
    if (!id) {
      setError('No car ID provided');
      setLoading(false);
      return;
    }
    
    // Validate MongoDB ObjectId format (24 hex characters)
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    if (!objectIdRegex.test(id)) {
      setError('Invalid car ID format');
      setLoading(false);
      return;
    }
    
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        // Backend endpoint: /cars/:id
        const response = await api.getCarById(id); 
        
        console.log('Car details response:', response); // Debug log
        console.log('Requested car ID:', id); // Debug log
        
        if (response.data && !response.error) {
          // Handle different possible response structures
          let carData = null;
          
          // Check if response has the car data directly (like the working example)
          if (response.data._id) {
            // Direct car object (this is what we expect based on the working endpoint)
            carData = response.data;
          } else if (response.data.data) {
            carData = response.data.data;
          } else if (response.data.car) {
            carData = response.data.car;
          } else {
            console.warn('Unexpected response structure:', response.data);
            carData = null;
          }
          
          console.log('Extracted car data:', carData); // Debug log
          
          if (carData && carData._id) {
            setCar(carData);
            // Track car view activity
            activityService.trackCarView(id, user?.id);
          } else {
            console.warn('No valid car data found');
            setError('Car not found or invalid data received');
            setCar(null);
          }
        } else {
          console.warn('API response error:', response.error);
          // Handle different error types
          if (response.error?.includes('404')) {
            setError('This car listing could not be found. It may have been sold or removed.');
          } else if (response.error?.includes('403')) {
            setError('You do not have permission to view this car listing.');
          } else {
            setError(response.error || 'Failed to load car details');
          }
          setCar(null);
        }
      } catch (e) {
        console.error('Failed to load car', e);
        // Handle network and other errors
        if (e instanceof Error) {
          if (e.message.includes('404')) {
            setError('This car listing could not be found. It may have been sold or removed.');
          } else if (e.message.includes('network') || e.message.includes('fetch')) {
            setError('Network error. Please check your connection and try again.');
          } else {
            setError(e.message);
          }
        } else {
          setError('An unexpected error occurred while loading car details');
        }
        setCar(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, user?.id]);

  const pricing = useMemo(() => {
    if (car && car.price) {
      return { current: car.price, original: car.price, hasDiscount: false };
    }
    return { current: 0, original: 0, hasDiscount: false };
  }, [car]);  const images: string[] = useMemo(() => {
    if (car) {
      // Ensure we have valid images
      const validImages = car.images?.filter(img => img && img.trim() !== '') || [];
      if (validImages.length > 0) {
        return validImages;
      }
      // Fall back to primary image if available
      if (car.primaryImage && car.primaryImage.trim() !== '') {
        return [car.primaryImage];
      }
      // Final fallback to placeholder
      return ['/placeholder.svg'];
    }
    return ['/placeholder.svg'];
  }, [car]);  const formatPrice = (price: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'RWF', minimumFractionDigits: 0 }).format(price);

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
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
              <Car className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">Car Not Found</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {error || 'The car you are looking for could not be found or may have been removed.'}
            </p>
            <div className="mb-4 p-3 bg-muted/30 rounded text-sm text-muted-foreground">
              <strong>Car ID:</strong> {id}
            </div>
            <div className="space-x-4">
              <Button onClick={() => navigate('/buy-cars')} className="bg-primary hover:bg-primary/90">
                Browse Available Cars
              </Button>
              <Button variant="outline" onClick={() => navigate(-1)}>
                Go Back
              </Button>
            </div>
            {error?.includes('404') && (
              <div className="mt-8 p-4 bg-muted/50 rounded-lg max-w-md mx-auto">
                <p className="text-sm text-muted-foreground mb-3">
                  <strong>Tip:</strong> This car may have been recently sold or the listing may have expired. 
                  Check out our other available vehicles below.
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={async () => {
                    try {
                      const response = await api.getCars({ status: 'available', limit: 5 });
                      console.log('Available cars check:', response);
                      if (response.data?.items?.length > 0) {
                        toast({ title: 'Success', description: `Found ${response.data.items.length} available cars. Check console for details.` });
                      } else {
                        toast({ title: 'Info', description: 'No cars found in database' });
                      }
                    } catch (e) {
                      console.error('Error checking cars:', e);
                      toast({ title: 'Error', description: 'Failed to check available cars', variant: 'destructive' });
                    }
                  }}
                >
                  Check Available Cars (Debug)
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={`${car ? `${car.make} ${car.model} – ${car.year}` : 'Car Details'} | connectify Rwanda`}
        description={car?.description || 'View detailed specs, photos, and pricing for this vehicle.'}
      />
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
                  <LazyImage
                    src={images[activeImageIdx]}
                    alt={`${car.make} ${car.model}`}
                    containerClassName="w-full h-[420px]"
                  />
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
                      <LazyImage src={src} alt={`thumb-${idx}`} containerClassName="w-full h-full" />
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
                                <span className="text-3xl font-bold text-primary">
                  {pricing.current > 0 ? formatPrice(pricing.current) : 'Price N/A'}
                </span>
                {pricing.hasDiscount && (
                  <span className="text-muted-foreground line-through">{formatPrice(pricing.original)}</span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                  <Car className="h-4 w-4" />
                  {car.mileage ? `${car.mileage.toLocaleString()} Miles` : 'Mileage N/A'}
                </div>
                {/* Ensure enum value is displayed correctly */}
                                <div className="flex items-center gap-2">
                  <Fuel className="h-4 w-4" />
                  {car.fuelType ? car.fuelType.charAt(0).toUpperCase() + car.fuelType.slice(1) : 'Fuel N/A'}
                </div>
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  {car.transmission ? car.transmission.charAt(0).toUpperCase() + car.transmission.slice(1) : 'Transmission N/A'}
                </div>
                                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {car.location || 'Location N/A'}
                </div>
              </div>
              <div className="pt-2 space-y-2">
                <Button 
                  className="w-full" 
                  disabled={car.status !== 'available' || !user}
                  onClick={() => {
                    if (user && car.status === 'available') {
                      // Scroll to messaging component
                      const messagingElement = document.querySelector('#car-messaging');
                      if (messagingElement) {
                        messagingElement.scrollIntoView({ behavior: 'smooth' });
                        // Trigger the messaging component to expand
                        const messagingButton = messagingElement.querySelector('button');
                        if (messagingButton) {
                          messagingButton.click();
                        }
                      }
                    }
                  }}
                >
                  {car.status !== 'available' ? 'Not Available' : 
                   user?.role === 'admin' ? 'Admin View' :
                   user ? 'Chat with Admin' : 'Login to Chat'}
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

      {/* Customer to Admin Chat */}
      {user && car && (
        <div id="car-messaging">
          <CarMessaging
            carId={car._id}
            carDetails={{
              make: car.make,
              model: car.model,
              year: car.year,
              price: car.price,
              primaryImage: car.primaryImage
            }}
          />
        </div>
      )}
    </div>
  );
};

export default CarDetails;