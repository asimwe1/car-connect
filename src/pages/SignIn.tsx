import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Phone, Lock } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import SEO from '@/components/SEO';
import { CountryCodeSelector } from '@/components/CountryCodeSelector';
import { getCountryByCode } from '@/data/countryCodes';
import { api } from '@/services/api';

const schema = z.object({
  phone: z
    .string()
    .min(8)
    .max(20)
    .regex(/^\+[1-9]\d{1,14}$/, 'Please enter a valid international phone number starting with your country code'),
  password: z.string().min(1, 'Password is required'),
  remember: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;

const SignIn = () => {
  const rememberDefault = false;
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('RW'); // Default to Rwanda
  const [localPhoneNumber, setLocalPhoneNumber] = useState('');

  const { toast } = useToast();
  const navigate = useNavigate();
  const { setAuthenticatedUser } = useAuth();

  const { register: rhfRegister, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { phone: '', password: '', remember: rememberDefault },
  });

  const rememberMe = watch('remember');

  useEffect(() => {
    const rememberedPhone = localStorage.getItem('rememberPhone');
    if (rememberedPhone) {
      setValue('phone', rememberedPhone);
      setValue('remember', true);

      const countryCodes = getCountryByCode('all');
      let matchedCountry = null;
      let localPart = rememberedPhone;

      countryCodes.sort((a, b) => b.dialCode.length - a.dialCode.length);
      for (const country of countryCodes) {
        if (rememberedPhone.startsWith(country.dialCode)) {
          matchedCountry = country;
          localPart = rememberedPhone.substring(country.dialCode.length);
          break;
        }
      }

      if (matchedCountry) {
        setSelectedCountry(matchedCountry.code);
        setLocalPhoneNumber(localPart);
      }
    }
  }, [setValue]);

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      const result = await api.login({ phone: data.phone, password: data.password });
      if (result.error || !result.data?.success) {
        toast({
          title: 'Error',
          description: result.error || result.data?.message || 'Invalid phone number or password.',
          variant: 'destructive',
        });
        return;
      }

      const user = result.data.user;
      if (!user) {
        toast({
          title: 'Error',
          description: 'No user data returned from login.',
          variant: 'destructive',
        });
        return;
      }

      setAuthenticatedUser(user);

      if (data.remember) {
        localStorage.setItem('rememberPhone', data.phone);
      } else {
        localStorage.removeItem('rememberPhone');
      }

      const isAdmin = user.role === 'admin';
      navigate(isAdmin ? '/admin-dashboard' : '/buyer-dashboard');
    } catch (error: unknown) {
      console.error('SignIn error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
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
    setValue('phone', fullNumber, { shouldValidate: true });
  };

  const handleCountryChange = (countryCode: string) => {
    setSelectedCountry(countryCode);

    if (localPhoneNumber) {
      const country = getCountryByCode(countryCode);
      const fullNumber = country ? `${country.dialCode}${localPhoneNumber}` : `+${localPhoneNumber}`;
      setValue('phone', fullNumber, { shouldValidate: true });
    } else {
      const country = getCountryByCode(countryCode);
      const fullNumber = country ? country.dialCode : '';
      setValue('phone', fullNumber, { shouldValidate: true });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-primary/10 flex items-center justify-center p-4">
      <SEO title="Sign In – CarConnect Rwanda" description="Sign in to your CarConnect account to book test drives, save cars, and manage orders." />
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
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                    className={`search-input pl-8 ${errors.phone ? 'border-destructive' : ''}`}
                    required
                    onChange={handleLocalNumberChange}
                  />
                  <input type="hidden" {...rhfRegister('phone')} />
                </div>
              </div>
              {errors.phone && (
                <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  {...rhfRegister('password')}
                  className={`search-input pl-8 pr-10 ${errors.password ? 'border-destructive' : ''}`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                {errors.password && (
                  <p className="text-sm text-destructive mt-1">{errors.password.message}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 select-none text-sm text-muted-foreground">
                <Checkbox
                  id="remember"
                  checked={!!rememberMe}
                  onCheckedChange={(v) => setValue('remember', !!v)}
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