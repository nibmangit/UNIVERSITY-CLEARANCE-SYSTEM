import { Navigate, Outlet, useLocation } from 'react-router-dom';
import ConnectionProblem from '../components/ConnectionProblem';
import LoadingScreen from '../components/LoadingScreen';
import { useAuth } from '../hooks/useAuth';
import { homePathForRole } from '../utils/roles';


export default function PublicOnlyRoute() {
  const { status, user, retry } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <LoadingScreen label="Checking your session…" />;
  if (status === 'error') return <ConnectionProblem onRetry={retry} />;

  if (user) {
    const from = location.state?.from;
    const target =
      from && from.pathname !== '/login'
        ? `${from.pathname}${from.search ?? ''}`
        : homePathForRole(user.role);
    return <Navigate to={target} replace />;
  }

  return <Outlet />;
}