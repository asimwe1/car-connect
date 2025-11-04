export interface User {
  _id: string;
  id: string;
  fullname: string;
  phone: string | null;
  email: string | null;
  role: 'admin' | 'user';
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const IS_DEVELOPMENT = import.meta.env.DEV;
const RAW_API_BASE = import.meta.env.VITE_API_URL || 'https://carhubconnect.onrender.com/api';

// API Base URL - always use HTTPS for production backend
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
    localStorage.setItem('token', token);
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

  async forgotPassword(data: { phone?: string; email?: string; recaptchaToken?: string }) {
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

  // Admin methods
  async getUsers() {
    return this.request('/admin/users');
  }

  async getOrders() {
    return this.request('/admin/orders');
  }

  async getActivityLogs() {
    return this.request('/admin/activity');
  }

  // Messages methods
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

  // Upload methods
  async uploadImage(file: File): Promise<{ data?: { url: string }; error?: string }> {
    const formData = new FormData();
    formData.append('image', file);

    return this.request('/upload/image', {
      method: 'POST',
      body: formData,
      headers: {}, // Don't set Content-Type for FormData
    });
  }

  async uploadVideo(file: File): Promise<{ data?: { url: string }; error?: string }> {
    const formData = new FormData();
    formData.append('video', file);

    return this.request('/upload/video', {
      method: 'POST',
      body: formData,
      headers: {}, // Don't set Content-Type for FormData
    });
  }

  // Vehicle methods
  async getVehicles() {
    return this.request('/vehicles');
  }

  // Brands methods
  async getBrands() {
    return this.request('/brands');
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

  // Booking methods
  async getMyBookings() {
    // Get user role to determine correct endpoint
    const user = authStorage.getUser();
    const isAdmin = user?.role === 'admin';
    
    if (isAdmin) {
      // Admin can see all bookings
      return this.request('/bookings');
    } else {
      // Regular users see only their own bookings
      return this.request('/bookings/me');
    }
  }

  async getAllBookings() {
    // Admin-only method to get all bookings
    return this.request('/bookings');
  }

  async getAdminBookings(params?: { page?: number; limit?: number; status?: string }) {
    // Admin-only method with pagination
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.status) searchParams.append('status', params.status);

    return this.request(`/bookings${searchParams.toString() ? `?${searchParams.toString()}` : ''}`);
  }

  async createBooking(data: { carId: string; startDate: string; endDate: string; notes?: string }) {
    return this.request('/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getBookingById(bookingId: string) {
    return this.request(`/bookings/${bookingId}`);
  }

  async confirmBooking(bookingId: string) {
    return this.request(`/bookings/${bookingId}/confirm`, {
      method: 'POST',
    });
  }

  async updateBooking(bookingId: string, data: { status?: string; notes?: string }) {
    return this.request(`/bookings/${bookingId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async cancelBooking(bookingId: string) {
    return this.request(`/bookings/${bookingId}/cancel`, {
      method: 'POST',
    });
  }

  // Wishlist methods
  async getWishlist() {
    return this.request('/wishlist');
  }

  async addToWishlist(carId: string) {
    return this.request('/wishlist/add', {
      method: 'POST',
      body: JSON.stringify({ carId }),
    });
  }

  async removeFromWishlist(carId: string) {
    return this.request('/wishlist/remove', {
      method: 'POST',
      body: JSON.stringify({ carId }),
    });
  }

  async clearWishlist() {
    return this.request('/wishlist/clear', {
      method: 'DELETE',
    });
  }

  async deleteWishlist() {
    return this.request('/wishlist', {
      method: 'DELETE',
    });
  }

  // Test drive booking methods
  async createTestDriveBooking(data: { 
    carId: string; 
    date: string; 
    time: string; 
    fullName: string; 
    phone: string; 
    email?: string; 
    notes?: string 
  }) {
    return this.request('/test-drives', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMyTestDrives() {
    return this.request('/test-drives');
  }
}

// Authentication storage utilities
export const authStorage = {
  setUser: (user: User) => localStorage.setItem('user', JSON.stringify(user)),
  getUser: (): User | null => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  },
  clearUser: () => localStorage.removeItem('user'),
};

export const api = new ApiService(API_BASE_URL);