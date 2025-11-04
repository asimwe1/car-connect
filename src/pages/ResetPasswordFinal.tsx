// src/pages/ResetPasswordFinal.tsx
import { useState } from 'react';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { api } from '@/services/api';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ResetPasswordFinal() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const token = localStorage.getItem('resetToken');

  const handleSubmit = async () => {
    if (password.length < 6) {
      toast({ title: "Weak password", description: "Minimum 6 characters", variant: "destructive" });
      return;
    }

    setLoading(true);
    const result = await api.resetPassword(token!, password);
    setLoading(false);

    if (result.data?.success) {
      localStorage.removeItem('resetToken');
      toast({ title: "Success!", description: "Password updated." });
      navigate('/signin');
    } else {
      toast({ title: "Failed", description: "Try again", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-primary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center mb-2">
            <Link to="/reset-password-verify" className="mr-auto">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </div>
          <CardTitle>Create New Password</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter new password"
            className="mb-4"
          />
          <Button onClick={handleSubmit} disabled={loading} className="w-full">
            {loading ? "Saving..." : "Reset Password"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}