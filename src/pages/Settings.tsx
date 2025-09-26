import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Bell, Shield, CreditCard, Settings as SettingsIcon, Moon, Sun, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { clearAllStorageAndCookies } from '@/utils/cookies';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleClearAllData = () => {
    clearAllStorageAndCookies();
    toast({
      title: "Data Cleared",
      description: "All cookies, local storage, and cached data have been cleared.",
    });
  };

  const settingSections = [
    {
      icon: <User className="h-6 w-6 text-primary" />,
      title: "Profile Settings",
      description: "Manage your personal information and preferences",
      items: [
        "Update profile information",
        "Change profile picture",
        "Update contact details",
        "Manage account preferences"
      ]
    },
    {
      icon: <Bell className="h-6 w-6 text-primary" />,
      title: "Notifications",
      description: "Control how and when you receive notifications",
      items: [
        "Email notifications",
        "SMS alerts",
        "Push notifications",
        "Marketing communications"
      ]
    },
    {
      icon: <Shield className="h-6 w-6 text-primary" />,
      title: "Privacy & Security",
      description: "Manage your privacy settings and account security",
      items: [
        "Change password",
        "Two-factor authentication",
        "Privacy settings",
        "Login activity"
      ]
    },
    {
      icon: <CreditCard className="h-6 w-6 text-primary" />,
      title: "Payment Settings",
      description: "Manage your payment methods and billing information",
      items: [
        "Payment methods",
        "Billing information",
        "Transaction history",
        "Auto-pay settings"
      ]
    },
    {
      icon: <Trash2 className="h-6 w-6 text-destructive" />,
      title: "Data & Privacy",
      description: "Manage your data and clear stored information",
      items: [
        "Clear cookies and cache",
        "Reset app preferences",
        "Clear browsing data",
        "Export personal data"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-r from-primary to-primary-dark text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="text-left mb-6">
              <Button variant="ghost" onClick={() => navigate(user?.role === 'admin' ? '/admin-dashboard' : '/buyer-dashboard')}>
                {/* simple arrow */}
                <span className="mr-2">←</span>
                Back to Dashboard
              </Button>
            </div>
            <SettingsIcon className="h-16 w-16 mx-auto mb-6 animate-fade-in" />
            <h1 className="text-4xl font-bold mb-4 animate-fade-in">Account Settings</h1>
            <p className="text-xl leading-relaxed animate-slide-up">
              Manage your account preferences, security settings, and notification preferences
            </p>
          </div>
        </div>
      </section>

      {/* Settings Sections */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {settingSections.map((section, index) => (
                <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] animate-zoom-in" style={{ animationDelay: `${index * 150}ms` }}>
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      {section.icon}
                      <CardTitle className="text-xl">{section.title}</CardTitle>
                    </div>
                    <p className="text-muted-foreground">{section.description}</p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      {section.items.map((item, idx) => (
                        <li key={idx} className="flex items-center">
                          <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                          <span className="text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      variant="outline" 
                      className="w-full hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                      onClick={() => {
                        // For now, show a toast that this feature is coming soon
                        alert(`${section.title} feature is coming soon!`);
                      }}
                    >
                      Manage Settings
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-6 animate-fade-in">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-6 text-center hover:shadow-lg transition-all duration-300 hover:scale-[1.02] animate-slide-up">
                  <CardContent className="p-0">
                    <Moon className="h-8 w-8 text-primary mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">Dark Mode</h3>
                    <Badge variant="secondary">Coming Soon</Badge>
                  </CardContent>
                </Card>

                <Card className="p-6 text-center hover:shadow-lg transition-all duration-300 hover:scale-[1.02] animate-slide-up" style={{ animationDelay: '150ms' }}>
                  <CardContent className="p-0">
                    <Bell className="h-8 w-8 text-primary mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">Notification Center</h3>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                      onClick={() => alert('Notification settings coming soon!')}
                    >
                      Manage
                    </Button>
                  </CardContent>
                </Card>

                <Card className="p-6 text-center hover:shadow-lg transition-all duration-300 hover:scale-[1.02] animate-slide-up" style={{ animationDelay: '300ms' }}>
                  <CardContent className="p-0">
                    <Shield className="h-8 w-8 text-primary mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">Security Center</h3>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                      onClick={() => alert('Security center coming soon!')}
                    >
                      Review
                    </Button>
                  </CardContent>
                </Card>

                <Card className="p-6 text-center hover:shadow-lg transition-all duration-300 hover:scale-[1.02] animate-slide-up" style={{ animationDelay: '450ms' }}>
                  <CardContent className="p-0">
                    <Trash2 className="h-8 w-8 text-destructive mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">Clear Data</h3>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      className="transition-all duration-200"
                      onClick={handleClearAllData}
                    >
                      Clear All
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Support Section */}
            <div className="mt-12 p-8 bg-secondary/30 rounded-lg text-center animate-fade-in">
              <h2 className="text-2xl font-bold mb-4">Need Help?</h2>
              <p className="text-muted-foreground mb-6">
                Can't find what you're looking for? Our support team is here to help you with any questions or issues.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  className="bg-primary text-primary-foreground hover:bg-primary-dark transition-all duration-200 hover:scale-105"
                  onClick={() => window.location.href = '/support'}
                >
                  Contact Support
                </Button>
                <Button 
                  variant="outline" 
                  className="hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                  onClick={() => alert('Help center coming soon!')}
                >
                  View Help Center
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Settings;