import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { LoadingSpinner } from './LoadingSpinner';

interface PrivateRouteProps {
  allowedRoles?: string[];
  redirectTo?: string;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ allowedRoles, redirectTo = '/login' }) => {
  const { user, isAuthenticated, loading } = useSelector((state: RootState) => state.auth);

  if (loading) {
    return <LoadingSpinner fullScreen text="Checking authentication..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const hasRole = user?.roles?.some(role => allowedRoles.includes(role));
    if (!hasRole) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <Outlet />;
};