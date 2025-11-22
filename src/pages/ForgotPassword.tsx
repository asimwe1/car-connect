import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Phone, Mail, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import SEO from '@/components/SEO';
import { CountryCodeSelector } from '@/components/CountryCodeSelector';
import { getCountryByCode } from '@/data/countryCodes';
import { api } from '@/services/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const phoneSchema = z.object({
  phone: z
    .string()
    .min(8)
    .max(20)
    .regex(/^\+[1-9]\d{1,14}$/, 'Please enter a valid international phone number starting with your country code'),
});

const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type PhoneFormValues = z.infer<typeof phoneSchema>;
type EmailFormValues = z.infer<typeof emailSchema>;

const ForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('RW'); // Default to Rwanda
  const [localPhoneNumber, setLocalPhoneNumber] = useState('');
  const [activeTab, setActiveTab] = useState('phone');

  const { toast } = useToast();
  const navigate = useNavigate();

  // Add ref to track if component is mounted
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const phoneForm = useForm<PhoneFormValues>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: '' },
  });

  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: '' },
  });

const onPhoneSubmit = async (data: PhoneFormValues) => {
    // Prevent duplicate submissions
    if (isLoading) {
      console.log('Request already in progress, skipping duplicate submission');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Starting forgot password request for phone:', data.phone);
      
      const result = await api.forgotPassword({ phone: data.phone });

      // Check if component is still mounted before updating state
      if (!isMountedRef.current) {
        console.log('Component unmounted, skipping state update');
        return;
      }

      if (result.error || !result.data?.success) {
        const errorMessage = result.error || result.data?.message || 'Failed to send reset code.';
        
        // Handle specific Twilio error cases for phone
        if (errorMessage.toLowerCase().includes('rate') || errorMessage.toLowerCase().includes('limit')) {
          toast({
            title: 'Too Many Requests',
            description: 'Too many attempts. Please wait a few minutes before trying again.',
            variant: 'destructive',
          });
        } else if (errorMessage.toLowerCase().includes('invalid') && errorMessage.toLowerCase().includes('phone')) {
          toast({
            title: 'Invalid Phone Number',
            description: 'Please enter a valid phone number with country code.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Error',
            description: errorMessage,
            variant: 'destructive',
          });
        }
        return;
      }

      // Store for reset password verification - Twilio flow
      localStorage.setItem('passwordResetData', JSON.stringify({ 
        phone: data.phone, 
        method: 'phone',
        timestamp: Date.now() // Add timestamp for session management
      }));

      toast({
        title: 'OTP Sent Successfully',
        description: 'Please check your phone for the verification code. The code will expire in 1 hour.',
      });

      navigate('/reset-password');
    } catch (error: unknown) {
      // Check if component is still mounted before showing error
      if (!isMountedRef.current) {
        console.log('Component unmounted, skipping error handling');
        return;
      }
      
      console.error('Forgot password error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      // Only update loading state if component is still mounted
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };

const onEmailSubmit = async (data: EmailFormValues) => {
    // Prevent duplicate submissions
    if (isLoading) {
      console.log('Request already in progress, skipping duplicate submission');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Starting forgot password request for email:', data.email);
      
      const result = await api.forgotPassword({ email: data.email });
      
      // Check if component is still mounted before updating state
      if (!isMountedRef.current) {
        console.log('Component unmounted, skipping state update');
        return;
      }

      if (result.error || !result.data?.success) {
        const errorMessage = result.error || result.data?.message || 'Failed to send reset code.';
        
        // Handle specific Twilio error cases for email
        if (errorMessage.toLowerCase().includes('rate') || errorMessage.toLowerCase().includes('limit')) {
          toast({
            title: 'Too Many Requests',
            description: 'Too many attempts. Please wait a few minutes before trying again.',
            variant: 'destructive',
          });
        } else if (errorMessage.toLowerCase().includes('invalid') && errorMessage.toLowerCase().includes('email')) {
          toast({
            title: 'Invalid Email',
            description: 'Please enter a valid email address.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Error',
            description: errorMessage,
            variant: 'destructive',
          });
        }
        return;
      }

      // Store for reset password verification - Twilio flow
      localStorage.setItem('passwordResetData', JSON.stringify({ 
        email: data.email, 
        method: 'email',
        timestamp: Date.now() // Add timestamp for session management
      }));

      toast({
        title: 'OTP Sent Successfully',
        description: 'Please check your email for the verification code. The code will expire in 1 hour.',
      });

      navigate('/reset-password');
    } catch (error: unknown) {
      // Check if component is still mounted before showing error
      if (!isMountedRef.current) {
        console.log('Component unmounted, skipping error handling');
        return;
      }
      
      console.error('Forgot password error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      // Only update loading state if component is still mounted
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  const handleLocalNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const localNumber = e.target.value.replace(/[^\d]/g, '');
    setLocalPhoneNumber(localNumber);

    const country = getCountryByCode(selectedCountry);
    const fullNumber = country ? `${country.dialCode}${localNumber}` : `+${localNumber}`;
    phoneForm.setValue('phone', fullNumber, { shouldValidate: true });
  };

  const handleCountryChange = (countryCode: string) => {
    setSelectedCountry(countryCode);

    if (localPhoneNumber) {
      const country = getCountryByCode(countryCode);
      const fullNumber = country ? `${country.dialCode}${localPhoneNumber}` : `+${localPhoneNumber}`;
      phoneForm.setValue('phone', fullNumber, { shouldValidate: true });
    } else {
      const country = getCountryByCode(countryCode);
      const fullNumber = country ? country.dialCode : '';
      phoneForm.setValue('phone', fullNumber, { shouldValidate: true });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-primary/10 flex items-center justify-center p-4">
      <SEO title="Forgot Password – connectify Rwanda" description="Reset your connectify account password using your phone number or email address." />
      <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm border border-border shadow-card">
        <CardHeader className="space-y-1 text-center">
          <div className="flex items-center justify-center mb-2">
            <Link
              to="/signin"
              className="absolute left-6 top-6 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
            Reset Password
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Enter your phone number or email to receive a reset code
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="phone">Phone Number</TabsTrigger>
              <TabsTrigger value="email">Email Address</TabsTrigger>
            </TabsList>
            
            <TabsContent value="phone">
              <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="flex gap-2">
                    <CountryCodeSelector
                      value={selectedCountry}
                      onValueChange={handleCountryChange}
                      disabled={isLoading}
                    />
                    <div className="relative flex-1">
                      <Phone className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="7XX XXX XXX"
                        value={localPhoneNumber}
                        className={`search-input pl-8 ${phoneForm.formState.errors.phone ? 'border-destructive' : ''}`}
                        required
                        onChange={handleLocalNumberChange}
                        disabled={isLoading}
                      />
                      <input type="hidden" {...phoneForm.register('phone')} />
                    </div>
                  </div>
                  {phoneForm.formState.errors.phone && (
                    <p className="text-sm text-destructive mt-1">{phoneForm.formState.errors.phone.message}</p>
                  )}
                </div>

                <Button type="submit" className="btn-hero w-full" disabled={isLoading}>
                  {isLoading ? 'Sending Code...' : 'Send Reset Code'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="email">
              <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email address"
                      {...emailForm.register('email')}
                      className={`search-input pl-8 ${emailForm.formState.errors.email ? 'border-destructive' : ''}`}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  {emailForm.formState.errors.email && (
                    <p className="text-sm text-destructive mt-1">{emailForm.formState.errors.email.message}</p>
                  )}
                </div>

                <Button type="submit" className="btn-hero w-full" disabled={isLoading}>
                  {isLoading ? 'Sending Code...' : 'Send Reset Code'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Remember your password?{' '}
              <Link
                to="/signin"
                className="text-primary hover:text-primary-light font-medium transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;