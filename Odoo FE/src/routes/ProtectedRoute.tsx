import React from 'react';
import { Navigate } from 'react-router-dom';
import { useGlobalStore } from '@/store/globalStore';
import { ROUTES } from '@/constants/routes';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const token = useGlobalStore((state) => state.token);

  if (!token) {
    // If not authenticated, redirect to login page
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
