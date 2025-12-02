import React, { useState } from 'react';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { CountryCodeSelector } from '@/components/CountryCodeSelector';
import { Phone, Mail, MapPin, Clock, Send } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    countryCode: 'RW',
    phoneNumber: '',
    message: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCountryCodeChange = (countryCode: string) => {
    setFormData({
      ...formData,
      countryCode
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate form
    if (!formData.name || !formData.phoneNumber || !formData.message) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Simulate form submission
    setTimeout(() => {
      toast({
        title: "Message Sent!",
        description: "We'll get back to you within 24 hours.",
        variant: "default",
      });
      
      // Reset form
      setFormData({
        name: '',
        countryCode: 'RW',
        phoneNumber: '',
        message: ''
      });
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-primary/5 py-12">
      <SEO title="Contact – connectify Rwanda" description="Have questions? Contact connectify for support, partnerships, or media inquiries." />
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12 fade-in-up">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
            Get in Touch
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Have questions about our premium vehicles? We're here to help you find your perfect car.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card className="bg-card/80 backdrop-blur-sm border border-border shadow-card fade-in-up">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold">Send us a Message</CardTitle>
              <CardDescription>
                Fill out the form below and we'll respond as soon as possible.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="search-input"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <div className="flex gap-2">
                    <CountryCodeSelector
                      value={formData.countryCode}
                      onValueChange={handleCountryCodeChange}
                      className="flex-shrink-0"
                    />
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      placeholder="78***"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className="search-input"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Tell us how we can help you..."
                    value={formData.message}
                    onChange={handleInputChange}
                    className="search-input min-h-[120px] resize-none"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="btn-hero w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-6 fade-in-up stagger-delay-2">
            <Card className="bg-card/80 backdrop-blur-sm border border-border shadow-card">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Phone className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Phone</h3>
                    <ul className="text-muted-foreground space-y-1">
                      <li>
                        <a 
                          href="https://wa.me/250788881400" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          +250 788 881 400
                        </a>
                      </li>
                      <li>
                        <a 
                          href="https://wa.me/250788572481" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          +250 788 572 481
                        </a>
                      </li>
                    </ul>
                    <p className="text-sm text-muted-foreground mt-2">Available 24/7</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur-sm border border-border shadow-card">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Email</h3>
                    <ul className="text-muted-foreground space-y-1">
                      <li>
                        <a 
                          href="mailto:customers@connectify.rw" 
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          customers@connectify.rw
                        </a>
                      </li>
                      <li>
                        <a 
                          href="mailto:supports@connectify.rw" 
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          supports@connectify.rw
                        </a>
                      </li>
                    </ul>
                    <p className="text-sm text-muted-foreground mt-2">We respond as soon as possible</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur-sm border border-border shadow-card">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Address</h3>
                    <p className="text-muted-foreground">kigali city, Rwanda</p>
                    <p className="text-muted-foreground">KN 84 ST, Nyarugenge, </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur-sm border border-border shadow-card">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Business Hours</h3>
                    <p className="text-muted-foreground">Monday - Friday: 9AM - 7PM</p>
                    <p className="text-muted-foreground">Saturday: 10AM - 6PM</p>
                    <p className="text-muted-foreground">Sunday: 12PM - 5PM</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;