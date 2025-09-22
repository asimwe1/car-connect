import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Upload, Shield, Zap, Users, Car, CheckCircle, DollarSign } from 'lucide-react';
import { useInView } from 'react-intersection-observer';

const SellCarTab = () => {
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

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
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
            <Select value={formData.make} onValueChange={(value) => handleInputChange('make', value)}>
              <SelectTrigger className="search-input">
                <SelectValue placeholder="Select make" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="toyota">Toyota</SelectItem>
                <SelectItem value="honda">Honda</SelectItem>
                <SelectItem value="mercedes">Mercedes</SelectItem>
                <SelectItem value="bmw">BMW</SelectItem>
                <SelectItem value="nissan">Nissan</SelectItem>
              </SelectContent>
            </Select>
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
            <Label htmlFor="price">Price (USD) *</Label>
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
            <Select value={formData.location} onValueChange={(value) => handleInputChange('location', value)}>
              <SelectTrigger className="search-input">
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kigali">Kigali</SelectItem>
                <SelectItem value="butare">Butare</SelectItem>
                <SelectItem value="musanze">Musanze</SelectItem>
                <SelectItem value="rubavu">Rubavu</SelectItem>
              </SelectContent>
            </Select>
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
          <div className="mt-2 border-2 border-dashed border-border rounded-lg p-8 text-center">
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Drag and drop images here, or click to browse</p>
            <Button variant="outline" className="mt-4">
              Select Images
            </Button>
          </div>
        </div>

        {/* Video Upload */}
        <div className="mt-6">
          <Label>Upload Video (Optional, Max 50MB)</Label>
          <div className="mt-2 border-2 border-dashed border-border rounded-lg p-6 text-center">
            <Car className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-muted-foreground text-sm">Add a video walkthrough of your car</p>
            <Button variant="outline" size="sm" className="mt-2">
              Select Video
            </Button>
          </div>
        </div>

        <Button className="w-full mt-8 btn-hero text-lg py-4">
          List My Car
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