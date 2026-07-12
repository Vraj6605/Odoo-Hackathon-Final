import React, { useState, useMemo } from 'react';
import { useTransitStore, type VehicleType, type VehicleStatus, type DriverStatus, type Vehicle, type Driver } from '@/store/transitStore';
import { useVehicles, useDrivers, useCreateVehicle, useCreateDriver } from '@/hooks/useTransitApi';
import { 
  Truck, 
  Users, 
  Plus, 
  Search, 
  MapPin, 
  Star,
  AlertCircle,
  X,
  Lock
} from 'lucide-react';
import Button from '@/components/ui/Button';

export const VehicleRegistry: React.FC = () => {
  const { data: vehicles = [] } = useVehicles();
  const { data: drivers = [] } = useDrivers();
  const activeRole = useTransitStore((state) => state.activeRole);

  const createVehicleMutation = useCreateVehicle();
  const createDriverMutation = useCreateDriver();

  // Tab State: 'vehicles' | 'drivers'
  const [activeTab, setActiveTab] = useState<'vehicles' | 'drivers'>('vehicles');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Register Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Asset Forms State
  const [newVehicle, setNewVehicle] = useState({
    name: '',
    type: 'Truck' as VehicleType,
    licensePlate: '',
    region: 'North' as 'North' | 'South' | 'East' | 'West',
    model: '',
    fuelLevel: 100,
  });

  const [newDriver, setNewDriver] = useState({
    name: '',
    licenseNumber: '',
    phone: '',
    rating: 5.0,
  });

  // Error validations
  const [formError, setFormError] = useState('');

  // RBAC Permission Check
  const hasWritePermission = activeRole === 'Fleet Manager';

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v: Vehicle) => {
      const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            v.licensePlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            v.model.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || v.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [vehicles, searchQuery, statusFilter]);

  const filteredDrivers = useMemo(() => {
    return drivers.filter((d: Driver) => {
      const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            d.licenseNumber.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || d.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [drivers, searchQuery, statusFilter]);

  // Form Submissions
  const handleAddVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVehicle.name || !newVehicle.licensePlate || !newVehicle.model) {
      setFormError('Please fill in all required fields.');
      return;
    }
    
    // License plate duplicate check
    if (vehicles.some((v: Vehicle) => v.licensePlate.toLowerCase() === newVehicle.licensePlate.toLowerCase())) {
      setFormError('License plate already exists in registry.');
      return;
    }

    createVehicleMutation.mutate({
      registration_number: newVehicle.licensePlate.toUpperCase(),
      name_model: newVehicle.name,
      type: newVehicle.type,
      max_load_capacity: newVehicle.type === 'Truck' ? 15000 : newVehicle.type === 'Van' ? 4000 : 1000,
      odometer: 0,
      acquisition_cost: newVehicle.type === 'Truck' ? 80000 : newVehicle.type === 'Van' ? 35000 : 22000,
      status: 'Available',
    });

    // Reset state & close
    setNewVehicle({
      name: '',
      type: 'Truck',
      licensePlate: '',
      region: 'North',
      model: '',
      fuelLevel: 100,
    });
    setFormError('');
    setIsModalOpen(false);
  };

  const handleAddDriver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDriver.name || !newDriver.licenseNumber || !newDriver.phone) {
      setFormError('Please fill in all required fields.');
      return;
    }

    if (drivers.some((d: Driver) => d.licenseNumber.toLowerCase() === newDriver.licenseNumber.toLowerCase())) {
      setFormError('Driver License Number already registered.');
      return;
    }

    createDriverMutation.mutate({
      name: newDriver.name,
      license_number: newDriver.licenseNumber.toUpperCase(),
      license_category: 'Class A',
      license_expiry: new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0],
      contact_number: newDriver.phone,
      safety_score: Number(newDriver.rating),
      status: 'Available',
    });

    setNewDriver({
      name: '',
      licenseNumber: '',
      phone: '',
      rating: 5.0,
    });
    setFormError('');
    setIsModalOpen(false);
  };

  // Status badging styles
  const getVehicleStatusBadge = (status: VehicleStatus) => {
    switch (status) {
      case 'Available':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900';
      case 'On Trip':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900';
      case 'In Shop':
        return 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-900';
      case 'Retired':
        return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900';
      default:
        return 'bg-zinc-100 text-zinc-600';
    }
  };

  const getDriverStatusBadge = (status: DriverStatus) => {
    switch (status) {
      case 'Available':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900';
      case 'On Trip':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900';
      case 'Suspended':
        return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900';
      default:
        return 'bg-zinc-100 text-zinc-600';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Tab Selectors & Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Modern Tabs Toggle Button */}
        <div className="inline-flex rounded-xl bg-zinc-100 dark:bg-zinc-950 p-1 border border-zinc-200/50 dark:border-zinc-900">
          <button
            onClick={() => {
              setActiveTab('vehicles');
              setSearchQuery('');
              setStatusFilter('All');
            }}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-extrabold tracking-wide transition-all cursor-pointer ${
              activeTab === 'vehicles'
                ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Vehicle Fleet ({vehicles.length})</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('drivers');
              setSearchQuery('');
              setStatusFilter('All');
            }}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-extrabold tracking-wide transition-all cursor-pointer ${
              activeTab === 'drivers'
                ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Driver Registry ({drivers.length})</span>
          </button>
        </div>

        {/* Action Button: Conditional registration permission */}
        <div className="relative group">
          <Button
            variant="contained"
            disabled={!hasWritePermission}
            onClick={() => setIsModalOpen(true)}
            className={`flex items-center space-x-1.5 font-bold h-11 text-xs px-5 shadow-sm rounded-xl cursor-pointer ${
              hasWritePermission
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 cursor-not-allowed border border-zinc-300/30'
            }`}
          >
            {!hasWritePermission ? <Lock className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>Register New {activeTab === 'vehicles' ? 'Vehicle' : 'Driver'}</span>
          </Button>

          {/* Warning Tooltip if not Fleet Manager */}
          {!hasWritePermission && (
            <div className="absolute right-0 bottom-full mb-2 scale-0 group-hover:scale-100 transition-all duration-150 bg-zinc-950 text-white text-[10px] font-bold rounded px-2.5 py-1.5 shadow-md pointer-events-none z-50 w-52 text-center">
              Requires <span className="text-purple-400">Fleet Manager</span> role to register new assets.
            </div>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-900 shadow-sm flex flex-col md:flex-row gap-4 items-center transition-all duration-300">
        
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder={
              activeTab === 'vehicles' 
                ? 'Search fleet by name, model, license plate...' 
                : 'Search driver by name, DL number...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs font-semibold pl-10 pr-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-zinc-100"
          />
        </div>

        {/* Status quick select */}
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider whitespace-nowrap">Filter Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-semibold px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-zinc-100 w-full md:w-40"
          >
            <option value="All">All statuses</option>
            {activeTab === 'vehicles' ? (
              <>
                <option value="Available">Available</option>
                <option value="On Trip">On Trip</option>
                <option value="In Shop">In Shop</option>
                <option value="Retired">Retired</option>
              </>
            ) : (
              <>
                <option value="Available">Available</option>
                <option value="On Trip">On Trip</option>
                <option value="Suspended">Suspended</option>
              </>
            )}
          </select>
        </div>
      </div>

      {/* Main Registry Table Display */}
      <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-900 shadow-sm overflow-hidden transition-all duration-300">
        
        {activeTab === 'vehicles' ? (
          /* VEHICLE DATA TABLE */
          <div className="overflow-x-auto">
            {filteredVehicles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center space-y-2">
                <Truck className="w-10 h-10 text-zinc-300 dark:text-zinc-800" />
                <p className="text-sm font-bold text-zinc-500">No vehicles found</p>
                <p className="text-xs text-zinc-400">Try adjusting your filters or search keywords.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-950/50 text-zinc-400 font-extrabold uppercase tracking-wider text-[9px]">
                    <th className="px-6 py-4">Vehicle Model</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">License Plate</th>
                    <th className="px-6 py-4">Region</th>
                    <th className="px-6 py-4">Fuel Status</th>
                    <th className="px-6 py-4">Last Inspected</th>
                    <th className="px-6 py-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900 font-semibold text-zinc-600 dark:text-zinc-400">
                  {filteredVehicles.map((v: Vehicle) => (
                    <tr key={v.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-zinc-800 dark:text-zinc-200">{v.name}</p>
                        <p className="text-[10px] text-zinc-400">{v.model}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 px-2 py-0.5 rounded-md text-[10px]">
                          {v.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono">{v.licensePlate}</td>
                      <td className="px-6 py-4 flex items-center space-x-1 mt-1.5">
                        <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                        <span>{v.region}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-zinc-100 dark:bg-zinc-900 h-1.5 rounded-full overflow-hidden shrink-0">
                            <div 
                              style={{ width: `${v.fuelLevel}%` }} 
                              className={`h-1.5 rounded-full ${
                                v.fuelLevel < 20 ? 'bg-red-500' : v.fuelLevel < 50 ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                            />
                          </div>
                          <span className="font-mono">{v.fuelLevel}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">{v.lastMaintenanceDate}</td>
                      <td className="px-6 py-4 text-right">
                        <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black border ${getVehicleStatusBadge(v.status)}`}>
                          {v.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ) : (
          /* DRIVER DATA TABLE */
          <div className="overflow-x-auto">
            {filteredDrivers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center space-y-2">
                <Users className="w-10 h-10 text-zinc-300 dark:text-zinc-800" />
                <p className="text-sm font-bold text-zinc-500">No drivers found</p>
                <p className="text-xs text-zinc-400">Try adjusting your filters or search keywords.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-950/50 text-zinc-400 font-extrabold uppercase tracking-wider text-[9px]">
                    <th className="px-6 py-4">Driver Name</th>
                    <th className="px-6 py-4">License Number</th>
                    <th className="px-6 py-4">Contact Phone</th>
                    <th className="px-6 py-4">Rating</th>
                    <th className="px-6 py-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900 font-semibold text-zinc-600 dark:text-zinc-400">
                  {filteredDrivers.map((d: Driver) => (
                    <tr key={d.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10 transition-colors">
                      <td className="px-6 py-4 font-bold text-zinc-800 dark:text-zinc-200">
                        {d.name}
                      </td>
                      <td className="px-6 py-4 font-mono">{d.licenseNumber}</td>
                      <td className="px-6 py-4 font-mono">{d.phone}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-1 text-amber-500 font-bold">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>{d.rating.toFixed(1)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black border ${getDriverStatusBadge(d.status)}`}>
                          {d.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* POPUP REGISTRATION MODAL FORM */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop overlay */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsModalOpen(false)}
          />
          
          {/* Form Dialog Panel */}
          <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 w-full max-w-md shadow-2xl relative z-10 overflow-hidden animate-scale-up">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-900 flex justify-between items-center bg-zinc-50 dark:bg-zinc-950">
              <h3 className="font-extrabold text-sm text-zinc-800 dark:text-zinc-200 uppercase tracking-wider flex items-center space-x-2">
                <span>Register New {activeTab === 'vehicles' ? 'Vehicle' : 'Driver'}</span>
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body Forms */}
            <div className="p-6">
              
              {/* Write check warnings */}
              {!hasWritePermission ? (
                <div className="flex items-start space-x-2 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 p-4 rounded-xl text-red-600 dark:text-red-400 text-xs font-semibold mb-4">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>Operational block: Your role '{activeRole}' does not hold registration privileges. Only Fleet Managers may commit new assets.</p>
                </div>
              ) : formError ? (
                <div className="flex items-start space-x-2 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 p-3 rounded-xl text-red-600 dark:text-red-400 text-xs font-semibold mb-4">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              ) : null}

              {activeTab === 'vehicles' ? (
                /* VEHICLE FORM */
                <form onSubmit={handleAddVehicle} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Vehicle Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Kenworth T680 Heavy"
                      value={newVehicle.name}
                      onChange={(e) => setNewVehicle({ ...newVehicle, name: e.target.value })}
                      disabled={!hasWritePermission}
                      className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-zinc-100 disabled:opacity-50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">License Plate *</label>
                      <input
                        type="text"
                        placeholder="e.g. TX-4921-H"
                        value={newVehicle.licensePlate}
                        onChange={(e) => setNewVehicle({ ...newVehicle, licensePlate: e.target.value })}
                        disabled={!hasWritePermission}
                        className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-zinc-100 disabled:opacity-50 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Vehicle Class</label>
                      <select
                        value={newVehicle.type}
                        onChange={(e) => setNewVehicle({ ...newVehicle, type: e.target.value as VehicleType })}
                        disabled={!hasWritePermission}
                        className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-zinc-100 disabled:opacity-50"
                      >
                        <option value="Truck">Truck</option>
                        <option value="Van">Van</option>
                        <option value="Sedan">Sedan</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Model &amp; Year *</label>
                    <input
                      type="text"
                      placeholder="e.g. Kenworth 2024"
                      value={newVehicle.model}
                      onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                      disabled={!hasWritePermission}
                      className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-zinc-100 disabled:opacity-50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Region</label>
                      <select
                        value={newVehicle.region}
                        onChange={(e) => setNewVehicle({ ...newVehicle, region: e.target.value as any })}
                        disabled={!hasWritePermission}
                        className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-zinc-100 disabled:opacity-50"
                      >
                        <option value="North">North</option>
                        <option value="South">South</option>
                        <option value="East">East</option>
                        <option value="West">West</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Fuel Level (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={newVehicle.fuelLevel}
                        onChange={(e) => setNewVehicle({ ...newVehicle, fuelLevel: Number(e.target.value) })}
                        disabled={!hasWritePermission}
                        className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-zinc-100 disabled:opacity-50"
                      />
                    </div>
                  </div>

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
                      disabled={!hasWritePermission}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2 rounded-xl"
                    >
                      Register Asset
                    </Button>
                  </div>
                </form>
              ) : (
                /* DRIVER FORM */
                <form onSubmit={handleAddDriver} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Driver Full Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Arthur Pendragon"
                      value={newDriver.name}
                      onChange={(e) => setNewDriver({ ...newDriver, name: e.target.value })}
                      disabled={!hasWritePermission}
                      className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-zinc-100 disabled:opacity-50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">License Number *</label>
                      <input
                        type="text"
                        placeholder="e.g. DL-99238"
                        value={newDriver.licenseNumber}
                        onChange={(e) => setNewDriver({ ...newDriver, licenseNumber: e.target.value })}
                        disabled={!hasWritePermission}
                        className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-zinc-100 disabled:opacity-50 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Initial Rating</label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        step="0.1"
                        value={newDriver.rating}
                        onChange={(e) => setNewDriver({ ...newDriver, rating: Number(e.target.value) })}
                        disabled={!hasWritePermission}
                        className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-zinc-100 disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Contact Phone *</label>
                    <input
                      type="text"
                      placeholder="e.g. +1-555-0100"
                      value={newDriver.phone}
                      onChange={(e) => setNewDriver({ ...newDriver, phone: e.target.value })}
                      disabled={!hasWritePermission}
                      className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-zinc-100 disabled:opacity-50 font-mono"
                    />
                  </div>

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
                      disabled={!hasWritePermission}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2 rounded-xl"
                    >
                      Register Driver
                    </Button>
                  </div>
                </form>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default VehicleRegistry;
