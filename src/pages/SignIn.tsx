import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Phone, Lock, Mail } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import SEO from '@/components/SEO';
import { CountryCodeSelector } from '@/components/CountryCodeSelector';
import { getCountryByCode, countryCodes } from '@/data/countryCodes';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { handleError } from '@/utils/errorMessages';

const phoneSchema = z.object({
  phone: z
    .string()
    .min(8)
    .max(20)
    .regex(/^\+[1-9]\d{1,14}$/, 'Please enter a valid international phone number starting with your country code'),
  password: z.string().min(1, 'Password is required'),
  remember: z.boolean().optional(),
});

const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  remember: z.boolean().optional(),
});

type PhoneFormValues = z.infer<typeof phoneSchema>;
type EmailFormValues = z.infer<typeof emailSchema>;

const SignIn = () => {
  const rememberDefault = false;
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('RW'); // Default to Rwanda
  const [localPhoneNumber, setLocalPhoneNumber] = useState('');
  const [activeTab, setActiveTab] = useState('phone');

  const { toast } = useToast();
  const navigate = useNavigate();
  const { login, setAuthenticatedUser } = useAuth();

  const phoneForm = useForm<PhoneFormValues>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: '', password: '', remember: rememberDefault },
  });

  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: '', password: '', remember: rememberDefault },
  });

  const phoneRememberMe = phoneForm.watch('remember');
  const emailRememberMe = emailForm.watch('remember');

  useEffect(() => {
    const rememberedData = localStorage.getItem('rememberData');
    if (rememberedData) {
      try {
        const parsed = JSON.parse(rememberedData);
        if (parsed.type === 'phone') {
          phoneForm.setValue('phone', parsed.value);
          phoneForm.setValue('remember', true);

          const allCountries = countryCodes; // Use the array directly
          let matchedCountry = null;
          let localPart = parsed.value;

          allCountries.sort((a, b) => b.dialCode.length - a.dialCode.length);
          for (const country of allCountries) {
            if (parsed.value.startsWith(country.dialCode)) {
              matchedCountry = country;
              localPart = parsed.value.substring(country.dialCode.length);
              break;
            }
          }

          if (matchedCountry) {
            setSelectedCountry(matchedCountry.code);
            setLocalPhoneNumber(localPart);
          }
        } else if (parsed.type === 'email') {
          setActiveTab('email');
          emailForm.setValue('email', parsed.value);
          emailForm.setValue('remember', true);
        }
      } catch (error) {
        console.error('Error parsing remembered data:', error);
      }
    }
  }, [phoneForm, emailForm]);

  const onPhoneSubmit = async (data: PhoneFormValues) => {
    setIsLoading(true);
    try {
      const result = await login({ phone: data.phone, password: data.password });
      if (!result.success) {
        toast({
          title: 'Login Error',
          description: result.message || 'Invalid phone number or password.',
          variant: 'destructive',
        });
        return;
      }

      if (data.remember) {
        localStorage.setItem('rememberData', JSON.stringify({ type: 'phone', value: data.phone }));
      } else {
        localStorage.removeItem('rememberData');
      }

      // AuthContext login method already sets the user, so we can get it from result
      const user = result.user;
      if (user) {
        const isAdmin = user.role === 'admin';
        navigate(isAdmin ? '/admin-dashboard' : '/buyer-dashboard');
      } else {
        navigate('/buyer-dashboard');
      }
    } catch (error: unknown) {
      const errorMessage = handleError('SignIn (Phone)', error);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onEmailSubmit = async (data: EmailFormValues) => {
    setIsLoading(true);
    try {
      const result = await login({ email: data.email, password: data.password });
      if (!result.success) {
        toast({
          title: 'Login Error',
          description: result.message || 'Invalid email or password.',
          variant: 'destructive',
        });
        return;
      }

      if (data.remember) {
        localStorage.setItem('rememberData', JSON.stringify({ type: 'email', value: data.email }));
      } else {
        localStorage.removeItem('rememberData');
      }

      // AuthContext login method already sets the user, so we can get it from result
      const user = result.user;
      if (user) {
        const isAdmin = user.role === 'admin';
        navigate(isAdmin ? '/admin-dashboard' : '/buyer-dashboard');
      } else {
        navigate('/buyer-dashboard');
      }
    } catch (error: unknown) {
      const errorMessage = handleError('SignIn (Email)', error);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
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
      <SEO title="Sign In – connectify Rwanda" description="Sign in to your connectify account to book test drives, save cars, and manage orders." />
      <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm border border-border shadow-card">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="phone">Phone Number</TabsTrigger>
              <TabsTrigger value="email">
                Email Address
              </TabsTrigger>
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

                <div className="space-y-2">
                  <Label htmlFor="phone-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
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

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 select-none text-sm text-muted-foreground">
                    <Checkbox
                      id="phone-remember"
                      checked={!!phoneRememberMe}
                      onCheckedChange={(v) => phoneForm.setValue('remember', !!v)}
                    />
                    <span>Remember me</span>
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Forgot your password?
                  </Link>
                </div>

                <Button type="submit" className="btn-hero w-full" disabled={isLoading}>
                  {isLoading ? 'Signing In...' : 'Sign In'}
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

                <div className="space-y-2">
                  <Label htmlFor="email-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
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

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 select-none text-sm text-muted-foreground">
                    <Checkbox
                      id="email-remember"
                      checked={!!emailRememberMe}
                      onCheckedChange={(v) => emailForm.setValue('remember', !!v)}
                    />
                    <span>Remember me</span>
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Forgot your password?
                  </Link>
                </div>

                <Button type="submit" className="btn-hero w-full" disabled={isLoading}>
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="text-primary hover:text-primary-light font-medium transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>

      <div id="recaptcha-container" className="hidden"></div>
    </div>
  );
};

export default SignIn;