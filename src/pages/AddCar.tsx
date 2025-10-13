import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Car, Save, ArrowLeft, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/services/api';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { uploadImagesToCloudinary } from '@/services/cloudinaryUpload';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/Sidebar';

// Schema based on the backend carSchema
const carSchema = z.object({
  make: z.string().min(1, 'Make is required').trim(),
  model: z.string().min(1, 'Model is required').trim(),
  year: z.number().min(1900, 'Year must be after 1900').max(2025, 'Year cannot be in the future'),
  price: z.number().min(0, 'Price must be non-negative'),
  currency: z.enum(['RWF', 'USD']).default('RWF'),
  mileage: z.number().min(0, 'Mileage must be non-negative').optional(),
  vin: z.string().optional(),
  description: z.string().optional(),
  images: z.array(z.string()).optional(),
  primaryImage: z.string().optional(),
  location: z.string().optional(),
  fuelType: z.enum(['petrol', 'diesel', 'electric', 'hybrid', 'other']).default('other'),
  transmission: z.enum(['automatic', 'manual']).default('automatic'),
  bodyType: z.string().optional(),
  color: z.string().optional(),
});

type FormValues = z.infer<typeof carSchema>;

const AddCar = () => {
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormValues>({
    resolver: zodResolver(carSchema),
    defaultValues: {
      make: '',
      model: '',
      year: 2023,
      price: 0,
      currency: 'RWF',
      mileage: 0,
      fuelType: 'petrol',
      transmission: 'automatic',
      description: '',
      images: [],
      primaryImage: '',
      location: '',
      bodyType: '',
      color: '',
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + imageFiles.length > 20) {
      toast({
        title: 'Too many images',
        description: 'Maximum 20 images allowed',
        variant: 'destructive',
      });
      return;
    }
    setImageFiles((prev) => [...prev, ...files]);
  };

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSignOut = async () => {
    await logout();
    navigate('/');
  };

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      let imageUrls: string[] = [];
      if (imageFiles.length > 0) {
        imageUrls = await uploadImagesToCloudinary(imageFiles);
      }

      const carData = {
        make: data.make,
        model: data.model,
        year: data.year,
        price: data.price,
        currency: data.currency,
        mileage: data.mileage || 0,
        fuelType: data.fuelType,
        transmission: data.transmission,
        status: 'available',
        description: data.description || undefined,
        location: data.location || undefined,
        bodyType: data.bodyType || undefined,
        color: data.color || undefined,
        vin: data.vin || undefined,
        images: imageUrls,
        primaryImage: imageUrls[0] || '',
      };

      const response = await api.createCar(carData);
      if (response.error) {
        throw new Error(response.error);
      }

      toast({
        title: 'Success!',
        description: 'Car listing created successfully',
      });
      navigate('/admin-dashboard');
    } catch (error) {
      console.error('Error creating car:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create car listing',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
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
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <Button variant="ghost" onClick={() => navigate('/admin-dashboard')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-3xl font-bold">Add New Car</h1>
                <p className="text-muted-foreground">Create a new car listing</p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Car className="h-5 w-5" />
                    Vehicle Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="make">Make *</Label>
                      <Input
                        id="make"
                        {...register('make')}
                        placeholder="e.g., Toyota"
                        className={errors.make ? 'border-destructive' : ''}
                      />
                      {errors.make && <p className="text-sm text-destructive">{errors.make.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="model">Model *</Label>
                      <Input
                        id="model"
                        {...register('model')}
                        placeholder="e.g., Corolla"
                        className={errors.model ? 'border-destructive' : ''}
                      />
                      {errors.model && <p className="text-sm text-destructive">{errors.model.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="year">Year *</Label>
                      <Input
                        id="year"
                        type="number"
                        {...register('year', { valueAsNumber: true })}
                        placeholder="2023"
                        min="1900"
                        max="2025"
                        className={errors.year ? 'border-destructive' : ''}
                      />
                      {errors.year && <p className="text-sm text-destructive">{errors.year.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="color">Color</Label>
                      <Input
                        id="color"
                        {...register('color')}
                        placeholder="e.g., Blue"
                        className={errors.color ? 'border-destructive' : ''}
                      />
                      {errors.color && <p className="text-sm text-destructive">{errors.color.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        {...register('location')}
                        placeholder="e.g., Kigali, Rwanda"
                        className={errors.location ? 'border-destructive' : ''}
                      />
                      {errors.location && <p className="text-sm text-destructive">{errors.location.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bodyType">Body Type</Label>
                      <Select
                        value={watch('bodyType')}
                        onValueChange={(value) => setValue('bodyType', value)}
                      >
                        <SelectTrigger className={errors.bodyType ? 'border-destructive' : ''}>
                          <SelectValue placeholder="Select body type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SUV">SUV</SelectItem>
                          <SelectItem value="Sedan">Sedan</SelectItem>
                          <SelectItem value="Hatchback">Hatchback</SelectItem>
                          <SelectItem value="Coupe">Coupe</SelectItem>
                          <SelectItem value="Pickup">Pickup</SelectItem>
                          <SelectItem value="Wagon">Wagon</SelectItem>
                          <SelectItem value="Convertible">Convertible</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.bodyType && <p className="text-sm text-destructive">{errors.bodyType.message}</p>}
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Pricing</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="price">Price ({watch('currency')}) *</Label>
                        <Input
                          id="price"
                          type="number"
                          {...register('price', { valueAsNumber: true })}
                          placeholder={watch('currency') === 'USD' ? '15000' : '15000000'}
                          min="0"
                          step="0.01"
                          className={errors.price ? 'border-destructive' : ''}
                        />
                        {errors.price && <p className="text-sm text-destructive">{errors.price.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="currency">Currency</Label>
                        <Select
                          value={watch('currency')}
                          onValueChange={(value) => setValue('currency', value as any)}
                        >
                          <SelectTrigger className={errors.currency ? 'border-destructive' : ''}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="RWF">RWF</SelectItem>
                            <SelectItem value="USD">USD</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.currency && <p className="text-sm text-destructive">{(errors as any).currency?.message}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Specifications */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Specifications</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="mileage">Mileage</Label>
                        <Input
                          id="mileage"
                          type="number"
                          {...register('mileage', { valueAsNumber: true })}
                          placeholder="100000"
                          min="0"
                          className={errors.mileage ? 'border-destructive' : ''}
                        />
                        {errors.mileage && <p className="text-sm text-destructive">{errors.mileage.message}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="fuelType">Fuel Type *</Label>
                        <Select
                          value={watch('fuelType')}
                          onValueChange={(value) => setValue('fuelType', value as any)}
                        >
                          <SelectTrigger className={errors.fuelType ? 'border-destructive' : ''}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="petrol">Petrol</SelectItem>
                            <SelectItem value="diesel">Diesel</SelectItem>
                            <SelectItem value="hybrid">Hybrid</SelectItem>
                            <SelectItem value="electric">Electric</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.fuelType && <p className="text-sm text-destructive">{errors.fuelType.message}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="transmission">Transmission *</Label>
                        <Select
                          value={watch('transmission')}
                          onValueChange={(value) => setValue('transmission', value as any)}
                        >
                          <SelectTrigger className={errors.transmission ? 'border-destructive' : ''}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="automatic">Automatic</SelectItem>
                            <SelectItem value="manual">Manual</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.transmission && <p className="text-sm text-destructive">{errors.transmission.message}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="vin">VIN</Label>
                        <Input
                          id="vin"
                          {...register('vin')}
                          placeholder="Vehicle Identification Number"
                          className={errors.vin ? 'border-destructive' : ''}
                        />
                        {errors.vin && <p className="text-sm text-destructive">{errors.vin.message}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      {...register('description')}
                      placeholder="Enter vehicle description"
                      className={errors.description ? 'border-destructive' : ''}
                    />
                    {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
                  </div>

                  {/* Images */}
                  <div className="space-y-2">
                    <Label htmlFor="images">Images (Max 20, 5MB each)</Label>
                    <Input
                      id="images"
                      type="file"
                      accept="image/jpeg,image/png,image/jpg"
                      multiple
                      onChange={handleImageChange}
                    />
                    {imageFiles.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium">Image Previews:</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                          {imageFiles.map((file, index) => (
                            <div key={`new-${index}`} className="relative">
                              <img
                                src={URL.createObjectURL(file)}
                                alt={`Image ${index + 1}`}
                                className="w-full h-32 object-cover rounded"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-1 right-1 h-6 w-6"
                                onClick={() => removeImage(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {errors.images && <p className="text-sm text-destructive">{errors.images.message}</p>}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-4 pt-6">
                    <Button type="submit" disabled={isLoading} className="btn-hero">
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Creating...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Create Listing
                        </>
                      )}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => navigate('/admin-dashboard')}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCar;