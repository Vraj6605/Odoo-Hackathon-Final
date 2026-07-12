import apiClient from './apiClient';

export interface AnalyticsFilter {
  vehicle_type?: string;
  status?: string;
  region?: string;
}

export const analyticsApi = {
  // GET /api/dashboard/kpis with query parameters
  async getKPIs(filters?: AnalyticsFilter) {
    const params = new URLSearchParams();
    if (filters?.vehicle_type && filters.vehicle_type !== 'All') {
      params.append('vehicle_type', filters.vehicle_type);
    }
    if (filters?.status && filters.status !== 'All') {
      params.append('status', filters.status);
    }
    if (filters?.region && filters.region !== 'All') {
      params.append('region', filters.region);
    }

    const response = await apiClient.get('/api/dashboard/kpis', { params });
    return response.data;
  },

  // GET /api/reports/analytics with query parameters
  async getReports(filters?: AnalyticsFilter) {
    const params = new URLSearchParams();
    if (filters?.vehicle_type && filters.vehicle_type !== 'All') {
      params.append('vehicle_type', filters.vehicle_type);
    }
    if (filters?.status && filters.status !== 'All') {
      params.append('status', filters.status);
    }
    if (filters?.region && filters.region !== 'All') {
      params.append('region', filters.region);
    }

    const response = await apiClient.get('/api/reports/analytics', { params });
    return response.data;
  },
};
