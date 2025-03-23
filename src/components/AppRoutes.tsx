
import React from "react";
import { Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import WorkOrders from "@/pages/WorkOrders";
import Groups from "@/pages/Groups";
import Supervisor from "@/pages/Supervisor";
import Admin from "@/pages/Admin";
import AttendanceHistory from "@/pages/AttendanceHistory";
import Users from "@/pages/Users";
import MaterialRequirements from "@/pages/MaterialRequirements";
import BulkOrdersTest from "@/pages/BulkOrdersTest";
import Attendance from "@/pages/Attendance";
import NotFound from "@/pages/NotFound";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/quality-control/review"
        element={
          <ProtectedRoute>
            <WorkOrders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/work-orders"
        element={
          <ProtectedRoute>
            <WorkOrders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/groups"
        element={
          <ProtectedRoute>
            <Groups />
          </ProtectedRoute>
        }
      />
      <Route
        path="/supervisor"
        element={
          <ProtectedRoute>
            <Supervisor />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <Admin />
          </ProtectedRoute>
        }
      />
      <Route
        path="/attendance-history"
        element={
          <ProtectedRoute>
            <AttendanceHistory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <Users />
          </ProtectedRoute>
        }
      />
      <Route
        path="/material-requirements"
        element={
          <ProtectedRoute>
            <MaterialRequirements />
          </ProtectedRoute>
        }
      />
      <Route
        path="/bulk-orders-test"
        element={
          <ProtectedRoute>
            <BulkOrdersTest />
          </ProtectedRoute>
        }
      />
      <Route
        path="/attendance"
        element={
          <ProtectedRoute>
            <Attendance />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
