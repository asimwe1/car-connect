import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select-wrapper';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Car, Save, ArrowLeft, X, DollarSign, Calendar } from 'lucide-react';
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
  carType: z.enum(['sell', 'rent']).default('sell'),
  // Rental-specific fields
  dailyRate: z.number().min(0, 'Daily rate must be non-negative').optional(),
  minimumRentalDays: z.number().min(1, 'Minimum rental days must be at least 1').optional(),
  maximumRentalDays: z.number().min(1, 'Maximum rental days must be at least 1').optional(),
  availability: z.enum(['flexible', 'weekdays', 'weekends', 'specific']).optional(),
});

type FormValues = z.infer<typeof carSchema>;

const AddCar = () => {
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [carType, setCarType] = useState<'sell' | 'rent'>('sell');
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
      carType: 'sell',
      dailyRate: 0,
      minimumRentalDays: 1,
      maximumRentalDays: 30,
      availability: 'flexible',
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + imageFiles.length > 20) {
      toast({
        title: 'Too many images',
        description: 'You can upload a maximum of 20 images',
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

  // Helper function to render the main car form fields
  const renderCarForm = () => (
    <>
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="make">Make *</Label>
          <Input
            id="make"
            {...register('make')}
            placeholder="e.g., Toyota"
            className={errors.make ? 'border-red-500' : ''}
          />
          {errors.make && <p className="text-sm text-red-500">{errors.make.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="model">Model *</Label>
          <Input
            id="model"
            {...register('model')}
            placeholder="e.g., Camry"
            className={errors.model ? 'border-red-500' : ''}
          />
          {errors.model && <p className="text-sm text-red-500">{errors.model.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="year">Year *</Label>
          <Input
            id="year"
            type="number"
            {...register('year', { valueAsNumber: true })}
            placeholder="2023"
            className={errors.year ? 'border-red-500' : ''}
          />
          {errors.year && <p className="text-sm text-red-500">{errors.year.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Price *</Label>
          <div className="flex">
            <Input
              id="price"
              type="number"
              {...register('price', { valueAsNumber: true })}
              placeholder="0"
              className={`rounded-r-none ${errors.price ? 'border-red-500' : ''}`}
            />
            <Select {...register('currency')}>
              <SelectTrigger className="w-20 rounded-l-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="RWF">RWF</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {errors.price && <p className="text-sm text-red-500">{errors.price.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="mileage">Mileage (km)</Label>
          <Input
            id="mileage"
            type="number"
            {...register('mileage', { valueAsNumber: true })}
            placeholder="0"
            className={errors.mileage ? 'border-red-500' : ''}
          />
          {errors.mileage && <p className="text-sm text-red-500">{errors.mileage.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="vin">VIN</Label>
          <Input
            id="vin"
            {...register('vin')}
            placeholder="Vehicle Identification Number"
            className={errors.vin ? 'border-red-500' : ''}
          />
          {errors.vin && <p className="text-sm text-red-500">{errors.vin.message}</p>}
        </div>
      </div>

      {/* Technical Specifications */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label htmlFor="fuelType">Fuel Type</Label>
          <Select {...register('fuelType')}>
            <SelectTrigger>
              <SelectValue placeholder="Select fuel type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="petrol">Petrol</SelectItem>
              <SelectItem value="diesel">Diesel</SelectItem>
              <SelectItem value="electric">Electric</SelectItem>
              <SelectItem value="hybrid">Hybrid</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          {errors.fuelType && <p className="text-sm text-red-500">{errors.fuelType.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="transmission">Transmission</Label>
          <Select {...register('transmission')}>
            <SelectTrigger>
              <SelectValue placeholder="Select transmission" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="automatic">Automatic</SelectItem>
              <SelectItem value="manual">Manual</SelectItem>
            </SelectContent>
          </Select>
          {errors.transmission && <p className="text-sm text-red-500">{errors.transmission.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="bodyType">Body Type</Label>
          <Input
            id="bodyType"
            {...register('bodyType')}
            placeholder="e.g., Sedan, SUV, Hatchback"
            className={errors.bodyType ? 'border-red-500' : ''}
          />
          {errors.bodyType && <p className="text-sm text-red-500">{errors.bodyType.message}</p>}
        </div>
      </div>

      {/* Additional Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="color">Color</Label>
          <Input
            id="color"
            {...register('color')}
            placeholder="e.g., White, Black, Silver"
            className={errors.color ? 'border-red-500' : ''}
          />
          {errors.color && <p className="text-sm text-red-500">{errors.color.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            {...register('location')}
            placeholder="e.g., Kigali, Rwanda"
            className={errors.location ? 'border-red-500' : ''}
          />
          {errors.location && <p className="text-sm text-red-500">{errors.location.message}</p>}
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          {...register('description')}
          placeholder="Describe the car's condition, features, and any additional information..."
          className="w-full min-h-[100px] px-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
        {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
      </div>

      {/* Image Upload */}
      <div className="space-y-2">
        <Label>Images (up to 20 images)</Label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <div className="text-center">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90"
            >
              Choose Images
            </label>
            <p className="mt-2 text-sm text-gray-500">
              Upload high-quality images of the car
            </p>
          </div>
          {imageFiles.length > 0 && (
            <div className="mt-4">
              <div className="flex flex-wrap gap-2">
                {imageFiles.map((file, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index + 1}`}
                      className="w-20 h-20 object-cover rounded border"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );

  // Helper function to render rental-specific fields
  const renderRentalFields = () => (
    <div className="space-y-6 border-t pt-6">
      <h3 className="text-lg font-semibold text-blue-800">Rental Information</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="dailyRate">Daily Rate *</Label>
          <div className="flex">
            <Input
              id="dailyRate"
              type="number"
              {...register('dailyRate', { valueAsNumber: true })}
              placeholder="0"
              className={`rounded-r-none ${errors.dailyRate ? 'border-red-500' : ''}`}
            />
            <Select {...register('currency')}>
              <SelectTrigger className="w-20 rounded-l-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="RWF">RWF</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {errors.dailyRate && <p className="text-sm text-red-500">{errors.dailyRate.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="availability">Availability</Label>
          <Select {...register('availability')}>
            <SelectTrigger>
              <SelectValue placeholder="Select availability" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="flexible">Flexible</SelectItem>
              <SelectItem value="weekdays">Weekdays Only</SelectItem>
              <SelectItem value="weekends">Weekends Only</SelectItem>
              <SelectItem value="specific">Specific Dates</SelectItem>
            </SelectContent>
          </Select>
          {errors.availability && <p className="text-sm text-red-500">{errors.availability.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="minimumRentalDays">Minimum Rental Days</Label>
          <Input
            id="minimumRentalDays"
            type="number"
            {...register('minimumRentalDays', { valueAsNumber: true })}
            placeholder="1"
            className={errors.minimumRentalDays ? 'border-red-500' : ''}
          />
          {errors.minimumRentalDays && <p className="text-sm text-red-500">{errors.minimumRentalDays.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="maximumRentalDays">Maximum Rental Days</Label>
          <Input
            id="maximumRentalDays"
            type="number"
            {...register('maximumRentalDays', { valueAsNumber: true })}
            placeholder="30"
            className={errors.maximumRentalDays ? 'border-red-500' : ''}
          />
          {errors.maximumRentalDays && <p className="text-sm text-red-500">{errors.maximumRentalDays.message}</p>}
        </div>
      </div>
    </div>
  );

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
        // Add car type specific flags
        sellEnabled: carType === 'sell',
        rentEnabled: carType === 'rent',
        // Add rental-specific fields if it's a rental car
        ...(carType === 'rent' && {
          dailyRate: data.dailyRate || 0,
          minimumRentalDays: data.minimumRentalDays || 1,
          maximumRentalDays: data.maximumRentalDays || 30,
          availability: data.availability || 'flexible',
        }),
      };

      const response = await api.createCar(carData);
      if (response.error) {
        throw new Error(response.error);
      }

      toast({
        title: 'Success!',
        description: `Car listing created successfully for ${carType === 'sell' ? 'selling' : 'rental'}`,
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
          <div className="text-center">
            <h1 className="text-2xl font-bold text-destructive mb-4">Access Denied</h1>
            <p className="text-muted-foreground mb-6">You need admin privileges to access this page.</p>
            <Button onClick={() => navigate('/')} className="btn-hero">
              <ArrowLeft className="h-4 w-4 mr-2" />
                Go Home
              </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar onSignOut={handleSignOut} />
      <div className="ml-64 p-8">
          <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigate('/admin-dashboard')}
                className="shrink-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold">Add New Car</h1>
                <p className="text-muted-foreground">Create a new car listing</p>
              </div>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Car className="h-5 w-5" />
                  Add New Car
                  </CardTitle>
                </CardHeader>
              <CardContent>
                <Tabs value={carType} onValueChange={(value) => setCarType(value as 'sell' | 'rent')} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="sell" className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      For Sale
                    </TabsTrigger>
                    <TabsTrigger value="rent" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      For Rent
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="sell" className="space-y-6">
                    <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                      <h3 className="font-semibold text-green-800">Selling Car</h3>
                      <p className="text-sm text-green-600">Add a car that customers can purchase</p>
                    </div>
                    {renderCarForm()}
                  </TabsContent>

                  <TabsContent value="rent" className="space-y-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h3 className="font-semibold text-blue-800">Rental Car</h3>
                      <p className="text-sm text-blue-600">Add a car that customers can rent</p>
                    </div>
                    {renderCarForm()}
                    {renderRentalFields()}
                  </TabsContent>
                </Tabs>

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
  );
};

export default AddCar;