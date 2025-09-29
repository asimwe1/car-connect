// API service layer for backend integration
// @ts-ignore - Vite provides import.meta.env
const RAW_API_BASE = import.meta.env.VITE_API_URL || 'https://carhubconnect.onrender.com/api';

// Normalize to HTTPS to avoid "mixed content" in production
const API_BASE_URL = (() => {
  try {
    const url = new URL(RAW_API_BASE);
    // In production, always use HTTPS
    if (import.meta.env.PROD && url.protocol === 'http:') {
      url.protocol = 'https:';
    }
    // Ensure trailing no slash beyond /api
    return url.toString().replace(/\/$/, '');
  } catch {
    // Fallback safe default
    return 'https://carhubconnect.onrender.com/api';
  }
})();

class ApiService {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {},
    retries = 3
  ): Promise<{ data?: T; error?: string }> {
    const url = `${this.baseURL}${endpoint}`;
    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Add auth token if available
    const token = this.getToken();
    if (token) {
      defaultHeaders.Authorization = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      credentials: 'include' // For cookie-based auth
    };

    for (let attempt = 0; attempt <= retries; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        console.warn(`Request to ${url} timed out after 60 seconds (attempt ${attempt + 1}/${retries + 1})`);
      }, 60000); // Increased to 60 seconds

      try {
        const response = await fetch(url, {
          ...config,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        let data: any;
        try {
          data = await response.json();
        } catch {
          // Handle non-JSON responses
          data = { message: response.statusText };
        }

        if (!response.ok) {
          const errorMessage = data.message || `HTTP ${response.status}: ${response.statusText}`;
          // Don't retry on client errors (4xx)
          if (response.status >= 400 && response.status < 500) {
            console.error(`Client error for ${url}: ${errorMessage}`);
            return { error: errorMessage };
          }

          // Retry on server errors (5xx) and network issues
          if (attempt < retries) {
            console.warn(`Request to ${url} failed (attempt ${attempt + 1}/${retries + 1}): ${errorMessage}`);
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
            continue;
          }

          console.error(`Max retries reached for ${url}: ${errorMessage}`);
          return { error: errorMessage };
        }

        return { data };
      } catch (error) {
        clearTimeout(timeoutId);

        if (error instanceof Error && error.name === 'AbortError') {
          if (attempt < retries) {
            console.warn(`Request to ${url} aborted (attempt ${attempt + 1}/${retries + 1}): ${error.message}`);
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
            continue;
          }
          return { error: 'Request timed out after multiple attempts' };
        }

        const errorMessage = error instanceof Error ? error.message : 'Network error';
        console.error(`Request to ${url} failed: ${errorMessage}`);
        return { error: errorMessage };
      }
    }

    return { error: 'Maximum retry attempts exceeded' };
  }

  private getToken(): string | null {
    // Get token from cookies (handled by browser)
    return null;
  }

  // Authentication methods
  async register(userData: { fullname: string; phone: string; password: string }) {
    return this.request<{
      message: string;
      success: boolean;
      otpSent: boolean
    }>('/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: { phone: string; password: string }) {
    return this.request<{
      message: string;
      success: boolean;
      user: User
    }>('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
  }

  async verifyOtp(data: { phone: string; otpCode: string }) {
    return this.request<{
      message: string;
      success: boolean;
      otpVerified: boolean
    }>('/auth/verify-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  async getMe() {
    return this.request<{ success: boolean; user?: User }>('/auth/me', {
      headers: {
        'Content-Type': 'application/json',
      },
    }, 1);
  }

  // Car methods
  async getCars(params?: {
    page?: number;
    limit?: number;
    q?: string;
    status?: string;
    sellEnabled?: boolean;
    rentEnabled?: boolean;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.q) searchParams.append('q', params.q);
    if (params?.status) searchParams.append('status', params.status);
    if (typeof params?.sellEnabled === 'boolean') searchParams.append('sellEnabled', String(params.sellEnabled));
    if (typeof params?.rentEnabled === 'boolean') searchParams.append('rentEnabled', String(params.rentEnabled));

    const queryString = searchParams.toString();
    return this.request(`/cars${queryString ? `?${queryString}` : ''}`);
  }

  async getCarById(id: string) {
    return this.request(`/cars/${id}`);
  }

  async createCar(carData: any) {
    return this.request('/cars', {
      method: 'POST',
      body: JSON.stringify(carData),
    });
  }

  async updateCar(id: string, carData: any) {
    return this.request(`/cars/${id}`, {
      method: 'PUT',
      body: JSON.stringify(carData),
    });
  }

  async deleteCar(id: string) {
    return this.request(`/cars/${id}`, {
      method: 'DELETE',
    });
  }

  async getMyCars() {
    return this.request('/cars/me/mine');
  }

  // Booking methods
  async createBooking(bookingData: { carId: string; notes?: string }) {
    return this.request('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  async getMyBookings() {
    return this.request('/bookings/me');
  }

  async confirmBooking(id: string) {
    return this.request(`/bookings/${id}/confirm`, {
      method: 'POST',
    });
  }

  async cancelBooking(id: string) {
    return this.request(`/bookings/${id}/cancel`, {
      method: 'POST',
    });
  }

  // Order methods
  async createOrder(orderData: { carId: string; amount: number; notes?: string }) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async getMyOrders() {
    return this.request('/orders/me');
  }

  async createCheckoutSession(data: {
    orderId: string;
    successUrl: string;
    cancelUrl: string;
  }) {
    return this.request('/orders/checkout', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async payOrder(id: string, paymentRef?: string) {
    return this.request(`/orders/${id}/pay`, {
      method: 'POST',
      body: JSON.stringify({ paymentRef }),
    });
  }

  // Admin analytics/mgmt
  async getAdminOrders(params?: { page?: number; limit?: number; q?: string; status?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', String(params.page));
    if (params?.limit) searchParams.append('limit', String(params.limit));
    if (params?.q) searchParams.append('q', params.q);
    if (params?.status) searchParams.append('status', params.status);
    const qs = searchParams.toString();
    return this.request(`/admin/orders${qs ? `?${qs}` : ''}`);
  }

  async getAdminBookings(params?: { page?: number; limit?: number; q?: string; status?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', String(params.page));
    if (params?.limit) searchParams.append('limit', String(params.limit));
    if (params?.q) searchParams.append('q', params.q);
    if (params?.status) searchParams.append('status', params.status);
    const qs = searchParams.toString();
    return this.request(`/admin/bookings${qs ? `?${qs}` : ''}`);
  }

  // User methods (admin only)
  async getUsers(params?: { page?: number; limit?: number; q?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.q) searchParams.append('q', params.q);

    const queryString = searchParams.toString();
    return this.request(`/users${queryString ? `?${queryString}` : ''}`);
  }

  async updateUserRole(id: string, role: 'user' | 'admin') {
    return this.request(`/users/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  }

  // Messaging methods
  async getConversations() {
    return this.request('/messages/conversations');
  }

  async getMessages(carId: string, recipientId: string) {
    return this.request(`/messages/${carId}/${recipientId}`);
  }

  async sendMessage(data: { recipientId: string; carId: string; content: string }) {
    return this.request('/messages', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async markMessagesAsRead(messageIds: string[]) {
    return this.request('/messages/mark-read', {
      method: 'POST',
      body: JSON.stringify({ messageIds }),
    });
  }

  // Admin messaging methods
  async getAdminConversations() {
    return this.request('/messages/admin/conversations');
  }
}

// Create singleton instance
export const api = new ApiService(API_BASE_URL);

// Auth context helper
export interface User {
  id: string;
  fullname: string;
  phone: string;
  role: 'user' | 'admin';
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// Auth storage helpers with expiration
export const authStorage = {
  setUser: (user: User) => {
    const userData = {
      user,
      timestamp: Date.now(),
      expires: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
    };
    localStorage.setItem('user', JSON.stringify(userData));
  },
  getUser: (): User | null => {
    try {
      const stored = localStorage.getItem('user');
      if (!stored) return null;

      const userData = JSON.parse(stored);

      // Check if it's the old format (just user object)
      if (userData.fullname && !userData.user) {
        // Old format, migrate it
        const migratedData = {
          user: userData,
          timestamp: Date.now(),
          expires: Date.now() + (7 * 24 * 60 * 60 * 1000)
        };
        localStorage.setItem('user', JSON.stringify(migratedData));
        return userData;
      }

      // Check if expired
      if (userData.expires && Date.now() > userData.expires) {
        console.log('Stored user session expired, clearing...');
        localStorage.removeItem('user');
        return null;
      }

      return userData.user || null;
    } catch (error) {
      console.error('Error parsing stored user:', error);
      localStorage.removeItem('user');
      return null;
    }
  },
  clearUser: () => {
    localStorage.removeItem('user');
  },
  refreshExpiration: () => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        const userData = JSON.parse(stored);
        if (userData.user) {
          userData.expires = Date.now() + (7 * 24 * 60 * 60 * 1000);
          localStorage.setItem('user', JSON.stringify(userData));
        }
      } catch (error) {
        console.error('Error refreshing user expiration:', error);
      }
    }
  }
};

// Global access for debugging and cross-module access
if (typeof window !== 'undefined') {
  (window as any).authStorage = authStorage;
  console.log('💡 Tip: Auth storage available globally for session management');
}