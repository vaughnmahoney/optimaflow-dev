
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./components/AuthProvider";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Employees from "./pages/Employees";
import Attendance from "./pages/Attendance";
import AttendanceHistory from "./pages/AttendanceHistory";
import WorkOrders from "./pages/WorkOrders";
import Dashboard from "./pages/Dashboard";
import Payroll from "./pages/Payroll";
import VehicleMaintenance from "./pages/VehicleMaintenance";
import Storage from "./pages/Storage";
import Expenses from "./pages/Receipts"; // Renamed to Expenses but keeping the file name
import Calendar from "./pages/Calendar";
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";
import BulkOrdersTest from "./pages/BulkOrdersTest";
import MaterialRequirements from "./pages/MaterialRequirements";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/landing" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/bulk-orders-test" element={<BulkOrdersTest />} />
            
            {/* Main application routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
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
              path="/material-requirements"
              element={
                <ProtectedRoute>
                  <MaterialRequirements />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payroll"
              element={
                <ProtectedRoute>
                  <Payroll />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vehicle-maintenance"
              element={
                <ProtectedRoute>
                  <VehicleMaintenance />
                </ProtectedRoute>
              }
            />
            <Route
              path="/storage"
              element={
                <ProtectedRoute>
                  <Storage />
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
            {/* Legacy routes redirected to new paths */}
            <Route
              path="/supervisor"
              element={<Navigate to="/attendance" replace />}
            />
            <Route
              path="/admin"
              element={<Navigate to="/employees" replace />}
            />
            <Route
              path="/employees"
              element={
                <ProtectedRoute>
                  <Employees />
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
              path="/receipts"
              element={
                <ProtectedRoute>
                  <Expenses />
                </ProtectedRoute>
              }
            />
            <Route
              path="/calendar"
              element={
                <ProtectedRoute>
                  <Calendar />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
