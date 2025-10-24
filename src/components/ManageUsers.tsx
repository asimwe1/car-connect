import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { Users, Search, MapPin, Phone, Calendar } from 'lucide-react';
import { api } from '@/services/api';

interface User {
  _id: string;
  fullname: string;
  phone: string;
  role: 'user' | 'admin';
  createdAt: string;
  location?: string;
}

interface ManageUsersProps {
  // This component will fetch its own data
}

const ManageUsers: React.FC<ManageUsersProps> = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.getUsers({ page: 1, limit: 10 });
      if (response.data) {
        const usersData = Array.isArray(response.data) ? response.data : response.data.items || [];
        setUsers(usersData);
        setTotalUsers(response.data.total || usersData.length);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone.includes(searchTerm)
  );

  const getLocationFromPhone = (phone: string) => {
    // Simple location detection based on phone number patterns
    if (phone.startsWith('+250')) return 'Rwanda';
    if (phone.startsWith('+254')) return 'Kenya';
    if (phone.startsWith('+256')) return 'Uganda';
    if (phone.startsWith('+255')) return 'Tanzania';
    return 'Unknown';
  };

  return (
    <Card className="bg-card/80 backdrop-blur-sm border border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Manage Users
            </CardTitle>
            <CardDescription>View and manage platform users</CardDescription>
          </div>
          <Badge variant="secondary">
            {totalUsers} total
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Loading users...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No users found</p>
                <p className="text-xs mt-1">Try adjusting your search</p>
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user._id}
                  className="flex items-start gap-3 p-3 bg-accent/10 rounded-lg hover:bg-accent/20 transition-colors"
                >
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm truncate">
                        {user.fullname}
                      </p>
                      <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'} className="text-xs">
                        {user.role}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        <span>{user.phone}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{getLocationFromPhone(user.phone)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {users.length > 0 && (
            <div className="mt-4 pt-3 border-t">
              <Link to="/admin/users">
                <Button variant="outline" size="sm" className="w-full">
                  <Users className="w-4 h-4 mr-2" />
                  View All Users
                </Button>
              </Link>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ManageUsers;
