import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Upload, Shield, Zap, Users, Car, CheckCircle, DollarSign, X, Image, Video } from 'lucide-react';
import { uploadImages, uploadVideo } from '@/services/upload';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { useInView } from 'react-intersection-observer';
import { notificationService } from '@/services/notifications';

type ListingType = 'sell' | 'rent';

export interface SellCarTabProps {
  listingType: ListingType;
  isLocked: boolean;
}

const SellCarTab: React.FC<SellCarTabProps> = ({ listingType, isLocked }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: '',
    price: '',
    mileage: '',
    seats: '',
    transmission: '',
    fuel: '',
    color: '',
    location: '',
    description: ''
  });
  
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadedVideo, setUploadedVideo] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { ref: stepsRef, inView: stepsInView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const { ref: whySellRef, inView: whySellInView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const { ref: soldCarsRef, inView: soldCarsInView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Validate file count
    if (selectedImages.length + files.length > 20) {
      toast({
        title: "Too many images",
        description: "Maximum 20 images allowed",
        variant: "destructive"
      });
      return;
    }

    // Validate file sizes
    const validFiles = Array.from(files).filter(file => {
      if (file.size > 5 * 1024 * 1024) { // 5MB
        toast({
          title: "File too large",
          description: `${file.name} is larger than 5MB`,
          variant: "destructive"
        });
        return false;
      }
      return true;
    });

    // Store the files
    setSelectedImages(prev => [...prev, ...validFiles]);

    // Clear input
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }

    // Show success message
    toast({
      title: "Images selected",
      description: `${validFiles.length} images ready to upload`,
      variant: "default"
    });
  };

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > 50 * 1024 * 1024) { // 50MB
      toast({
        title: "File too large",
        description: "Video must be smaller than 50MB",
        variant: "destructive",
      });
      return;
    }

    // Store the video file
    setSelectedVideo(file);
    
    // Clear input
    if (videoInputRef.current) {
      videoInputRef.current.value = '';
    }

    toast({
      title: "Video selected",
      description: "Video ready to upload",
      variant: "default",
    });
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeVideo = () => {
    setSelectedVideo(null);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const validateForm = () => {
    const required = [
      { key: 'make', label: 'Make' },
      { key: 'model', label: 'Model' },
      { key: 'year', label: 'Year' },
      { key: 'price', label: 'Price' },
      { key: 'mileage', label: 'Mileage' },
      { key: 'transmission', label: 'Transmission' },
      { key: 'fuel', label: 'Fuel Type' },
      { key: 'color', label: 'Color' },
      { key: 'location', label: 'Location' },
    ];

    for (const field of required) {
      const val = (formData as any)[field.key];
      if (!val || String(val).trim() === '') {
        toast({
          title: `${field.label} is required`,
          description: `Please provide ${field.label.toLowerCase()}.`,
          variant: 'destructive',
        });
        return false;
      }
    }
    return true;
  };

  const handleListCar = async () => {
    try {
      if (!isAuthenticated) {
        toast({ title: 'Sign in required', description: 'Please sign in to list your car.' });
        navigate('/signin');
        return;
      }

      if (!validateForm()) return;
      
      if (selectedImages.length === 0) {
        toast({
          title: "Images required",
          description: "Please select at least one image of your car",
          variant: "destructive"
        });
        return;
      }

      setIsSubmitting(true);
      let imageUrls: string[] = [];
      let videoUrl: string | null = null;

      // First upload images to Cloudinary
      if (selectedImages.length > 0) {
        toast({
          title: "Uploading images",
          description: "Please wait while we upload your images...",
          variant: "default"
        });
        
        // Upload images in batches of 3 to avoid timeout
        const batchSize = 3;
        const batches = [];
        for (let i = 0; i < selectedImages.length; i += batchSize) {
          batches.push(selectedImages.slice(i, i + batchSize));
        }
        
        for (const batch of batches) {
          const batchUrls = await uploadImages(batch);
          imageUrls = [...imageUrls, ...batchUrls];
        }
        setUploadedImages(imageUrls);
      }

      // Upload video if selected
      if (selectedVideo) {
        toast({
          title: "Uploading video",
          description: "Please wait while we upload your video...",
          variant: "default"
        });
        videoUrl = await uploadVideo(selectedVideo);
        setUploadedVideo(videoUrl);
      }

      // Build payload matching backend expectations
      const payload = {
        make: formData.make,
        model: formData.model,
        year: Number(formData.year),
        price: Number(formData.price),
        mileage: Number(formData.mileage) || 0,
        fuelType: formData.fuel,
        transmission: formData.transmission || 'automatic',
        status: 'listed', // Set to pending for admin review
        description: formData.description || undefined,
        location: formData.location || undefined,
        seats: formData.seats ? Number(formData.seats) : undefined,
        color: formData.color || undefined,
        images: imageUrls,
        primaryImage: imageUrls[0] || undefined,
        video: videoUrl,
      } as any;

      const res = await api.createCar(payload);
      if (res.error) throw new Error(res.error);

      // Trigger notification for admin
      notificationService.notifyCarListing({
        id: res.data?._id || res.data?.id || 'unknown',
        make: formData.make,
        model: formData.model,
        year: Number(formData.year),
        type: 'sell',
        sellerName: user?.fullname || 'Unknown User'
      });

      toast({ title: 'Car listed!', description: 'Your car has been submitted for review. You will be notified once it\'s approved.' });
      navigate('/admin-dashboard');
    } catch (err: any) {
      toast({ title: 'Failed to list car', description: err?.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const sellingSteps = [
    {
      icon: Upload,
      title: "Upload Your Car",
      description: "Add photos, details and set your price"
    },
    {
      icon: DollarSign,
      title: "Get Offers",
      description: "Receive competitive offers from buyers"
    },
    {
      icon: CheckCircle,
      title: "Sell Securely",
      description: "Complete the sale with our secure platform"
    }
  ];

  const whySellFeatures = [
    {
      icon: Shield,
      title: "Secure Transactions",
      description: "All payments are processed securely through our platform"
    },
    {
      icon: Zap,
      title: "Fast Payments",
      description: "Get paid quickly after your car is sold"
    },
    {
      icon: Users,
      title: "Wide Reach",
      description: "Access thousands of potential buyers"
    }
  ];

  const recentlySold = [
    {
      title: "Toyota Land Cruiser 2020",
      price: 45000,
      image: "/placeholder.svg",
      soldDate: "2 days ago"
    },
    {
      title: "Honda CR-V 2019",
      price: 32000,
      image: "/placeholder.svg",
      soldDate: "5 days ago"
    },
    {
      title: "Mercedes C-Class 2021",
      price: 55000,
      image: "/placeholder.svg",
      soldDate: "1 week ago"
    }
  ];

  return (
    <div className="space-y-12">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-primary via-primary-light to-primary rounded-xl p-8 text-center text-primary-foreground fade-in-up">
        <h2 className="text-4xl font-bold mb-4">Turn Your Car Into Cash Fast</h2>
        <p className="text-xl opacity-90 mb-6">Join thousands of sellers who trust CarConnect.rw</p>
        <Button 
          size="lg" 
          className="bg-white text-primary hover:bg-gray-100 font-semibold px-8 py-4"
          onClick={() => document.getElementById('car-form')?.scrollIntoView({ behavior: 'smooth' })}
        >
          Start Selling Now
        </Button>
      </div>

      {/* Selling Steps */}
      <div ref={stepsRef} className={`${stepsInView ? 'fade-in-up' : 'opacity-0'}`}>
        <div className="text-center mb-8">
          <h3 className="text-3xl font-bold text-foreground mb-4">How It Works</h3>
          <p className="text-muted-foreground">Simple steps to sell your car</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sellingSteps.map((step, index) => (
            <Card key={index} className={`text-center p-6 brand-card fade-in-up stagger-delay-${index + 1}`}>
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-primary to-primary-light rounded-full flex items-center justify-center mb-4">
                <step.icon className="w-8 h-8 text-primary-foreground" />
              </div>
              <div className="mx-auto w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center mb-4 text-sm font-bold">
                {index + 1}
              </div>
              <h4 className="font-semibold text-lg mb-2 text-foreground">{step.title}</h4>
              <p className="text-muted-foreground text-sm">{step.description}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Car Upload Form */}
      <div id="car-form" className="bg-gradient-to-r from-card to-accent/10 rounded-xl p-8 fade-in-up">
        <h3 className="text-2xl font-bold text-foreground mb-6">List Your Car</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <Label htmlFor="make">Make *</Label>
            <Input
              id="make"
              placeholder="e.g., Mercedes-Benz"
              value={formData.make}
              onChange={(e) => handleInputChange('make', e.target.value)}
              className="search-input"
            />
          </div>

          <div>
            <Label htmlFor="model">Model *</Label>
            <Input
              id="model"
              placeholder="e.g., Corolla"
              value={formData.model}
              onChange={(e) => handleInputChange('model', e.target.value)}
              className="search-input"
            />
          </div>

          <div>
            <Label htmlFor="year">Year *</Label>
            <Input
              id="year"
              type="number"
              placeholder="e.g., 2020"
              value={formData.year}
              onChange={(e) => handleInputChange('year', e.target.value)}
              className="search-input"
            />
          </div>

          <div>
            <Label htmlFor="price">Price (RWF) *</Label>
            <Input
              id="price"
              type="number"
              placeholder="e.g., 25000"
              value={formData.price}
              onChange={(e) => handleInputChange('price', e.target.value)}
              className="search-input"
            />
          </div>

          <div>
            <Label htmlFor="mileage">Mileage (km) *</Label>
            <Input
              id="mileage"
              type="number"
              placeholder="e.g., 50000"
              value={formData.mileage}
              onChange={(e) => handleInputChange('mileage', e.target.value)}
              className="search-input"
            />
          </div>

          <div>
            <Label htmlFor="seats">Number of Seats *</Label>
            <Select value={formData.seats} onValueChange={(value) => handleInputChange('seats', value)}>
              <SelectTrigger className="search-input">
                <SelectValue placeholder="Select seats" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2 Seats</SelectItem>
                <SelectItem value="4">4 Seats</SelectItem>
                <SelectItem value="5">5 Seats</SelectItem>
                <SelectItem value="7">7 Seats</SelectItem>
                <SelectItem value="8">8+ Seats</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="transmission">Transmission *</Label>
            <Select value={formData.transmission} onValueChange={(value) => handleInputChange('transmission', value)}>
              <SelectTrigger className="search-input">
                <SelectValue placeholder="Select transmission" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="automatic">Automatic</SelectItem>
                <SelectItem value="cvt">CVT</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="fuel">Fuel Type *</Label>
            <Select value={formData.fuel} onValueChange={(value) => handleInputChange('fuel', value)}>
              <SelectTrigger className="search-input">
                <SelectValue placeholder="Select fuel type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="petrol">Petrol</SelectItem>
                <SelectItem value="diesel">Diesel</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
                <SelectItem value="electric">Electric</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="color">Color *</Label>
            <Input
              id="color"
              placeholder="e.g., White"
              value={formData.color}
              onChange={(e) => handleInputChange('color', e.target.value)}
              className="search-input"
            />
          </div>

          <div>
            <Label htmlFor="location">Location *</Label>
            <input
              id="location"
              list="locations"
              placeholder="e.g., Kigali"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="mt-6">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Describe your car's condition, features, and any additional information..."
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className="search-input min-h-[100px]"
          />
        </div>

        {/* Image Upload */}
        <div className="mt-6">
          <Label>Upload Photos (Max 20 images, 5MB each)</Label>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
          />
          <div 
            className="mt-2 border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => imageInputRef.current?.click()}
          >
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Drag and drop images here, or click to browse</p>
            <Button 
              variant="outline" 
              className="mt-4"
              disabled={isUploading}
              onClick={(e) => {
                e.stopPropagation();
                imageInputRef.current?.click();
              }}
            >
              {isUploading ? 'Uploading...' : 'Select Images'}
            </Button>
          </div>
          
          {/* Image Previews */}
          {selectedImages.length > 0 && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              {selectedImages.map((file, index) => (
                <div key={index} className="relative group">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                    onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Video Upload */}
        <div className="mt-6">
          <Label>Upload Video (Optional, Max 50MB)</Label>
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            onChange={handleVideoUpload}
            className="hidden"
          />
          <div 
            className="mt-2 border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => videoInputRef.current?.click()}
          >
            <Video className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-muted-foreground text-sm">Add a video walkthrough of your car</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              disabled={isUploading}
              onClick={(e) => {
                e.stopPropagation();
                videoInputRef.current?.click();
              }}
            >
              {isUploading ? 'Uploading...' : 'Select Video'}
            </Button>
          </div>
          
          {/* Video Preview */}
          {selectedVideo && (
            <div className="mt-4 relative">
              <video
                src={URL.createObjectURL(selectedVideo)}
                controls
                className="w-full max-w-md mx-auto rounded-lg"
                onLoadedData={(e) => URL.revokeObjectURL((e.target as HTMLVideoElement).src)}
              />
              <button
                onClick={removeVideo}
                className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        <Button className="w-full mt-8 btn-hero text-lg py-4" disabled={isUploading || isSubmitting} onClick={handleListCar}>
          {isSubmitting ? 'Listing...' : 'List My Car'}
        </Button>
      </div>

      {/* Why Sell With Us */}
      <div ref={whySellRef} className={`${whySellInView ? 'fade-in-up' : 'opacity-0'}`}>
        <div className="text-center mb-8">
          <h3 className="text-3xl font-bold text-foreground mb-4">Why Sell With CarConnect.rw?</h3>
          <p className="text-muted-foreground">Experience the difference with our premium selling platform</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {whySellFeatures.map((feature, index) => (
            <Card key={index} className={`text-center p-6 brand-card fade-in-up stagger-delay-${index + 1}`}>
              <div className="mx-auto w-12 h-12 bg-gradient-to-r from-primary to-primary-light rounded-full flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h4 className="font-semibold text-lg mb-2 text-foreground">{feature.title}</h4>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Recently Sold Cars */}
      <div ref={soldCarsRef} className={`${soldCarsInView ? 'fade-in-up' : 'opacity-0'}`}>
        <div className="text-center mb-8">
          <h3 className="text-3xl font-bold text-foreground mb-4">Recently Sold</h3>
          <p className="text-muted-foreground">See what others have successfully sold</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recentlySold.map((car, index) => (
            <Card key={index} className={`overflow-hidden brand-card fade-in-up stagger-delay-${index + 1}`}>
              <img 
                src={car.image} 
                alt={car.title}
                className="w-full h-40 object-cover"
              />
              <CardContent className="p-4">
                <h4 className="font-semibold text-foreground mb-2">{car.title}</h4>
                <div className="flex justify-between items-center">
                  <div className="text-2xl font-bold text-primary">{formatPrice(car.price)}</div>
                  <Badge variant="secondary">{car.soldDate}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SellCarTab