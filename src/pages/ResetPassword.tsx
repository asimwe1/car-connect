import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Lock, ArrowLeft, Key } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import SEO from '@/components/SEO';
import { api } from '@/services/api';

const schema = z.object({
  otpCode: z.string().min(4, 'OTP code must be at least 4 digits').max(6, 'OTP code must be at most 6 digits'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Confirm password is required')
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

type FormValues = z.infer<typeof schema>;

interface ResetData {
  phone?: string;
  email?: string;
  method: 'phone' | 'email';
}

const ResetPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetData, setResetData] = useState<ResetData | null>(null);

  const { toast } = useToast();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { otpCode: '', newPassword: '', confirmPassword: '' },
  });

  useEffect(() => {
    const storedData = localStorage.getItem('passwordResetData');
    if (!storedData) {
      toast({
        title: 'Error',
        description: 'No reset session found. Please start the password reset process again.',
        variant: 'destructive',
      });
      navigate('/forgot-password');
      return;
    }

    try {
      const parsed = JSON.parse(storedData) as ResetData;
      setResetData(parsed);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Invalid reset session. Please start the password reset process again.',
        variant: 'destructive',
      });
      navigate('/forgot-password');
    }
  }, [navigate, toast]);

  const onSubmit = async (data: FormValues) => {
    if (!resetData) {
      toast({
        title: 'Error',
        description: 'No reset session found. Please start the password reset process again.',
        variant: 'destructive',
      });
      navigate('/forgot-password');
      return;
    }

    setIsLoading(true);
    try {
      const resetPayload = {
        otpCode: data.otpCode,
        newPassword: data.newPassword,
        ...(resetData.phone && { phone: resetData.phone }),
        ...(resetData.email && { email: resetData.email }),
      };

      const result = await api.resetPasswordWithOtp(resetPayload);
      if (result.error || !result.data?.success) {
        toast({
          title: 'Error',
          description: result.error || result.data?.message || 'Failed to reset password.',
          variant: 'destructive',
        });
        return;
      }

      // Clear the reset session
      localStorage.removeItem('passwordResetData');

      toast({
        title: 'Password Reset Successful',
        description: 'Your password has been reset successfully. You can now sign in with your new password.',
      });

      navigate('/signin');
    } catch (error: unknown) {
      console.error('Reset password error:', error);
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

  if (!resetData) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-primary/10 flex items-center justify-center p-4">
      <SEO title="Reset Password – CarConnect Rwanda" description="Enter your verification code and new password to complete the password reset process." />
      <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm border border-border shadow-card">
        <CardHeader className="space-y-1 text-center">
          <div className="flex items-center justify-center mb-2">
            <Link
              to="/forgot-password"
              className="absolute left-6 top-6 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
            Reset Password
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Enter the verification code sent to your {resetData.method === 'phone' ? 'phone' : 'email'} and your new password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otpCode">Verification Code</Label>
              <div className="relative">
                <Key className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="otpCode"
                  type="text"
                  placeholder="Enter verification code"
                  {...register('otpCode')}
                  className={`search-input pl-8 ${errors.otpCode ? 'border-destructive' : ''}`}
                  required
                  disabled={isLoading}
                  maxLength={6}
                />
              </div>
              {errors.otpCode && (
                <p className="text-sm text-destructive mt-1">{errors.otpCode.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  {...register('newPassword')}
                  className={`search-input pl-8 pr-10 ${errors.newPassword ? 'border-destructive' : ''}`}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-sm text-destructive mt-1">{errors.newPassword.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Lock className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  {...register('confirmPassword')}
                  className={`search-input pl-8 pr-10 ${errors.confirmPassword ? 'border-destructive' : ''}`}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-destructive mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button type="submit" className="btn-hero w-full" disabled={isLoading}>
              {isLoading ? 'Resetting Password...' : 'Reset Password'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Didn't receive a code?{' '}
              <Link
                to="/forgot-password"
                className="text-primary hover:text-primary-light font-medium transition-colors"
              >
                Send again
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;