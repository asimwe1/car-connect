// src/pages/ResetPasswordVerify.tsx
import { useState } from 'react';
import { Button, Input, Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { api } from '@/services/api';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ResetPasswordVerify() {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const phone = localStorage.getItem('resetPhone');

  const handleSubmit = async () => {
    if (otp.length !== 6) {
      toast({ title: "Invalid", description: "Enter 6 digits", variant: "destructive" });
      return;
    }

    setLoading(true);
    const result = await api.verifyResetOTP({ otp });

    if (result.data?.success && result.data?.token) {
      localStorage.setItem('resetToken', result.data.token);
      localStorage.removeItem('resetPhone');
      navigate('/reset-password-final');
    } else {
      toast({ title: "Invalid OTP", description: result.data?.message || "Try again", variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-primary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center mb-2">
            <Link to="/forgot-password" className="mr-auto">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </div>
          <CardTitle>Enter Verification Code</CardTitle>
          <CardDescription>
            We sent a 6-digit code to <strong>{phone}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="123456"
            className="text-center text-2xl tracking-widest"
            maxLength={6}
            autoFocus
          />
          <Button onClick={handleSubmit} disabled={loading} className="mt-6 w-full">
            {loading ? "Verifying..." : "Verify & Continue"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}