import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vehiclesApi, type CreateVehiclePayload } from '@/lib/api/vehicles';
import { driversApi, type CreateDriverPayload } from '@/lib/api/drivers';
import { tripsApi, type CreateTripPayload } from '@/lib/api/trips';
import { analyticsApi, type AnalyticsFilter } from '@/lib/api/analytics';
import { logsApi, type CreateMaintenancePayload, type CreateFuelLogPayload, type CreateExpensePayload } from '@/lib/api/logs';
import { useTransitStore, type Vehicle, type Driver, type Trip } from '@/store/transitStore';

// 1. Vehicles Query & Mutation Hooks
export function useVehicles() {
  const localVehicles = useTransitStore((state) => state.vehicles);
  
  return useQuery<Vehicle[]>({
    queryKey: ['vehicles'],
    queryFn: async () => {
      try {
        const data = await vehiclesApi.getVehicles();
        return Array.isArray(data) ? data : data.data || localVehicles;
      } catch (err) {
        console.warn('Vehicles API call failed. Falling back to local store.', err);
        return localVehicles;
      }
    },
    initialData: localVehicles,
  });
}

export function useCreateVehicle() {
  const queryClient = useQueryClient();
  const addLocalVehicle = useTransitStore((state) => state.addVehicle);

  return useMutation({
    mutationFn: async (payload: CreateVehiclePayload) => {
      try {
        const response = await vehiclesApi.createVehicle(payload);
        return response;
      } catch (err) {
        console.warn('Create Vehicle API failed. Saving locally.', err);
        return { success: false, fallbackPayload: payload };
      }
    },
    onSuccess: (_res, variables) => {
      // Always sync to local store for consistency and fallback offline capability
      addLocalVehicle({
        name: variables.name_model,
        type: variables.type as any,
        status: (variables.status as any) || 'Available',
        licensePlate: variables.registration_number,
        region: 'North', // Default region mapping
        model: variables.name_model,
        fuelLevel: 100,
        lastMaintenanceDate: new Date().toISOString().split('T')[0],
      });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['kpis'] });
    },
  });
}

// 2. Drivers Query & Mutation Hooks
export function useDrivers() {
  const localDrivers = useTransitStore((state) => state.drivers);

  return useQuery<Driver[]>({
    queryKey: ['drivers'],
    queryFn: async () => {
      try {
        const data = await driversApi.getDrivers();
        return Array.isArray(data) ? data : data.data || localDrivers;
      } catch (err) {
        console.warn('Drivers API call failed. Falling back to local store.', err);
        return localDrivers;
      }
    },
    initialData: localDrivers,
  });
}

export function useCreateDriver() {
  const queryClient = useQueryClient();
  const addLocalDriver = useTransitStore((state) => state.addDriver);

  return useMutation({
    mutationFn: async (payload: CreateDriverPayload) => {
      try {
        const response = await driversApi.createDriver(payload);
        return response;
      } catch (err) {
        console.warn('Create Driver API failed. Saving locally.', err);
        return { success: false, fallbackPayload: payload };
      }
    },
    onSuccess: (_res, variables) => {
      addLocalDriver({
        name: variables.name,
        licenseNumber: variables.license_number,
        phone: variables.contact_number,
        status: (variables.status as any) || 'Available',
        rating: variables.safety_score || 5.0,
      });
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      queryClient.invalidateQueries({ queryKey: ['kpis'] });
    },
  });
}

// 3. Trips Query & Mutation Hooks
export function useTrips() {
  const localTrips = useTransitStore((state) => state.trips);

  return useQuery<Trip[]>({
    queryKey: ['trips'],
    queryFn: async () => {
      try {
        const data = await tripsApi.getTrips();
        return Array.isArray(data) ? data : data.data || localTrips;
      } catch (err) {
        console.warn('Trips API call failed. Falling back to local store.', err);
        return localTrips;
      }
    },
    initialData: localTrips,
  });
}

export function useCreateTrip() {
  const queryClient = useQueryClient();
  const createLocalTrip = useTransitStore((state) => state.createTrip);

  return useMutation({
    mutationFn: async (payload: CreateTripPayload) => {
      try {
        const response = await tripsApi.createTrip(payload);
        return response;
      } catch (err) {
        console.warn('Create Trip API failed. Saving locally.', err);
        return { success: false, fallbackPayload: payload };
      }
    },
    onSuccess: (_res, variables) => {
      createLocalTrip({
        source: variables.source,
        destination: variables.destination,
        driverId: variables.driver_id,
        vehicleId: variables.vehicle_id,
        cargoWeight: variables.cargo_weight,
        plannedDistance: variables.planned_distance,
        cost: Math.round(variables.planned_distance * 3.5), // Estimate cost
      });
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      queryClient.invalidateQueries({ queryKey: ['kpis'] });
    },
  });
}

export function useUpdateTripStatus() {
  const queryClient = useQueryClient();
  const updateLocalTripStatus = useTransitStore((state) => state.updateTripStatus);

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      try {
        const response = await tripsApi.updateTripStatus(id, status);
        return response;
      } catch (err) {
        console.warn('Update Trip Status API failed. Updating locally.', err);
        return { success: false, id, status };
      }
    },
    onSuccess: (_res, variables) => {
      updateLocalTripStatus(variables.id, variables.status as any);
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      queryClient.invalidateQueries({ queryKey: ['kpis'] });
    },
  });
}

