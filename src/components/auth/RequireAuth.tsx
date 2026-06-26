import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { ReactNode } from 'react';

export function RequireAuth({ children, role }: { children: ReactNode; role?: 'employer' | 'worker' }) {
  const { isAuthenticated, userRole } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role && userRole !== role) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
