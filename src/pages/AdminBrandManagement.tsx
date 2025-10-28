import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  ArrowLeft,
  Upload,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/Sidebar';
import { brandService, Brand, CreateBrandData, UpdateBrandData } from '@/services/brandService';
import { uploadImages } from '@/services/upload';

const AdminBrandManagement = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, logout, isAuthenticated } = useAuth();

  const [createFormData, setCreateFormData] = useState<CreateBrandData>({
    name: '',
    logo: '',
    count: ''
  });

  const [editFormData, setEditFormData] = useState<UpdateBrandData>({
    name: '',
    logo: '',
    count: '',
    isActive: true
  });

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/signin');
      return;
    }
    fetchBrands();
  }, [isAuthenticated, user, navigate]);

  const fetchBrands = async () => {
    try {
      setErrorMessage(null);
      setLoading(true);
      const response = await brandService.getBrands();
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      setBrands(response.data || []);
    } catch (error: any) {
      console.error('Error fetching brands:', error);
      const msg = typeof error?.message === 'string' ? error.message : 'Failed to fetch brands. Please try again.';
      setErrorMessage(msg);
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBrand = async () => {
    try {
      if (!createFormData.name.trim()) {
        toast({
          title: 'Name required',
          description: 'Please enter a brand name.',
          variant: 'destructive',
        });
        return;
      }

      const response = await brandService.createBrand(createFormData);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      setBrands(prev => [response.data!, ...prev]);
      setIsCreateDialogOpen(false);
      setCreateFormData({ name: '', logo: '', count: '' });
      
      toast({
        title: 'Success',
        description: 'Brand created successfully.',
      });
    } catch (error: any) {
      console.error('Error creating brand:', error);
      toast({
        title: 'Error',
        description: 'Failed to create brand.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateBrand = async () => {
    if (!editingBrand) return;
    
    try {
      const response = await brandService.updateBrand(editingBrand.id, editFormData);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      setBrands(prev => prev.map(brand => 
        brand.id === editingBrand.id ? response.data! : brand
      ));
      setIsEditDialogOpen(false);
      setEditingBrand(null);
      
      toast({
        title: 'Success',
        description: 'Brand updated successfully.',
      });
    } catch (error: any) {
      console.error('Error updating brand:', error);
      toast({
        title: 'Error',
        description: 'Failed to update brand.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteBrand = async (brandId: string) => {
    try {
      const response = await brandService.deleteBrand(brandId);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      setBrands(prev => prev.filter(brand => brand.id !== brandId));
      
      toast({
        title: 'Success',
        description: 'Brand deleted successfully.',
      });
    } catch (error: any) {
      console.error('Error deleting brand:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete brand.',
        variant: 'destructive',
      });
    }
  };

  const handleToggleStatus = async (brandId: string) => {
    try {
      const response = await brandService.toggleBrandStatus(brandId);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      setBrands(prev => prev.map(brand => 
        brand.id === brandId ? response.data! : brand
      ));
      
      toast({
        title: 'Success',
        description: 'Brand status updated successfully.',
      });
    } catch (error: any) {
      console.error('Error toggling brand status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update brand status.',
        variant: 'destructive',
      });
    }
  };

  const handleLogoUpload = async (file: File, isEdit = false) => {
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) { // 2MB
      toast({
        title: 'File too large',
        description: 'Logo must be smaller than 2MB',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    try {
      const uploadedImages = await uploadImages([file]);
      const logoUrl = uploadedImages[0];
      
      if (isEdit) {
        setEditFormData(prev => ({ ...prev, logo: logoUrl }));
      } else {
        setCreateFormData(prev => ({ ...prev, logo: logoUrl }));
      }
      
      toast({
        title: 'Logo uploaded',
        description: 'Logo uploaded successfully',
      });
    } catch (error) {
      console.error('Logo upload error:', error);
      toast({
        title: 'Upload failed',
        description: 'Failed to upload logo. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const openEditDialog = (brand: Brand) => {
    setEditingBrand(brand);
    setEditFormData({
      name: brand.name,
      logo: brand.logo,
      count: brand.count,
      isActive: brand.isActive
    });
    setIsEditDialogOpen(true);
  };

  const handleSignOut = async () => {
    await logout();
    navigate('/');
  };

  const filteredBrands = brands.filter(brand =>
    brand.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                <h1 className="text-3xl font-bold">Brand Management</h1>
                <p className="text-muted-foreground">Manage car brands displayed on the landing page</p>
              </div>
            </div>

            {/* Search and Actions */}
            <Card className="mb-8">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search brands..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="btn-hero w-full sm:w-auto">
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Brand
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Create New Brand</DialogTitle>
                        <DialogDescription>
                          Add a new car brand to display on the landing page.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="name">Brand Name *</Label>
                          <Input
                            id="name"
                            placeholder="e.g., Toyota"
                            value={createFormData.name}
                            onChange={(e) => setCreateFormData(prev => ({ ...prev, name: e.target.value }))}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="count">Model Count</Label>
                          <Input
                            id="count"
                            placeholder="e.g., 120+ Models"
                            value={createFormData.count}
                            onChange={(e) => setCreateFormData(prev => ({ ...prev, count: e.target.value }))}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label>Brand Logo</Label>
                          <div className="flex items-center gap-4">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleLogoUpload(file, false);
                              }}
                              className="hidden"
                              id="logo-upload"
                            />
                            <label
                              htmlFor="logo-upload"
                              className="flex items-center gap-2 px-4 py-2 border border-border rounded-md cursor-pointer hover:bg-accent/50"
                            >
                              <Upload className="h-4 w-4" />
                              {isUploading ? 'Uploading...' : 'Upload Logo'}
                            </label>
                            {createFormData.logo && (
                              <div className="flex items-center gap-2">
                                <img src={createFormData.logo} alt="Logo preview" className="h-8 w-8 object-contain" />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setCreateFormData(prev => ({ ...prev, logo: '' }))}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleCreateBrand}>Create Brand</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>

            {/* Brands Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {[...Array(8)].map((_, i) => (
                  <Card key={i} className="overflow-hidden animate-pulse">
                    <div className="h-32 bg-muted"></div>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="h-4 bg-muted rounded"></div>
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : errorMessage ? (
              <Card className="bg-destructive/10 border-destructive/30 mb-8">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-destructive">Brands failed to load</h3>
                      <p className="text-sm text-muted-foreground mt-1">{errorMessage}</p>
                    </div>
                    <Button onClick={fetchBrands} variant="destructive">Retry</Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {filteredBrands.map((brand) => (
                  <Card key={brand.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative h-32 flex items-center justify-center bg-muted">
                      {brand.logo ? (
                        <img
                          src={brand.logo}
                          alt={`${brand.name} logo`}
                          className="max-w-full max-h-full object-contain"
                        />
                      ) : (
                        <div className="text-muted-foreground">No Logo</div>
                      )}
                      <Badge 
                        className={`absolute top-2 right-2 ${
                          brand.isActive 
                            ? 'bg-green-500 text-white' 
                            : 'bg-gray-500 text-white'
                        }`}
                      >
                        {brand.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>

                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div>
                          <h3 className="font-semibold text-lg">{brand.name}</h3>
                          <p className="text-sm text-muted-foreground">{brand.count}</p>
                        </div>

                        <div className="flex gap-2 flex-wrap">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(brand)}
                            className="flex-1 sm:flex-none"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleStatus(brand.id)}
                            className="flex-1 sm:flex-none"
                          >
                            {brand.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-destructive hover:text-destructive flex-1 sm:flex-none"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Brand</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{brand.name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteBrand(brand.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Edit Brand</DialogTitle>
                  <DialogDescription>
                    Update the brand information.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-name">Brand Name *</Label>
                    <Input
                      id="edit-name"
                      placeholder="e.g., Toyota"
                      value={editFormData.name}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-count">Model Count</Label>
                    <Input
                      id="edit-count"
                      placeholder="e.g., 120+ Models"
                      value={editFormData.count}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, count: e.target.value }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Brand Logo</Label>
                    <div className="flex items-center gap-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleLogoUpload(file, true);
                        }}
                        className="hidden"
                        id="edit-logo-upload"
                      />
                      <label
                        htmlFor="edit-logo-upload"
                        className="flex items-center gap-2 px-4 py-2 border border-border rounded-md cursor-pointer hover:bg-accent/50"
                      >
                        <Upload className="h-4 w-4" />
                        {isUploading ? 'Uploading...' : 'Upload New Logo'}
                      </label>
                      {editFormData.logo && (
                        <div className="flex items-center gap-2">
                          <img src={editFormData.logo} alt="Logo preview" className="h-8 w-8 object-contain" />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditFormData(prev => ({ ...prev, logo: '' }))}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpdateBrand}>Update Brand</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {!loading && filteredBrands.length === 0 && (
              <div className="text-center py-12">
                <div className="h-16 w-16 text-muted-foreground mx-auto mb-4">🚗</div>
                <h3 className="text-lg font-semibold mb-2">No Brands Found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm ? 'Try adjusting your search criteria.' : 'Get started by adding your first brand.'}
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)} className="btn-hero">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Brand
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBrandManagement;
