import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Car, Fuel, Settings, Users, MapPin, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import LoadingSpinner from "@/components/LoadingSpinner";
import { api } from "@/services/api";

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
  owner: {
    _id: string;
    fullname: string;
    email: string;
  };
}

const BuyCars = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMake, setSelectedMake] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchCars();
  }, [searchTerm, selectedMake, selectedYear, sortBy]);

  const fetchCars = async () => {
    try {
      setLoading(true);
      const response = await api.getCars({
        q: searchTerm || undefined,
        status: 'available',
        sellEnabled: true,
        page: 1,
        limit: 50
      });

      if (response.data?.items) {
        let filteredCars = response.data.items;

        // Apply client-side filtering for make and year
        if (selectedMake && selectedMake !== "all") {
          filteredCars = filteredCars.filter(car => 
            car.make.toLowerCase().includes(selectedMake.toLowerCase())
          );
        }

        if (selectedYear && selectedYear !== "all") {
          filteredCars = filteredCars.filter(car => 
            car.year === parseInt(selectedYear)
          );
        }

        // Apply client-side sorting
        switch (sortBy) {
          case 'price_low':
            filteredCars.sort((a, b) => a.price - b.price);
            break;
          case 'price_high':
            filteredCars.sort((a, b) => b.price - a.price);
            break;
          case 'year_new':
            filteredCars.sort((a, b) => b.year - a.year);
            break;
          case 'mileage':
            filteredCars.sort((a, b) => a.mileage - b.mileage);
            break;
          case 'newest':
          default:
            // Already sorted by creation date from backend
            break;
        }

        setCars(filteredCars);
      } else {
        setCars([]);
      }
    } catch (error) {
      console.error("Error fetching cars:", error);
      setCars([]);
      toast({
        title: "Error",
        description: "Failed to load cars. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToWishlist = (carId: string) => {
    // TODO: Implement wishlist functionality with backend API
    toast({
      title: "Feature Coming Soon",
      description: "Wishlist functionality will be available soon.",
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(price);
  };

  const makes = ["All", "Toyota", "Ford", "Mercedes Benz", "Audi", "BMW", "Nissan", "Honda"];
  const years = ["All", "2024", "2023", "2022", "2021", "2020", "2019", "2018"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-primary/10 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Find Your Perfect Car</h1>
          <p className="text-muted-foreground text-lg">
            Browse our extensive collection of quality vehicles
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search cars..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedMake} onValueChange={setSelectedMake}>
                <SelectTrigger>
                  <SelectValue placeholder="Make" />
                </SelectTrigger>
                <SelectContent>
                  {makes.map((make) => (
                    <SelectItem key={make} value={make === "All" ? "all" : make}>
                      {make}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year === "All" ? "all" : year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="price_low">Price: Low to High</SelectItem>
                  <SelectItem value="price_high">Price: High to Low</SelectItem>
                  <SelectItem value="year_new">Year: Newest</SelectItem>
                  <SelectItem value="mileage">Mileage: Low to High</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                More Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            {loading ? (
              <div className="flex items-center gap-2">
                <LoadingSpinner size="sm" />
                Loading cars...
              </div>
            ) : (
              `${cars.length} car${cars.length !== 1 ? 's' : ''} found`
            )}
          </p>
        </div>

        {/* Cars Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden animate-pulse">
                <div className="h-48 bg-muted"></div>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded"></div>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : cars.length === 0 ? (
          <div className="text-center py-12">
            <Car className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Cars Found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search criteria or filters.
            </p>
            <Button onClick={() => {
              setSearchTerm("");
              setSelectedMake("all");
              setSelectedYear("all");
              setSortBy("newest");
            }}>
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cars.map((car) => (
              <Card key={car._id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                <div className="relative">
                  <img
                    src={car.primaryImage || car.images[0] || '/placeholder.svg'}
                    alt={`${car.make} ${car.model}`}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {car.status === "available" && (
                    <Badge className="absolute top-2 left-2 bg-green-500">
                      Available
                    </Badge>
                  )}
                  
                  {car.status === "reserved" && (
                    <Badge className="absolute top-2 left-2 bg-yellow-500">
                      Reserved
                    </Badge>
                  )}

                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 bg-white/80 hover:bg-white text-red-500 hover:text-red-600"
                    onClick={() => handleAddToWishlist(car._id)}
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>

                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{car.make} {car.model}</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {car.year} • {car.bodyType || 'Vehicle'}
                  </p>

                  <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                    <div className="flex items-center gap-1">
                      <Car className="h-3 w-3" />
                      <span>{car.mileage.toLocaleString()} Miles</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Fuel className="h-3 w-3" />
                      <span>{car.fuelType}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Settings className="h-3 w-3" />
                      <span>{car.transmission}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>{car.color || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-3 text-xs">
                    <MapPin className="h-3 w-3" />
                    <span>{car.location || 'Location not specified'}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-bold text-primary">
                        {formatPrice(car.price)}
                      </p>
                    </div>
                    <Button 
                      size="sm"
                      onClick={() => navigate(`/car/${car._id}`)}
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyCars;