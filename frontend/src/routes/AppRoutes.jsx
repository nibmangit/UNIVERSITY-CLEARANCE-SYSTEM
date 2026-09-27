import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Login from '../pages/auth/Login';

import StudentDashboard from '../pages/student/StudentDashboard';
import Clearance from '../pages/student/Clearance';
import History from '../pages/student/History';
import Notification from '../pages/student/Notification';
import Profile from '../pages/student/Profile';

import OfficerDashboard from '../pages/officer/OfficerDashboard';
import OfficerClearances from '../pages/officer/Clearances';
import OfficerIssues from '../pages/officer/Issues';

import RegistrarDashboard from '../pages/registrar/RegistrarDashboard';
import Students from '../pages/registrar/Students';
import Clearances from '../pages/registrar/Clearances';
import Issues from '../pages/registrar/Issues';
import Completed from '../pages/registrar/Completed';

import Layout from '../components/Layout';

function Placeholder({ title }) {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      <p className="mt-2 text-gray-600">
        This page will be implemented in its assigned module.
      </p>
    </div>
  );
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        
        <Route  
          path="/login" 
          element={ 
               <Login /> 
              } />

        {/* Student */}
        <Route
          path="/student"
          element={
            <Layout>
              <StudentDashboard />
            </Layout>
          }
        />

        <Route
          path="/student/clearance"
          element={
            <Layout>
              <Clearance />
            </Layout>
              }
        />

        <Route
          path="/student/history"
          element={
            <Layout>
              <History />
            </Layout>
          }
        />

        <Route
          path="/student/notifications"
          element={
            <Layout>
              <Notification />
            </Layout>
          }
        />

        <Route
          path="/student/profile"
          element={
            <Layout>
              <Profile />
            </Layout>
          }
        />

        {/* Officer */}
        <Route
          path="/officer"
          element={
            <Layout>
              <OfficerDashboard />
            </Layout>
          }
        />

        <Route
          path="/officer/clearances"
          element={
            <Layout>
              <OfficerClearances />
            </Layout>
          }
        />

        <Route
          path="/officer/issues"
          element={
            <Layout>
              <OfficerIssues />
            </Layout>
          }
        />

        {/* Registrar */}
        <Route
          path="/registrar"
          element={
            <Layout>
              <RegistrarDashboard />
            </Layout>
          }
        />

        <Route
          path="/registrar/students"
          element={
            <Layout>
              <Students />
            </Layout>
          }
        />

        <Route
          path="/registrar/clearances"
          element={
            <Layout>
              <Clearances />
            </Layout>
          }
        />

        <Route
          path="/registrar/issues"
          element={
            <Layout>
              <Issues />
            </Layout>
          }
        />

        <Route
          path="/registrar/completed"
          element={
            <Layout>
              <Completed />
            </Layout>
          }
        />

        {/* Unknown route */}
        <Route
          path="*"
          element={<Placeholder title="Page Not Found" />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;