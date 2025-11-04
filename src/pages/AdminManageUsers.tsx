import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Link } from 'react-router-dom';
import { Users, Search, MapPin, Phone, Calendar, ArrowLeft, Mail, Eye } from 'lucide-react';
import { api } from '@/services/api';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface User {
  _id: string;
  fullname: string;
  phone: string | null;
  email: string | null;
  role: 'user' | 'admin';
  createdAt: string;
  location?: string;
}

const AdminManageUsers = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalUsers, setTotalUsers] = useState(0);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/admin-dashboard');
      return;
    }
    fetchUsers();
  }, [user, navigate]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.getUsers({ page: 1, limit: 100 });
      const usersData = response.data?.items || response.data || [];
      setUsers(usersData);
      setTotalUsers(usersData.length);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    navigate('/');
  };

  const filteredUsers = users.filter(user =>
    user.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.phone && user.phone.includes(searchTerm)) ||
    (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getLocationFromPhone = (phone: string | null | undefined) => {
    // Handle null/undefined phone numbers
    if (!phone || typeof phone !== 'string') {
      return 'Unknown';
    }
    
    // Simple location detection based on phone number patterns
    if (phone.startsWith('+1')) return 'United States';
    if (phone.startsWith('+44')) return 'United Kingdom';
    if (phone.startsWith('+91')) return 'India';
    if (phone.startsWith('+86')) return 'China';
    if (phone.startsWith('+49')) return 'Germany';
    if (phone.startsWith('+33')) return 'France';
    if (phone.startsWith('+81')) return 'Japan';
    if (phone.startsWith('+61')) return 'Australia';
    if (phone.startsWith('+27')) return 'South Africa';
    if (phone.startsWith('+234')) return 'Nigeria';
    if (phone.startsWith('+254')) return 'Kenya';
    if (phone.startsWith('+256')) return 'Uganda';
    if (phone.startsWith('+255')) return 'Tanzania';
    if (phone.startsWith('+250')) return 'Rwanda';
    return 'Unknown';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-primary/10">
        <div className="flex flex-col md:flex-row">
          <Sidebar handleSignOut={handleSignOut} />
          <div className="flex-1 md:ml-64 p-3 sm:p-4 md:p-8">
            <div className="mx-auto w-full max-w-7xl">
              <div className="flex items-center justify-center h-64">
                <div className="text-lg text-muted-foreground">Loading users...</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-primary/10">
      <div className="flex flex-col md:flex-row">
        <Sidebar handleSignOut={handleSignOut} />
        <div className="flex-1 md:ml-64 p-3 sm:p-4 md:p-8">
          <div className="mx-auto w-full max-w-7xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => navigate('/admin-dashboard')}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
                <div className="flex items-center gap-2">
                  <Users className="h-6 w-6 text-primary" />
                  <h1 className="text-2xl font-bold">Manage Users</h1>
                </div>
              </div>
            </div>

            {/* Search and Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
              <Card className="lg:col-span-3">
                <CardContent className="p-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users by name or phone..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-primary">{totalUsers}</div>
                  <div className="text-sm text-muted-foreground">Total Users</div>
                </CardContent>
              </Card>
            </div>

            {/* Users List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUsers.map((user) => (
                <Card key={user._id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{user.fullname}</CardTitle>
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      {user.phone && (
                        <CardDescription className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {user.phone}
                        </CardDescription>
                      )}
                      {user.email && (
                        <CardDescription className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </CardDescription>
                      )}
                      {!user.phone && !user.email && (
                        <CardDescription className="text-muted-foreground">
                          No contact information
                        </CardDescription>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{getLocationFromPhone(user.phone)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>Joined {formatDate(user.createdAt)}</span>
                      </div>
                      <div className="mt-3">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => {
                            setSelectedUser(user);
                            setShowUserDetails(true);
                          }}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No users found</h3>
                <p className="text-muted-foreground">
                  {searchTerm ? 'Try adjusting your search terms' : 'No users available'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Details Modal */}
      <Dialog open={showUserDetails} onOpenChange={setShowUserDetails}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{selectedUser.fullname}</h3>
                <Badge variant={selectedUser.role === 'admin' ? 'default' : 'secondary'} className="mt-1">
                  {selectedUser.role}
                </Badge>
              </div>
              
              <div className="space-y-3">
                <div className="border-b pb-3">
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Contact Information</h4>
                  {selectedUser.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedUser.phone}</span>
                    </div>
                  )}
                  {selectedUser.email && (
                    <div className="flex items-center gap-2 text-sm mt-1">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedUser.email}</span>
                    </div>
                  )}
                  {!selectedUser.phone && !selectedUser.email && (
                    <p className="text-sm text-muted-foreground">No contact information available</p>
                  )}
                </div>

                <div className="border-b pb-3">
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Location</h4>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{getLocationFromPhone(selectedUser.phone)}</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Account Information</h4>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Joined {formatDate(selectedUser.createdAt)}</span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    <span>User ID: {selectedUser._id}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminManageUsers;
