// Brand Service for managing car brands
import { api } from './api';

export interface Brand {
  id: string;
  name: string;
  logo: string;
  count: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBrandData {
  name: string;
  logo: string;
  count: string;
}

export interface UpdateBrandData {
  name?: string;
  logo?: string;
  count?: string;
  isActive?: boolean;
}

class BrandService {
  // Get all brands
  async getBrands(): Promise<{ data?: Brand[]; error?: string }> {
    return api.request('/brands');
  }

  // Get active brands (for public display)
  async getActiveBrands(): Promise<{ data?: Brand[]; error?: string }> {
    return api.request('/brands/active');
  }

  // Create a new brand
  async createBrand(brandData: CreateBrandData): Promise<{ data?: Brand; error?: string }> {
    return api.request('/brands', {
      method: 'POST',
      body: JSON.stringify(brandData),
    });
  }

  // Update a brand
  async updateBrand(id: string, brandData: UpdateBrandData): Promise<{ data?: Brand; error?: string }> {
    return api.request(`/brands/${id}`, {
      method: 'PUT',
      body: JSON.stringify(brandData),
    });
  }

  // Delete a brand
  async deleteBrand(id: string): Promise<{ data?: { success: boolean }; error?: string }> {
    return api.request(`/brands/${id}`, {
      method: 'DELETE',
    });
  }

  // Toggle brand active status
  async toggleBrandStatus(id: string): Promise<{ data?: Brand; error?: string }> {
    return api.request(`/brands/${id}/toggle`, {
      method: 'PATCH',
    });
  }
}

export const brandService = new BrandService();
export default brandService;
