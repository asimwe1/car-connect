import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/services/api';
import { adminRealtimeService } from '@/services/adminRealtimeService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search, 
  CheckCircle, 
  XCircle, 
  ArrowLeft,
  Car,
  User,
  Phone,
  Calendar,
  DollarSign,
  Gauge,
  Fuel,
  Settings,
  MapPin,
  Palette,
  FileText,
  Image,
  Video,
  MessageCircle,
  ExternalLink
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/Sidebar';
import type { CarReview, CarReviewFilters } from '@/services/carReviewService';

const AdminCarReview = () => {
  const [cars, setCars] = useState<CarReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedCar, setSelectedCar] = useState<CarReview | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [contactInfo, setContactInfo] = useState('');
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, logout, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/signin');
      return;
    }

    // Initialize realtime connection
    const connectRealtime = () => {
      if (!adminRealtimeService) {
        console.error('Admin realtime service not available');
        return;
      }

      try {
        adminRealtimeService.connect();
      } catch (error) {
        console.error('Failed to connect to realtime service:', error);
        // Attempt to reconnect after a delay, but stop after 5 attempts
        if (!window.realtimeAttempts) {
          window.realtimeAttempts = 1;
        } else if (window.realtimeAttempts >= 5) {
          console.log('Max realtime connection attempts reached');
          return;
        } else {
          window.realtimeAttempts++;
        }
        setTimeout(connectRealtime, 5000);
      }
    };

    connectRealtime();
    fetchCars();
    fetchStats();

    // Cleanup function
    return () => {
      if (adminRealtimeService) {
        try {
          adminRealtimeService.disconnect();
          // Reset connection attempts counter
          if (window.realtimeAttempts) {
            delete window.realtimeAttempts;
          }
        } catch (error) {
          console.error('Error disconnecting realtime service:', error);
        }
      }
    };
  }, [isAuthenticated, user, navigate]);

  const fetchCars = async () => {
    try {
      setErrorMessage(null);
      setLoading(true);
      
      // Use the /cars/listed endpoint to get cars with "listed" status that need admin review
      const response = await api.request('/cars/listed');
      
      console.log('API Response:', response); // Debug log
      
      if (response.error) {
        console.error('API Error:', response.error);
        throw new Error(response.error);
      }
      
      // Handle the response structure with cars nested under response.data.cars
      const carsList = Array.isArray(response.data?.cars) ? response.data.cars : [];
      
      console.log('Extracted cars list:', carsList); // Debug log
      
      // Apply status filter if not 'all'
      const filteredCars = statusFilter === 'all' 
        ? carsList 
        : carsList.filter(car => car.status === statusFilter);
      
      if (!filteredCars.length && carsList.length > 0) {
        setErrorMessage(`No cars found with status: ${statusFilter}`);
      } else if (!carsList.length) {
        setErrorMessage('No cars found pending review at this time');
      } else {
        setErrorMessage(null); // Clear any previous error messages
      }
      
      setCars(filteredCars);
    } catch (error: any) {
      console.error('Error fetching cars:', error);
      // Use user-friendly message instead of technical error
      setErrorMessage('No cars found at this time');
      // Don't show toast for network errors to avoid spam
      console.log('Cars fetch error details:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Get cars from the listed endpoint and calculate stats from the response
      const response = await api.request('/cars/listed');
      
      if (response.error) {
        console.error('Error fetching listed cars for stats:', response.error);
        return;
      }
      
      const carsList = Array.isArray(response.data?.cars) ? response.data.cars : [];
      
      // Count cars by status
      const pending = carsList.filter(car => car.status === 'pending' || car.status === 'listed').length;
      const approved = carsList.filter(car => car.status === 'approved' || car.status === 'available').length;
      const rejected = carsList.filter(car => car.status === 'rejected').length;
      
      setStats({
        pending,
        approved,
        rejected
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Don't show error toast for stats - just log it
      console.log('Stats fetch failed, using default values');
    }
  };

  const handleReviewAction = async () => {
    if (!selectedCar || !reviewAction) return;
    
    try {
      let response;
      if (reviewAction === 'approve') {
        response = await api.request(`/cars/${selectedCar.id}/status`, { 
          method: 'PUT',
          body: JSON.stringify({ 
            status: 'available',
            notes: reviewNotes,
            pending_review: false
          })
        });
      } else {
        response = await api.request(`/cars/${selectedCar.id}/status`, { 
          method: 'PUT',
          body: JSON.stringify({ 
            status: 'rejected',
            notes: reviewNotes,
            pending_review: false
          })
        });
      }
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      // Update the car in the list
      setCars(prev => prev.map(car => 
        car.id === selectedCar.id ? response.data! : car
      ));
      
      setIsReviewDialogOpen(false);
      setSelectedCar(null);
      setReviewAction(null);
      setReviewNotes('');
      
      // Refresh stats
      fetchStats();
      
      toast({
        title: 'Success',
        description: `Car ${reviewAction === 'approve' ? 'approved' : 'rejected'} successfully.`,
      });
    } catch (error: any) {
      console.error('Error reviewing car:', error);
      toast({
        title: 'Error',
        description: 'Failed to review car.',
        variant: 'destructive',
      });
    }
  };

  const openDetailDialog = (car: CarReview) => {
    setSelectedCar(car);
    setIsDetailDialogOpen(true);
  };

  const openReviewDialog = (car: CarReview, action: 'approve' | 'reject') => {
    setSelectedCar(car);
    setReviewAction(action);
    setReviewNotes('');
    setIsReviewDialogOpen(true);
  };

  const handleSignOut = async () => {
    await logout();
    navigate('/');
  };

  const formatPrice = (price: number) => 
    new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'RWF', 
      minimumFractionDigits: 0 
    }).format(price);

  const generateWhatsAppLink = (phoneNumber: string, message?: string) => {
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    const defaultMessage = message || 'Hello! I\'m interested in your car listing.';
    return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(defaultMessage)}`;
  };

  // Helper functions to extract owner details from populated or legacy fields
  const getOwnerName = (car: CarReview): string => {
    if (typeof car.owner === 'object' && car.owner?.fullname) {
      return car.owner.fullname;
    }
    return car.sellerName || 'Unknown';
  };

  const getOwnerPhone = (car: CarReview): string => {
    if (typeof car.owner === 'object' && car.owner?.phone) {
      return car.owner.phone;
    }
    return car.sellerPhone || '';
  };

  const getOwnerEmail = (car: CarReview): string => {
    if (typeof car.owner === 'object' && car.owner?.email) {
      return car.owner.email;
    }
    return '';
  };

  const getListingTypeBadge = (car: CarReview) => {
    // Check if it's a rental car based on type field or dailyRate
    const isRental = car.type === 'rental' || car.dailyRate !== undefined;
    return isRental ? (
      <Badge variant="secondary" className="bg-blue-100 text-blue-800">For Rent</Badge>
    ) : (
      <Badge variant="secondary" className="bg-green-100 text-green-800">For Sale</Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'listed':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Listed</Badge>;
      case 'approved':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Approved</Badge>;
      case 'available':
        return <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">Available</Badge>;
      case 'rejected':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredCars = Array.isArray(cars) ? cars.filter(car =>
    (car.make || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (car.model || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    getOwnerName(car).toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
              <p className="text-muted-foreground">You need admin privileges to access this page.</p>
              <Button onClick={() => navigate('/')} className="mt-4">
                Go Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-primary/10">
      <div className="flex flex-col md:flex-row">
        <Sidebar handleSignOut={handleSignOut} />
        <div className="flex-1 md:ml-64 p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <Button variant="ghost" onClick={() => navigate('/admin-dashboard')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-3xl font-bold">Car Review Management</h1>
                <p className="text-muted-foreground">Review and approve/reject car listings from sellers</p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
                      <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                    </div>
                    <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Approved</p>
                      <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                    </div>
                    <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Rejected</p>
                      <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                    </div>
                    <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                      <XCircle className="h-4 w-4 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filters */}
            <Card className="mb-8">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search cars by make, model, or seller..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="listed">Listed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={fetchCars} variant="outline">
                    Refresh
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Cars Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
            ) : errorMessage ? (
              <Card className="bg-muted/50 border-muted mb-8">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-muted-foreground">No Cars Available</h3>
                      <p className="text-sm text-muted-foreground mt-1">{errorMessage}</p>
                    </div>
                    <Button onClick={fetchCars} variant="outline">Refresh</Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredCars.map((car) => (
                  <Card key={car.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative">
                      {car.primaryImage ? (
                        <img
                          src={car.primaryImage}
                          alt={`${car.make} ${car.model}`}
                          className="w-full h-48 object-cover"
                        />
                      ) : (
                        <div className="w-full h-48 bg-muted flex items-center justify-center">
                          <Car className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                      
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        {getStatusBadge(car.status)}
                        {getListingTypeBadge(car)}
                      </div>
                    </div>

                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div>
                          <h3 className="font-semibold text-lg">{car.make} {car.model}</h3>
                          <p className="text-sm text-muted-foreground">
                            {car.year} • {car.location}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            <span>{formatPrice(car.price)}</span>
                          </div>
                          {car.dailyRate && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{formatPrice(car.dailyRate)}/day</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Gauge className="h-3 w-3" />
                            <span>{car.mileage.toLocaleString()} km</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Fuel className="h-3 w-3" />
                            <span>{car.fuelType}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Settings className="h-3 w-3" />
                            <span>{car.transmission}</span>
                          </div>
                          {car.type === 'rental' && car.availability && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{car.availability}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <User className="h-3 w-3" />
                          <span>{getOwnerName(car)}</span>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <div className="flex gap-2 flex-wrap">
                            {car.status === 'pending' && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openReviewDialog(car, 'approve')}
                                  className="flex-1 sm:flex-none text-green-600 hover:text-green-700"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openReviewDialog(car, 'reject')}
                                  className="flex-1 sm:flex-none text-red-600 hover:text-red-700"
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                          <Button
                            size="sm"
                            onClick={() => navigate(`/admin/view-car/${(car as any)._id || (car as any).id}`)}
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Car Detail Dialog */}
            <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Car Details</DialogTitle>
                  <DialogDescription>
                    Detailed information about the car listing
                  </DialogDescription>
                </DialogHeader>
                {selectedCar && (
                  <div className="space-y-6">
                    {/* Car Images */}
                    {selectedCar.images && selectedCar.images.length > 0 && (
                      <div>
                        <Label className="text-sm font-medium">Images</Label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                          {selectedCar.images.map((image, index) => (
                            <img
                              key={index}
                              src={image}
                              alt={`${selectedCar.make} ${selectedCar.model} ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg"
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Car Video */}
                    {selectedCar.video && (
                      <div>
                        <Label className="text-sm font-medium">Video</Label>
                        <video
                          src={selectedCar.video}
                          controls
                          className="w-full max-w-md mt-2 rounded-lg"
                        />
                      </div>
                    )}

                    {/* Car Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium">Basic Information</Label>
                          <div className="mt-2 space-y-2">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Make:</span>
                              <span className="font-medium">{selectedCar.make}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Model:</span>
                              <span className="font-medium">{selectedCar.model}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Year:</span>
                              <span className="font-medium">{selectedCar.year}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Price:</span>
                              <span className="font-medium text-primary">{formatPrice(selectedCar.price)}</span>
                            </div>
                            {selectedCar.dailyRate && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Daily Rate:</span>
                                <span className="font-medium text-blue-600">{formatPrice(selectedCar.dailyRate)}</span>
                              </div>
                            )}
                            {selectedCar.type === 'rental' && (
                              <>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Availability:</span>
                                  <span className="font-medium">{selectedCar.availability || 'Flexible'}</span>
                                </div>
                                {selectedCar.minimumRentalDays && (
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Min Rental Days:</span>
                                    <span className="font-medium">{selectedCar.minimumRentalDays}</span>
                                  </div>
                                )}
                                {selectedCar.maximumRentalDays && (
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Max Rental Days:</span>
                                    <span className="font-medium">{selectedCar.maximumRentalDays}</span>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>

                        <div>
                          <Label className="text-sm font-medium">Specifications</Label>
                          <div className="mt-2 space-y-2">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Mileage:</span>
                              <span className="font-medium">{selectedCar.mileage.toLocaleString()} km</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Fuel Type:</span>
                              <span className="font-medium">{selectedCar.fuelType}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Transmission:</span>
                              <span className="font-medium">{selectedCar.transmission}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Color:</span>
                              <span className="font-medium">{selectedCar.color}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Location:</span>
                              <span className="font-medium">{selectedCar.location}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium">Owner Information</Label>
                          <div className="mt-2 space-y-2">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Name:</span>
                              <span className="font-medium">{getOwnerName(selectedCar)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Phone:</span>
                              <span className="font-medium">{getOwnerPhone(selectedCar)}</span>
                            </div>
                            {getOwnerEmail(selectedCar) && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Email:</span>
                                <span className="font-medium">{getOwnerEmail(selectedCar)}</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Listed:</span>
                              <span className="font-medium">
                                {new Date(selectedCar.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Status:</span>
                              {getStatusBadge(selectedCar.status)}
                            </div>
                          </div>
                        </div>

                        {/* Contact Information */}
                        <div>
                          <Label className="text-sm font-medium">Contact Information</Label>
                          <div className="mt-2 space-y-3">
                            <div className="flex gap-2">
                              <Input
                                placeholder="Enter phone number for WhatsApp"
                                value={contactInfo}
                                onChange={(e) => setContactInfo(e.target.value)}
                                className="flex-1"
                              />
                              {contactInfo && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => window.open(generateWhatsAppLink(contactInfo), '_blank')}
                                  className="flex items-center gap-2"
                                >
                                  <MessageCircle className="h-4 w-4" />
                                  WhatsApp
                                  <ExternalLink className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                            {getOwnerPhone(selectedCar) && (
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => window.open(generateWhatsAppLink(getOwnerPhone(selectedCar)), '_blank')}
                                  className="flex items-center gap-2"
                                >
                                  <Phone className="h-4 w-4" />
                                  Contact Owner
                                  <ExternalLink className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>

                        {selectedCar.description && (
                          <div>
                            <Label className="text-sm font-medium">Description</Label>
                            <p className="mt-2 text-sm text-muted-foreground">
                              {selectedCar.description}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
                    Close
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Review Action Dialog */}
            <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>
                    {reviewAction === 'approve' ? 'Approve' : 'Reject'} Car Listing
                  </DialogTitle>
                  <DialogDescription>
                    {reviewAction === 'approve' 
                      ? 'Approve this car listing to make it visible to buyers.'
                      : 'Reject this car listing. The seller will be notified.'
                    }
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  {selectedCar && (
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-medium">{selectedCar.make} {selectedCar.model} ({selectedCar.year})</h4>
                      <p className="text-sm text-muted-foreground">by {getOwnerName(selectedCar)}</p>
                    </div>
                  )}
                  <div className="grid gap-2">
                    <Label htmlFor="notes">Review Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder={`Add notes for ${reviewAction === 'approve' ? 'approval' : 'rejection'}...`}
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleReviewAction}
                    className={reviewAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
                  >
                    {reviewAction === 'approve' ? 'Approve' : 'Reject'} Listing
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {!loading && filteredCars.length === 0 && (
              <div className="text-center py-12">
                <Car className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Cars Found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Try adjusting your search criteria.' 
                    : 'No cars are currently under review.'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCarReview;
