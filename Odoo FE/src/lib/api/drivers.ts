import apiClient from './apiClient';

export interface CreateDriverPayload {
  name: string;
  license_number: string;
  license_category: string;
  license_expiry: string; // e.g. "2026-07-12"
  contact_number: string;
  safety_score?: number;
  status?: string; // e.g. "Available"
}

export interface UpdateDriverPayload {
  name?: string | null;
  license_number?: string | null;
  license_category?: string | null;
  license_expiry?: string | null;
  contact_number?: string | null;
  safety_score?: number | null;
  status?: string | null;
  is_active?: boolean | null;
}

export const driversApi = {
  // Get all drivers
  async getDrivers(skip?: number, limit?: number) {
    const response = await apiClient.get('/api/v1/drivers/', {
      params: { skip, limit },
    });
    return response.data;
  },

  // Get driver by ID
  async getDriverById(id: string) {
    const response = await apiClient.get(`/api/v1/drivers/${id}`);
    return response.data;
  },

  // Create a new driver
  async createDriver(payload: CreateDriverPayload) {
    const response = await apiClient.post('/api/v1/drivers/', payload);
    return response.data;
  },

  // Update a driver
  async updateDriver(id: string, payload: UpdateDriverPayload) {
    const response = await apiClient.put(`/api/v1/drivers/${id}`, payload);
    return response.data;
  },

  // Delete a driver
  async deleteDriver(id: string) {
    const response = await apiClient.delete(`/api/v1/drivers/${id}`);
    return response.data;
  },
};
