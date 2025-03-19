
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { AuthProvider } from "@/components/AuthProvider";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Toaster } from "@/components/ui/toaster";

import Login from "@/pages/Login";
import Admin from "@/pages/Admin";
import NotFound from "@/pages/NotFound";
import Groups from "@/pages/Groups";
import Supervisor from "@/pages/Supervisor";
import Attendance from "@/pages/Attendance";
import AttendanceHistory from "@/pages/AttendanceHistory";
import WorkOrders from "@/pages/WorkOrders";
import Employees from "@/pages/Employees";
import Users from "@/pages/Users";

import "@/App.css";

// Initialize React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            {/* Protected routes */}
            <Route path="/" element={<ProtectedRoute><Navigate to="/work-orders" replace /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
            <Route path="/groups" element={<ProtectedRoute><Groups /></ProtectedRoute>} />
            <Route path="/supervisor" element={<ProtectedRoute><Supervisor /></ProtectedRoute>} />
            <Route path="/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
            <Route path="/attendance-history" element={<ProtectedRoute><AttendanceHistory /></ProtectedRoute>} />
            <Route path="/work-orders" element={<ProtectedRoute><WorkOrders /></ProtectedRoute>} />
            <Route path="/employees" element={<ProtectedRoute><Employees /></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </Router>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
