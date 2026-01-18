import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/layout/ProtectedRoute';
import HomePage from '../pages/HomePage';
import Login from '../pages/auth/Login';
import AdminLogin from '../pages/auth/AdminLogin';
import RHLogin from '../pages/auth/RHLogin';
import EmployeeLogin from '../pages/auth/EmployeeLogin';
import EmployeeDashboard from '../pages/employee/Dashboard';
import Balances from '../pages/employee/Balances';
import MyRequests from '../pages/employee/MyRequests';
import Details from '../pages/employee/Details';
import RHDashboard from '../pages/rh/Dashboard';
import RHEmployees from '../pages/rh/Employees';
import Validation from '../pages/rh/Validation';
import Statistics from '../pages/rh/Statistics';
import RHReports from '../pages/rh/Reports';
import AdminDashboard from '../pages/admin/Dashboard';
import Users from '../pages/admin/Users';
import AdminEmployees from '../pages/admin/Employees';
import Settings from '../pages/admin/Settings';
import Requests from '../pages/admin/Requests';
import Reports from '../pages/admin/Reports';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/rh/login" element={<RHLogin />} />
      <Route path="/employee/login" element={<EmployeeLogin />} />
      <Route path="/" element={<HomePage />} />

      {/* Employee Routes */}
      <Route
        path="/employee/dashboard"
        element={
          <ProtectedRoute roles={['employe']}>
            <EmployeeDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/balances"
        element={
          <ProtectedRoute roles={['employe']}>
            <Balances />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/requests"
        element={
          <ProtectedRoute roles={['employe']}>
            <MyRequests />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/details"
        element={
          <ProtectedRoute roles={['employe']}>
            <Details />
          </ProtectedRoute>
        }
      />

      {/* RH Routes */}
      <Route
        path="/rh/dashboard"
        element={
          <ProtectedRoute roles={['rh']}>
            <RHDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/rh/employees"
        element={
          <ProtectedRoute roles={['rh']}>
            <RHEmployees />
          </ProtectedRoute>
        }
      />
      <Route
        path="/rh/validation"
        element={
          <ProtectedRoute roles={['rh']}>
            <Validation />
          </ProtectedRoute>
        }
      />
      <Route
        path="/rh/statistics"
        element={
          <ProtectedRoute roles={['rh']}>
            <Statistics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/rh/reports"
        element={
          <ProtectedRoute roles={['rh']}>
            <RHReports />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute roles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute roles={['admin']}>
            <Users />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/employees"
        element={
          <ProtectedRoute roles={['admin']}>
            <AdminEmployees />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute roles={['admin']}>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/requests"
        element={
          <ProtectedRoute roles={['admin']}>
            <Requests />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute roles={['admin']}>
            <Reports />
          </ProtectedRoute>
        }
      />

      <Route path="/unauthorized" element={<div>Unauthorized</div>} />
    </Routes>
  );
};

export default AppRoutes;
