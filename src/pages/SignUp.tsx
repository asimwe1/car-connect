import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Phone, Lock, User, Mail } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import SEO from '@/components/SEO';
import { CountryCodeSelector } from '@/components/CountryCodeSelector';
import { getCountryByCode } from '@/data/countryCodes';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { handleError } from '@/utils/errorMessages';

const phoneSchema = z.object({
  fullname: z.string().min(1, 'Full name is required'),
  phone: z.string().min(8).max(20).regex(/^\+[1-9]\d{1,14}$/, 'Please enter a valid international phone number'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Confirm password is required')
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

const emailSchema = z.object({
  fullname: z.string().min(1, 'Full name is required'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Confirm password is required')
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

type PhoneFormValues = z.infer<typeof phoneSchema>;
type EmailFormValues = z.infer<typeof emailSchema>;

const SignUp = () => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [selectedCountry, setSelectedCountry] = useState('RW'); // Default to Rwanda
  const [localPhoneNumber, setLocalPhoneNumber] = useState(''); // Store local number separately
  const [activeTab, setActiveTab] = useState<'phone' | 'email'>('phone');

  const { toast } = useToast();
  const navigate = useNavigate();
  const { register } = useAuth();

  const phoneForm = useForm<PhoneFormValues>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { fullname: '', phone: '', password: '', confirmPassword: '' }
  });

  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { fullname: '', email: '', password: '', confirmPassword: '' }
  });

  const onPhoneSubmit = async (data: PhoneFormValues) => {
    setIsLoading(true);

    try {
      const result = await register({
        fullname: data.fullname,
        phone: data.phone,
        password: data.password
      });
      if (!result.success) {
        toast({
          title: "Error",
          description: result.message || "An unexpected error occurred",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: 'Registration Successful',
        description: 'You have successfully signed up'
      });
      navigate('/signin');

    } catch (error: any) {
      const errorMessage = handleError('SignUp (Phone)', error);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onEmailSubmit = async (data: EmailFormValues) => {
    setIsLoading(true);

    try {
      const result = await register({
        fullname: data.fullname,
        email: data.email,
        password: data.password
      });
      if (!result.success) {
        const errorMessage = result.message || "An unexpected error occurred";

        // Only show "not supported" message for specific backend rejection errors
        if (errorMessage.toLowerCase().includes('email not supported') ||
          errorMessage.toLowerCase().includes('only phone number') ||
          errorMessage.toLowerCase().includes('phone number required')) {
          toast({
            title: "Email Registration Not Fully Supported",
            description: "The backend currently has limited email support. You may try phone number registration for the most reliable experience.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Registration Error",
            description: errorMessage,
            variant: "destructive",
          });
        }
        return;
      }

      toast({
        title: 'Registration Successful',
        description: 'You have successfully signed up. Please check your email for verification.'
      });

      // Navigate to OTP verification if needed, otherwise to signin
      if (result.otpSent) {
        navigate('/verify-otp', { state: { email: data.email } });
      } else {
        navigate('/signin');
      }

    } catch (error: any) {
      const errorMessage = handleError('SignUp (Email)', error);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-primary/10 flex items-center justify-center p-4">
      <SEO title="Sign Up – connectify Rwanda" description="Create your connectify account to start buying, selling, and renting cars in Rwanda." />
      <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm border border-border shadow-card">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
            Create Account
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Join Us today, and never struggle
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'phone' | 'email')} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="phone">Phone Number</TabsTrigger>
              <TabsTrigger value="email">
                Email Address
              </TabsTrigger>
            </TabsList>

            <TabsContent value="phone" className="mt-6">
              <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone-fullname">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone-fullname"
                      type="text"
                      placeholder="Enter your full name"
                      {...phoneForm.register('fullname')}
                      className={`search-input pl-8 ${phoneForm.formState.errors.fullname ? 'border-destructive' : ''}`}
                      required
                      disabled={isLoading}
                    />
                    {phoneForm.formState.errors.fullname && (
                      <p className="text-sm text-destructive mt-1">{phoneForm.formState.errors.fullname.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="flex gap-2">
                    <CountryCodeSelector
                      value={selectedCountry}
                      onValueChange={(countryCode) => {
                        setSelectedCountry(countryCode);
                        // Update full phone number when country changes
                        if (localPhoneNumber) {
                          const country = getCountryByCode(countryCode);
                          const fullNumber = country ? `${country.dialCode}${localPhoneNumber}` : `+${localPhoneNumber}`;
                          phoneForm.setValue('phone', fullNumber);
                        }
                      }}
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
                        disabled={isLoading}
                        onChange={(e) => {
                          const localNumber = e.target.value.replace(/[^\d]/g, ''); // Only allow digits
                          setLocalPhoneNumber(localNumber);

                          const country = getCountryByCode(selectedCountry);
                          const fullNumber = country ? `${country.dialCode}${localNumber}` : `+${localNumber}`;
                          phoneForm.setValue('phone', fullNumber);
                        }}
                      />
                      <input type="hidden" {...phoneForm.register('phone')} />
                    </div>
                  </div>
                  {phoneForm.formState.errors.phone && (
                    <p className="text-sm text-destructive mt-1">{phoneForm.formState.errors.phone.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      {...phoneForm.register('password')}
                      className={`search-input pl-8 pr-10 ${phoneForm.formState.errors.password ? 'border-destructive' : ''}`}
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    {phoneForm.formState.errors.password && (
                      <p className="text-sm text-destructive mt-1">{phoneForm.formState.errors.password.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone-confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone-confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      {...phoneForm.register('confirmPassword')}
                      className={`search-input pl-8 pr-10 ${phoneForm.formState.errors.confirmPassword ? 'border-destructive' : ''}`}
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    {phoneForm.formState.errors.confirmPassword && (
                      <p className="text-sm text-destructive mt-1">{phoneForm.formState.errors.confirmPassword.message}</p>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  className="btn-hero w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="email" className="mt-6">
              <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-fullname">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email-fullname"
                      type="text"
                      placeholder="Enter your full name"
                      {...emailForm.register('fullname')}
                      className={`search-input pl-8 ${emailForm.formState.errors.fullname ? 'border-destructive' : ''}`}
                      required
                      disabled={isLoading}
                    />
                    {emailForm.formState.errors.fullname && (
                      <p className="text-sm text-destructive mt-1">{emailForm.formState.errors.fullname.message}</p>
                    )}
                  </div>
                </div>

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
                    {emailForm.formState.errors.email && (
                      <p className="text-sm text-destructive mt-1">{emailForm.formState.errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      {...emailForm.register('password')}
                      className={`search-input pl-8 pr-10 ${emailForm.formState.errors.password ? 'border-destructive' : ''}`}
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    {emailForm.formState.errors.password && (
                      <p className="text-sm text-destructive mt-1">{emailForm.formState.errors.password.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email-confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email-confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      {...emailForm.register('confirmPassword')}
                      className={`search-input pl-8 pr-10 ${emailForm.formState.errors.confirmPassword ? 'border-destructive' : ''}`}
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    {emailForm.formState.errors.confirmPassword && (
                      <p className="text-sm text-destructive mt-1">{emailForm.formState.errors.confirmPassword.message}</p>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  className="btn-hero w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
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

      {/* Hidden reCAPTCHA container */}
      <div id="recaptcha-container" className="hidden"></div>
    </div>
  );
};

export default SignUp;
