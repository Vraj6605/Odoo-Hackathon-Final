import apiClient from './apiClient';

export interface CreateTripPayload {
  source: string;
  destination: string;
  cargo_weight: number;
  planned_distance: number;
  status?: string; // e.g. "Draft"
  actual_fuel_consumed?: number | null;
  final_odometer?: number | null;
  vehicle_id: string;
  driver_id: string;
}

export interface UpdateTripPayload {
  source?: string | null;
  destination?: string | null;
  cargo_weight?: number | null;
  planned_distance?: number | null;
  status?: string | null;
  actual_fuel_consumed?: number | null;
  final_odometer?: number | null;
  vehicle_id?: string | null;
  driver_id?: string | null;
  is_active?: boolean | null;
}

export const tripsApi = {
  // Get all trips
  async getTrips(skip?: number, limit?: number) {
    const response = await apiClient.get('/api/v1/trips/', {
      params: { skip, limit },
    });
    return response.data;
  },

  // Get trip by ID
  async getTripById(id: string) {
    const response = await apiClient.get(`/api/v1/trips/${id}`);
    return response.data;
  },

  // Create a new trip
  async createTrip(payload: CreateTripPayload) {
    const response = await apiClient.post('/api/v1/trips/', payload);
    return response.data;
  },

  // Update a trip
  async updateTrip(id: string, payload: UpdateTripPayload) {
    const response = await apiClient.put(`/api/v1/trips/${id}`, payload);
    return response.data;
  },

  // Enforce state updates on a trip status
  async updateTripStatus(id: string, status: string) {
    try {
      // Matches: PATCH /api/trips/:id/status (Payload: lifecycle_status)
      const response = await apiClient.patch(`/api/v1/trips/${id}/status`, { 
        lifecycle_status: status 
      });
      return response.data;
    } catch (error) {
      console.warn('PATCH status endpoint failed, falling back to PUT /api/v1/trips/:id', error);
      const response = await apiClient.put(`/api/v1/trips/${id}`, { status });
      return response.data;
    }
  },

  // Delete a trip
  async deleteTrip(id: string) {
    const response = await apiClient.delete(`/api/v1/trips/${id}`);
    return response.data;
  },
};
