import apiClient from './apiClient';

export interface CreateVehiclePayload {
  registration_number: string;
  name_model: string;
  type: string;
  max_load_capacity: number;
  odometer: number;
  acquisition_cost: number;
  status?: string; // e.g. "Available"
}

export interface UpdateVehiclePayload {
  registration_number?: string | null;
  name_model?: string | null;
  type?: string | null;
  max_load_capacity?: number | null;
  odometer?: number | null;
  acquisition_cost?: number | null;
  status?: string | null;
  is_active?: boolean | null;
}

export const vehiclesApi = {
  // Get all vehicles
  async getVehicles(skip?: number, limit?: number) {
    const response = await apiClient.get('/api/v1/vehicles/', {
      params: { skip, limit },
    });
    return response.data;
  },

  // Get vehicle by ID
  async getVehicleById(id: string) {
    const response = await apiClient.get(`/api/v1/vehicles/${id}`);
    return response.data;
  },

  // Create a new vehicle
  async createVehicle(payload: CreateVehiclePayload) {
    const response = await apiClient.post('/api/v1/vehicles/', payload);
    return response.data;
  },

  // Update a vehicle
  async updateVehicle(id: string, payload: UpdateVehiclePayload) {
    const response = await apiClient.put(`/api/v1/vehicles/${id}`, payload);
    return response.data;
  },

  // Delete a vehicle
  async deleteVehicle(id: string) {
    const response = await apiClient.delete(`/api/v1/vehicles/${id}`);
    return response.data;
  },
};
