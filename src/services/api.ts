// API service layer for backend integration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

class ApiService {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
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
      credentials: 'include', // For cookie-based auth
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        return {
          error: data.message || `HTTP ${response.status}`,
        };
      }

      return { data };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  private getToken(): string | null {
    // Get token from cookies (handled by browser)
    return null;
  }

  // Authentication methods
  async register(userData: { fullname: string; email: string; password: string }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: { email: string; password: string }) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async verifyOtp(data: { email: string; otp: string }) {
    return this.request('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  async getMe() {
    return this.request('/auth/me');
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
}

// Create singleton instance
export const api = new ApiService(API_BASE_URL);

// Auth context helper
export interface User {
  _id: string;
  fullname: string;
  email: string;
  role: 'user' | 'admin';
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// Auth storage helpers
export const authStorage = {
  setUser: (user: User) => {
    localStorage.setItem('user', JSON.stringify(user));
  },
  getUser: (): User | null => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  clearUser: () => {
    localStorage.removeItem('user');
  },
};
