import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api, User, AuthState, authStorage } from '../services/api';
import { clearAllStorageAndCookies } from '../utils/cookies';
import { sessionManager } from '../services/sessionManager';

interface AuthContextType extends AuthState {
  login: (phone: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (fullname: string, phone: string, password: string) => Promise<{ success: boolean; message?: string }>;
  verifyOtp: (phone: string, otp: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setAuthenticatedUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Setup session manager logout handler
  useEffect(() => {
    sessionManager.setLogoutHandler(() => {
      console.log('Session timeout - forcing logout');
      logout();
    });
  }, []);

  const checkAuth = async (preserveExistingUser = false) => {
    try {
      setIsLoading(true);
      const response = await api.getMe();
      
      if (response.data && typeof response.data === 'object' && 'success' in response.data && response.data.success) {
        const userData = (response.data as any).user as User | undefined;
        if (userData) {
          setUser(userData);
          authStorage.setUser(userData);
          return;
        }
      }
      
      // If API call fails, check if we have a saved user and it's still valid
      const savedUser = authStorage.getUser();
      if (savedUser && (preserveExistingUser || user)) {
        console.log('API auth check failed, but keeping existing user session');
        if (!user) setUser(savedUser);
        return;
      }
      
      // Only clear user if we don't have an existing session to preserve
      if (!preserveExistingUser && !user) {
        setUser(null);
        authStorage.clearUser();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      
      // Fallback to saved user if API is unreachable
      const savedUser = authStorage.getUser();
      if (savedUser && (preserveExistingUser || user)) {
        console.log('API unreachable, keeping existing user session');
        if (!user) setUser(savedUser);
      } else if (!preserveExistingUser && !user) {
        setUser(null);
        authStorage.clearUser();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (phone: string, password: string) => {
    try {
      const response = await api.login({ phone, password });
      
      if (response.data && typeof response.data === 'object' && 'success' in response.data && response.data.success) {
        // Start session on successful login
        sessionManager.startSession();
        return { 
          success: true, 
          message: 'message' in response.data ? String(response.data.message) : 'Login successful' 
        };
      }
      return { 
        success: false, 
        message: 'error' in response ? String(response.error) : 'Login failed' 
      };
    } catch (error) {
      return { success: false, message: 'Network error' };
    }
  };

  const register = async (fullname: string, phone: string, password: string) => {
    try {
      const response = await api.register({ fullname, phone, password });
      
      if (response.data && typeof response.data === 'object' && 'message' in response.data) {
        if (response.data.message === 'Registration successful') {
          return { 
            success: true, 
            message: String(response.data.message) 
          };
        }
      }
      return { 
        success: false, 
        message: 'error' in response ? String(response.error) : 'Registration failed' 
      };
    } catch (error) {
      return { success: false, message: 'Network error' };
    }
  };

  const verifyOtp = async (phone: string, otp: string) => {
    try {
      const response = await api.verifyOtp({ phone, otp });
      
      if (response.data && typeof response.data === 'object' && 'success' in response.data && response.data.success) {
        // After successful OTP verification, get user data
        await checkAuth();
        return { 
          success: true, 
          message: 'message' in response.data ? String(response.data.message) : 'Verification successful' 
        };
      }
      return { 
        success: false, 
        message: 'error' in response ? String(response.error) : 'OTP verification failed' 
      };
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
      // End session
      sessionManager.endSession();
      setUser(null);
      authStorage.clearUser();
      // Clear all cookies and storage
      clearAllStorageAndCookies();
    }
  };

  // Allow trusted flows (e.g., verified admin bypass or OTP) to set the user
  const setAuthenticatedUser = (nextUser: User) => {
    setUser(nextUser);
    authStorage.setUser(nextUser);
    // Start session for authenticated user
    sessionManager.startSession();
  };

  useEffect(() => {
    // Check if user is already logged in
    const savedUser = authStorage.getUser();
    if (savedUser) {
      setUser(savedUser);
      // Start session for restored user
      sessionManager.startSession();
      // Optionally verify the session is still valid (but don't clear user if it fails)
      checkAuth(true).catch(() => {
        // If auth check fails, keep the saved user but log the issue
        console.log('Auth verification failed, but keeping saved user session');
      }).finally(() => {
        setIsLoading(false);
      });
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
    setAuthenticatedUser,
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
