import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type VehicleType = 'Truck' | 'Van' | 'Sedan';
export type VehicleStatus = 'Available' | 'On Trip' | 'In Shop' | 'Retired';

export interface Vehicle {
  id: string;
  name: string;
  type: VehicleType;
  status: VehicleStatus;
  licensePlate: string;
  region: 'North' | 'South' | 'East' | 'West';
  model: string;
  fuelLevel: number;
  lastMaintenanceDate: string;
}

export type DriverStatus = 'Available' | 'On Trip' | 'Suspended';

export interface Driver {
  id: string;
  name: string;
  status: DriverStatus;
  licenseNumber: string;
  phone: string;
  rating: number;
}

export type TripStatus = 'Draft' | 'Dispatched' | 'Completed' | 'Cancelled';

export interface Trip {
  id: string;
  source: string;
  destination: string;
  driverId: string;
  vehicleId: string;
  cargoWeight: number; // in kg
  plannedDistance: number; // in km
  status: TripStatus;
  cost: number;
  date: string;
}

export type LogType = 'Fuel' | 'Maintenance' | 'Expense';

export interface MaintenanceLog {
  id: string;
  vehicleId: string;
  type: LogType;
  description: string;
  cost: number;
  liters?: number; // for Fuel logs
  date: string;
  status: 'Active' | 'Closed';
}

export type TransitRole = 'Fleet Manager' | 'Driver' | 'Safety Officer' | 'Financial Analyst';

interface TransitState {
  // States
  vehicles: Vehicle[];
  drivers: Driver[];
  trips: Trip[];
  logs: MaintenanceLog[];
  activeRole: TransitRole;

  // Actions
  setActiveRole: (role: TransitRole) => void;
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => void;
  updateVehicleStatus: (id: string, status: VehicleStatus) => void;
  addDriver: (driver: Omit<Driver, 'id'>) => void;
  updateDriverStatus: (id: string, status: DriverStatus) => void;
  createTrip: (trip: Omit<Trip, 'id' | 'status' | 'date'>) => void;
  updateTripStatus: (tripId: string, status: TripStatus) => void;
  addLog: (log: Omit<MaintenanceLog, 'id'>) => void;
  resolveLog: (id: string) => void;
}

const initialVehicles: Vehicle[] = [
  { id: 'v-1', name: 'Volvo FH16 Heavy Duty', type: 'Truck', status: 'Available', licensePlate: 'TX-9988-A', region: 'North', model: 'Volvo 2024', fuelLevel: 85, lastMaintenanceDate: '2026-06-15' },
  { id: 'v-2', name: 'Ford Transit Cargo', type: 'Van', status: 'On Trip', licensePlate: 'TX-4412-B', region: 'West', model: 'Ford Transit 2023', fuelLevel: 42, lastMaintenanceDate: '2026-05-20' },
  { id: 'v-3', name: 'Mercedes Sprinter Van', type: 'Van', status: 'In Shop', licensePlate: 'TX-3321-C', region: 'South', model: 'Mercedes 2022', fuelLevel: 10, lastMaintenanceDate: '2026-07-01' },
  { id: 'v-4', name: 'Tesla Semi', type: 'Truck', status: 'Available', licensePlate: 'TX-1010-E', region: 'East', model: 'Tesla Semi 2024', fuelLevel: 98, lastMaintenanceDate: '2026-06-30' },
  { id: 'v-5', name: 'Toyota HiAce Crew', type: 'Van', status: 'Available', licensePlate: 'TX-8877-D', region: 'North', model: 'Toyota 2023', fuelLevel: 70, lastMaintenanceDate: '2026-04-12' },
  { id: 'v-6', name: 'Chevrolet Bolt Fleet', type: 'Sedan', status: 'Available', licensePlate: 'TX-5050-F', region: 'West', model: 'Chevrolet 2023', fuelLevel: 62, lastMaintenanceDate: '2026-07-05' },
  { id: 'v-7', name: 'Scania R500 Hauler', type: 'Truck', status: 'Retired', licensePlate: 'TX-0001-X', region: 'East', model: 'Scania 2015', fuelLevel: 0, lastMaintenanceDate: '2025-12-01' },
];

const initialDrivers: Driver[] = [
  { id: 'd-1', name: 'Marcus Sterling', status: 'Available', licenseNumber: 'DL-99128A', phone: '+1-555-0192', rating: 4.9 },
  { id: 'd-2', name: 'Elena Rostova', status: 'On Trip', licenseNumber: 'DL-77312B', phone: '+1-555-0187', rating: 4.8 },
  { id: 'd-3', name: 'Jamal Washington', status: 'Available', licenseNumber: 'DL-33491C', phone: '+1-555-0144', rating: 4.7 },
  { id: 'd-4', name: 'Sophia Chen', status: 'Suspended', licenseNumber: 'DL-11029F', phone: '+1-555-0156', rating: 4.2 },
  { id: 'd-5', name: 'Carlos Mendez', status: 'Available', licenseNumber: 'DL-55231E', phone: '+1-555-0163', rating: 4.6 },
];

const initialTrips: Trip[] = [
  { id: 't-1', source: 'Austin Depot', destination: 'Dallas Logistics Hub', driverId: 'd-2', vehicleId: 'v-2', cargoWeight: 8500, plannedDistance: 320, status: 'Dispatched', cost: 1200, date: '2026-07-12' },
  { id: 't-2', source: 'Houston Terminal', destination: 'Austin Depot', driverId: 'd-1', vehicleId: 'v-1', cargoWeight: 12000, plannedDistance: 260, status: 'Completed', cost: 950, date: '2026-07-11' },
  { id: 't-3', source: 'San Antonio Port', destination: 'El Paso Station', driverId: 'd-3', vehicleId: 'v-4', cargoWeight: 15000, plannedDistance: 880, status: 'Draft', cost: 2800, date: '2026-07-12' },
];

const initialLogs: MaintenanceLog[] = [
  { id: 'l-1', vehicleId: 'v-3', type: 'Maintenance', description: 'Replace worn out front brake pads and discs', cost: 450, date: '2026-07-10', status: 'Active' },
  { id: 'l-2', vehicleId: 'v-2', type: 'Fuel', description: 'Regular Diesel Refuel', cost: 180, liters: 120, date: '2026-07-11', status: 'Closed' },
  { id: 'l-3', vehicleId: 'v-1', type: 'Expense', description: 'I-35 Highway Toll Pass', cost: 45, date: '2026-07-12', status: 'Closed' },
];

export const useTransitStore = create<TransitState>()(
  persist(
    (set) => ({
      vehicles: initialVehicles,
      drivers: initialDrivers,
      trips: initialTrips,
      logs: initialLogs,
      activeRole: 'Fleet Manager',

      setActiveRole: (role) => set({ activeRole: role }),

      addVehicle: (vehicle) =>
        set((state) => ({
          vehicles: [
            ...state.vehicles,
            { ...vehicle, id: `v-${state.vehicles.length + 1}-${Math.floor(Math.random() * 1000)}` },
          ],
        })),

      updateVehicleStatus: (id, status) =>
        set((state) => ({
          vehicles: state.vehicles.map((v) => (v.id === id ? { ...v, status } : v)),
        })),

      addDriver: (driver) =>
        set((state) => ({
          drivers: [
            ...state.drivers,
            { ...driver, id: `d-${state.drivers.length + 1}-${Math.floor(Math.random() * 1000)}` },
          ],
        })),

      updateDriverStatus: (id, status) =>
        set((state) => ({
          drivers: state.drivers.map((d) => (d.id === id ? { ...d, status } : d)),
        })),

      createTrip: (trip) =>
        set((state) => ({
          trips: [
            ...state.trips,
            {
              ...trip,
              id: `t-${state.trips.length + 1}-${Math.floor(Math.random() * 1000)}`,
              status: 'Draft',
              date: new Date().toISOString().split('T')[0],
            },
          ],
        })),

      updateTripStatus: (tripId, status) =>
        set((state) => {
          const trip = state.trips.find((t) => t.id === tripId);
          if (!trip) return {};

          let updatedVehicles = [...state.vehicles];
          let updatedDrivers = [...state.drivers];

          if (status === 'Dispatched') {
            updatedVehicles = state.vehicles.map((v) =>
              v.id === trip.vehicleId ? { ...v, status: 'On Trip' as VehicleStatus } : v
            );
            updatedDrivers = state.drivers.map((d) =>
              d.id === trip.driverId ? { ...d, status: 'On Trip' as DriverStatus } : d
            );
          } else if (status === 'Completed' || status === 'Cancelled') {
            updatedVehicles = state.vehicles.map((v) =>
              v.id === trip.vehicleId && v.status === 'On Trip' ? { ...v, status: 'Available' as VehicleStatus } : v
            );
            updatedDrivers = state.drivers.map((d) =>
              d.id === trip.driverId && d.status === 'On Trip' ? { ...d, status: 'Available' as DriverStatus } : d
            );
          }

          return {
            trips: state.trips.map((t) => (t.id === tripId ? { ...t, status } : t)),
            vehicles: updatedVehicles,
            drivers: updatedDrivers,
          };
        }),

      addLog: (log) =>
        set((state) => {
          const newLog = {
            ...log,
            id: `l-${state.logs.length + 1}-${Math.floor(Math.random() * 1000)}`,
          };

          let updatedVehicles = [...state.vehicles];
          if (log.type === 'Maintenance' && log.status === 'Active') {
            updatedVehicles = state.vehicles.map((v) =>
              v.id === log.vehicleId ? { ...v, status: 'In Shop' as VehicleStatus } : v
            );
          }

          return {
            logs: [...state.logs, newLog],
            vehicles: updatedVehicles,
          };
        }),

      resolveLog: (id) =>
        set((state) => {
          const log = state.logs.find((l) => l.id === id);
          if (!log) return {};

          const updatedLogs = state.logs.map((l) => (l.id === id ? { ...l, status: 'Closed' as const } : l));

          const updatedVehicles = state.vehicles.map((v) =>
            v.id === log.vehicleId && v.status === 'In Shop' ? { ...v, status: 'Available' as VehicleStatus } : v
          );

          return {
            logs: updatedLogs,
            vehicles: updatedVehicles,
          };
        }),
    }),
    {
      name: 'transit-ops-store',
      partialize: (state) => ({
        vehicles: state.vehicles,
        drivers: state.drivers,
        trips: state.trips,
        logs: state.logs,
        activeRole: state.activeRole,
      }),
    }
  )
);
