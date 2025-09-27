import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Car, Upload, X } from 'lucide-react';
import { api } from '@/services/api';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// Schema based on the Car interface
const carSchema = z.object({
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.number().min(1900, 'Year must be after 1900').max(2025, 'Year cannot be in the future'),
  price: z.number().min(0, 'Price must be non-negative'),
  mileage: z.number().min(0, 'Mileage must be non-negative'),
  fuelType: z.enum(['petrol', 'diesel', 'hybrid', 'electric', 'other']),
  transmission: z.enum(['automatic', 'manual']),
  status: z.enum(['available', 'sold', 'pending']),
  description: z.string().optional(),
  images: z.array(z.string()).optional(),
  primaryImage: z.string().optional(),
  location: z.string().optional(),
  bodyType: z.string().optional(),
  color: z.string().optional(),
});

type FormValues = z.infer<typeof carSchema>;

const EditCar = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  const { register, handleSubmit, formState: { errors }, setValue, reset, watch } = useForm<FormValues>({
    resolver: zodResolver(carSchema),
    defaultValues: {
      make: '',
      model: '',
      year: 2023,
      price: 0,
      mileage: 0,
      fuelType: 'petrol',
      transmission: 'automatic',
      status: 'available',
      description: '',
      images: [],
      primaryImage: '',
      location: '',
      bodyType: '',
      color: '',
    },
  });

  useEffect(() => {
    if (id) {
      fetchVehicle();
    }
  }, [id]);

  const fetchVehicle = async () => {
    try {
      setLoading(true);
      const res = await api.getCarById(id as string);
      if (res.error || !res.data) throw new Error(res.error || 'Car not found');
      const data = res.data as any;
      const images = data.images || [];
      setExistingImages(images);
      reset({
        make: data.make || '',
        model: data.model || '',
        year: data.year || 2023,
        price: data.price || 0,
        mileage: data.mileage || 0,
        fuelType: data.fuelType || 'petrol',
        transmission: data.transmission || 'automatic',
        status: data.status || 'available',
        description: data.description || '',
        images: images,
        primaryImage: data.primaryImage || images[0] || '',
        location: data.location || '',
        bodyType: data.bodyType || '',
        color: data.color || '',
      });
    } catch (error) {
      console.error('Error fetching vehicle:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch vehicle details.',
        variant: 'destructive',
      });
      navigate('/admin/cars');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImageFiles((prev) => [...prev, ...files]);
      const newImageUrls = files.map((file) => URL.createObjectURL(file));
      const updatedImages = [...watch('images'), ...newImageUrls];
      setValue('images', updatedImages);
      if (!watch('primaryImage') && updatedImages.length > 0) {
        setValue('primaryImage', updatedImages[0]);
      }
    }
  };

  const removeImage = (index: number, isExisting: boolean) => {
    if (isExisting) {
      const updatedExistingImages = existingImages.filter((_, i) => i !== index);
      setExistingImages(updatedExistingImages);
      const updatedImages = [...updatedExistingImages, ...imageFiles.map((file) => URL.createObjectURL(file))];
      setValue('images', updatedImages);
    } else {
      const newImageIndex = index - existingImages.length;
      const updatedImageFiles = imageFiles.filter((_, i) => i !== newImageIndex);
      setImageFiles(updatedImageFiles);
      const updatedImages = [...existingImages, ...updatedImageFiles.map((file) => URL.createObjectURL(file))];
      setValue('images', updatedImages);
    }
    // Update primaryImage if the removed image was the primary one
    if (watch('primaryImage') === (isExisting ? existingImages[index] : URL.createObjectURL(imageFiles[index - existingImages.length]))) {
      const remainingImages = [...existingImages, ...imageFiles.map((file) => URL.createObjectURL(file))];
      setValue('primaryImage', remainingImages.length > 0 ? remainingImages[0] : '');
    }
  };

  const onSubmit = async (data: FormValues) => {
    if (!id) return;

    try {
      setSaving(true);
      let uploadedImages = data.images;
      if (imageFiles.length > 0) {
        // Placeholder: Replace with actual file upload logic to your backend
        // Example: const res = await api.uploadImages(imageFiles);
        // uploadedImages = [...existingImages, ...res.data.urls];
        uploadedImages = data.images; // Using client-side URLs for now
      }

      const payload = {
        make: data.make,
        model: data.model,
        year: data.year,
        price: data.price,
        mileage: data.mileage,
        fuelType: data.fuelType,
        transmission: data.transmission,
        status: data.status,
        description: data.description || undefined,
        images: uploadedImages,
        primaryImage: data.primaryImage || uploadedImages[0] || undefined,
        location: data.location || undefined,
        bodyType: data.bodyType || undefined,
        color: data.color || undefined,
      };

      const res = await api.updateCar(id, payload);
      if (res.error) throw new Error(res.error);

      toast({
        title: 'Success!',
        description: 'Vehicle updated successfully',
      });

      navigate('/admin/cars');
    } catch (error) {
      console.error('Error updating vehicle:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update vehicle',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-primary/10 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-8"></div>
            <Card>
              <CardContent className="p-8">
                <div className="space-y-4">
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-10 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-1/3"></div>
                  <div className="h-10 bg-muted rounded"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-primary/10 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => navigate('/admin/cars')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Cars
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Edit Vehicle</h1>
            <p className="text-muted-foreground">Update vehicle information</p>
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
                  <Input
                    id="bodyType"
                    {...register('bodyType')}
                    placeholder="e.g., Sedan"
                    className={errors.bodyType ? 'border-destructive' : ''}
                  />
                  {errors.bodyType && <p className="text-sm text-destructive">{errors.bodyType.message}</p>}
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
              </div>

              {/* Pricing */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Pricing</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (USD) *</Label>
                    <Input
                      id="price"
                      type="number"
                      {...register('price', { valueAsNumber: true })}
                      placeholder="25000"
                      min="0"
                      step="0.01"
                      className={errors.price ? 'border-destructive' : ''}
                    />
                    {errors.price && <p className="text-sm text-destructive">{errors.price.message}</p>}
                  </div>
                </div>
              </div>

              {/* Specifications */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Specifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="mileage">Mileage *</Label>
                    <Input
                      id="mileage"
                      type="number"
                      {...register('mileage', { valueAsNumber: true })}
                      placeholder="50000"
                      min="0"
                      className={errors.mileage ? 'border-destructive' : ''}
                    />
                    {errors.mileage && <p className="text-sm text-destructive">{errors.mileage.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="seats">Number of Seats</Label>
                    <Input
                      id="seats"
                      type="number"
                      {...register('seats', { valueAsNumber: true })}
                      placeholder="5"
                      min="1"
                      max="9"
                      className={errors.seats ? 'border-destructive' : ''}
                    />
                    {errors.seats && <p className="text-sm text-destructive">{errors.seats.message}</p>}
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
                    <Label htmlFor="status">Status *</Label>
                    <Select
                      value={watch('status')}
                      onValueChange={(value) => setValue('status', value as any)}
                    >
                      <SelectTrigger className={errors.status ? 'border-destructive' : ''}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="sold">Sold</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.status && <p className="text-sm text-destructive">{errors.status.message}</p>}
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
                <Label htmlFor="images">Images</Label>
                <Input
                  id="images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                />
                {(existingImages.length > 0 || imageFiles.length > 0) && (
                  <div className="mt-4">
                    <p className="text-sm font-medium">Image Previews:</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                      {existingImages.map((url, index) => (
                        <div key={`existing-${index}`} className="relative">
                          <img
                            src={url}
                            alt={`Existing image ${index + 1}`}
                            className="w-full h-32 object-cover rounded"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6"
                            onClick={() => removeImage(index, true)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      {imageFiles.map((file, index) => (
                        <div key={`new-${index}`} className="relative">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`New image ${index + 1}`}
                            className="w-full h-32 object-cover rounded"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6"
                            onClick={() => removeImage(index + existingImages.length, false)}
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
                <Button type="submit" disabled={saving} className="btn-hero">
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate('/admin/cars')}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
};

export default EditCar;