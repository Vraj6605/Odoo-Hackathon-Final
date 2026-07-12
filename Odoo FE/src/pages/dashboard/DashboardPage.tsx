import React, { useState, useMemo } from 'react';
import { 
  useVehicles, 
  useDrivers, 
  useTrips, 
  useDashboardKPIs, 
  useReportsAnalytics 
} from '@/hooks/useTransitApi';
import { useTransitStore, type Vehicle, type Driver, type Trip } from '@/store/transitStore';
import { 
  Truck, 
  Users, 
  TrendingUp, 
  MapPin, 
  Wrench, 
  DollarSign, 
  Activity, 
  Filter, 
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  XCircle,
  HelpCircle
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  // Filters state
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedRegion, setSelectedRegion] = useState<string>('All');

  // React Query API hooks
  const { data: vehicles = [] } = useVehicles();
  const { data: drivers = [] } = useDrivers();
  const { data: trips = [] } = useTrips();
  const logs = useTransitStore((state) => state.logs);
  
  const { data: kpis } = useDashboardKPIs({
    vehicle_type: selectedType,
    status: selectedStatus,
    region: selectedRegion,
  });

  const { data: reportAnalytics } = useReportsAnalytics({
    vehicle_type: selectedType,
    status: selectedStatus,
    region: selectedRegion,
  });

  // Filter options
  const typeOptions = ['All', 'Truck', 'Van', 'Sedan'];
  const statusOptions = ['All', 'Available', 'On Trip', 'In Shop', 'Retired'];
  const regionOptions = ['All', 'North', 'South', 'East', 'West'];

  // Handle reset filters
  const resetFilters = () => {
    setSelectedType('All');
    setSelectedStatus('All');
    setSelectedRegion('All');
  };

  // Dynamic statistics from API Query
  const stats = useMemo(() => {
    return {
      totalVehicles: kpis?.totalVehicles ?? 0,
      activeVehicles: kpis?.activeVehicles ?? 0,
      availableVehicles: kpis?.availableVehicles ?? 0,
      inMaintenance: kpis?.inMaintenance ?? 0,
      activeTrips: kpis?.activeTrips ?? 0,
      pendingTrips: kpis?.pendingTrips ?? 0,
      driversOnDuty: kpis?.driversOnDuty ?? 0,
      utilization: kpis?.utilization ?? 0,
    };
  }, [kpis]);

  // Expenses calculations from reports API
  const costBreakdown = useMemo(() => {
    const fuel = reportAnalytics?.fuel ?? 0;
    const maint = reportAnalytics?.maint ?? 0;
    const misc = reportAnalytics?.misc ?? 0;
    const total = reportAnalytics?.total ?? (fuel + maint + misc);

    return { fuel, maint, misc, total };
  }, [reportAnalytics]);

  // Filtered vehicles for the mini list
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v: Vehicle) => {
      const typeMatch = selectedType === 'All' || v.type === selectedType;
      const statusMatch = selectedStatus === 'All' || v.status === selectedStatus;
      const regionMatch = selectedRegion === 'All' || v.region === selectedRegion;
      return typeMatch && statusMatch && regionMatch;
    });
  }, [vehicles, selectedType, selectedStatus, selectedRegion]);

  // Custom SVGs charts data
  const fuelPct = costBreakdown.total > 0 ? (costBreakdown.fuel / costBreakdown.total) * 100 : 33;
  const maintPct = costBreakdown.total > 0 ? (costBreakdown.maint / costBreakdown.total) * 100 : 33;
  const miscPct = costBreakdown.total > 0 ? (costBreakdown.misc / costBreakdown.total) * 100 : 34;

  const mockWeeklyData = [
    { day: 'Mon', cost: 1200, trips: 14 },
    { day: 'Tue', cost: 1500, trips: 18 },
    { day: 'Wed', cost: 980, trips: 11 },
    { day: 'Thu', cost: 1700, trips: 20 },
    { day: 'Fri', cost: 2100, trips: 23 },
    { day: 'Sat', cost: 1100, trips: 12 },
    { day: 'Sun', cost: 850, trips: 8 },
  ];

  return (
    <div className="space-y-6">
      
      {/* 1. Filter Tray Component */}
      <div className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-900 shadow-sm transition-all duration-300">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-blue-50 dark:bg-blue-950/40 rounded-xl text-blue-600 dark:text-blue-400">
              <Filter className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-white">Fleet Filter Controls</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Filter widgets and vehicle summary below</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:max-w-2xl">
            {/* Vehicle Type Select */}
            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Vehicle Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-zinc-100"
              >
                {typeOptions.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* Vehicle Status Select */}
            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Operational Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-zinc-100"
              >
                {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Region Select */}
            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Operating Region</label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-zinc-100"
              >
                {regionOptions.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>

          {(selectedType !== 'All' || selectedStatus !== 'All' || selectedRegion !== 'All') && (
            <button
              onClick={resetFilters}
              className="flex items-center justify-center space-x-1.5 px-4 py-2 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-xl text-xs font-bold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 cursor-pointer w-full lg:w-auto shrink-0 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. KPI Summary Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
        {/* Active Vehicles */}
        <div className="bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-900 shadow-sm transition-all duration-300">
          <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Active Vehicles</p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-zinc-900 dark:text-white">{stats.activeVehicles}</span>
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <span className="text-[10px] text-zinc-400 mt-1 block">Vehicles currently on road</span>
        </div>

        {/* Available Vehicles */}
        <div className="bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-900 shadow-sm transition-all duration-300">
          <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Available Fleet</p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-zinc-900 dark:text-white">{stats.availableVehicles}</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <span className="text-[10px] text-zinc-400 mt-1 block">Ready for dispatching</span>
        </div>

        {/* Vehicles in Maintenance */}
        <div className="bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-900 shadow-sm transition-all duration-300">
          <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">In Maintenance</p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-zinc-900 dark:text-white">{stats.inMaintenance}</span>
            <div className="p-1.5 rounded-lg bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <span className="text-[10px] text-zinc-400 mt-1 block">In workshop repair</span>
        </div>

        {/* Active Trips */}
        <div className="bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-900 shadow-sm transition-all duration-300">
          <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Active Trips</p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-zinc-900 dark:text-white">{stats.activeTrips}</span>
            <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <span className="text-[10px] text-zinc-400 mt-1 block">Dispatched deliveries</span>
        </div>

        {/* Pending Trips */}
        <div className="bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-900 shadow-sm transition-all duration-300">
          <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Pending Trips</p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-zinc-900 dark:text-white">{stats.pendingTrips}</span>
            <div className="p-1.5 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 text-yellow-600 dark:text-yellow-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <span className="text-[10px] text-zinc-400 mt-1 block">Drafts awaiting dispatch</span>
        </div>

        {/* Drivers On Duty */}
        <div className="bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-900 shadow-sm transition-all duration-300">
          <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Drivers on Duty</p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-zinc-900 dark:text-white">{stats.driversOnDuty}</span>
            <div className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/20 text-teal-600 dark:text-teal-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <span className="text-[10px] text-zinc-400 mt-1 block">Active available/busy</span>
        </div>

        {/* Fleet Utilization */}
        <div className="bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-900 shadow-sm transition-all duration-300 col-span-2 md:col-span-1">
          <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Fleet Utilization</p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-zinc-900 dark:text-white">{stats.utilization}%</span>
            <div className="p-1.5 rounded-lg bg-pink-50 dark:bg-pink-950/20 text-pink-600 dark:text-pink-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          {/* Visual Mini Progress Bar */}
          <div className="w-full bg-zinc-100 dark:bg-zinc-900 rounded-full h-1.5 mt-2">
            <div 
              className="bg-pink-500 h-1.5 rounded-full transition-all duration-500" 
              style={{ width: `${stats.utilization}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3. Analytical Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Cost Breakdown Pie/Donut Chart */}
        <div className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-900 shadow-sm transition-all duration-300 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-3">
            <h3 className="font-bold text-sm text-zinc-800 dark:text-zinc-200 flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-zinc-400" />
              <span>Operational Expense Ledger</span>
            </h3>
            <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 px-2.5 py-1 rounded-lg">
              Total: ${costBreakdown.total.toLocaleString()}
            </span>
          </div>

          {/* Premium CSS Chart Visualizer */}
          <div className="flex flex-col items-center justify-center py-4">
            <div className="relative w-36 h-36 flex items-center justify-center">
              {/* Custom SVG Donut Chart */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="var(--border)" strokeWidth="12" />
                {/* Fuel Segment */}
                {costBreakdown.total > 0 && (
                  <circle
                    cx="50" cy="50" r="40"
                    fill="transparent"
                    stroke="#3b82f6" // blue
                    strokeWidth="12"
                    strokeDasharray={`${fuelPct * 2.51} 251`}
                    strokeDashoffset="0"
                  />
                )}
                {/* Maintenance Segment */}
                {costBreakdown.total > 0 && (
                  <circle
                    cx="50" cy="50" r="40"
                    fill="transparent"
                    stroke="#f59e0b" // amber/orange
                    strokeWidth="12"
                    strokeDasharray={`${maintPct * 2.51} 251`}
                    strokeDashoffset={`-${fuelPct * 2.51}`}
                  />
                )}
                {/* Misc Segment */}
                {costBreakdown.total > 0 && (
                  <circle
                    cx="50" cy="50" r="40"
                    fill="transparent"
                    stroke="#10b981" // emerald
                    strokeWidth="12"
                    strokeDasharray={`${miscPct * 2.51} 251`}
                    strokeDashoffset={`-${(fuelPct + maintPct) * 2.51}`}
                  />
                )}
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Costs</span>
                <span className="text-lg font-black text-zinc-800 dark:text-zinc-100">${costBreakdown.total}</span>
              </div>
            </div>

            {/* Legends */}
            <div className="grid grid-cols-3 gap-3 w-full mt-6 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
              <div className="flex flex-col items-center p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center space-x-1.5 text-blue-600 dark:text-blue-400 font-bold mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span>Fuel</span>
                </div>
                <span>${costBreakdown.fuel}</span>
                <span className="text-[9px] text-zinc-400">({Math.round(fuelPct)}%)</span>
              </div>
              <div className="flex flex-col items-center p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center space-x-1.5 text-amber-600 dark:text-amber-400 font-bold mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span>Maint</span>
                </div>
                <span>${costBreakdown.maint}</span>
                <span className="text-[9px] text-zinc-400">({Math.round(maintPct)}%)</span>
              </div>
              <div className="flex flex-col items-center p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center space-x-1.5 text-emerald-600 dark:text-emerald-400 font-bold mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>Tolls</span>
                </div>
                <span>${costBreakdown.misc}</span>
                <span className="text-[9px] text-zinc-400">({Math.round(miscPct)}%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Operational Efficiency (Bar Chart SVG) */}
        <div className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-900 shadow-sm transition-all duration-300 space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-3">
            <h3 className="font-bold text-sm text-zinc-800 dark:text-zinc-200 flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-zinc-400" />
              <span>Weekly Fleet Delivery &amp; Cost Trend</span>
            </h3>
            <span className="text-xs text-zinc-400">Avg Cost/Trip: $118</span>
          </div>

          {/* SVG Custom Bar Chart */}
          <div className="w-full pt-2">
            <div className="h-48 w-full flex items-end justify-between px-2 border-b border-zinc-200 dark:border-zinc-800">
              {mockWeeklyData.map((data, idx) => {
                // Normalize height relative to max cost $2100
                const costHeight = (data.cost / 2200) * 100;
                // Normalize trips height relative to max 25
                const tripHeight = (data.trips / 25) * 100;

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center group relative mx-1 sm:mx-2">
                    {/* Tooltip on Hover */}
                    <div className="absolute bottom-full mb-2 scale-0 group-hover:scale-100 transition-all duration-200 bg-zinc-950 text-white dark:bg-zinc-800 p-2 rounded shadow-md z-50 text-[10px] text-center pointer-events-none w-28">
                      <p className="font-bold border-b border-zinc-800 pb-1 mb-1">{data.day} Details</p>
                      <p className="text-blue-400">Trips: <span className="font-bold text-white">{data.trips}</span></p>
                      <p className="text-emerald-400">Cost: <span className="font-bold text-white">${data.cost}</span></p>
                    </div>

                    <div className="w-full flex justify-center items-end space-x-1.5 h-36">
                      {/* Trips Bar (Blue) */}
                      <div 
                        style={{ height: `${tripHeight}%` }} 
                        className="w-2.5 sm:w-3.5 bg-blue-500 hover:bg-blue-600 rounded-t-sm transition-all duration-500"
                      />
                      {/* Cost Bar (Amber) */}
                      <div 
                        style={{ height: `${costHeight}%` }} 
                        className="w-2.5 sm:w-3.5 bg-amber-500 hover:bg-amber-600 rounded-t-sm transition-all duration-500"
                      />
                    </div>

                    <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 mt-2 block shrink-0">
                      {data.day}
                    </span>
                  </div>
                );
              })}
            </div>
            
            {/* Chart Legend */}
            <div className="flex items-center justify-center space-x-6 mt-4 text-[10px] font-bold text-zinc-500 dark:text-zinc-400">
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 bg-blue-500 rounded-sm" />
                <span>Total Dispatches</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 bg-amber-500 rounded-sm" />
                <span>Operating Costs ($)</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 4. Active Fleet Summary & Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Vehicles Registry Matching Filters */}
        <div className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-900 shadow-sm transition-all duration-300 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-3">
            <h3 className="font-bold text-sm text-zinc-800 dark:text-zinc-200">
              Filtered Fleet Status ({filteredVehicles.length} vehicles)
            </h3>
            <span className="text-[10px] font-bold text-zinc-400">Showing assets matching search criteria</span>
          </div>

          {filteredVehicles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center space-y-2">
              <AlertTriangle className="w-8 h-8 text-zinc-400" />
              <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">No vehicles match the selected filter combination.</p>
              <button 
                onClick={resetFilters} 
                className="text-[11px] font-bold text-blue-600 hover:text-blue-500 cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-100 dark:border-zinc-900 text-zinc-400 font-bold">
                    <th className="py-2.5">Asset Name</th>
                    <th className="py-2.5">Plate</th>
                    <th className="py-2.5">Region</th>
                    <th className="py-2.5">Fuel</th>
                    <th className="py-2.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900 font-semibold text-zinc-600 dark:text-zinc-400">
                  {filteredVehicles.map((vehicle: Vehicle) => {
                    const statusColors: Record<string, string> = {
                      Available: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900',
                      'On Trip': 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900',
                      'In Shop': 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-900',
                      Retired: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900',
                    };

                    return (
                      <tr key={vehicle.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-colors">
                        <td className="py-3">
                          <p className="font-bold text-zinc-800 dark:text-zinc-200">{vehicle.name}</p>
                          <p className="text-[10px] text-zinc-400">{vehicle.model}</p>
                        </td>
                        <td className="py-3">{vehicle.licensePlate}</td>
                        <td className="py-3">{vehicle.region}</td>
                        <td className="py-3">
                          <div className="flex items-center space-x-1.5">
                            <div className="w-12 bg-zinc-100 dark:bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                              <div 
                                style={{ width: `${vehicle.fuelLevel}%` }} 
                                className={`h-1.5 rounded-full ${
                                  vehicle.fuelLevel < 20 ? 'bg-red-500' : vehicle.fuelLevel < 50 ? 'bg-amber-500' : 'bg-emerald-500'
                                }`} 
                              />
                            </div>
                            <span>{vehicle.fuelLevel}%</span>
                          </div>
                        </td>
                        <td className="py-3 text-right">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${statusColors[vehicle.status] || ''}`}>
                            {vehicle.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Activity Logs (Logs list from Store + simulated actions) */}
        <div className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-900 shadow-sm transition-all duration-300 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-3">
            <h3 className="font-bold text-sm text-zinc-800 dark:text-zinc-200 flex items-center space-x-2">
              <Activity className="w-4 h-4 text-zinc-400" />
              <span>Real-Time Activity Log</span>
            </h3>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          <div className="space-y-4 overflow-y-auto max-h-[310px] pr-1">
            {/* Custom derived logs from Trips and Maintenance Logs */}
            {trips.length === 0 && logs.length === 0 ? (
              <p className="text-xs text-zinc-400 text-center py-10">No activities logged yet.</p>
            ) : (
              [
                ...trips.map((t: Trip) => ({
                  type: 'trip',
                  time: 'Active Date: ' + t.date,
                  title: `Trip ${t.id} - ${t.status}`,
                  desc: `${t.source} ➔ ${t.destination} (Driver: ${drivers.find((d: Driver) => d.id === t.driverId)?.name || 'N/A'})`,
                  icon: t.status === 'Dispatched' ? <TrendingUp className="w-3.5 h-3.5 text-blue-500" /> : t.status === 'Completed' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : t.status === 'Cancelled' ? <XCircle className="w-3.5 h-3.5 text-red-500" /> : <HelpCircle className="w-3.5 h-3.5 text-zinc-400" />,
                  bg: t.status === 'Dispatched' ? 'bg-blue-50 dark:bg-blue-950/20' : t.status === 'Completed' ? 'bg-emerald-50 dark:bg-emerald-950/20' : t.status === 'Cancelled' ? 'bg-red-50 dark:bg-red-950/20' : 'bg-zinc-50 dark:bg-zinc-900/50'
                })),
                ...logs.map((l: any) => ({
                  type: 'log',
                  time: l.date,
                  title: `${l.type} logged on ${vehicles.find((v: Vehicle) => v.id === l.vehicleId)?.name || 'Vehicle'}`,
                  desc: `${l.description} (Cost: $${l.cost})`,
                  icon: l.type === 'Fuel' ? <DollarSign className="w-3.5 h-3.5 text-blue-500" /> : l.type === 'Maintenance' ? <Wrench className="w-3.5 h-3.5 text-orange-500" /> : <DollarSign className="w-3.5 h-3.5 text-emerald-500" />,
                  bg: l.type === 'Fuel' ? 'bg-blue-50 dark:bg-blue-950/20' : l.type === 'Maintenance' ? 'bg-orange-50 dark:bg-orange-950/20' : 'bg-emerald-50 dark:bg-emerald-950/20'
                }))
              ]
              .sort((a, b) => b.time.localeCompare(a.time)) // Order by date/time
              .slice(0, 5)
              .map((item, idx) => (
                <div key={idx} className="flex items-start space-x-3 text-xs leading-relaxed">
                  <div className={`p-2 rounded-xl shrink-0 ${item.bg}`}>
                    {item.icon}
                  </div>
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <p className="font-bold text-zinc-800 dark:text-zinc-200 truncate">{item.title}</p>
                    <p className="text-zinc-500 dark:text-zinc-400">{item.desc}</p>
                    <p className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500">{item.time}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default DashboardPage;
