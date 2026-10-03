import { Navigate, Outlet, useLocation } from 'react-router-dom';
import ConnectionProblem from '../components/ConnectionProblem';
import LoadingScreen from '../components/LoadingScreen';
import { useAuth } from '../hooks/useAuth';
import { homePathForRole } from '../utils/roles';


export default function ProtectedRoute({ allowedRoles }) {
  const { status, user, retry } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <LoadingScreen label="Checking your session…" />;
  if (status === 'error') return <ConnectionProblem onRetry={retry} />;

  // Not logged in: go to login, and remember where the user was.
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;

  // Logged in, but this area belongs to another role.
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={homePathForRole(user.role)} replace />;
  }

  return <Outlet />;
}