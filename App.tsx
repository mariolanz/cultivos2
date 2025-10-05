
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AppProvider';

import MainLayout from './components/layout/MainLayout';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Setup from './components/Setup';
import Log from './components/Log';
import Harvest from './components/Harvest';
import Reports from './components/Reports';
import AiDiagnosis from './components/AiDiagnosis';
import Settings from './components/Settings';
import PrivateRoute from './components/PrivateRoute';
import PermissionRoute from './components/PermissionRoute';
import BatchManagement from './components/BatchManagement';
import Expenses from './components/Expenses';
import Archive from './components/Archive';
import MaintenanceReports from './components/MaintenanceReports';
import MaintenanceDashboard from './components/MaintenanceDashboard';
import MotherPlants from './components/MotherPlants';
import Schedule from './components/Schedule';
import Trimming from './components/Trimming';
import PnoLibrary from './components/PnoLibrary';
import Notifications from './components/Notifications';
import Infographics from './components/Infographics';
import SelectRole from './components/SelectRole';

const App: React.FC = () => {
  const { loggedInUser } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={loggedInUser ? <Navigate to="/" /> : <Login />} />
      <Route path="/select-role" element={loggedInUser ? <SelectRole /> : <Navigate to="/login" />} />
      <Route 
        path="/" 
        element={
          <PrivateRoute>
            <MainLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<PermissionRoute permission="dashboard"><Dashboard /></PermissionRoute>} />
        <Route path="schedule" element={<PermissionRoute permission="schedule"><Schedule /></PermissionRoute>} />
        <Route path="notifications" element={<PermissionRoute permission="notifications"><Notifications /></PermissionRoute>} />
        <Route path="setup" element={<PermissionRoute permission="setup"><Setup /></PermissionRoute>} />
        <Route path="batches" element={<PermissionRoute permission="batches"><BatchManagement /></PermissionRoute>} />
        <Route path="mother-plants" element={<PermissionRoute permission="motherPlants"><MotherPlants /></PermissionRoute>} />
        <Route path="log" element={<PermissionRoute permission="log"><Log /></PermissionRoute>} />
        <Route path="pno-library" element={<PermissionRoute permission="pnoLibrary"><PnoLibrary /></PermissionRoute>} />
        <Route path="infographics" element={<PermissionRoute permission="infographics"><Infographics /></PermissionRoute>} />
        <Route path="harvest" element={<PermissionRoute permission="harvest"><Harvest /></PermissionRoute>} />
        <Route path="reports" element={<PermissionRoute permission="reports"><Reports /></PermissionRoute>} />
        <Route path="ai-diagnosis" element={<PermissionRoute permission="aiDiagnosis"><AiDiagnosis /></PermissionRoute>} />
        <Route path="trimming" element={<PermissionRoute permission="trimming"><Trimming /></PermissionRoute>} />
        <Route path="expenses" element={<PermissionRoute permission="expenses"><Expenses /></PermissionRoute>} />
        <Route path="settings" element={<PermissionRoute permission="settings"><Settings /></PermissionRoute>} />
        <Route path="archive" element={<PermissionRoute permission="archive"><Archive /></PermissionRoute>} />
        <Route path="maintenance-reports" element={<PermissionRoute permission="maintenanceReports"><MaintenanceReports /></PermissionRoute>} />
        <Route path="maintenance-calendar" element={<PermissionRoute permission="maintenanceCalendar"><MaintenanceDashboard /></PermissionRoute>} />
      </Route>
      <Route path="*" element={<Navigate to={loggedInUser ? "/" : "/login"} />} />
    </Routes>
  );
};

export default App;