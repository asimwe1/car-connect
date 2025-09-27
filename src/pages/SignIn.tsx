import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { notify } from '@/components/Notifier';
import { Eye, EyeOff, Phone, Lock } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import SEO from '@/components/SEO';
// NOTE: We will remove firebasePhoneAuth from the primary login flow
// import { firebasePhoneAuth } from '@/services/firebaseAuth'; 
import { CountryCodeSelector } from '@/components/CountryCodeSelector';
import { getCountryByCode } from '@/data/countryCodes';

// --- Simulation of a real backend authentication API call ---
// NOTE: This function simulates a call to your backend /api/login endpoint
// In a real application, you would replace this with a proper API call using fetch or a library like axios.
const simulateBackendLogin = async (phone: string, password: string): Promise<any> => {
    // Simulated delay for network latency
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulated database/user check
    if (phone === '+250788881400' && password === 'carhub@1050') {
        return {
            success: true,
            user: { 
                _id: '68d5498abc621c37fe2b5fab', 
                fullname: 'Admin One', 
                phone: phone, 
                role: 'admin' 
            },
            role: 'admin'
        };
    }

    if (phone === '+250793373953' && password === 'carhub@1050') {
        return {
            success: true,
            user: { 
                _id: '68d5491683ce5fa40a99954b', 
                fullname: 'User One', 
                phone: phone, 
                role: 'user' 
            },
            role: 'user'
        };
    }
    
    // Default failure for any other number/password combination
    return { 
        success: false, 
        message: 'Invalid phone number or password.' 
    };
};
// -------------------------------------------------------------------

const schema = z.object({
  // Adjusted regex for international phone number format, ensuring it starts with '+'
  phone: z.string().min(8).max(20).regex(/^\+[1-9]\d{1,14}$/,
    'Please enter a valid international phone number starting with your country code'),
  password: z.string().min(1, 'Password is required'),
  remember: z.boolean().optional()
});

type FormValues = z.infer<typeof schema>;

const SignIn = () => {
  const rememberDefault = false;
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('RW'); // Default to Rwanda
  const [localPhoneNumber, setLocalPhoneNumber] = useState(''); // Store local number separately
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const { setAuthenticatedUser } = useAuth(); // Assuming 'login' is now handled by setting user

  const { register: rhfRegister, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { phone: '', password: '', remember: rememberDefault }
  });

  const rememberMe = watch('remember');

  // Effect to load 'remembered' phone number
  useEffect(() => {
    const rememberedPhone = localStorage.getItem('rememberPhone');
    if (rememberedPhone) {
      setValue('phone', rememberedPhone);
      setValue('remember', true);
      
      // Attempt to parse the remembered number into country code and local number
      const countryCodes = getCountryByCode('all'); // Assuming getCountryByCode can return all codes
      let matchedCountry = null;
      let localPart = rememberedPhone;

      // Find the longest matching dial code
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
      if (data.remember) {
        localStorage.setItem('rememberPhone', data.phone);
      } else {
        localStorage.removeItem('rememberPhone');
      }

      // --- New Backend-Only Authentication Logic ---
      const authResult = await simulateBackendLogin(data.phone, data.password);

      if (authResult.success) {
        const user = authResult.user;
        setAuthenticatedUser(user);
        toast({ title: 'Welcome', description: 'Login successful. Redirecting to dashboard.' });
        
        // Redirect based on user role
        if (user.role === 'admin') {
          navigate('/admin-dashboard');
        } else {
          navigate('/buyer-dashboard');
        }
        return;

      } else {
        // Handle login failure from the simulated backend
        toast({
          title: "Login Failed",
          description: authResult.message || "Invalid phone number or password.",
          variant: "destructive",
        });
        return;
      }
      // --- End of New Authentication Logic ---
      
      // NOTE: All previous Firebase OTP and test user bypass logic has been removed.

    } catch (error: unknown) {
      console.error('SignIn error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred during login';
      notify.error('Sign in failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocalNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const localNumber = e.target.value.replace(/[^\d]/g, ''); // Only allow digits
    setLocalPhoneNumber(localNumber);
    
    const country = getCountryByCode(selectedCountry);
    // Construct the full number using the country's dial code
    const fullNumber = country ? `${country.dialCode}${localNumber}` : `+${localNumber}`; 
    setValue('phone', fullNumber, { shouldValidate: true }); // Update form value and trigger validation
  };

  const handleCountryChange = (countryCode: string) => {
    setSelectedCountry(countryCode);
    
    // Re-construct the full number when country changes, if a local number is entered
    if (localPhoneNumber) {
        const country = getCountryByCode(countryCode);
        const fullNumber = country ? `${country.dialCode}${localPhoneNumber}` : `+${localPhoneNumber}`;
        setValue('phone', fullNumber, { shouldValidate: true });
    } else {
        // If local number is empty, ensure 'phone' field reflects only the dial code for validation
        const country = getCountryByCode(countryCode);
        const fullNumber = country ? country.dialCode : '';
        setValue('phone', fullNumber, { shouldValidate: true });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-primary/10 flex items-center justify-center p-4">
      <SEO title="Sign In – CarHub Rwanda" description="Sign in to your CarHub account to book test drives, save cars, and manage orders." />
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
                  {/* NOTE: Hidden input to hold the full validated number for react-hook-form/zod */}
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
                  type={showPassword ? "text" : "password"}
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
                <Checkbox id="remember" checked={!!rememberMe} onCheckedChange={(v) => setValue('remember', !!v)} />
                <span>Remember me</span>
              </label>
              <Link 
                to="/forgot-password" // Changed to a more appropriate path
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Forgot your password?
              </Link>
            </div>

            <Button
              type="submit"
              className="btn-hero w-full"
              disabled={isLoading}
            >
              {isLoading ? "Signing In..." : "Sign In"}
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
      
      {/* Hidden reCAPTCHA container is no longer needed but kept for safety if you reintroduce Firebase */}
      <div id="recaptcha-container" className="hidden"></div>
    </div>
  );
};

export default SignIn;