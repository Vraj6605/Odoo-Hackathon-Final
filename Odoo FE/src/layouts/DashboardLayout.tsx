import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useGlobalStore } from '@/store/globalStore';
import { useTransitStore, type TransitRole } from '@/store/transitStore';
import { ROUTES } from '@/constants/routes';
import ThemeToggle from '@/components/theme/ThemeToggle';
import Button from '@/components/ui/Button';
import { 
  LayoutDashboard, 
  Truck, 
  Navigation, 
  Wrench, 
  LogOut, 
  Menu, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Shield,
  UserCheck,
  Scale
} from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, clearAuth } = useGlobalStore();
  const { activeRole, setActiveRole } = useTransitStore();
  
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    clearAuth();
    navigate(ROUTES.LOGIN);
  };

  const roles: { value: TransitRole; label: string; color: string; desc: string; icon: React.ReactNode }[] = [
    { 
      value: 'Fleet Manager', 
      label: 'Fleet Manager', 
      color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800', 
      desc: 'Full read/write permissions for all fleet operations.',
      icon: <UserCheck className="w-4 h-4 text-purple-500" />
    },
    { 
      value: 'Driver', 
      label: 'Driver', 
      color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800', 
      desc: 'Log fuel, check active trip assignment.',
      icon: <Truck className="w-4 h-4 text-blue-500" />
    },
    { 
      value: 'Safety Officer', 
      label: 'Safety Officer', 
      color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800', 
      desc: 'Monitor health, logs, and maintenance alerts.',
      icon: <Shield className="w-4 h-4 text-emerald-500" />
    },
    { 
      value: 'Financial Analyst', 
      label: 'Financial Analyst', 
      color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800', 
      desc: 'Access tolls, fuel, and cost ledgers.',
      icon: <Scale className="w-4 h-4 text-amber-500" />
    },
  ];

  const menuItems = [
    { text: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, path: ROUTES.DASHBOARD },
    { text: 'Vehicles & Drivers', icon: <Truck className="w-5 h-5" />, path: ROUTES.VEHICLES },
    { text: 'Trip Management', icon: <Navigation className="w-5 h-5" />, path: ROUTES.TRIPS },
    { text: 'Maintenance Hub', icon: <Wrench className="w-5 h-5" />, path: ROUTES.MAINTENANCE },
  ];

  const activeRoleConfig = roles.find(r => r.value === activeRole) || roles[0];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-900 transition-all duration-300">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between px-6 border-b border-zinc-200 dark:border-zinc-900 h-16 shrink-0">
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30 text-white font-extrabold text-lg shrink-0">
            T
          </div>
          {(!desktopCollapsed || mobileOpen) && (
            <span className="font-black text-lg tracking-wider text-zinc-900 dark:text-white truncate">
              Transit<span className="text-blue-600 dark:text-blue-400">Ops</span>
            </span>
          )}
        </div>
        
        {/* Toggle Collapse on Desktop only */}
        <button 
          onClick={() => setDesktopCollapsed(!desktopCollapsed)} 
          className="hidden md:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 cursor-pointer"
        >
          {desktopCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.text}
              onClick={() => {
                navigate(item.path);
                setMobileOpen(false);
              }}
              className={`w-full flex items-center rounded-xl p-3 text-sm font-semibold tracking-wide transition-all duration-200 cursor-pointer group relative ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900/50'
              } ${desktopCollapsed && !mobileOpen ? 'justify-center' : ''}`}
            >
              <div className={`transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-600 dark:group-hover:text-zinc-300'}`}>
                {item.icon}
              </div>
              
              {(!desktopCollapsed || mobileOpen) ? (
                <span className="ml-3 truncate">{item.text}</span>
              ) : (
                /* Tooltip for collapsed desktop menu */
                <div className="absolute left-16 scale-0 group-hover:scale-100 transition-all duration-150 origin-left bg-zinc-900 dark:bg-zinc-800 text-white text-xs font-bold rounded px-2.5 py-1.5 shadow-md pointer-events-none z-50">
                  {item.text}
                </div>
              )}
            </button>
          );
        })}
      </nav>
      
      {/* Sidebar Footer */}
      <div className="p-4 border-t border-zinc-200 dark:border-zinc-900 space-y-4 bg-zinc-50/50 dark:bg-zinc-950/50 shrink-0">
        {user && (!desktopCollapsed || mobileOpen) && (
          <div className="flex items-center space-x-3 px-2 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <div className="w-8 h-8 rounded-full bg-blue-600/10 dark:bg-blue-400/10 flex items-center justify-center font-bold text-blue-600 dark:text-blue-400 text-sm">
              {user.firstName[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate text-zinc-900 dark:text-zinc-100">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-[10px] text-zinc-400 truncate">
                {user.email}
              </p>
            </div>
          </div>
        )}

        <Button
          variant="outlined"
          color="error"
          fullWidth
          onClick={handleLogout}
          className={`flex items-center justify-center text-xs h-10 border-red-200 dark:border-red-950 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 ${
            desktopCollapsed && !mobileOpen ? 'p-0' : 'space-x-2'
          }`}
        >
          <LogOut className="w-4 h-4" />
          {(!desktopCollapsed || mobileOpen) && <span>Sign Out</span>}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
      
      {/* 1. Desktop Sidebar Container */}
      <aside 
        className={`hidden md:block shrink-0 h-screen sticky top-0 z-20 transition-all duration-300 ${
          desktopCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* 2. Mobile Drawer Backdrop and Drawer Panel */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer content */}
          <div className="relative flex flex-col w-64 max-w-xs h-full bg-white dark:bg-zinc-950 shadow-2xl animate-slide-in">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 w-8 h-8 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 flex items-center justify-center z-50 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            {sidebarContent}
          </div>
        </div>
      )}

      {/* 3. Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b border-zinc-200 dark:border-zinc-900 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md px-6 shadow-sm transition-colors">
          
          {/* Left Area: Toggle Menu and View Title */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold text-zinc-800 dark:text-zinc-200 capitalize tracking-wide">
              {location.pathname.split('/').pop() || 'Dashboard'}
            </h1>
          </div>

          {/* Right Area: Role Selector, Theme Switcher, notifications */}
          <div className="flex items-center space-x-4">
            {/* RBAC Role Toggle Dropdown */}
            <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-1 shadow-sm gap-2">
              <span className="hidden lg:inline text-[11px] font-bold text-zinc-400 uppercase tracking-wider pl-2">
                Simulated Role:
              </span>
              <div className="relative group">
                <select
                  value={activeRole}
                  onChange={(e) => setActiveRole(e.target.value as TransitRole)}
                  className={`pl-8 pr-6 py-1.5 rounded-lg text-xs font-extrabold border cursor-pointer appearance-none transition-all focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm ${activeRoleConfig.color}`}
                >
                  {roles.map((r) => (
                    <option key={r.value} value={r.value} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white font-bold">
                      {r.label}
                    </option>
                  ))}
                </select>
                <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  {activeRoleConfig.icon}
                </div>
                {/* Visual dropdown chevron */}
                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500 dark:text-zinc-400">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 p-6 overflow-y-auto">
          {/* Alert indicating active role summary */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 p-4 rounded-xl gap-2 shadow-sm text-xs">
            <div>
              <span className="font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                Role Context: {activeRole}
              </span>
              <p className="text-zinc-500 dark:text-zinc-400 mt-0.5">
                {activeRoleConfig.desc}
              </p>
            </div>
            <div className="flex items-center space-x-1 font-bold text-zinc-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Simulated JWT Auth Active</span>
            </div>
          </div>

          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
