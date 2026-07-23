import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { VehicleList } from './components/inventory/VehicleList';
import { AdminInventoryPanel } from './components/admin/AdminInventoryPanel';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, token } = useAuth();
  if (!token && !user) return <Navigate to="/login" replace />;
  // Role is uppercase 'ADMIN' — verified from Role.js and JWT payload
  if (requireAdmin && user?.role !== 'ADMIN') return <Navigate to="/dashboard" replace />;
  return children;
};

export const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={user.role === 'ADMIN' ? '/admin' : '/dashboard'} replace /> : <LoginForm />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <RegisterForm />} />
      <Route path="/dashboard" element={<ProtectedRoute><VehicleList /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute requireAdmin={true}><AdminInventoryPanel /></ProtectedRoute>} />
      <Route path="/" element={<Navigate to={user ? (user.role === 'ADMIN' ? '/admin' : '/dashboard') : '/login'} replace />} />
    </Routes>
  );
};
