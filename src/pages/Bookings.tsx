import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// Removed Supabase dependency - using Node API
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Clock, Car, MapPin, Phone, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/services/api";
import { format } from "date-fns";

interface Booking {
  _id: string;
  status: string;
  notes?: string;
  createdAt: string;
  car: {
    _id: string;
    make: string;
    model: string;
    year: number;
    price: number;
    images: string[];
    primaryImage?: string;
    location?: string;
  };
  expiresAt?: string;
}

const Bookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await api.getMyBookings();
      if (response.data) {
        setBookings(response.data as any);
      } else {
        setBookings([]);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast({
        title: "Error",
        description: "Failed to fetch bookings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    try {
      const response = await api.cancelBooking(id);
      if (response.error) throw new Error(response.error);
      setBookings(prev => prev.map(b => b._id === id ? { ...b, status: 'cancelled' } : b));
      toast({ title: 'Booking cancelled' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to cancel booking', variant: 'destructive' });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "cancelled":
        return "bg-red-500";
      case "completed":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), "MMMM d, yyyy");
  };

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(":");
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return format(date, "h:mm a");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">My Bookings</h1>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="h-4 bg-muted rounded w-1/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Bookings Yet</h3>
            <p className="text-muted-foreground mb-6">
              You haven't made any test drive bookings yet.
            </p>
            <Button onClick={() => navigate("/buy-cars")}>
              Browse Cars
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-sm text-muted-foreground">
                You have {bookings.length} booking{bookings.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="space-y-6">
              {bookings.map((booking) => (
                <Card key={booking._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg mb-2">
                          Test Drive - {booking.car.make} {booking.car.model}
                        </CardTitle>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(booking.createdAt)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>
                              {booking.expiresAt ? `Expires ${format(new Date(booking.expiresAt), 'PPP p')}` : ''}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Car Image */}
                      <div className="md:w-1/3">
                        {(booking.car.images && booking.car.images.length > 0) || booking.car.primaryImage ? (
                          <img
                            src={booking.car.primaryImage || booking.car.images[0]}
                            alt={`${booking.car.make} ${booking.car.model}`}
                            className="w-full h-40 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-full h-40 bg-muted rounded-lg flex items-center justify-center">
                            <Car className="h-12 w-12 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      {/* Booking Details */}
                      <div className="md:w-2/3 space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Car Details</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center gap-2">
                              <Car className="h-4 w-4 text-muted-foreground" />
                              <span>{booking.car.year} {booking.car.make} {booking.car.model}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span>{booking.car.location || '—'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold text-primary">
                                ${booking.car.price.toLocaleString()}
                              </span>
                            </div>
                            {booking.cars.seller_contact && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span>{booking.cars.seller_contact}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {booking.notes && (
                          <div>
                            <h4 className="font-semibold mb-2">Notes</h4>
                            <p className="text-sm text-muted-foreground">{booking.notes}</p>
                          </div>
                        )}

                        <div className="flex gap-2 pt-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/car/${booking.car._id}`)}
                          >
                            View Car
                          </Button>
                          {booking.status === "pending" && (
                            <Button variant="destructive" size="sm" onClick={() => handleCancel(booking._id)}>
                              Cancel Booking
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Bookings;