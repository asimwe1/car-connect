import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft,
  Calendar,
  DollarSign,
  User,
  Car,
  Clock,
  MessageCircle,
  FileText
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { api } from "@/services/api";
import Sidebar from '@/components/Sidebar';

interface Order {
  _id: string;
  amount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'expired';
  createdAt: string;
  updatedAt: string;
  buyer: { fullname: string; email: string };
  car: { 
    make: string; 
    model: string; 
    year: number; 
    images: string[]; 
    primaryImage?: string;
    price?: number;
    dailyRate?: number;
  };
  paymentRef?: string;
  notes?: string;
  expiresAt?: string;
}

const AdminOrderDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const init = async () => {
      if (!isAuthenticated || user?.role !== 'admin') {
        navigate('/signin');
        return;
      }

      try {
        // Verify authentication
        const meResponse = await api.request('/auth/me');
        if (meResponse.error || !meResponse.data?.user) {
          throw new Error('Authentication check failed');
        }
        await fetchOrder();
      } catch (error) {
        console.error('Auth or initialization error:', error);
        navigate('/signin');
      }
    };

    init();
  }, [isAuthenticated, user, navigate, id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);

      const response = await api.request(`/bookings/${id}`);
      
      if (response.error) {
        throw new Error(response.error);
      }

      const booking = response.data;
      if (!booking) {
        throw new Error('Order not found');
      }

      // Transform booking data to match Order interface
      const normalized: Order = {
        _id: String(booking._id || ''),
        amount: booking.amount || 0,
        status: (booking.status || 'pending') as any,
        createdAt: String(booking.createdAt || new Date().toISOString()),
        updatedAt: String(booking.updatedAt || new Date().toISOString()),
        expiresAt: String(booking.expiresAt || ''),
        buyer: {
          fullname: String(booking.user?.fullname || '—'),
          email: String(booking.user?.email || '—'),
        },
        car: {
          make: String(booking.car?.make || 'Unknown'),
          model: String(booking.car?.model || ''),
          year: Number(booking.car?.year || new Date().getFullYear()),
          images: booking.car?.images || [],
          primaryImage: booking.car?.primaryImage,
          price: booking.car?.price,
          dailyRate: booking.car?.dailyRate,
        },
        paymentRef: booking.paymentRef,
        notes: booking.notes,
      };

      setOrder(normalized);
    } catch (error) {
      console.error('Error fetching order:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to fetch order details');
      toast({
        title: 'Error',
        description: 'Failed to fetch order details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await api.request('/auth/logout', { method: 'POST' });
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const formatPrice = (price: number) => 
    new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'RWF', 
      minimumFractionDigits: 0 
    }).format(price);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'confirmed':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Confirmed</Badge>;
      case 'cancelled':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Cancelled</Badge>;
      case 'expired':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Expired</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <Button variant="ghost" onClick={() => navigate('/admin-orders')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Orders
              </Button>
              <div>
                <h1 className="text-3xl font-bold">Order Details</h1>
                <p className="text-muted-foreground">View and manage order information</p>
              </div>
            </div>

            {loading ? (
              <Card>
                <CardContent className="p-8">
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-muted rounded w-1/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                  </div>
                </CardContent>
              </Card>
            ) : errorMessage ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
                  <p className="text-muted-foreground mb-4">{errorMessage}</p>
                  <Button onClick={fetchOrder}>Retry</Button>
                </CardContent>
              </Card>
            ) : order ? (
              <div className="space-y-6">
                {/* Order Summary Card */}
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>Order Summary</CardTitle>
                        <p className="text-sm text-muted-foreground">Order ID: {order._id}</p>
                      </div>
                      {getStatusBadge(order.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-semibold mb-2">Customer Information</h3>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span>{order.buyer.fullname}</span>
                            </div>
                            {order.buyer.email && (
                              <div className="flex items-center gap-2">
                                <MessageCircle className="h-4 w-4 text-muted-foreground" />
                                <span>{order.buyer.email}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <h3 className="font-semibold mb-2">Vehicle Details</h3>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Car className="h-4 w-4 text-muted-foreground" />
                              <span>{order.car.make} {order.car.model} ({order.car.year})</span>
                            </div>
                            {order.car.primaryImage && (
                              <img 
                                src={order.car.primaryImage} 
                                alt={`${order.car.make} ${order.car.model}`}
                                className="rounded-lg w-full max-w-xs object-cover"
                              />
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h3 className="font-semibold mb-2">Order Details</h3>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>Created: {formatDate(order.createdAt)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>Updated: {formatDate(order.updatedAt)}</span>
                            </div>
                            {order.expiresAt && (
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span>Expires: {formatDate(order.expiresAt)}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-muted-foreground" />
                              <span>Amount: {formatPrice(order.amount)}</span>
                            </div>
                            {order.car.dailyRate && (
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span>Daily Rate: {formatPrice(order.car.dailyRate)}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {(order.notes || order.paymentRef) && (
                          <div>
                            <h3 className="font-semibold mb-2">Additional Information</h3>
                            {order.notes && (
                              <div className="flex items-start gap-2 mb-2">
                                <FileText className="h-4 w-4 text-muted-foreground mt-1" />
                                <p className="text-muted-foreground">{order.notes}</p>
                              </div>
                            )}
                            {order.paymentRef && (
                              <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                                <span>Payment Ref: {order.paymentRef}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                {order.status === 'pending' && (
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <Button 
                          variant="outline" 
                          className="flex-1 text-green-600 hover:text-green-700"
                          onClick={() => console.log('Confirm order:', order._id)}
                        >
                          Confirm Order
                        </Button>
                        <Button 
                          variant="outline"
                          className="flex-1 text-red-600 hover:text-red-700"
                          onClick={() => console.log('Cancel order:', order._id)}
                        >
                          Cancel Order
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <h2 className="text-xl font-semibold mb-2">Order Not Found</h2>
                  <p className="text-muted-foreground mb-4">This order may have been deleted or does not exist.</p>
                  <Button onClick={() => navigate('/admin-orders')}>View All Orders</Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetails;