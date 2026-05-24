import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/auth-store';

export function PublicRoute() {
  const { token, user } = useAuthStore();

  if (token && user) {
    if (user.role === 'Admin') return <Navigate to="/admin" replace />;
    if (user.role === 'Teacher') return <Navigate to="/teacher" replace />;
    if (user.role === 'Student') return <Navigate to="/student" replace />;
  }

  return <Outlet />;
}
