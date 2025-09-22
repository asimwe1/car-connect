import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Car, Upload, Save, ArrowLeft } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '@/services/api';

const AddCar = () => {
  const [formData, setFormData] = useState({
    title: '',
    make: '',
    model: '',
    full_model: '',
    year: '',
    manufacture_date: '',
    color: '',
    mileage: '',
    mileage_unit: 'km',
    body_type: '',
    fuel_type: '',
    transmission: '',
    seats: '5',
    vin: '',
    registration_number: '',
    condition: 'Used',
    location: '',
    description: '',
    price: '',
    discount: '',
    negotiable: false,
    service_history: '',
    last_service_date: '',
    seller_contact: '',
    // listing modes
    sell_enabled: true,
    rent_enabled: false,
    rent_price_per_day: '',
    rent_deposit: '',
    rent_min_days: '',
    rent_max_days: ''
  });
  const [images, setImages] = useState<File[]>([]);
  const [video, setVideo] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 20) {
      toast({
        title: "Too many images",
        description: "Maximum 20 images allowed",
        variant: "destructive",
      });
      return;
    }
    setImages(prev => [...prev, ...files]);
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.size > 50 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Video must be less than 50MB",
        variant: "destructive",
      });
      return;
    }
    setVideo(file || null);
  };

  const uploadFiles = async (carId: string) => {
    // TODO: Implement file upload with backend
    // For now, return placeholder URLs
    const imageUrls: string[] = images.map((_, i) => `/placeholder.svg`);
    let videoUrl = video ? '/placeholder.svg' : '';

    return { imageUrls, videoUrl };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate required fields
      if (!formData.title || !formData.make || !formData.model || !formData.year || 
          !formData.color || !formData.body_type || !formData.fuel_type || 
          !formData.transmission || !formData.location || !formData.price) {
        toast({
          title: "Missing fields",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Create car record via backend API
      const carData = {
        make: formData.make,
        model: formData.model,
        year: parseInt(formData.year),
        price: parseFloat(formData.price),
        mileage: parseInt(formData.mileage) || 0,
        fuelType: formData.fuel_type,
        transmission: formData.transmission,
        status: 'available',
        description: formData.description,
        location: formData.location,
        bodyType: formData.body_type,
        color: formData.color,
        vin: formData.vin,
        images: [], // Will be updated after file upload
        primaryImage: '',
        // listing modes
        sellEnabled: !!formData.sell_enabled,
        rentEnabled: !!formData.rent_enabled,
        rentPricePerDay: formData.rent_enabled && formData.rent_price_per_day ? parseFloat(formData.rent_price_per_day) : undefined,
        rentDeposit: formData.rent_enabled && formData.rent_deposit ? parseFloat(formData.rent_deposit) : undefined,
        rentMinDays: formData.rent_enabled && formData.rent_min_days ? parseInt(formData.rent_min_days) : undefined,
        rentMaxDays: formData.rent_enabled && formData.rent_max_days ? parseInt(formData.rent_max_days) : undefined,
      };

      const response = await api.createCar(carData);

      if (response.error) {
        throw new Error(response.error);
      }

      const created = response.data;
      const createdId = created._id;

      // TODO: Implement file upload for backend API
      // For now, file upload is disabled

      toast({
        title: "Success!",
        description: "Car listing created successfully",
      });

      navigate('/admin/cars');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create car listing",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-primary/10 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/admin-dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Add New Car</h1>
            <p className="text-muted-foreground">Create a new car listing</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card className="bg-card/80 backdrop-blur-sm border border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="w-5 h-5" />
                Basic Information
              </CardTitle>
              <CardDescription>Enter the basic details of the car</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title (Make + Model) *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Toyota Camry"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="search-input"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="make">Make *</Label>
                <Input
                  id="make"
                  placeholder="e.g., Toyota"
                  value={formData.make}
                  onChange={(e) => handleInputChange('make', e.target.value)}
                  className="search-input"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">Model *</Label>
                <Input
                  id="model"
                  placeholder="e.g., Camry"
                  value={formData.model}
                  onChange={(e) => handleInputChange('model', e.target.value)}
                  className="search-input"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="full_model">Full Model/Trim</Label>
                <Input
                  id="full_model"
                  placeholder="e.g., Camry LE 2.5L"
                  value={formData.full_model}
                  onChange={(e) => handleInputChange('full_model', e.target.value)}
                  className="search-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="year">Year *</Label>
                <Input
                  id="year"
                  type="number"
                  min="1900"
                  max="2025"
                  placeholder="e.g., 2020"
                  value={formData.year}
                  onChange={(e) => handleInputChange('year', e.target.value)}
                  className="search-input"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="manufacture_date">Manufacture Date</Label>
                <Input
                  id="manufacture_date"
                  type="date"
                  value={formData.manufacture_date}
                  onChange={(e) => handleInputChange('manufacture_date', e.target.value)}
                  className="search-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">Color *</Label>
                <Input
                  id="color"
                  placeholder="e.g., Black"
                  value={formData.color}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                  className="search-input"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="condition">Condition *</Label>
                <Select value={formData.condition} onValueChange={(value) => handleInputChange('condition', value)}>
                  <SelectTrigger className="search-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="New">New</SelectItem>
                    <SelectItem value="Used">Used</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

        {/* Listing Modes */}
        <Card className="bg-card/80 backdrop-blur-sm border border-border">
          <CardHeader>
            <CardTitle>Listing Modes</CardTitle>
            <CardDescription>Choose whether the car is for sale, rent, or both</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="sell_enabled"
                checked={formData.sell_enabled}
                onCheckedChange={(checked) => handleInputChange('sell_enabled', checked)}
              />
              <Label htmlFor="sell_enabled">Enable for Sale</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="rent_enabled"
                checked={formData.rent_enabled}
                onCheckedChange={(checked) => handleInputChange('rent_enabled', checked)}
              />
              <Label htmlFor="rent_enabled">Enable for Rent</Label>
            </div>

            {formData.rent_enabled && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="rent_price_per_day">Rent Price Per Day (RWF)</Label>
                  <Input
                    id="rent_price_per_day"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="50000"
                    value={formData.rent_price_per_day}
                    onChange={(e) => handleInputChange('rent_price_per_day', e.target.value)}
                    className="search-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rent_deposit">Deposit (RWF)</Label>
                  <Input
                    id="rent_deposit"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="100000"
                    value={formData.rent_deposit}
                    onChange={(e) => handleInputChange('rent_deposit', e.target.value)}
                    className="search-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rent_min_days">Minimum Days</Label>
                  <Input
                    id="rent_min_days"
                    type="number"
                    min="1"
                    placeholder="1"
                    value={formData.rent_min_days}
                    onChange={(e) => handleInputChange('rent_min_days', e.target.value)}
                    className="search-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rent_max_days">Maximum Days</Label>
                  <Input
                    id="rent_max_days"
                    type="number"
                    min="1"
                    placeholder="30"
                    value={formData.rent_max_days}
                    onChange={(e) => handleInputChange('rent_max_days', e.target.value)}
                    className="search-input"
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

          {/* Technical Specifications */}
          <Card className="bg-card/80 backdrop-blur-sm border border-border">
            <CardHeader>
              <CardTitle>Technical Specifications</CardTitle>
              <CardDescription>Vehicle specifications and features</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="mileage">Mileage</Label>
                <div className="flex gap-2">
                  <Input
                    id="mileage"
                    type="number"
                    min="0"
                    placeholder="100000"
                    value={formData.mileage}
                    onChange={(e) => handleInputChange('mileage', e.target.value)}
                    className="search-input flex-1"
                  />
                  <Select value={formData.mileage_unit} onValueChange={(value) => handleInputChange('mileage_unit', value)}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="km">km</SelectItem>
                      <SelectItem value="miles">miles</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="body_type">Body Type *</Label>
                <Select value={formData.body_type} onValueChange={(value) => handleInputChange('body_type', value)} required>
                  <SelectTrigger className="search-input">
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="fuel_type">Fuel Type *</Label>
                <Select value={formData.fuel_type} onValueChange={(value) => handleInputChange('fuel_type', value)} required>
                  <SelectTrigger className="search-input">
                    <SelectValue placeholder="Select fuel type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Petrol">Petrol</SelectItem>
                    <SelectItem value="Diesel">Diesel</SelectItem>
                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                    <SelectItem value="Electric">Electric</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="transmission">Transmission *</Label>
                <Select value={formData.transmission} onValueChange={(value) => handleInputChange('transmission', value)} required>
                  <SelectTrigger className="search-input">
                    <SelectValue placeholder="Select transmission" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Manual">Manual</SelectItem>
                    <SelectItem value="Automatic">Automatic</SelectItem>
                    <SelectItem value="CVT">CVT</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="seats">Number of Seats</Label>
                <Select value={formData.seats} onValueChange={(value) => handleInputChange('seats', value)}>
                  <SelectTrigger className="search-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="7">7</SelectItem>
                    <SelectItem value="8">8</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  placeholder="e.g., Kigali, Rwanda"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="search-input"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card className="bg-card/80 backdrop-blur-sm border border-border">
            <CardHeader>
              <CardTitle>Pricing Information</CardTitle>
              <CardDescription>Set the price and discount details</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="price">Price (RWF) *</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="15000000"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  className="search-input"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount">Discount (RWF)</Label>
                <Input
                  id="discount"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="500000"
                  value={formData.discount}
                  onChange={(e) => handleInputChange('discount', e.target.value)}
                  className="search-input"
                />
              </div>

              <div className="flex items-center space-x-2 pt-6">
                <Checkbox
                  id="negotiable"
                  checked={formData.negotiable}
                  onCheckedChange={(checked) => handleInputChange('negotiable', checked)}
                />
                <Label htmlFor="negotiable">Price is negotiable</Label>
              </div>
            </CardContent>
          </Card>

          {/* Media Upload */}
          <Card className="bg-card/80 backdrop-blur-sm border border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Media Upload
              </CardTitle>
              <CardDescription>Upload photos and videos of the car</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="images">Photos (Max 20, 5MB each)</Label>
                <Input
                  id="images"
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={handleImageUpload}
                  className="search-input"
                />
                {images.length > 0 && (
                  <p className="text-sm text-muted-foreground">{images.length} image(s) selected</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="video">Video (Max 50MB, MP4)</Label>
                <Input
                  id="video"
                  type="file"
                  accept="video/mp4"
                  onChange={handleVideoUpload}
                  className="search-input"
                />
                {video && (
                  <p className="text-sm text-muted-foreground">Video selected: {video.name}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card className="bg-card/80 backdrop-blur-sm border border-border">
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
              <CardDescription>Optional details and contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the car's features, history, and condition..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="search-input min-h-24"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="vin">VIN</Label>
                  <Input
                    id="vin"
                    placeholder="Vehicle Identification Number"
                    value={formData.vin}
                    onChange={(e) => handleInputChange('vin', e.target.value)}
                    className="search-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registration_number">Registration Number</Label>
                  <Input
                    id="registration_number"
                    placeholder="License plate number"
                    value={formData.registration_number}
                    onChange={(e) => handleInputChange('registration_number', e.target.value)}
                    className="search-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="last_service_date">Last Service Date</Label>
                  <Input
                    id="last_service_date"
                    type="date"
                    value={formData.last_service_date}
                    onChange={(e) => handleInputChange('last_service_date', e.target.value)}
                    className="search-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seller_contact">Seller Contact</Label>
                  <Input
                    id="seller_contact"
                    placeholder="Phone number or email"
                    value={formData.seller_contact}
                    onChange={(e) => handleInputChange('seller_contact', e.target.value)}
                    className="search-input"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="service_history">Service History</Label>
                <Textarea
                  id="service_history"
                  placeholder="Maintenance records, repairs, upgrades..."
                  value={formData.service_history}
                  onChange={(e) => handleInputChange('service_history', e.target.value)}
                  className="search-input"
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin-dashboard')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="btn-hero"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Create Listing
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCar;