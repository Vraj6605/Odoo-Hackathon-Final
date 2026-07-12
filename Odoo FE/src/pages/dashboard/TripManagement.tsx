import React, { useState, useMemo } from 'react';
import { useTransitStore, type TripStatus, type Vehicle, type Driver, type Trip } from '@/store/transitStore';
import { useVehicles, useDrivers, useTrips, useCreateTrip, useUpdateTripStatus } from '@/hooks/useTransitApi';
import { 
  Navigation, 
  Plus, 
  User, 
  Truck, 
  Scale, 
  TrendingUp, 
  DollarSign, 
  Play, 
  CheckCircle, 
  XCircle, 
  Lock, 
  AlertCircle,
  X,
  ArrowRight
} from 'lucide-react';
import Button from '@/components/ui/Button';

export const TripManagement: React.FC = () => {
  const { data: vehicles = [] } = useVehicles();
  const { data: drivers = [] } = useDrivers();
  const { data: trips = [] } = useTrips();
  const activeRole = useTransitStore((state) => state.activeRole);

  const createTripMutation = useCreateTrip();
  const updateTripStatusMutation = useUpdateTripStatus();

  // Create Trip Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [driverId, setDriverId] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [cargoWeight, setCargoWeight] = useState('');
  const [plannedDistance, setPlannedDistance] = useState('');
  const [cost, setCost] = useState('');
  const [formError, setFormError] = useState('');

  // RBAC permissions
  const canCreateTrips = activeRole === 'Fleet Manager';
  const canDispatchTrips = activeRole === 'Fleet Manager';
  const canCompleteTrips = activeRole === 'Fleet Manager' || activeRole === 'Driver';
  const canCancelTrips = activeRole === 'Fleet Manager';

  // Dynamic asset filtering (ONLY show Available assets for new trips)
  const availableVehicles = useMemo(() => {
    return vehicles.filter((v: Vehicle) => v.status === 'Available');
  }, [vehicles]);

  const availableDrivers = useMemo(() => {
    return drivers.filter((d: Driver) => d.status === 'Available');
  }, [drivers]);

  // Trip List partitioned by Status
  const columns: { id: TripStatus; title: string; color: string; border: string; bg: string }[] = [
    { id: 'Draft', title: 'Draft / Planned', color: 'text-zinc-500', border: 'border-zinc-200 dark:border-zinc-800', bg: 'bg-zinc-50 dark:bg-zinc-950/40' },
    { id: 'Dispatched', title: 'In Transit / Dispatched', color: 'text-blue-500', border: 'border-blue-200 dark:border-blue-900/50', bg: 'bg-blue-50/20 dark:bg-blue-950/10' },
    { id: 'Completed', title: 'Completed', color: 'text-emerald-500', border: 'border-emerald-200 dark:border-emerald-900/50', bg: 'bg-emerald-50/20 dark:bg-emerald-950/10' },
    { id: 'Cancelled', title: 'Cancelled', color: 'text-red-500', border: 'border-red-200 dark:border-red-900/50', bg: 'bg-red-50/20 dark:bg-red-950/10' },
  ];

  // Handle Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!canCreateTrips) {
      setFormError('Access Denied: Only Fleet Managers can create trips.');
      return;
    }

    if (!source || !destination || !driverId || !vehicleId || !cargoWeight || !plannedDistance || !cost) {
      setFormError('Please fill out all required fields.');
      return;
    }

    // Double check asset availability
    const vehObj = vehicles.find((v: Vehicle) => v.id === vehicleId);
    const drvObj = drivers.find((d: Driver) => d.id === driverId);

    if (vehObj?.status !== 'Available') {
      setFormError('Selected vehicle is no longer available.');
      return;
    }
    if (drvObj?.status !== 'Available') {
      setFormError('Selected driver is no longer available.');
      return;
    }

    createTripMutation.mutate({
      source,
      destination,
      driver_id: driverId,
      vehicle_id: vehicleId,
      cargo_weight: Number(cargoWeight),
      planned_distance: Number(plannedDistance),
    });

    // Reset Form
    setSource('');
    setDestination('');
    setDriverId('');
    setVehicleId('');
    setCargoWeight('');
    setPlannedDistance('');
    setCost('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Info Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-zinc-900 dark:text-white">Active Trip Logistics</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Track and dispatch cargo orders through the lifecycle stages</p>
        </div>

        {/* Create Trip Form Trigger */}
        <div className="relative group">
          <Button
            variant="contained"
            disabled={!canCreateTrips}
            onClick={() => setIsModalOpen(true)}
            className={`flex items-center space-x-1.5 font-bold h-11 text-xs px-5 shadow-sm rounded-xl cursor-pointer ${
              canCreateTrips
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 cursor-not-allowed border border-zinc-300/30'
            }`}
          >
            {!canCreateTrips ? <Lock className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>Create New Trip</span>
          </Button>

          {!canCreateTrips && (
            <div className="absolute right-0 bottom-full mb-2 scale-0 group-hover:scale-100 transition-all duration-150 bg-zinc-950 text-white text-[10px] font-bold rounded px-2.5 py-1.5 shadow-md pointer-events-none z-50 w-56 text-center">
              Requires <span className="text-purple-400">Fleet Manager</span> role to create new trips.
            </div>
          )}
        </div>
      </div>

      {/* Dynamic Kanban Board Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {columns.map((col) => {
          const colTrips = trips.filter((t: Trip) => t.status === col.id);
          
          return (
            <div 
              key={col.id} 
              className={`rounded-2xl border ${col.border} ${col.bg} p-4 flex flex-col min-h-[500px] transition-all duration-300 shadow-sm`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-900 shrink-0">
                <span className={`text-xs font-black uppercase tracking-wider ${col.color}`}>
                  {col.title}
                </span>
                <span className="text-[10px] font-extrabold bg-zinc-200/60 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded-full">
                  {colTrips.length}
                </span>
              </div>

              {/* Kanban Lane Cards container */}
              <div className="flex-1 overflow-y-auto space-y-3 pt-3 pr-1 max-h-[550px]">
                {colTrips.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-zinc-200/50 dark:border-zinc-800/50 rounded-xl py-12 text-zinc-400">
                    <Navigation className="w-6 h-6 stroke-1 mb-2" />
                    <span className="text-[10px] font-semibold">No trips in this lane</span>
                  </div>
                ) : (
                  colTrips.map((trip: Trip) => {
                    const vehicleObj = vehicles.find((v: Vehicle) => v.id === trip.vehicleId);
                    const driverObj = drivers.find((d: Driver) => d.id === trip.driverId);

                    return (
                      <div 
                        key={trip.id} 
                        className="bg-white dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200 dark:border-zinc-900 shadow-sm hover:shadow-md transition-all duration-200 space-y-3"
                      >
                        {/* Source ➔ Destination */}
                        <div>
                          <div className="flex items-center space-x-1.5 font-bold text-xs text-zinc-800 dark:text-zinc-200">
                            <span className="truncate">{trip.source}</span>
                            <ArrowRight className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                            <span className="truncate">{trip.destination}</span>
                          </div>
                          <span className="text-[9px] font-extrabold text-zinc-400 font-mono tracking-wider mt-0.5 block">
                            TRIP ID: {trip.id}
                          </span>
                        </div>

                        {/* Driver & Vehicle */}
                        <div className="grid grid-cols-2 gap-2 text-[10px] text-zinc-500 dark:text-zinc-400 font-semibold">
                          <div className="flex items-center space-x-1 py-1 px-2 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-900">
                            <User className="w-3 h-3 text-zinc-400" />
                            <span className="truncate">{driverObj?.name || 'Unknown'}</span>
                          </div>
                          <div className="flex items-center space-x-1 py-1 px-2 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-900">
                            <Truck className="w-3 h-3 text-zinc-400" />
                            <span className="truncate">{vehicleObj?.name || 'Unknown'}</span>
                          </div>
                        </div>

                        {/* Payload, Distance, Costs info */}
                        <div className="flex justify-between border-t border-zinc-100 dark:border-zinc-900 pt-2 text-[10px] text-zinc-500 font-semibold">
                          <span className="flex items-center space-x-1">
                            <Scale className="w-3.5 h-3.5 text-zinc-400" />
                            <span>{(trip.cargoWeight / 1000).toFixed(1)}t</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <TrendingUp className="w-3.5 h-3.5 text-zinc-400" />
                            <span>{trip.plannedDistance} km</span>
                          </span>
                          <span className="flex items-center space-x-1 font-bold text-zinc-700 dark:text-zinc-300">
                            <DollarSign className="w-3 h-3 text-zinc-400" />
                            <span>${trip.cost}</span>
                          </span>
                        </div>

                        {/* Action buttons based on lifecycle phase */}
                        {trip.status === 'Draft' && (
                          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-900">
                            <button
                              disabled={!canDispatchTrips}
                              onClick={() => updateTripStatusMutation.mutate({ id: trip.id, status: 'Dispatched' })}
                              className={`w-full flex items-center justify-center space-x-1.5 h-8 rounded-lg text-[10px] font-extrabold cursor-pointer transition-colors ${
                                canDispatchTrips 
                                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/10' 
                                  : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-400 cursor-not-allowed'
                              }`}
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                              <span>Dispatch Vehicle</span>
                            </button>
                          </div>
                        )}

                        {trip.status === 'Dispatched' && (
                          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-900 grid grid-cols-2 gap-2">
                            {/* Complete Trip */}
                            <button
                              disabled={!canCompleteTrips}
                              onClick={() => updateTripStatusMutation.mutate({ id: trip.id, status: 'Completed' })}
                              className={`flex items-center justify-center space-x-1 h-8 rounded-lg text-[10px] font-extrabold cursor-pointer transition-colors ${
                                canCompleteTrips 
                                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                                  : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-400 cursor-not-allowed'
                              }`}
                            >
                              <CheckCircle className="w-3 h-3" />
                              <span>Complete</span>
                            </button>
                            {/* Cancel Trip */}
                            <button
                              disabled={!canCancelTrips}
                              onClick={() => updateTripStatusMutation.mutate({ id: trip.id, status: 'Cancelled' })}
                              className={`flex items-center justify-center space-x-1 h-8 rounded-lg text-[10px] font-extrabold cursor-pointer transition-colors ${
                                canCancelTrips 
                                  ? 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 hover:bg-red-100 hover:text-red-700' 
                                  : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-400 cursor-not-allowed'
                              }`}
                            >
                              <XCircle className="w-3 h-3" />
                              <span>Cancel</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* TRIP CREATION DIALOG FORM */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          
          <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 w-full max-w-lg shadow-2xl relative z-10 overflow-hidden animate-scale-up">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-900 flex justify-between items-center bg-zinc-50 dark:bg-zinc-950">
              <h3 className="font-extrabold text-sm text-zinc-800 dark:text-zinc-200 uppercase tracking-wider flex items-center space-x-2">
                <span>Create New Trip Order</span>
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {!canCreateTrips ? (
                <div className="flex items-start space-x-2 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 p-4 rounded-xl text-red-600 dark:text-red-400 text-xs font-semibold mb-4">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>Operational block: Your role '{activeRole}' does not hold planning privileges. Only Fleet Managers may commit new trip orders.</p>
                </div>
              ) : formError ? (
                <div className="flex items-start space-x-2 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 p-3 rounded-xl text-red-600 dark:text-red-400 text-xs font-semibold mb-4">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              ) : null}

              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Route Source & Destination */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Source Depot *</label>
                    <input
                      type="text"
                      placeholder="e.g. Austin Depot"
                      value={source}
                      onChange={(e) => setSource(e.target.value)}
                      disabled={!canCreateTrips}
                      className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-zinc-100 disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Destination Hub *</label>
                    <input
                      type="text"
                      placeholder="e.g. Denver Logistics"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      disabled={!canCreateTrips}
                      className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-zinc-100 disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* DYNAMIC DROPDOWNS: Only available assets */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Driver Dropdown Selection */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Select Driver *</label>
                      <span className="text-[9px] text-zinc-400 font-bold bg-zinc-100 dark:bg-zinc-900 px-1.5 py-0.5 rounded">
                        {availableDrivers.length} Available
                      </span>
                    </div>
                    <select
                      value={driverId}
                      onChange={(e) => setDriverId(e.target.value)}
                      disabled={!canCreateTrips}
                      className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-zinc-100 disabled:opacity-50"
                    >
                      <option value="">-- Choose Driver --</option>
                      {availableDrivers.map((d: Driver) => (
                        <option key={d.id} value={d.id}>
                          {d.name} (Rating: {d.rating.toFixed(1)})
                        </option>
                      ))}
                    </select>
                    {availableDrivers.length === 0 && canCreateTrips && (
                      <span className="text-[9px] text-red-500 mt-1 block">All drivers are currently dispatched/suspended.</span>
                    )}
                  </div>

                  {/* Vehicle Dropdown Selection */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Select Vehicle *</label>
                      <span className="text-[9px] text-zinc-400 font-bold bg-zinc-100 dark:bg-zinc-900 px-1.5 py-0.5 rounded">
                        {availableVehicles.length} Available
                      </span>
                    </div>
                    <select
                      value={vehicleId}
                      onChange={(e) => setVehicleId(e.target.value)}
                      disabled={!canCreateTrips}
                      className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-zinc-100 disabled:opacity-50"
                    >
                      <option value="">-- Choose Vehicle --</option>
                      {availableVehicles.map((v: Vehicle) => (
                        <option key={v.id} value={v.id}>
                          {v.name} ({v.type} - {v.licensePlate})
                        </option>
                      ))}
                    </select>
                    {availableVehicles.length === 0 && canCreateTrips && (
                      <span className="text-[9px] text-red-500 mt-1 block">No vehicles available at this depot.</span>
                    )}
                  </div>

                </div>

                {/* Cargo, Distance and Budget Costs */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Cargo (kg) *</label>
                    <input
                      type="number"
                      placeholder="e.g. 5000"
                      value={cargoWeight}
                      onChange={(e) => setCargoWeight(e.target.value)}
                      disabled={!canCreateTrips}
                      className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-zinc-100 disabled:opacity-50 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Distance (km) *</label>
                    <input
                      type="number"
                      placeholder="e.g. 450"
                      value={plannedDistance}
                      onChange={(e) => setPlannedDistance(e.target.value)}
                      disabled={!canCreateTrips}
                      className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-zinc-100 disabled:opacity-50 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Budget Cost ($) *</label>
                    <input
                      type="number"
                      placeholder="e.g. 1500"
                      value={cost}
                      onChange={(e) => setCost(e.target.value)}
                      disabled={!canCreateTrips}
                      className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-zinc-100 disabled:opacity-50 font-mono"
                    />
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-900 flex justify-end space-x-2.5">
                  <Button 
                    variant="outlined" 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-zinc-500 hover:text-zinc-800"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    type="submit"
                    disabled={!canCreateTrips}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2 rounded-xl"
                  >
                    Create Trip Order
                  </Button>
                </div>

              </form>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default TripManagement;
