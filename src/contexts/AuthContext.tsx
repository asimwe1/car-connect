import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api, User, AuthState, authStorage } from '../services/api';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (fullname: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  verifyOtp: (email: string, otp: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      const response = await api.getMe();
      
      if (response.data?.success && response.data.user) {
        const userData = response.data.user;
        setUser(userData);
        authStorage.setUser(userData);
      } else {
        setUser(null);
        authStorage.clearUser();
      }
    } catch (error) {
      setUser(null);
      authStorage.clearUser();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await api.login({ email, password });
      
      if (response.data?.success) {
        return { success: true, message: response.data.message };
      } else {
        return { success: false, message: response.error || 'Login failed' };
      }
    } catch (error) {
      return { success: false, message: 'Network error' };
    }
  };

  const register = async (fullname: string, email: string, password: string) => {
    try {
      const response = await api.register({ fullname, email, password });
      
      if (response.data?.message === 'Registration successful') {
        return { success: true, message: response.data.message };
      } else {
        return { success: false, message: response.error || 'Registration failed' };
      }
    } catch (error) {
      return { success: false, message: 'Network error' };
    }
  };

  const verifyOtp = async (email: string, otp: string) => {
    try {
      const response = await api.verifyOtp({ email, otp });
      
      if (response.data?.success) {
        // After successful OTP verification, get user data
        await checkAuth();
        return { success: true, message: response.data.message };
      } else {
        return { success: false, message: response.error || 'OTP verification failed' };
      }
    } catch (error) {
      return { success: false, message: 'Network error' };
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      authStorage.clearUser();
    }
  };

  useEffect(() => {
    // Check if user is already logged in
    const savedUser = authStorage.getUser();
    if (savedUser) {
      setUser(savedUser);
      // Verify the session is still valid
      checkAuth();
    } else {
      setIsLoading(false);
    }
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    verifyOtp,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
