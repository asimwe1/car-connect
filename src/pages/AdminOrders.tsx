import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  ShoppingBag, 
  Filter, 
  Eye, 
  CheckCircle, 
  XCircle,
  Clock,
  ArrowLeft,
  Calendar,
  DollarSign,
  User,
  Car
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/services/api";

interface Order {
  _id: string;
  amount: number;
  status: 'initiated' | 'paid' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  buyer: { fullname: string; email: string };
  car: { make: string; model: string; year: number; images: string[]; primaryImage?: string };
  paymentRef?: string;
  notes?: string;
}

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.getAdminOrders({ page: 1, limit: 100 });
      if (response.data?.items) setOrders(response.data.items as any);
      else setOrders([]);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast({
        title: "Error",
        description: "Failed to fetch orders. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      // TODO: Implement API call to update order status
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus as any, updated_at: new Date().toISOString() }
          : order
      ));
      
      toast({
        title: "Success",
        description: `Order status updated to ${newStatus}.`,
      });
    } catch (error) {
      console.error("Error updating order status:", error);
      toast({
        title: "Error",
        description: "Failed to update order status.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-500';
      case 'initiated':
        return 'bg-yellow-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4" />;
      case 'initiated':
        return <Clock className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(price);

  const filteredOrders = orders.filter(order =>
    `${order.buyer.fullname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${order.buyer.email}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${order.car.make} ${order.car.model}`.toLowerCase().includes(searchTerm.toLowerCase())
  ).filter(order => statusFilter === '' || order.status === statusFilter);

  const totalRevenue = orders
    .filter(order => order.status === 'paid')
    .reduce((sum, order) => sum + order.amount, 0);

  const totalOrders = orders.length;
  const completedOrders = orders.filter(order => order.status === 'paid').length;
  const pendingOrders = orders.filter(order => order.status === 'initiated').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-primary/10 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => navigate('/admin-dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Manage Orders</h1>
            <p className="text-muted-foreground">View and manage customer orders</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold">{totalOrders}</p>
                </div>
                <ShoppingBag className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{completedOrders}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{pendingOrders}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-600">{formatPrice(totalRevenue)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders by number, customer, or vehicle..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
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
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <Card key={order._id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <img
                        src={order.car.primaryImage || order.car.images[0] || '/placeholder.svg'}
                        alt={`${order.car.make} ${order.car.model}`}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">{order._id.slice(0,8).toUpperCase()}</h3>
                          <Badge className={getStatusColor(order.status)}>
                            <span className="flex items-center gap-1">
                              {getStatusIcon(order.status)}
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </Badge>
                        </div>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>{order.buyer.fullname} ({order.buyer.email})</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Car className="h-4 w-4" />
                            <span>{order.car.make} {order.car.model} {order.car.year}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>Ordered {formatDate(order.createdAt)}</span>
                          </div>
                          {order.paymentRef && (
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4" />
                              <span>Payment Ref {order.paymentRef}</span>
                            </div>
                          )}
                        </div>
                        {order.notes && (
                          <p className="text-sm text-muted-foreground italic">
                            Note: {order.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right space-y-2">
                      <div className="text-2xl font-bold text-primary">
                        {formatPrice(order.amount)}
                      </div>
                      <div className="flex gap-2">
                        {order.status === 'initiated' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleUpdateStatus(order._id, 'paid')}
                            >
                              Mark Paid
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateStatus(order._id, 'cancelled')}
                            >
                              Cancel
                            </Button>
                          </>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/admin/order/${order._id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Orders Found</h3>
            <p className="text-muted-foreground">
              {searchTerm ? 'Try adjusting your search criteria.' : 'No orders have been placed yet.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;


