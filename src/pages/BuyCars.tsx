import { useState, useEffect, useMemo } from "react";
import SEO from "@/components/SEO";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Car, Fuel, Settings, Palette, MapPin, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import LoadingSpinner from "@/components/LoadingSpinner";
import { api } from "@/services/api";
import { useWishlistStore } from "@/store/useWishlistStore";

interface Car {
  createdAt: string | number | Date;
  _id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuelType: string;
  transmission: string;
  status: "available" | "reserved" | "sold";
  description?: string;
  images: string[];
  primaryImage: string;
  location?: string;
  bodyType?: string;
  color?: string;
  owner: string; // ObjectId as string
}

const BuyCars: React.FC = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [allCars, setAllCars] = useState<Car[]>([]); // Store unfiltered cars
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMake, setSelectedMake] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedFuelType, setSelectedFuelType] = useState("all");
  const [selectedTransmission, setSelectedTransmission] = useState("all");
  const [selectedBodyType, setSelectedBodyType] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const { wishlist, addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore();

  // Fetch cars on mount
  useEffect(() => {
    const brandFromUrl = searchParams.get("brand");
    if (brandFromUrl && brandFromUrl !== "all") {
      const adjustedMake = brandFromUrl === "mercedes-benz" ? "Mercedes Benz" : brandFromUrl;
      setSelectedMake(adjustedMake);
    }
    fetchCars();
    fetchWishlist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCars = async () => {
    try {
      setLoading(true);
      const params = {
        status: "available",
        sellEnabled: true, // Only fetch cars enabled for selling
        page: 1,
        limit: 1000,
      };
      console.log("API call with params:", params);
      const response = await api.getCars(params);
      console.log("Cars API response:", response); // Debug log
      if (response.data?.items && Array.isArray(response.data.items)) {
        console.log("Cars found:", response.data.items.length); // Debug log
        console.log("First few car IDs:", response.data.items.slice(0, 3).map(car => car._id)); // Debug log
        setAllCars(response.data.items);
      } else {
        setAllCars([]);
        toast({
          title: "No Data",
          description: "No cars found. Try adjusting your filters.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching cars:", error);
      setAllCars([]);
      toast({
        title: "Error",
        description: error instanceof Error && error.message.includes("timed out")
          ? "Request timed out. Please check your network and try again."
          : "Failed to load cars. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlist = async () => {
    try {
      const response = await api.getWishlist();
      if (response.data?.wishlist?.cars) {
        const cars = response.data.wishlist.cars;
        // Update Zustand store
        cars.forEach(car => {
          if (!isInWishlist(car._id)) {
            addToWishlist(car._id);
          }
        });
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      toast({
        title: "Error",
        description: "Failed to load wishlist. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedMake !== "all") {
      const urlMake = selectedMake === "Mercedes Benz" ? "mercedes-benz" : selectedMake.toLowerCase();
      params.set("brand", urlMake);
    }
    if (selectedYear !== "all") params.set("year", selectedYear);
    if (selectedFuelType !== "all") params.set("fuelType", selectedFuelType);
    if (selectedTransmission !== "all") params.set("transmission", selectedTransmission);
    if (selectedBodyType !== "all") params.set("bodyType", selectedBodyType);
    if (sortBy !== "newest") params.set("sortBy", sortBy);
    const currentParams = new URLSearchParams(window.location.search);
    let shouldUpdate = false;
    params.forEach((value, key) => {
      if (currentParams.get(key) !== value) shouldUpdate = true;
    });
    if (shouldUpdate) window.history.pushState({}, "", `${window.location.pathname}?${params.toString()}`);
  }, [selectedMake, selectedYear, selectedFuelType, selectedTransmission, selectedBodyType, sortBy]);

  // Filter and sort cars on the frontend
  const filteredCars = useMemo(() => {
    let result = [...allCars];
    if (searchTerm) {
      const searchRegex = new RegExp(searchTerm, "i");
      result = result.filter((car) =>
        searchRegex.test(car.make) ||
        searchRegex.test(car.model) ||
        (car.description && searchRegex.test(car.description))
      );
    }
    if (selectedMake !== "all") {
      const makeRegex = new RegExp(selectedMake, "i");
      result = result.filter((car) => makeRegex.test(car.make));
    }
    if (selectedYear !== "all") {
      result = result.filter((car) => car.year === parseInt(selectedYear));
    }
    if (selectedFuelType !== "all") {
      const fuelRegex = new RegExp(`^${selectedFuelType}$`, "i");
      result = result.filter((car) => car.fuelType && fuelRegex.test(car.fuelType));
    }
    if (selectedTransmission !== "all") {
      const transRegex = new RegExp(`^${selectedTransmission}$`, "i");
      result = result.filter((car) => car.transmission && transRegex.test(car.transmission));
    }
    if (selectedBodyType !== "all") {
      const bodyRegex = new RegExp(`^${selectedBodyType}$`, "i");
      result = result.filter((car) => car.bodyType && bodyRegex.test(car.bodyType));
    }
    switch (sortBy) {
      case "price_low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price_high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "year_new":
        result.sort((a, b) => b.year - a.year);
        break;
      case "mileage_low":
        result.sort((a, b) => (a.mileage || 0) - (b.mileage || 0));
        break;
      case "newest":
      default:
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }
    return result;
  }, [allCars, searchTerm, selectedMake, selectedYear, selectedFuelType, selectedTransmission, selectedBodyType, sortBy]);

  const handleAddToWishlist = async (carId: string) => {
    try {
      if (isInWishlist(carId)) {
        const response = await api.removeFromWishlist(carId);
        if (response.error) throw new Error(response.error);
        removeFromWishlist(carId);
        toast({ title: "Removed from Wishlist", description: "Car removed from your wishlist." });
      } else {
        const response = await api.addToWishlist(carId);
        if (response.error) throw new Error(response.error);
        addToWishlist(carId);
        toast({ title: "Added to Wishlist", description: "Car added to your wishlist." });
      }
    } catch (error) {
      console.error("Error updating wishlist:", error);
      toast({ title: "Error", description: "Failed to update wishlist. Please try again.", variant: "destructive" });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: "RWF",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const makes = ["all", "Toyota", "Ford", "Mercedes-Benz", "Audi", "BMW", "Nissan", "Honda"];
  const years = ["all", "2025", "2024", "2023", "2022", "2021", "2020", "2019", "2018"];
  const fuelTypes = ["all", "petrol", "diesel", "electric", "hybrid", "other"];
  const transmissions = ["all", "automatic", "manual"];
  const bodyTypes = ["all", "SUV", "Sedan", "Hatchback", "Coupe", "Pickup", "Wagon", "Convertible", "Other"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-primary/10 p-8">
      <SEO title="Buy Cars – CarConnect Rwanda" description="Browse verified cars for sale in Rwanda. Filter by make, model, year, fuel type, transmission, and more." />
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Find Your Perfect Car</h1>
          <p className="text-muted-foreground text-lg">Browse our extensive collection of quality vehicles</p>
        </div>

        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by make, model..."
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
                    <SelectItem key={make} value={make}>
                      {make.charAt(0).toUpperCase() + make.slice(1)}
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
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedFuelType} onValueChange={setSelectedFuelType}>
                <SelectTrigger>
                  <SelectValue placeholder="Fuel Type" />
                </SelectTrigger>
                <SelectContent>
                  {fuelTypes.map((fuel) => (
                    <SelectItem key={fuel} value={fuel}>
                      {fuel.charAt(0).toUpperCase() + fuel.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedTransmission} onValueChange={setSelectedTransmission}>
                <SelectTrigger>
                  <SelectValue placeholder="Transmission" />
                </SelectTrigger>
                <SelectContent>
                  {transmissions.map((trans) => (
                    <SelectItem key={trans} value={trans}>
                      {trans.charAt(0).toUpperCase() + trans.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedBodyType} onValueChange={setSelectedBodyType}>
                <SelectTrigger>
                  <SelectValue placeholder="Body Type" />
                </SelectTrigger>
                <SelectContent>
                  {bodyTypes.map((body) => (
                    <SelectItem key={body} value={body}>
                      {body.charAt(0).toUpperCase() + body.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between items-center mb-6">
          <p className="text-sm text-muted-foreground">
            {loading ? (
              <div className="flex items-center gap-2">
                <LoadingSpinner size="sm" />
                Loading cars...
              </div>
            ) : (
              `${filteredCars.length} car${filteredCars.length !== 1 ? "s" : ""} found`
            )}
          </p>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price_low">Price: Low to High</SelectItem>
              <SelectItem value="price_high">Price: High to Low</SelectItem>
              <SelectItem value="year_new">Year: Newest</SelectItem>
              <SelectItem value="mileage_low">Mileage: Low to High</SelectItem>
            </SelectContent>
          </Select>
        </div>

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
        ) : filteredCars.length === 0 ? (
          <div className="text-center py-12">
            <Car className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Cars Found</h3>
            <p className="text-muted-foreground mb-6">Try adjusting your search criteria or filters.</p>
            <Button
              onClick={() => {
                setSearchTerm("");
                setSelectedMake("all");
                setSelectedYear("all");
                setSelectedFuelType("all");
                setSelectedTransmission("all");
                setSelectedBodyType("all");
                setSortBy("newest");
                window.history.pushState({}, "", "/buy-cars");
              }}
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCars.map((car) => (
              <Card 
                key={car._id} 
                className="overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer"
                onClick={() => navigate(`/car/${car._id}`)}
              >
                <div className="relative">
                  <img
                    src={car.primaryImage || car.images?.[0] || "/placeholder-car.jpg"}
                    alt={`${car.make} ${car.model}`}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    onError={(e) => (e.currentTarget.src = "/placeholder-car.jpg")}
                  />
                  {car.status === "available" && (
                    <Badge className="absolute top-2 left-2 bg-green-500">Available</Badge>
                  )}
                  {car.status === "reserved" && (
                    <Badge className="absolute top-2 left-2 bg-yellow-500">Reserved</Badge>
                  )}
                  {car.status === "sold" && (
                    <Badge className="absolute top-2 left-2 bg-red-500">Sold</Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`absolute top-2 right-2 bg-white/80 hover:bg-white ${
                      isInWishlist(car._id) ? "text-red-500" : "text-gray-500"
                    } hover:text-red-600`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToWishlist(car._id);
                    }}
                    disabled={car.status !== "available"}
                  >
                    <Heart
                      className={`h-4 w-4 ${isInWishlist(car._id) ? "fill-red-500" : ""}`}
                    />
                  </Button>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{car.make} {car.model}</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {car.year} • {car.bodyType || "N/A"}
                  </p>
                  <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                    <div className="flex items-center gap-1">
                      <Car className="h-3 w-3" />
                      <span>{car.mileage ? `${car.mileage.toLocaleString()} km` : "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Fuel className="h-3 w-3" />
                      <span>{car.fuelType ? car.fuelType.charAt(0).toUpperCase() + car.fuelType.slice(1) : "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Settings className="h-3 w-3" />
                      <span>{car.transmission ? car.transmission.charAt(0).toUpperCase() + car.transmission.slice(1) : "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Palette className="h-3 w-3" />
                      <span>{car.color || "N/A"}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-3 text-xs">
                    <MapPin className="h-3 w-3" />
                    <span>{car.location || "N/A"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-bold text-primary">{formatPrice(car.price)}</p>
                    <Button 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/car/${car._id}`);
                      }} 
                      disabled={car.status !== "available"}
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