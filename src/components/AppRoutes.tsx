
import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const LoginPage = React.lazy(() => import('@/pages/Login'));
const DashboardPage = React.lazy(() => import('@/pages/Dashboard'));
const WorkOrders = React.lazy(() => import('@/pages/WorkOrders'));
const MaterialsRequirements = React.lazy(() => import('@/pages/MaterialsRequirements'));
const ReportsPage = React.lazy(() => import('@/pages/Reports'));
const BulkOrdersPage = React.lazy(() => import('@/pages/BulkOrdersProgressive'));
const DiagnosticPage = React.lazy(() => import('@/pages/DiagnosticPage'));

const AppRoutes: React.FC = () => {
  const { isLoggedIn } = useAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={
          isLoggedIn ? (
            <Suspense fallback={<LoadingSpinner />}>
              <DashboardPage />
            </Suspense>
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/login"
        element={
          !isLoggedIn ? (
            <Suspense fallback={<LoadingSpinner />}>
              <LoginPage />
            </Suspense>
          ) : (
            <Navigate to="/" />
          )
        }
      />
      <Route
        path="/dashboard"
        element={
          isLoggedIn ? (
            <Suspense fallback={<LoadingSpinner />}>
              <DashboardPage />
            </Suspense>
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/work-orders"
        element={
          isLoggedIn ? (
            <Suspense fallback={<LoadingSpinner />}>
              <WorkOrders />
            </Suspense>
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/materials"
        element={
          isLoggedIn ? (
            <Suspense fallback={<LoadingSpinner />}>
              <MaterialsRequirements />
            </Suspense>
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/reports"
        element={
          isLoggedIn ? (
            <Suspense fallback={<LoadingSpinner />}>
              <ReportsPage />
            </Suspense>
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/bulk-orders"
        element={
          isLoggedIn ? (
            <Suspense fallback={<LoadingSpinner />}>
              <BulkOrdersPage />
            </Suspense>
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/diagnostics"
        element={
          isLoggedIn ? (
            <Suspense fallback={<LoadingSpinner />}>
              <DiagnosticPage />
            </Suspense>
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;