// 4. Analytics & Dashboard Query Hooks
export function useDashboardKPIs(filters?: AnalyticsFilter) {
  const vehicles = useTransitStore((state) => state.vehicles);
  const drivers = useTransitStore((state) => state.drivers);
  const trips = useTransitStore((state) => state.trips);

  return useQuery({
    queryKey: ['kpis', filters],
    queryFn: async () => {
      try {
        const data = await analyticsApi.getKPIs(filters);
        return data;
      } catch (err) {
        console.warn('Dashboard KPIs API failed. Calculating dynamically from local store.', err);
        
        // Dynamic calculations matching local store status
        const totalVehicles = vehicles.length;
        const activeVehicles = vehicles.filter(v => v.status === 'On Trip').length;
        const availableVehicles = vehicles.filter(v => v.status === 'Available').length;
        const inMaintenance = vehicles.filter(v => v.status === 'In Shop').length;
        const activeTrips = trips.filter(t => t.status === 'Dispatched').length;
        const pendingTrips = trips.filter(t => t.status === 'Draft').length;
        const driversOnDuty = drivers.filter(d => d.status === 'Available' || d.status === 'On Trip').length;
        
        const activeNonRetired = vehicles.filter(v => v.status !== 'Retired').length;
        const utilization = activeNonRetired > 0 
          ? Math.round((activeVehicles / activeNonRetired) * 100) 
          : 0;

        return {
          totalVehicles,
          activeVehicles,
          availableVehicles,
          inMaintenance,
          activeTrips,
          pendingTrips,
          driversOnDuty,
          utilization,
        };
      }
    },
  });
}

export function useReportsAnalytics(filters?: AnalyticsFilter) {
  const logs = useTransitStore((state) => state.logs);

  return useQuery({
    queryKey: ['reports', filters],
    queryFn: async () => {
      try {
        const data = await analyticsApi.getReports(filters);
        return data;
      } catch (err) {
        console.warn('Reports Analytics API failed. Calculating dynamically from local store.', err);

        const fuel = logs.filter(l => l.type === 'Fuel').reduce((sum, l) => sum + l.cost, 0);
        const maint = logs.filter(l => l.type === 'Maintenance').reduce((sum, l) => sum + l.cost, 0);
        const misc = logs.filter(l => l.type === 'Expense').reduce((sum, l) => sum + l.cost, 0);
        const total = fuel + maint + misc;

        return {
          fuel,
          maint,
          misc,
          total,
        };
      }
    },
  });
}

// 5. Logs & Expense Mutation Hooks
export function useCreateMaintenanceLog() {
  const queryClient = useQueryClient();
  const addLocalLog = useTransitStore((state) => state.addLog);

  return useMutation({
    mutationFn: async (payload: CreateMaintenancePayload) => {
      try {
        const response = await logsApi.createMaintenance(payload);
        return response;
      } catch (err) {
        console.warn('Create Maintenance API failed. Logging locally.', err);
        return { success: false, fallbackPayload: payload };
      }
    },
    onSuccess: (_res, variables) => {
      addLocalLog({
        vehicleId: variables.vehicle_id,
        type: 'Maintenance',
        description: variables.description,
        cost: variables.cost,
        date: variables.entry_date,
        status: variables.status as any,
      });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['kpis'] });
    },
  });
}

export function useResolveMaintenanceLog() {
  const queryClient = useQueryClient();
  const resolveLocalLog = useTransitStore((state) => state.resolveLog);

  return useMutation({
    mutationFn: async ({ id, status, completionDate }: { id: string; status: string; completionDate?: string }) => {
      try {
        const response = await logsApi.updateMaintenanceLog(id, { 
          status, 
          completion_date: completionDate || new Date().toISOString().split('T')[0] 
        });
        return response;
      } catch (err) {
        console.warn('Update Maintenance Log API failed. Resolving locally.', err);
        return { success: false, id };
      }
    },
    onSuccess: (_res, variables) => {
      resolveLocalLog(variables.id);
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['kpis'] });
    },
  });
}

export function useCreateFuelLog() {
  const queryClient = useQueryClient();
  const addLocalLog = useTransitStore((state) => state.addLog);

  return useMutation({
    mutationFn: async (payload: CreateFuelLogPayload) => {
      try {
        const response = await logsApi.createFuelLog(payload);
        return response;
      } catch (err) {
        console.warn('Create Fuel Log API failed. Logging locally.', err);
        return { success: false, fallbackPayload: payload };
      }
    },
    onSuccess: (_res, variables) => {
      addLocalLog({
        vehicleId: variables.vehicle_id,
        type: 'Fuel',
        description: `Diesel Refuel (${variables.liters}L)`,
        cost: variables.cost,
        liters: variables.liters,
        date: variables.log_date,
        status: 'Closed',
      });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['kpis'] });
    },
  });
}

export function useCreateExpenseLog() {
  const queryClient = useQueryClient();
  const addLocalLog = useTransitStore((state) => state.addLog);

  return useMutation({
    mutationFn: async (payload: CreateExpensePayload) => {
      try {
        const response = await logsApi.createExpense(payload);
        return response;
      } catch (err) {
        console.warn('Create Expense API failed. Logging locally.', err);
        return { success: false, fallbackPayload: payload };
      }
    },
    onSuccess: (_res, variables) => {
      addLocalLog({
        vehicleId: variables.vehicle_id,
        type: 'Expense',
        description: `${variables.category} toll passes`,
        cost: variables.amount,
        date: variables.expense_date,
        status: 'Closed',
      });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['kpis'] });
    },
  });
}
