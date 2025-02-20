
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./components/AuthProvider";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import Supervisor from "./pages/Supervisor";
import AttendanceHistory from "./pages/AttendanceHistory";
import WorkOrders from "./pages/WorkOrders";
import NotFound from "./pages/NotFound";
import WorkOrderDetail from "./pages/WorkOrderDetail";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/work-orders" replace />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <Admin />
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
              path="/attendance-history"
              element={
                <ProtectedRoute>
                  <AttendanceHistory />
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
              path="/work-orders/:id"
              element={
                <ProtectedRoute>
                  <WorkOrderDetail />
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
