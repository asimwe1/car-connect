import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useToast } from '@/hooks/use-toast';
import { notify } from '@/components/Notifier';
import { Shield, Clock, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { firebasePhoneAuth } from '@/services/firebaseAuth';

const VerifyOTP = () => {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [attempts, setAttempts] = useState(0);
  const [userData, setUserData] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { verifyOtp, login, checkAuth, user } = useAuth();

  useEffect(() => {
    // Get pending verification data
    const pendingData = localStorage.getItem('pendingVerification');
    if (!pendingData) {
      navigate('/signin');
      return;
    }
    setUserData(JSON.parse(pendingData));

    // Start countdown timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      notify.error('Invalid OTP', 'Please enter the 6-digit code');
      return;
    }

    if (attempts >= 5) {
      notify.error('Too Many Attempts', 'Please try again later');
      return;
    }

    if (!userData?.phone) {
      notify.error('Error', 'Phone number not found');
      navigate('/signin');
      return;
    }

    setIsLoading(true);

    try {
      let result;
      
      // Check if using Firebase Phone Auth
      if (userData.useFirebase) {
        // Verify OTP using Firebase
        const firebaseUser = await firebasePhoneAuth.verifyOTP(otp);
        
        // Now authenticate with backend using the verified phone number
        if (userData.isSignIn) {
          result = await login(userData.phone, userData.password);
        } else {
          // For signup, you might want to create the user account here
          result = { success: true, user: firebaseUser };
        }
      } else {
        // Use existing backend OTP verification
        result = await verifyOtp(userData.phone, otp);
      }

      if (result.success) {
        // Refresh auth state from backend (sets user in context)
        await checkAuth();
        localStorage.removeItem('pendingVerification');
        
        notify.success('Success!', 'Account verified successfully');
        
        // Redirect based on user role (re-read from storage/context)
        const updatedUser = JSON.parse(localStorage.getItem('user') || 'null') || user;
        if (updatedUser) {
          const isAdmin = updatedUser?.role === 'admin';
          navigate(isAdmin ? '/admin-dashboard' : '/buyer-dashboard');
          return;
        }
        
        // If backend didn't return a session (e.g. test numbers in FAKE mode), create a local session
        if (firebasePhoneAuth.isFakeMode() && firebasePhoneAuth.isTestNumber(userData.phone)) {
          const fallbackUser = { _id: 'test-user', fullname: 'Test User', phone: userData.phone, role: 'user' as const };
          localStorage.setItem('user', JSON.stringify(fallbackUser));
          navigate('/buyer-dashboard');
          return;
        }
      } else {
        setAttempts(prev => prev + 1);
        notify.error('Invalid OTP', result.message || `Wrong code. ${5 - attempts - 1} attempts remaining`);
        setOtp('');
      }
    } catch (error: any) {
      setAttempts(prev => prev + 1);
      notify.error('Verification Failed', error.message || 'Please try again');
      setOtp('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;
    
    setCanResend(false);
    setTimeLeft(60);
    setAttempts(0);
    
    try {
      // Check if using Firebase Phone Auth
      if (userData?.useFirebase) {
        // Re-initialize Firebase Phone Auth and send new OTP
        firebasePhoneAuth.initializeRecaptcha();
        await firebasePhoneAuth.sendOTP(userData.phone);
      }
      
      notify.success('OTP Sent', 'Use code 123456 for test numbers');
    } catch (error: any) {
      notify.error('Error', error.message || 'Failed to resend OTP');
    }

    // Restart timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-primary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm border border-border shadow-card">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Verify Your Phone</CardTitle>
          <CardDescription className="text-muted-foreground">
            We've sent a 6-digit code to{' '}
            <span className="font-medium text-foreground">
              {userData?.phone}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={(value) => setOtp(value)}
                disabled={isLoading}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} className="search-input text-center" />
                  <InputOTPSlot index={1} className="search-input text-center" />
                  <InputOTPSlot index={2} className="search-input text-center" />
                  <InputOTPSlot index={3} className="search-input text-center" />
                  <InputOTPSlot index={4} className="search-input text-center" />
                  <InputOTPSlot index={5} className="search-input text-center" />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <Button
              onClick={handleVerifyOTP}
              className="btn-hero w-full"
              disabled={isLoading || otp.length !== 6}
            >
              {isLoading ? "Verifying..." : "Verify Code"}
            </Button>
          </div>

          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>
                {canResend ? "You can resend the code now" : `Resend in ${formatTime(timeLeft)}`}
              </span>
            </div>

            <Button
              variant="ghost"
              onClick={handleResendOTP}
              disabled={!canResend}
              className="text-primary hover:text-primary-light"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Resend Code
            </Button>
          </div>

          {attempts > 0 && (
            <div className="text-center text-sm text-warning">
              {attempts}/5 attempts used
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Hidden reCAPTCHA container */}
      <div id="recaptcha-container" className="hidden"></div>
    </div>
  );
};

export default VerifyOTP;