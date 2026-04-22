import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

/** Solo accesible si NO hay sesión (login, registro) */
export function PublicRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />;
}

/** Requiere sesión activa */
export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

/** Requiere sesión + rol admin */
export function AdminRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isAdmin = useAuthStore((s) => s.isAdmin);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

/** Requiere sesión + ser cofrade activo */
export function CofradeRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isCofrade = useAuthStore((s) => s.isCofrade);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isCofrade) return <Navigate to="/pago-cuota" replace />;
  return <Outlet />;
}
