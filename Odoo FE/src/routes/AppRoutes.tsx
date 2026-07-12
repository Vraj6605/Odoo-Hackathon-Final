import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import AuthLayout from '@/layouts/AuthLayout';
import DashboardLayout from '@/layouts/DashboardLayout';
import ProtectedRoute from './ProtectedRoute';

// Lazy load pages for optimal bundle sizes
const LoginPage = React.lazy(() => import('@/pages/login/LoginPage'));
const DashboardPage = React.lazy(() => import('@/pages/dashboard/DashboardPage'));
const VehicleRegistry = React.lazy(() => import('@/pages/dashboard/VehicleRegistry'));
const TripManagement = React.lazy(() => import('@/pages/dashboard/TripManagement'));
const MaintenanceHub = React.lazy(() => import('@/pages/dashboard/MaintenanceHub'));

export const AppRoutes: React.FC = () => {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen w-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <Routes>
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        </Route>

        {/* Protected Dashboard Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to={ROUTES.DASHBOARD} replace />} />
          <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
          <Route path={ROUTES.VEHICLES} element={<VehicleRegistry />} />
          <Route path={ROUTES.TRIPS} element={<TripManagement />} />
          <Route path={ROUTES.MAINTENANCE} element={<MaintenanceHub />} />
        </Route>

        {/* Fallback Catch All */}
        <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
      </Routes>
    </React.Suspense>
  );
};

export default AppRoutes;
