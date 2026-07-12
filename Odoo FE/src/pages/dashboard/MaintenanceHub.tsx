import React, { useState, useMemo } from 'react';
import { useTransitStore, type LogType, type Vehicle } from '@/store/transitStore';
import { 
  useVehicles, 
  useCreateMaintenanceLog, 
  useCreateFuelLog, 
  useCreateExpenseLog, 
  useResolveMaintenanceLog 
} from '@/hooks/useTransitApi';
import { 
  Wrench, 
  Fuel, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  Plus, 
  ListFilter, 
  AlertCircle,
  Truck,
  Calendar,
  Lock
} from 'lucide-react';
import Button from '@/components/ui/Button';

export const MaintenanceHub: React.FC = () => {
  const { data: vehicles = [] } = useVehicles();
  const logs = useTransitStore((state) => state.logs);
  const activeRole = useTransitStore((state) => state.activeRole);

  const createMaintenanceMutation = useCreateMaintenanceLog();
  const createFuelLogMutation = useCreateFuelLog();
  const createExpenseMutation = useCreateExpenseLog();
  const resolveMaintenanceMutation = useResolveMaintenanceLog();

  // Tab State: 'fuel' | 'maintenance' | 'tolls'
  const [activeFormTab, setActiveFormTab] = useState<'fuel' | 'maintenance' | 'tolls'>('fuel');

  // History filter
  const [logTypeFilter, setLogTypeFilter] = useState<'All' | LogType>('All');

  // Form states
  const [vehicleId, setVehicleId] = useState('');
  const [cost, setCost] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [liters, setLiters] = useState('');
  const [maintStatus, setMaintStatus] = useState<'Active' | 'Closed'>('Active');
  
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // RBAC Permission Logic
  const canLogFuel = activeRole === 'Fleet Manager' || activeRole === 'Driver';
  const canLogMaint = activeRole === 'Fleet Manager' || activeRole === 'Safety Officer';
  const canLogTolls = activeRole === 'Fleet Manager' || activeRole === 'Financial Analyst';
  
  const canResolveMaint = activeRole === 'Fleet Manager' || activeRole === 'Safety Officer';

  // Stats summaries
  const totals = useMemo(() => {
    const fuelCost = logs.filter(l => l.type === 'Fuel').reduce((sum, l) => sum + l.cost, 0);
    const maintCost = logs.filter(l => l.type === 'Maintenance').reduce((sum, l) => sum + l.cost, 0);
    const tollsCost = logs.filter(l => l.type === 'Expense').reduce((sum, l) => sum + l.cost, 0);
    const activeRepairCount = logs.filter(l => l.type === 'Maintenance' && l.status === 'Active').length;

    return {
      fuelCost,
      maintCost,
      tollsCost,
      totalCost: fuelCost + maintCost + tollsCost,
      activeRepairs: activeRepairCount
    };
  }, [logs]);

  // Filtered Logs list
  const filteredLogs = useMemo(() => {
    return logs
      .filter((log) => logTypeFilter === 'All' || log.type === logTypeFilter)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [logs, logTypeFilter]);

  // Form submission handler
  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    // Check permissions
    if (activeFormTab === 'fuel' && !canLogFuel) {
      setFormError(`Action Blocked: '${activeRole}' role is not permitted to log Fuel.`);
      return;
    }
    if (activeFormTab === 'maintenance' && !canLogMaint) {
      setFormError(`Action Blocked: '${activeRole}' role is not permitted to log repairs.`);
      return;
    }
    if (activeFormTab === 'tolls' && !canLogTolls) {
      setFormError(`Action Blocked: '${activeRole}' role is not permitted to log tolls.`);
      return;
    }

    if (!vehicleId || !cost || !date || !description) {
      setFormError('Please fill out all required fields.');
      return;
    }

    if (activeFormTab === 'fuel' && !liters) {
      setFormError('Fuel logging requires liters quantity.');
      return;
    }

    if (activeFormTab === 'fuel') {
      createFuelLogMutation.mutate({
        liters: Number(liters),
        cost: Number(cost),
        log_date: date,
        vehicle_id: vehicleId,
      });
    } else if (activeFormTab === 'maintenance') {
      createMaintenanceMutation.mutate({
        description,
        cost: Number(cost),
        entry_date: date,
        status: maintStatus,
        vehicle_id: vehicleId,
      });
    } else {
      createExpenseMutation.mutate({
        category: 'Tolls/Misc',
        amount: Number(cost),
        expense_date: date,
        vehicle_id: vehicleId,
      });
    }

    // Reset Form
    setVehicleId('');
    setCost('');
    setDescription('');
    setLiters('');
    setFormSuccess(`${activeFormTab.toUpperCase()} log recorded successfully!`);
    
    // Clear success after 3s
    setTimeout(() => setFormSuccess(''), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* KPI Stats summaries */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Total Ledger Costs */}
        <div className="bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-900 shadow-sm">
          <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Total Ledger Expense</span>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xl font-black text-zinc-900 dark:text-white">${totals.totalCost.toLocaleString()}</span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Fuel Costs */}
        <div className="bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-900 shadow-sm">
          <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Fuel Costs</span>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xl font-black text-zinc-950 dark:text-white">${totals.fuelCost.toLocaleString()}</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400">
              <Fuel className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Maintenance Costs */}
        <div className="bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-900 shadow-sm">
          <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Workshop Repairs</span>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xl font-black text-zinc-900 dark:text-white">${totals.maintCost.toLocaleString()}</span>
            <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Active Repair Shop Alert */}
        <div className="bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-900 shadow-sm">
          <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Vehicles In Shop</span>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xl font-black text-zinc-900 dark:text-white">{totals.activeRepairs} Active</span>
            <div className="p-2 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
        </div>

      </div>

      {/* Action form + Ledgers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ACTIONABLE LOG FORMS */}
        <div className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-900 shadow-sm h-fit space-y-4">
          <div className="border-b border-zinc-100 dark:border-zinc-900 pb-3">
            <h3 className="font-bold text-sm text-zinc-800 dark:text-zinc-200">
              Record Operational Costs
            </h3>
            <p className="text-[10px] text-zinc-400 mt-0.5">Select a category to post transaction records</p>
          </div>

          {/* Form Tabs selector */}
          <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 shrink-0">
            <button
              onClick={() => {
                setActiveFormTab('fuel');
                setFormError('');
                setFormSuccess('');
              }}
              className={`py-1.5 text-[10px] font-extrabold rounded-lg tracking-wide transition-all cursor-pointer ${
                activeFormTab === 'fuel'
                  ? 'bg-white dark:bg-zinc-950 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              Fuel Log
            </button>
            <button
              onClick={() => {
                setActiveFormTab('maintenance');
                setFormError('');
                setFormSuccess('');
              }}
              className={`py-1.5 text-[10px] font-extrabold rounded-lg tracking-wide transition-all cursor-pointer ${
                activeFormTab === 'maintenance'
                  ? 'bg-white dark:bg-zinc-950 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              Maintenance
            </button>
            <button
              onClick={() => {
                setActiveFormTab('tolls');
                setFormError('');
                setFormSuccess('');
              }}
              className={`py-1.5 text-[10px] font-extrabold rounded-lg tracking-wide transition-all cursor-pointer ${
                activeFormTab === 'tolls'
                  ? 'bg-white dark:bg-zinc-950 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              Tolls &amp; Toll passes
            </button>
          </div>

          {/* Action form */}
          <form onSubmit={handleAddLog} className="space-y-3">
            
            {/* Feedback messages */}
            {formError && (
              <div className="flex items-start space-x-1.5 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 p-2.5 rounded-lg text-red-600 dark:text-red-400 text-[10px] font-semibold">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{formError}</span>
              </div>
            )}
            {formSuccess && (
              <div className="flex items-start space-x-1.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 p-2.5 rounded-lg text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>{formSuccess}</span>
              </div>
            )}

            {/* Select Vehicle */}
            <div>
              <label className="block text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Target Fleet Vehicle *</label>
              <select
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-zinc-100"
              >
                <option value="">-- Select Vehicle --</option>
                {vehicles.map((v: Vehicle) => (
                  <option key={v.id} value={v.id}>{v.name} ({v.licensePlate})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Cost Amount */}
              <div>
                <label className="block text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Cost (USD) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xs font-bold">$</span>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    className="w-full text-xs font-semibold pl-6 pr-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-zinc-100 font-mono"
                  />
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="block text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Transaction Date *</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-zinc-100 font-mono"
                />
              </div>
            </div>

            {/* Fuel Tab Specific Fields */}
            {activeFormTab === 'fuel' && (
              <div>
                <label className="block text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Refuel Quantity (Liters) *</label>
                <input
                  type="number"
                  placeholder="e.g. 150"
                  value={liters}
                  onChange={(e) => setLiters(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-zinc-100 font-mono"
                />
              </div>
            )}

            {/* Maintenance Tab Specific Fields */}
            {activeFormTab === 'maintenance' && (
              <div>
                <label className="block text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Repair Status</label>
                <select
                  value={maintStatus}
                  onChange={(e) => setMaintStatus(e.target.value as any)}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-zinc-100"
                >
                  <option value="Active">Active (Vehicle sent to Shop / Unavailable)</option>
                  <option value="Closed">Closed / Completed (Vehicle available)</option>
                </select>
              </div>
            )}

            {/* Description (Common) */}
            <div>
              <label className="block text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Log Description *</label>
              <textarea
                placeholder={
                  activeFormTab === 'fuel' 
                    ? 'Diesel refuel at Chevron station' 
                    : activeFormTab === 'maintenance'
                      ? 'Replaced front tires / regular oil flush'
                      : 'Toll pass invoice'
                }
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-zinc-100"
              />
            </div>

            {/* Submit Button with RBAC warnings */}
            <div className="pt-2">
              <Button
                variant="contained"
                type="submit"
                className="w-full flex items-center justify-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold h-10 text-xs cursor-pointer shadow"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Submit Expense Log</span>
              </Button>
            </div>

          </form>
        </div>

        {/* LOGS HISTORY & RESOLUTIONS LEDGER */}
        <div className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-900 shadow-sm lg:col-span-2 space-y-4">
          
          {/* History Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-3 gap-3">
            <div>
              <h3 className="font-bold text-sm text-zinc-800 dark:text-zinc-200">
                Expense &amp; Repair Ledgers
              </h3>
              <p className="text-[10px] text-zinc-400 mt-0.5">Filter by log category</p>
            </div>

            {/* Quick history filter */}
            <div className="flex items-center space-x-2">
              <ListFilter className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <select
                value={logTypeFilter}
                onChange={(e) => setLogTypeFilter(e.target.value as any)}
                className="text-xs font-semibold px-2 py-1 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-zinc-100 w-32"
              >
                <option value="All">All Expenses</option>
                <option value="Fuel">Fuel Logs</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Expense">Tolls / Misc</option>
              </select>
            </div>
          </div>

          {/* Ledger History List */}
          <div className="space-y-3 overflow-y-auto max-h-[400px] pr-1">
            {filteredLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center text-zinc-400">
                <ListFilter className="w-8 h-8 stroke-1 mb-2" />
                <span className="text-xs font-semibold">No transactions match the search filters.</span>
              </div>
            ) : (
              filteredLogs.map((log) => {
                const vehicleObj = vehicles.find((v: Vehicle) => v.id === log.vehicleId);
                
                // Color codes
                const logTypeColors = {
                  Fuel: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400',
                  Maintenance: 'bg-orange-50 text-orange-600 dark:bg-orange-950/20 dark:text-orange-400',
                  Expense: 'bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400',
                };

                return (
                  <div 
                    key={log.id} 
                    className="flex flex-col sm:flex-row sm:items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/10 p-3 rounded-xl border border-zinc-200/40 dark:border-zinc-900/60 text-xs gap-3 hover:border-zinc-300 dark:hover:border-zinc-800 transition-all duration-200"
                  >
                    
                    {/* Left: Type badge + Details */}
                    <div className="flex items-start space-x-3 min-w-0">
                      <div className={`p-2 rounded-xl shrink-0 ${logTypeColors[log.type]}`}>
                        {log.type === 'Fuel' ? <Fuel className="w-4 h-4" /> : <Wrench className="w-4 h-4" />}
                      </div>
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center space-x-2 flex-wrap">
                          <span className="font-bold text-zinc-800 dark:text-zinc-200 truncate">{log.description}</span>
                          {log.type === 'Maintenance' && (
                            <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-black tracking-wider uppercase border ${
                              log.status === 'Active' 
                                ? 'bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-900' 
                                : 'bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-900'
                            }`}>
                              {log.status === 'Active' ? 'In Repair Shop' : 'Resolved'}
                            </span>
                          )}
                        </div>
                        
                        {/* Vehicle & Date info */}
                        <div className="flex items-center space-x-3 text-[10px] text-zinc-400 dark:text-zinc-500 flex-wrap">
                          <span className="flex items-center space-x-1">
                            <Truck className="w-3.5 h-3.5 shrink-0" />
                            <span>{vehicleObj?.name || 'Unknown'} ({vehicleObj?.licensePlate || 'N/A'})</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-3.5 h-3.5 shrink-0" />
                            <span>{log.date}</span>
                          </span>
                          {log.liters && (
                            <span className="font-mono">({log.liters} Liters)</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Cost + Action (resolve active maintenance) */}
                    <div className="flex items-center justify-between sm:justify-end space-x-4 border-t sm:border-t-0 border-zinc-200/50 dark:border-zinc-800 pt-2 sm:pt-0 shrink-0">
                      <span className="font-extrabold text-sm text-zinc-800 dark:text-zinc-100 font-mono">
                        ${log.cost}
                      </span>
                      
                      {/* Active maintenance resolution trigger */}
                      {log.type === 'Maintenance' && log.status === 'Active' && (
                        <div className="relative group">
                          <button
                            disabled={!canResolveMaint}
                            onClick={() => resolveMaintenanceMutation.mutate({ id: log.id, status: 'Closed' })}
                            className={`flex items-center justify-center space-x-1 px-3 py-1.5 rounded-lg text-[10px] font-extrabold cursor-pointer border shadow-sm transition-all duration-200 ${
                              canResolveMaint 
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500/10' 
                                : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-400 cursor-not-allowed border-zinc-200/50 dark:border-zinc-800'
                            }`}
                          >
                            {!canResolveMaint ? <Lock className="w-3 h-3" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                            <span>Close Repair</span>
                          </button>

                          {!canResolveMaint && (
                            <div className="absolute right-0 bottom-full mb-2 scale-0 group-hover:scale-100 transition-all duration-150 bg-zinc-950 text-white text-[9px] font-bold rounded px-2 py-1 shadow-md pointer-events-none z-50 w-44 text-center">
                              Requires <span className="text-emerald-400">Safety Officer</span> or <span className="text-purple-400">Fleet Manager</span>.
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default MaintenanceHub;
