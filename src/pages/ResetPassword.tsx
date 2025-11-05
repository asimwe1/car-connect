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
  otpCode: z.string()
    .min(4, 'OTP code must be at least 4 digits')
    .max(10, 'OTP code must be at most 10 digits')
    .regex(/^\d+$/, 'OTP code must contain only numbers'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
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
  timestamp?: number; // For session expiry validation
}

const ResetPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
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
        title: 'Session Expired',
        description: 'No reset session found. Please start the password reset process again.',
        variant: 'destructive',
      });
      navigate('/forgot-password');
      return;
    }

    try {
      const parsed = JSON.parse(storedData) as ResetData;
      
      // Check if session is expired (1 hour)
      if (parsed.timestamp && Date.now() - parsed.timestamp > 60 * 60 * 1000) {
        localStorage.removeItem('passwordResetData');
        toast({
          title: 'Session Expired',
          description: 'Your reset session has expired. Please start the password reset process again.',
          variant: 'destructive',
        });
        navigate('/forgot-password');
        return;
      }
      
      setResetData(parsed);
    } catch (error) {
      localStorage.removeItem('passwordResetData');
      toast({
        title: 'Invalid Session',
        description: 'Invalid reset session. Please start the password reset process again.',
        variant: 'destructive',
      });
      navigate('/forgot-password');
    }
  }, [navigate, toast]);

  // Cooldown timer effect
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleResendOTP = async () => {
    if (!resetData || resendCooldown > 0) return;
    
    setIsResending(true);
    try {
      // Use the same forgot password endpoint to resend OTP
      const resendPayload = {
        ...(resetData.phone && { phone: resetData.phone }),
        ...(resetData.email && { email: resetData.email }),
      };

      const result = await api.forgotPassword(resendPayload);
      
      if (result.error || !result.data?.success) {
        toast({
          title: 'Resend Failed',
          description: result.error || result.data?.message || 'Failed to resend verification code.',
          variant: 'destructive',
        });
        return;
      }

      // Update timestamp for new session
      const updatedResetData = { ...resetData, timestamp: Date.now() };
      localStorage.setItem('passwordResetData', JSON.stringify(updatedResetData));
      setResetData(updatedResetData);
      
      // Start cooldown (60 seconds)
      setResendCooldown(60);
      
      toast({
        title: 'OTP Resent',
        description: `New verification code sent to your ${resetData.method === 'phone' ? 'phone' : 'email'}.`,
      });
    } catch (error) {
      console.error('Resend OTP error:', error);
      toast({
        title: 'Resend Failed',
        description: 'Failed to resend verification code. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsResending(false);
    }
  };

  const onSubmit = async (data: FormValues) => {
    if (!resetData) {
      toast({
        title: 'Session Error',
        description: 'No reset session found. Please start the password reset process again.',
        variant: 'destructive',
      });
      navigate('/forgot-password');
      return;
    }

    setIsLoading(true);
    try {
      // Prepare payload for Twilio-based backend
      const resetPayload = {
        otpCode: data.otpCode.trim(),
        newPassword: data.newPassword,
        ...(resetData.phone && { phone: resetData.phone }),
        ...(resetData.email && { email: resetData.email }),
      };

      console.log('Attempting password reset with Twilio OTP verification');
      const result = await api.resetPasswordWithOtp(resetPayload);
      
      if (result.error || !result.data?.success) {
        // Handle specific Twilio error cases
        const errorMessage = result.error || result.data?.message || 'Failed to reset password.';
        
        if (errorMessage.toLowerCase().includes('expired') || errorMessage.toLowerCase().includes('invalid')) {
          toast({
            title: 'Invalid or Expired OTP',
            description: 'The verification code is invalid or has expired. Please request a new code.',
            variant: 'destructive',
          });
        } else if (errorMessage.toLowerCase().includes('attempt')) {
          toast({
            title: 'Too Many Attempts',
            description: 'Too many failed attempts. Please wait before trying again.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Reset Failed',
            description: errorMessage,
            variant: 'destructive',
          });
        }
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
      
      // Handle network and other errors
      if (errorMessage.toLowerCase().includes('network') || errorMessage.toLowerCase().includes('fetch')) {
        toast({
          title: 'Network Error',
          description: 'Unable to connect to the server. Please check your internet connection and try again.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      }
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
                  maxLength={10}
                  autoComplete="one-time-code"
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

          <div className="mt-6 text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              Didn't receive a code?
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={handleResendOTP}
              disabled={isResending || resendCooldown > 0 || !resetData}
              className="w-full"
            >
              {isResending ? 'Resending...' : 
               resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 
               'Resend Verification Code'}
            </Button>
            <p className="text-xs text-muted-foreground">
              {resetData?.method === 'phone' 
                ? `Code sent to ${resetData?.phone?.replace(/(\+\d{1,3})\d{6,10}(\d{4})/, '$1****$2')}`
                : `Code sent to ${resetData?.email?.replace(/(.{2}).*(@.*)/, '$1****$2')}`
              }
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;