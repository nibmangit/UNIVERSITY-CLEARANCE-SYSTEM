import { Navigate, Route, Routes } from 'react-router-dom';

import Layout from '../components/Layout';
import { useAuth } from '../hooks/useAuth';
import { ROLES, homePathForRole } from '../utils/roles';
import ProtectedRoute from './ProtectedRoute';
import PublicOnlyRoute from './PublicOnlyRoute';

import Login from '../pages/auth/Login';
import NotFound from '../pages/NotFound';
import Notifications from '../pages/Notification';

import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminLogs from '../pages/admin/Logs';

import StudentDashboard from '../pages/student/StudentDashboard';
import StudentClearance from '../pages/student/Clearance';
import StudentHistory from '../pages/student/History';
import StudentProfile from '../pages/student/Profile';

import OfficerDashboard from '../pages/officer/OfficerDashboard';
import OfficerClearances from '../pages/officer/Clearances';
import OfficerClearanceDetails from '../pages/officer/ClearanceDetails';
import OfficerHistory from '../pages/officer/History';
import OfficerIssues from '../pages/officer/Issues';

import RegistrarDashboard from '../pages/registrar/RegistrarDashboard';
import Students from '../pages/registrar/Students';
import RegistrarClearances from '../pages/registrar/Clearances';
import RegistrarClearanceDetails from '../pages/registrar/ClearanceDetails';
import RegistrarIssues from '../pages/registrar/Issues';
import RegistrarCompleted from '../pages/registrar/Completed';

import Verify from '../pages/public/Verify';

function HomeRedirect() {
  const { role } = useAuth();
  return <Navigate to={homePathForRole(role)} replace />;
}


function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<Login />} />
      </Route>

      <Route path="/verify" element={<Verify />} />
      <Route path="/verify/:code" element={<Verify />} />

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
          <Route path="/student/notifications" element={<Notifications />} />
          <Route path="/student/profile" element={<StudentProfile />} />
          <Route path="/student/*" element={<NotFound />} />
        </Route>
      </Route>

      {/* Officer */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.OFFICER]} />}>
        <Route element={<Layout />}>
          <Route path="/officer/" element={<OfficerDashboard />} />
                    <Route path="/officer/clearances" element={<OfficerClearances />} />
          <Route path="/officer/history" element={<OfficerHistory />} />
          <Route path="/officer/clearances/:id" element={<OfficerClearanceDetails />} />
          <Route path="/officer/issues" element={<OfficerIssues />} />
          <Route path="/officer/notifications" element={<Notifications />} />
          <Route path="/officer/*" element={<NotFound />} />
        </Route>
      </Route>

      {/* Registrar */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.REGISTRAR]} />}>
        <Route element={<Layout />}>
          <Route path="/registrar/" element={<RegistrarDashboard />} /> 
          <Route path="/registrar/notifications" element={<Notifications />} /> 
          <Route path="/registrar/students" element={<Students />} />
          <Route path="/registrar/clearances" element={<RegistrarClearances />} />
          <Route path="/registrar/clearances/:id" element={<RegistrarClearanceDetails />} />
          <Route path="/registrar/issues" element={<RegistrarIssues />} />
          <Route path="/registrar/completed" element={<RegistrarCompleted />} />
          <Route path="/registrar/*" element={<NotFound />} />
        </Route>
      </Route>

      {/* Admin */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
        <Route element={<Layout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/logs" element={<AdminLogs />} />
          <Route path="/admin/*" element={<NotFound />} />
        </Route>
      </Route>
 

      <Route path="*" element={<NotFound fullScreen />} />
    </Routes>
  );
}

export default AppRoutes;