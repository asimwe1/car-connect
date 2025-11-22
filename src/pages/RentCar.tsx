import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Star, Clock, Shield, Headphones, DollarSign, Car } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { api } from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';

const RentCar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedFuel, setSelectedFuel] = useState('all');
  const [selectedTransmission, setSelectedTransmission] = useState('all');
  const [cars, setCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentReview, setCurrentReview] = useState(0);

  const { ref: whyRentRef, inView: whyRentInView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const { ref: reviewsRef, inView: reviewsInView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  // Load dynamic cars from backend (same as original CarRentTab)
  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.getCars({ status: 'available', rentEnabled: true, page: 1, limit: 60 });
        const items = (res.data as any)?.items || [];
        const mapped = items.map((c: any, idx: number) => ({
          id: c._id || idx,
          title: `${c.make} ${c.model}`,
          image: c.primaryImage || (Array.isArray(c.images) && c.images[0]) || '/placeholder.svg',
          type: c.bodyType || 'Vehicle',
          fuel: c.fuelType || '—',
          transmission: c.transmission || '—',
          seats: c.seats || 5,
          // pricePerDay optional until rentals pricing exists
          pricePerDay: undefined,
          location: c.location || 'Kigali',
          rating: 4.6,
          reviews: 12,
        }));
        if (isMounted) setCars(mapped);
      } catch (e) {
        if (isMounted) setCars([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => { isMounted = false; };
  }, []);

  // Auto-scrolling carousel for reviews
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentReview((prev) => (prev + 1) % reviews.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const filteredCars = cars.filter(car => {
    return (
      car.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedLocation === 'all' || car.location === selectedLocation) &&
      (selectedType === 'all' || car.type === selectedType) &&
      (selectedFuel === 'all' || car.fuel === selectedFuel) &&
      (selectedTransmission === 'all' || car.transmission === selectedTransmission)
    );
  });

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const whyRentFeatures = [
    {
      icon: DollarSign,
      title: "Affordable Rates",
      description: "Competitive pricing with no hidden fees"
    },
    {
      icon: Shield,
      title: "Reliable & Safe",
      description: "All vehicles are regularly maintained"
    },
    {
      icon: Headphones,
      title: "24/7 Support",
      description: "Round-the-clock customer assistance"
    },
    {
      icon: Clock,
      title: "Flexible Booking",
      description: "Easy online booking and cancellation"
    }
  ];

  const reviews = [
    {
      name: "Jean Claude",
      rating: 5,
      text: "Amazing service! The car was clean and in perfect condition.",
      date: "2 days ago"
    },
    {
      name: "Marie Uwimana",
      rating: 5,
      text: "Great experience renting from connectify. Highly recommended!",
      date: "1 week ago"
    },
    {
      name: "Patrick Nkurunziza",
      rating: 4,
      text: "Good value for money and professional service.",
      date: "2 weeks ago"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-primary/10">
      <div className="container mx-auto px-4 py-10">
        {/* Hero Section */}
        <div className="text-center mb-12 fade-in-up">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
            Rent Premium Cars
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose from our curated collection of premium vehicles available for rent
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-gradient-to-r from-primary/5 to-primary-light/5 rounded-xl p-6 fade-in-up mb-8">
          <h3 className="text-2xl font-bold text-foreground mb-6">Find Your Perfect Rental</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <div className="xl:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by car model..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input pl-10"
              />
            </div>
            
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger className="search-input">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="Kigali">Kigali</SelectItem>
                <SelectItem value="Butare">Butare</SelectItem>
                <SelectItem value="Musanze">Musanze</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="search-input">
                <SelectValue placeholder="Car Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="SUV">SUV</SelectItem>
                <SelectItem value="Sedan">Sedan</SelectItem>
                <SelectItem value="Hatchback">Hatchback</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedFuel} onValueChange={setSelectedFuel}>
              <SelectTrigger className="search-input">
                <SelectValue placeholder="Fuel Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Fuel Types</SelectItem>
                <SelectItem value="Petrol">Petrol</SelectItem>
                <SelectItem value="Diesel">Diesel</SelectItem>
                <SelectItem value="Hybrid">Hybrid</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedTransmission} onValueChange={setSelectedTransmission}>
              <SelectTrigger className="search-input">
                <SelectValue placeholder="Transmission" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Manual">Manual</SelectItem>
                <SelectItem value="Automatic">Automatic</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Car Grid */}
        <div className="space-y-6 mb-12">
          <h3 className="text-2xl font-bold text-foreground">Available Cars ({filteredCars.length})</h3>
          
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <LoadingSpinner />
            </div>
          ) : filteredCars.length === 0 ? (
            <div className="text-center py-12">
              <Car className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Rental Cars Available</h3>
              <p className="text-muted-foreground">
                {searchTerm || selectedLocation !== 'all' || selectedType !== 'all' || selectedFuel !== 'all' || selectedTransmission !== 'all'
                  ? 'Try adjusting your search criteria.'
                  : 'Check back later for available rental cars.'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCars.map((car, index) => (
                <Card key={car.id} className={`overflow-hidden brand-card fade-in-up stagger-delay-${index % 4 + 1}`}>
                  <div className="relative">
                    <img 
                      src={car.image} 
                      alt={car.title}
                      className="w-full h-48 object-cover"
                    />
                    <Badge className="absolute top-2 right-2 bg-primary/90 text-primary-foreground">
                      {car.type}
                    </Badge>
                  </div>
                  <CardContent className="p-4 space-y-3">
                    <div>
                      <h4 className="font-semibold text-lg text-foreground">{car.title}</h4>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 mr-1" />
                        {car.location}
                      </div>
                    </div>
                    
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{car.seats} seats</span>
                      <span>{car.fuel}</span>
                      <span>{car.transmission}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 fill-warning text-warning" />
                        <span className="text-sm font-medium">{car.rating}</span>
                        <span className="text-sm text-muted-foreground">({car.reviews})</span>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">{formatPrice(car.pricePerDay)}</div>
                        <div className="text-sm text-muted-foreground">per day</div>
                      </div>
                    </div>

                    <Button className="w-full btn-hero">
                      Book Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Why Rent With Us Section */}
        <div ref={whyRentRef} className={`${whyRentInView ? 'fade-in-up' : 'opacity-0'} mb-12`}>
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-foreground mb-4">Why Rent With connectify?</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Experience the difference with our premium car rental service
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyRentFeatures.map((feature, index) => (
              <Card key={index} className={`text-center p-6 brand-card fade-in-up stagger-delay-${index + 1}`}>
                <div className="mx-auto w-12 h-12 bg-gradient-to-r from-primary to-primary-light rounded-full flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h4 className="font-semibold text-lg mb-2 text-foreground">{feature.title}</h4>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Reviews Section - Carousel */}
        <div ref={reviewsRef} className={`${reviewsInView ? 'fade-in-up' : 'opacity-0'}`}>
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-foreground mb-4">What Our Customers Say</h3>
            <p className="text-muted-foreground">Real feedback from our valued customers</p>
          </div>

          <div className="relative max-w-3xl mx-auto">
            <Card key={currentReview} className="p-6 brand-card transition-all duration-500">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h5 className="font-semibold text-foreground">{reviews[currentReview].name}</h5>
                  <p className="text-sm text-muted-foreground">{reviews[currentReview].date}</p>
                </div>
                <div className="flex items-center">
                  {[...Array(reviews[currentReview].rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-warning text-warning" />
                  ))}
                </div>
              </div>
              <p className="text-muted-foreground italic">"{reviews[currentReview].text}"</p>
            </Card>

            {/* dots */}
            <div className="flex justify-center gap-2 mt-4">
              {reviews.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentReview(i)}
                  className={`h-2 w-2 rounded-full ${i === currentReview ? 'bg-primary' : 'bg-muted'}`}
                  aria-label={`Go to review ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RentCar;
