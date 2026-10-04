import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';

import Layout from '../components/Layout';
import Login from '../pages/auth/Login';
import { useAuth } from '../hooks/useAuth';
import { ROLES, homePathForRole } from '../utils/roles';
import ProtectedRoute from './ProtectedRoute';
import PublicOnlyRoute from './PublicOnlyRoute';

import StudentDashboard from '../pages/student/StudentDashboard';
import StudentClearance from '../pages/student/Clearance';
import StudentHistory from '../pages/student/History';
import StudentNotifications from '../pages/student/Notification';
import StudentProfile from '../pages/student/Profile';

import OfficerDashboard from '../pages/officer/OfficerDashboard';
import OfficerClearances from '../pages/officer/Clearances';
import OfficerClearanceDetails from '../pages/officer/ClearanceDetails';
import OfficerIssues from '../pages/officer/Issues';

function HomeRedirect() {
  const { role } = useAuth();
  return <Navigate to={homePathForRole(role)} replace />;
}

// TEMPORARY: stands in for every page until it is built. Each later step replaces one.
function Placeholder({ showLogout = false }) {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();

  return (
    <div className={showLogout ? 'p-6' : ''}>
      <h1 className="text-2xl font-semibold text-slate-900">{pathname}</h1>
      <p className="mt-2 text-sm text-slate-600">
        Not built yet. Logged in as {user?.university_id} ({user?.role}).
      </p>
      {showLogout && (
        <button
          type="button"
          onClick={logout}
          className="mt-4 h-10 rounded-md border border-slate-300 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Log out
        </button>
      )}
    </div>
  );
}



function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<Login />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<HomeRedirect />} />
      </Route>

      {/* Student */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.STUDENT]} />}>
        <Route element={<Layout />}>
          <Route path="/student/" element={<StudentDashboard />} />
          <Route path="/student/clearance" element={<StudentClearance />} />
          <Route path="/student/clearance/:id" element={<StudentClearance />} />
          <Route path="/student/history" element={<StudentHistory />} />
          <Route path="/student/notifications" element={<StudentNotifications />} />
          <Route path="/student/profile" element={<StudentProfile />} />
          <Route path="/student/*" element={<NotFound />} />
        </Route>
      </Route>

      {/* Officer */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.OFFICER]} />}>
        <Route element={<Layout />}>
          <Route path="/officer/" element={<OfficerDashboard />} />
          <Route path="/officer/clearances" element={<OfficerClearances />} />
          <Route path="/officer/clearances/:id" element={<OfficerClearanceDetails />} />
          <Route path="/officer/issues" element={<OfficerIssues />} />
          <Route path="/officer/*" element={<NotFound />} />
        </Route>
      </Route>

      {/* Registrar */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.REGISTRAR]} />}>
        <Route element={<Layout />}>
          <Route path="/registrar/*" element={<Placeholder />} />
        </Route>
      </Route>

      {/* Admin: no defined screens yet, so it stays outside the shared layout */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
        <Route path="/admin/*" element={<Placeholder showLogout />} />
      </Route>
 

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;


function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="max-w-sm text-center">
        <h1 className="text-xl font-semibold text-slate-900">Page not found</h1>
        <p className="mt-2 text-sm text-slate-600">
          The page you're looking for doesn't exist or has moved.
        </p>
        <Link
          to="/"
          className="mt-5 inline-flex h-10 items-center justify-center rounded-md bg-sky-900 px-4 text-sm font-medium text-white hover:bg-sky-800"
        >
          Go to home
        </Link>
      </div>
    </div>
  );
}