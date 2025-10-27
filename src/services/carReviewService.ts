// Car Review Service for managing car listings under review
import { api } from './api';

export interface CarReview {
  id: string;
  _id?: string; // MongoDB ID field
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuelType: string;
  transmission: string;
  bodyType?: string;
  color: string;
  location: string;
  description?: string;
  images: string[];
  primaryImage?: string;
  video?: string;
  status: 'pending' | 'approved' | 'rejected' | 'listed' | 'available';
  owner: string | {
    _id: string;
    fullname: string;
    email: string;
    phone: string;
  };
  // Legacy fields for compatibility
  sellerId: string;
  sellerName: string;
  sellerPhone: string;
  createdAt: Date;
  updatedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  reviewNotes?: string;
  // Additional fields for rental cars
  type?: 'rental' | 'sale';
  dailyRate?: number;
  availability?: string;
  minimumRentalDays?: number;
  maximumRentalDays?: number;
}

export interface CarReviewFilters {
  status?: 'pending' | 'approved' | 'rejected';
  make?: string;
  sellerId?: string;
  page?: number;
  limit?: number;
}

export interface ReviewAction {
  action: 'approve' | 'reject';
  notes?: string;
}

class CarReviewService {
  // Get all cars under review
  async getCarsUnderReview(filters?: CarReviewFilters): Promise<{ data?: CarReview[]; error?: string }> {
    const searchParams = new URLSearchParams();
    if (filters?.status) searchParams.append('status', filters.status);
    if (filters?.make) searchParams.append('make', filters.make);
    if (filters?.sellerId) searchParams.append('sellerId', filters.sellerId);
    if (filters?.page) searchParams.append('page', filters.page.toString());
    if (filters?.limit) searchParams.append('limit', filters.limit.toString());

    return api.request(`/cars/review${searchParams.toString() ? `?${searchParams.toString()}` : ''}`);
  }

  // Get a specific car review
  async getCarReview(id: string): Promise<{ data?: CarReview; error?: string }> {
    return api.request(`/cars/review/${id}`);
  }

  // Approve a car listing
  async approveCar(id: string, notes?: string): Promise<{ data?: CarReview; error?: string }> {
    return api.request(`/cars/review/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });
  }

  // Reject a car listing
  async rejectCar(id: string, notes?: string): Promise<{ data?: CarReview; error?: string }> {
    return api.request(`/cars/review/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });
  }

  // Get review statistics
  async getReviewStats(): Promise<{ data?: { pending: number; approved: number; rejected: number }; error?: string }> {
    return api.request('/cars/review/stats');
  }

  // Get cars by seller
  async getCarsBySeller(sellerId: string): Promise<{ data?: CarReview[]; error?: string }> {
    return api.request(`/cars/review/seller/${sellerId}`);
  }
}

export const carReviewService = new CarReviewService();
export default carReviewService;
