// api.ts
// API service layer for backend integration

// @ts-ignore - Vite provides import.meta.env
const RAW_API_BASE = import.meta.env.VITE_API_URL || 'https://carhubconnect.onrender.com/api';
const IS_DEVELOPMENT = import.meta.env.DEV;

// Use proxy in development, external URL in production
// Remove fallback URL entirely since backend only supports HTTPS
const API_BASE_URL = (() => {
  if (IS_DEVELOPMENT) {
    // In development, use direct HTTPS URL to avoid proxy CORS issues
    return 'https://carhubconnect.onrender.com/api';
  }
  
  try {
    const url = new URL(RAW_API_BASE);
    // In production, ensure HTTPS
    if (url.protocol === 'http:') {
      url.protocol = 'https:';
    }
    return url.toString().replace(/\/$/, '');
  } catch {
    return 'https://carhubconnect.onrender.com/api';
  }
})();

class ApiService {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    console.log('API Service initialized with base URL:', this.baseURL);
    console.log('API Service version: 3.0 - HTTPS only for production backend');
  }

  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {},
    retries = 3
  ): Promise<{ data?: T; error?: string }> {
    const url = `${this.baseURL}${endpoint}`;
    console.log('API Request:', { method: options.method || 'GET', url, endpoint });
    
    const token = this.getToken();
    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      credentials: 'include',
    };

    for (let attempt = 0; attempt <= retries; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      try {
        const response = await fetch(url, { ...config, signal: controller.signal });
        clearTimeout(timeoutId);

        const data = await response.json().catch(() => ({ message: response.statusText }));

        if (!response.ok) {
          const errorMessage = data.message || `HTTP ${response.status}: ${response.statusText}`;
          if (response.status >= 400 && response.status < 500) {
            console.error(`Client error for ${url}: ${errorMessage}`);
            return { error: errorMessage };
          }
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
        
        if (attempt < retries) {
          console.warn(`Retrying request (attempt ${attempt + 2}/${retries + 1})...`);
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
          continue;
        }
        
        return { error: errorMessage };
      }
    }

    return { error: 'Request failed after all retries' };
  }

  private setToken(token: string) {
  }
    
    const token = this.getToken();
    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      credentials: 'include',
    };

    for (let attempt = 0; attempt <= retries; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);
      const url = attempt === 0 ? primaryURL : `${this.fallbackURL}${endpoint}`;

      try {
        const response = await fetch(url, { ...config, signal: controller.signal });
        clearTimeout(timeoutId);

        const data = await response.json().catch(() => ({ message: response.statusText }));

        if (!response.ok) {
          const errorMessage = data.message || `HTTP ${response.status}: ${response.statusText}`;
          if (response.status >= 400 && response.status < 500) {
            console.error(`Client error for ${url}: ${errorMessage}`);
            return { error: errorMessage };
          }
          if (attempt < retries) {
            console.warn(`Request to ${url} failed (attempt ${attempt + 1}/${retries + 1}): ${errorMessage}`);
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
            continue;
          }
          console.error(`Max retries reached for ${url}: ${errorMessage}`);
          return { error: errorMessage };
        }

        // If fallback URL worked, remember it for subsequent requests
        if (url === `${this.fallbackURL}${endpoint}` && !this.useFallback) {
          console.log('Switching to fallback URL for future requests');
          this.useFallback = true;
        }

        return { data };
      } catch (error) {
        clearTimeout(timeoutId);
        
        // Check if this is an SSL error and we haven't tried the fallback yet
        if (error instanceof Error && 
            (error.message.includes('SSL') || error.message.includes('ERR_SSL_PROTOCOL_ERROR')) &&
            !this.useFallback && IS_DEVELOPMENT) {
          console.warn('SSL error detected, switching to HTTP fallback for development');
          this.useFallback = true;
          // Retry with fallback URL
          const fallbackResponse = await this.request(endpoint, options, retries - attempt - 1);
          return fallbackResponse;
        }
        
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
        
        // If this is the primary URL and we haven't tried fallback, try it
        if (url === primaryURL && !this.useFallback && IS_DEVELOPMENT && attempt < retries) {
          console.warn('Trying fallback URL due to network error');
          continue; // This will use fallback URL in next iteration
        }
        
        if (attempt === retries) {
          return { error: errorMessage };
        }
      }
    }
    return { error: 'Maximum retry attempts exceeded' };
  }

  private getToken(): string | null {
    return localStorage.getItem('token') || null;
  }

  // Authentication methods
  async register(userData: { fullname: string; phone?: string; email?: string; password: string }) {
    return this.request<{ message: string; success: boolean; otpSent: boolean }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: { phone?: string; email?: string; password: string }) {
    return this.request<{ message: string; success: boolean; user: User; token?: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async verifyOtp(data: { phone?: string; email?: string; otpCode: string }) {
    return this.request<{ message: string; success: boolean; otpVerified?: boolean }>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

async verifyResetOTP(data: { otp: string }) {
  return this.request('/auth/verify-reset-otp', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

async forgotPassword(data: { phone?: string; recaptchaToken?: string }) {
  return this.request('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

async resetPassword(token: string, password: string) {
  return this.request('/auth/reset-password', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ password }),
  });
}

  async resetPasswordWithOtp(data: { phone?: string; email?: string; otpCode: string; newPassword: string }) {
    return this.request<{ message: string; success: boolean }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async logout() {
    return this.request('/auth/logout', { method: 'POST' });
  }

  async getMe() {
    return this.request<{ success: boolean; user?: User }>('/auth/me', {}, 1);
  }

  // Car methods
  async getCars(params?: { page?: number; limit?: number; q?: string; status?: string; sellEnabled?: boolean; rentEnabled?: boolean }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.q) searchParams.append('q', params.q);
    if (params?.status) searchParams.append('status', params.status);
    if (typeof params?.sellEnabled === 'boolean') searchParams.append('sellEnabled', String(params.sellEnabled));
    if (typeof params?.rentEnabled === 'boolean') searchParams.append('rentEnabled', String(params.rentEnabled));

    return this.request(`/cars${searchParams.toString() ? `?${searchParams.toString()}` : ''}`);
  }

  async getCarById(id: string) {
    return this.request(`/cars/car/${id}`);
  }

  async createCar(carData: any) {
    // Using the correct endpoint for listing a car
    try {
      const compressedData = {
        ...carData,
        // Convert any undefined values to null to avoid JSON issues
        description: carData.description || null,
        location: carData.location || null,
        seats: carData.seats || null,
        color: carData.color || null,
        primaryImage: carData.primaryImage || null,
        video: carData.video || null
      };

      return this.request('/cars/list', { 
        method: 'POST',
        body: JSON.stringify(compressedData),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': window.location.origin
        }
      });
    } catch (error) {
      console.error('Car creation error:', error);
      throw error;
    }
  }

  async updateCar(id: string, carData: any) {
    return this.request(`/cars/${id}`, { method: 'PUT', body: JSON.stringify(carData) });
  }

  async deleteCar(id: string) {
    return this.request(`/cars/${id}`, { method: 'DELETE' });
  }

  async getMyCars() {
    return this.request('/cars/me/mine');
  }

  // Booking methods
  async createBooking(bookingData: { carId: string; notes?: string }) {
    return this.request('/bookings', { method: 'POST', body: JSON.stringify(bookingData) });
  }

  async getMyBookings() {
    return this.request('/bookings/me');
  }

  async confirmBooking(id: string) {
    return this.request(`/bookings/${id}/confirm`, { method: 'POST' });
  }

  async cancelBooking(id: string) {
    return this.request(`/bookings/${id}/cancel`, { method: 'POST' });
  }

  // Order methods
  async createOrder(orderData: { carId: string; amount: number; notes?: string }) {
    return this.request('/orders', { method: 'POST', body: JSON.stringify(orderData) });
  }

  async getMyOrders() {
    return this.request('/orders/me');
  }

  async createCheckoutSession(data: { orderId: string; successUrl: string; cancelUrl: string }) {
    return this.request('/orders/checkout', { method: 'POST', body: JSON.stringify(data) });
  }

  async payOrder(id: string, paymentRef?: string) {
    return this.request(`/orders/${id}/pay`, { method: 'POST', body: JSON.stringify({ paymentRef }) });
  }

  // Admin analytics/mgmt
  async getAdminOrders(params?: { page?: number; limit?: number; q?: string; status?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', String(params.page));
    if (params?.limit) searchParams.append('limit', String(params.limit));
    if (params?.q) searchParams.append('q', params.q);
    if (params?.status) searchParams.append('status', params.status);
    return this.request(`/orders${searchParams.toString() ? `?${searchParams.toString()}` : ''}`);
  }

  async getAdminBookings(params?: { page?: number; limit?: number; q?: string; status?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', String(params.page));
    if (params?.limit) searchParams.append('limit', String(params.limit));
    if (params?.q) searchParams.append('q', params.q);
    if (params?.status) searchParams.append('status', params.status);
    return this.request(`/bookings${searchParams.toString() ? `?${searchParams.toString()}` : ''}`);
  }

  // User methods (admin only)
  async getUsers(params?: { page?: number; limit?: number; q?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.q) searchParams.append('q', params.q);

    return this.request(`/users${searchParams.toString() ? `?${searchParams.toString()}` : ''}`);
  }

  async updateUserRole(id: string, role: 'user' | 'admin') {
    return this.request(`/users/${id}/role`, { method: 'PUT', body: JSON.stringify({ role }) });
  }

  // Messaging methods
  async getConversations() {
    return this.request('/messages/conversations');
  }

  async getMessages(carId: string, recipientId: string) {
    return this.request(`/messages/${carId}/${recipientId}`);
  }

  async sendMessage(data: { recipientId: string; carId: string; content: string }) {
    return this.request('/messages', { method: 'POST', body: JSON.stringify(data) });
  }

  async markMessagesAsRead(messageIds: string[]) {
    return this.request('/messages/mark-read', { method: 'POST', body: JSON.stringify({ messageIds }) });
  }

  // Wishlist methods
  async addToWishlist(carId: string) {
    if (!carId) return { error: 'Car ID is required' };
    return this.request('/wishlist/add', { method: 'POST', body: JSON.stringify({ carId }) });
  }

  async removeFromWishlist(carId: string) {
    if (!carId) return { error: 'Car ID is required' };
    return this.request('/wishlist/remove', { method: 'POST', body: JSON.stringify({ carId }) });
  }

  async getWishlist() {
    const result = await this.request('/wishlist', { method: 'GET' });
    if (result.error) return result;
    const cars = (result.data as any)?.data?.cars ?? [];
    return { data: cars } as { data: any; error?: string };
  }

  async deleteWishlist() {
    return this.request('/wishlist/delete', { method: 'DELETE' });
  }

  async clearWishlist() {
    return this.request('/wishlist/clear', { method: 'DELETE' });
  }

  // Admin messaging methods
  async getAdminConversations() {
    return this.request('/messages/conversations');
  }

  // Real-time metrics for admin dashboard
  async getAdminMetrics() {
    return this.request('/admin/metrics');
  }

  async getAdminStats() {
    return this.request('/admin/stats');
  }

  async getAdminCarViews() {
    return this.request('/admin/car-views');
  }

  async getAdminNewUsers() {
    return this.request('/admin/new-users');
  }

  // Brand methods
  async getBrands() {
    return this.request<{
      success: boolean;
      message: string;
      data: {
        brands: Array<{
          _id: string;
          name: string;
          logo: string;
          count: number;
        }>;
        count: number;
      };
    }>('/brands');
  }

  async getBrandById(brandId: string) {
    return this.request(`/brands/${brandId}`);
  }

  async getBrandByName(name: string) {
    return this.request(`/brand/${encodeURIComponent(name)}`);
  }

  async createBrand(data: { name: string; logo: string; count: string }) {
    return this.request('/brands', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBrand(brandId: string, data: Partial<{ name: string; logo: string; count: string }>) {
    return this.request(`/brands/${brandId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteBrand(brandId: string) {
    return this.request(`/brands/${brandId}`, {
      method: 'DELETE',
    });
  }

  async getAdminPendingBookings() {
    return this.request('/admin/pending-bookings');
  }

  async getActiveBrands() {
    return this.request('/brands/active');
  }

  async toggleBrandStatus(id: string) {
    return this.request(`/brands/${id}/toggle`, { method: 'PATCH' });
  }

  // Car review methods
  async getCarsUnderReview(params?: { status?: string; make?: string; sellerId?: string; page?: number; limit?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append('status', params.status);
    if (params?.make) searchParams.append('make', params.make);
    if (params?.sellerId) searchParams.append('sellerId', params.sellerId);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    return this.request(`/cars/review${searchParams.toString() ? `?${searchParams.toString()}` : ''}`);
  }

  async getCarReview(id: string) {
    return this.request(`/cars/review/${id}`);
  }

  async approveCar(id: string, notes?: string) {
    return this.request(`/cars/review/${id}/approve`, { 
      method: 'POST', 
      body: JSON.stringify({ notes }) 
    });
  }

  async rejectCar(id: string, notes?: string) {
    return this.request(`/cars/review/${id}/reject`, { 
      method: 'POST', 
      body: JSON.stringify({ notes }) 
    });
  }

  async getReviewStats() {
    return this.request('/cars/review/stats');
  }

  async getCarsBySeller(sellerId: string) {
    return this.request(`/cars/review/seller/${sellerId}`);
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

export interface WishlistItem {
  id: string;
  car_id: string;
  cars: {
    id: string;
    title: string;
    make: string;
    model: string;
    year: number;
    price: number;
    discount?: number;
    mileage: number;
    mileage_unit: string;
    fuel_type: string;
    transmission: string;
    seats: number;
    location: string;
    condition: string;
    images: string[];
    color: string;
    body_type: string;
  };
}

// Auth storage helpers with expiration
export const authStorage = {
  setUser: (user: User) => {
    const userData = { user, timestamp: Date.now(), expires: Date.now() + 7 * 24 * 60 * 60 * 1000 };
    localStorage.setItem('user', JSON.stringify(userData));
  },
  getUser: (): User | null => {
    const stored = localStorage.getItem('user');
    if (!stored) return null;
    const userData = JSON.parse(stored);
    if (userData.fullname && !userData.user) {
      const migratedData = { user: userData, timestamp: Date.now(), expires: Date.now() + 7 * 24 * 60 * 60 * 1000 };
      localStorage.setItem('user', JSON.stringify(migratedData));
      return userData;
    }
    if (userData.expires && Date.now() > userData.expires) {
      localStorage.removeItem('user');
      return null;
    }
    return userData.user || null;
  },
  clearUser: () => localStorage.removeItem('user'),
  refreshExpiration: () => {
    const stored = localStorage.getItem('user');
    if (stored) {
      const userData = JSON.parse(stored);
      if (userData.user) {
        userData.expires = Date.now() + 7 * 24 * 60 * 60 * 1000;
        localStorage.setItem('user', JSON.stringify(userData));
      }
    }
  },
};

// Global access for debugging
if (typeof window !== 'undefined') {
  (window as any).authStorage = authStorage;
  console.log('💡 Tip: Auth storage available globally for session management');
}