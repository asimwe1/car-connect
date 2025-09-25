import React from 'react';
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
import { firebasePhoneAuth } from '@/services/firebaseAuth';

const schema = z.object({
  phone: z.string().min(10).max(16).regex(/^\+?[0-9]{10,15}$/,
    'Please enter a valid phone number'),
  password: z.string().min(1, 'Password is required'),
  remember: z.boolean().optional()
});

type FormValues = z.infer<typeof schema>;

const SignIn = () => {
  const rememberDefault = false;
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { login, setAuthenticatedUser } = useAuth();
  const { register: rhfRegister, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { phone: '', password: '', remember: rememberDefault }
  });

  const rememberMe = watch('remember');

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      if (data.remember) {
        localStorage.setItem('rememberPhone', data.phone);
      } else {
        localStorage.removeItem('rememberPhone');
      }

      // Check if it's an admin number for bypass
      if (firebasePhoneAuth.isAdminNumber(data.phone)) {
        const adminBypass = await firebasePhoneAuth.adminBypass(data.phone);
        if (adminBypass.success) {
          // Admin credentials validation
          const digits = data.phone.replace(/\D/g, '');
          const adminMap: Record<string, { id: string; fullname: string; phone: string; password: string }> = {
              '250788881400': { id: '68d2960f836c423156abed3e', fullname: 'Test Admin', phone: '+250788881400', password: 'carhub@1050' },
              '250793373953': { id: '68d525aa9325d460f7f890e8', fullname: 'Admin One', phone: '+250793373953', password: 'carhub@1050' },
            };
          const matchKey = digits.endsWith('788881400') ? '250788881400' : (digits.endsWith('793373953') ? '250793373953' : '');
          
          if (matchKey && adminMap[matchKey] && data.password === adminMap[matchKey].password) {
            const adminUser = { _id: adminMap[matchKey].id, fullname: adminMap[matchKey].fullname, phone: adminMap[matchKey].phone, role: 'admin' as const };
            setAuthenticatedUser(adminUser);
            toast({ title: 'Welcome Admin', description: 'Admin access granted. Redirecting to dashboard.' });
            navigate('/admin-dashboard');
            return;
          } else {
            toast({
              title: "Invalid Admin Credentials",
              description: "Please check your password",
              variant: "destructive",
            });
            return;
          }
        }
      }

      // Initialize Firebase Phone Auth when not in fake mode
      if (!firebasePhoneAuth.isFakeMode()) {
        firebasePhoneAuth.initializeRecaptcha();
      }
      // Send OTP (in fake mode this does not hit Firebase)
      await firebasePhoneAuth.sendOTP(data.phone);
      
      // Store verification data
      localStorage.setItem('pendingVerification', JSON.stringify({
        phone: data.phone,
        password: data.password,
        isSignIn: true,
        useFirebase: true
      }));
      
      notify.success('Verification Code Sent', 'Use 123456 for test numbers');
      navigate('/verify-otp');
      
    } catch (error: unknown) {
      console.error('SignIn error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      notify.error('Sign in failed', errorMessage);
    } finally {
      setIsLoading(false);
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
              <div className="relative">
                <Phone className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+250 7XX XXX XXX"
                  {...rhfRegister('phone')}
                  className={`search-input pl-8 ${errors.phone ? 'border-destructive' : ''}`}
                  required
                />
                {errors.phone && (
                  <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>
                )}
              </div>
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
                to="/signin" 
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
      
      {/* Hidden reCAPTCHA container */}
      <div id="recaptcha-container" className="hidden"></div>
    </div>
  );
};

export default SignIn;
