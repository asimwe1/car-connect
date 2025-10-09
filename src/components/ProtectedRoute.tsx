import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthPrompt } from '@/contexts/AuthPromptContext';
import PageLoader from './PageLoader';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  adminOnly?: boolean;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  adminOnly = false,
  redirectTo
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const authPrompt = useAuthPrompt();

  useEffect(() => {
    // If authentication is required but user is not authenticated
    if (requireAuth && !isLoading && !isAuthenticated) {
      authPrompt.showPrompt({ 
        redirectTo: redirectTo || location.pathname + location.search 
      });
    }
  }, [requireAuth, isLoading, isAuthenticated, authPrompt, location, redirectTo]);

  // Show loading while checking authentication
  if (isLoading) {
    return <PageLoader />;
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // If admin access is required but user is not an admin
  if (adminOnly && isAuthenticated && user?.role !== 'admin') {
    return <Navigate to="/buyer-dashboard" replace />;
  }

  // If user is authenticated but trying to access auth pages, redirect to appropriate dashboard
  if (isAuthenticated && ['/signin', '/signup', '/verify-otp'].includes(location.pathname)) {
    const redirectTo = user?.role === 'admin' ? '/admin-dashboard' : '/buyer-dashboard';
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
