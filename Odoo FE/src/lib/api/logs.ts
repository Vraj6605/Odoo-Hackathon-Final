import apiClient from './apiClient';

export interface CreateMaintenancePayload {
  description: string;
  cost: number;
  entry_date: string; // e.g., "2026-07-12"
  completion_date?: string | null;
  status: string; // e.g., "Open" or "Closed"
  vehicle_id: string;
}

export interface CreateFuelLogPayload {
  liters: number;
  cost: number;
  log_date: string; // e.g., "2026-07-12"
  vehicle_id: string;
  trip_id?: string | null;
}

export interface CreateExpensePayload {
  category: string;
  amount: number;
  expense_date: string; // e.g., "2026-07-12"
  vehicle_id: string;
  trip_id?: string | null;
}

export const logsApi = {
  // Create a new maintenance log
  async createMaintenance(payload: CreateMaintenancePayload) {
    const response = await apiClient.post('/api/v1/maintenance/', payload);
    return response.data;
  },

  // Get all maintenance logs
  async getMaintenanceLogs(skip?: number, limit?: number) {
    const response = await apiClient.get('/api/v1/maintenance/', {
      params: { skip, limit },
    });
    return response.data;
  },

  // Update maintenance log status/details (e.g. resolve)
  async updateMaintenanceLog(id: string, payload: Partial<CreateMaintenancePayload> & { is_active?: boolean }) {
    const response = await apiClient.put(`/api/v1/maintenance/${id}`, payload);
    return response.data;
  },

  // Create a new fuel log record
  async createFuelLog(payload: CreateFuelLogPayload) {
    const response = await apiClient.post('/api/v1/fuel-logs/', payload);
    return response.data;
  },

  // Get all fuel logs
  async getFuelLogs(skip?: number, limit?: number) {
    const response = await apiClient.get('/api/v1/fuel-logs/', {
      params: { skip, limit },
    });
    return response.data;
  },

  // Create a new expense record
  async createExpense(payload: CreateExpensePayload) {
    const response = await apiClient.post('/api/v1/expenses/', payload);
    return response.data;
  },

  // Get all expense records
  async getExpenses(skip?: number, limit?: number) {
    const response = await apiClient.get('/api/v1/expenses/', {
      params: { skip, limit },
    });
    return response.data;
  },
};
