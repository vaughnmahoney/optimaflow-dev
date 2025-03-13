import { useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "@/components/ui/toaster";
import { MainLayout } from "@/layouts/MainLayout";
import { AuthLayout } from "@/layouts/AuthLayout";
import { Login } from "@/pages/Login";
import { Register } from "@/pages/Register";
import { Dashboard } from "@/pages/Dashboard";
import { QualityControlReview } from "@/pages/QualityControlReview";
import { QualityControlFlagged } from "@/pages/QualityControlFlagged";
import { BillingApproved } from "@/pages/BillingApproved";
import { BillingPricing } from "@/pages/BillingPricing";
import { Vehicles } from "@/pages/Vehicles";
import { StorageInventory } from "@/pages/StorageInventory";
import { StorageRequest } from "@/pages/StorageRequest";
import { StorageLocations } from "@/pages/StorageLocations";
import { Supervisor } from "@/pages/Supervisor";
import { AttendanceHistory } from "@/pages/AttendanceHistory";
import { Calendar } from "@/pages/Calendar";
import { Payroll } from "@/pages/Payroll";
import { Admin } from "@/pages/Admin";
import { EmployeesDevices } from "@/pages/EmployeesDevices";
import { EmployeesTools } from "@/pages/EmployeesTools";
import { ReceiptsTracking } from "@/pages/ReceiptsTracking";
import { AppsWex } from "@/pages/AppsWex";
import { AppsOnsite } from "@/pages/AppsOnsite";
import { AppsPex } from "@/pages/AppsPex";
import { AppsServiceChannel } from "@/pages/AppsServiceChannel";
import { AppsVerisae } from "@/pages/AppsVerisae";
import { WorkOrders } from "@/pages/WorkOrders";
import { BulkOrders } from "@/pages/BulkOrders";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { ScrollToTop } from "@/components/ScrollToTop";
import { OnsiteOrder } from "@/pages/OnsiteOrder";
import { MaterialRequirements } from "@/components/materials/MaterialRequirements";

const queryClient = new QueryClient();

function App() {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ScrollToTop />
        <Routes>
          <Route
            path="/*"
            element={
              <AuthLayout>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                </Routes>
              </AuthLayout>
            }
          />

          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <MainLayout
                  isSidebarOpen={isSidebarOpen}
                  setIsSidebarOpen={setIsSidebarOpen}
                >
                  <Dashboard />
                </MainLayout>
              </RequireAuth>
            }
          />

          <Route
            path="/quality-control"
            element={
              <RequireAuth>
                <MainLayout
                  isSidebarOpen={isSidebarOpen}
                  setIsSidebarOpen={setIsSidebarOpen}
                >
                  <Routes>
                    <Route path="/review" element={<QualityControlReview />} />
                    <Route path="/flagged" element={<QualityControlFlagged />} />
                  </Routes>
                </MainLayout>
              </RequireAuth>
            }
          />

          <Route
            path="/billing"
            element={
              <RequireAuth>
                <MainLayout
                  isSidebarOpen={isSidebarOpen}
                  setIsSidebarOpen={setIsSidebarOpen}
                >
                  <Routes>
                    <Route path="/approved" element={<BillingApproved />} />
                    <Route path="/pricing" element={<BillingPricing />} />
                  </Routes>
                </MainLayout>
              </RequireAuth>
            }
          />
          
          <Route
            path="/material-requirements"
            element={
              <RequireAuth>
                <MainLayout
                  isSidebarOpen={isSidebarOpen}
                  setIsSidebarOpen={setIsSidebarOpen}
                >
                  <MaterialRequirements />
                </MainLayout>
              </RequireAuth>
            }
          />

          <Route
            path="/vehicles"
            element={
              <RequireAuth>
                <MainLayout
                  isSidebarOpen={isSidebarOpen}
                  setIsSidebarOpen={setIsSidebarOpen}
                >
                  <Vehicles />
                </MainLayout>
              </RequireAuth>
            }
          />

          <Route
            path="/storage"
            element={
              <RequireAuth>
                <MainLayout
                  isSidebarOpen={isSidebarOpen}
                  setIsSidebarOpen={setIsSidebarOpen}
                >
                  <Routes>
                    <Route path="/inventory" element={<StorageInventory />} />
                    <Route path="/request" element={<StorageRequest />} />
                    <Route path="/locations" element={<StorageLocations />} />
                  </Routes>
                </MainLayout>
              </RequireAuth>
            }
          />

          <Route
            path="/supervisor"
            element={
              <RequireAuth>
                <MainLayout
                  isSidebarOpen={isSidebarOpen}
                  setIsSidebarOpen={setIsSidebarOpen}
                >
                  <Supervisor />
                </MainLayout>
              </RequireAuth>
            }
          />

          <Route
            path="/attendance-history"
            element={
              <RequireAuth>
                <MainLayout
                  isSidebarOpen={isSidebarOpen}
                  setIsSidebarOpen={setIsSidebarOpen}
                >
                  <AttendanceHistory />
                </MainLayout>
              </RequireAuth>
            }
          />

          <Route
            path="/calendar"
            element={
              <RequireAuth>
                <MainLayout
                  isSidebarOpen={isSidebarOpen}
                  setIsSidebarOpen={setIsSidebarOpen}
                >
                  <Calendar />
                </MainLayout>
              </RequireAuth>
            }
          />

          <Route
            path="/payroll"
            element={
              <RequireAuth>
                <MainLayout
                  isSidebarOpen={isSidebarOpen}
                  setIsSidebarOpen={setIsSidebarOpen}
                >
                  <Payroll />
                </MainLayout>
              </RequireAuth>
            }
          />

          <Route
            path="/admin"
            element={
              <RequireAuth>
                <MainLayout
                  isSidebarOpen={isSidebarOpen}
                  setIsSidebarOpen={setIsSidebarOpen}
                >
                  <Admin />
                </MainLayout>
              </RequireAuth>
            }
          />

          <Route
            path="/employees"
            element={
              <RequireAuth>
                <MainLayout
                  isSidebarOpen={isSidebarOpen}
                  setIsSidebarOpen={setIsSidebarOpen}
                >
                  <Routes>
                    <Route path="/devices" element={<EmployeesDevices />} />
                    <Route path="/tools" element={<EmployeesTools />} />
                  </Routes>
                </MainLayout>
              </RequireAuth>
            }
          />

          <Route
            path="/receipts"
            element={
              <RequireAuth>
                <MainLayout
                  isSidebarOpen={isSidebarOpen}
                  setIsSidebarOpen={setIsSidebarOpen}
                >
                  <Routes>
                    <Route path="/tracking" element={<ReceiptsTracking />} />
                  </Routes>
                </MainLayout>
              </RequireAuth>
            }
          />

          <Route
            path="/apps"
            element={
              <RequireAuth>
                <MainLayout
                  isSidebarOpen={isSidebarOpen}
                  setIsSidebarOpen={setIsSidebarOpen}
                >
                  <Routes>
                    <Route path="/wex" element={<AppsWex />} />
                    <Route path="/onsite" element={<AppsOnsite />} />
                    <Route path="/pex" element={<AppsPex />} />
                    <Route path="/service-channel" element={<AppsServiceChannel />} />
                    <Route path="/verisae" element={<AppsVerisae />} />
                  </Routes>
                </MainLayout>
              </RequireAuth>
            }
          />

          <Route
            path="/work-orders"
            element={
              <RequireAuth>
                <MainLayout
                  isSidebarOpen={isSidebarOpen}
                  setIsSidebarOpen={setIsSidebarOpen}
                >
                  <WorkOrders />
                </MainLayout>
              </RequireAuth>
            }
          />

          <Route
            path="/bulk-orders"
            element={
              <RequireAuth>
                <MainLayout
                  isSidebarOpen={isSidebarOpen}
                  setIsSidebarOpen={setIsSidebarOpen}
                >
                  <BulkOrders />
                </MainLayout>
              </RequireAuth>
            }
          />

          <Route
            path="/onsite-order/:orderNo"
            element={
              <RequireAuth>
                <MainLayout
                  isSidebarOpen={isSidebarOpen}
                  setIsSidebarOpen={setIsSidebarOpen}
                >
                  <OnsiteOrder />
                </MainLayout>
              </RequireAuth>
            }
          />
        </Routes>
        <Toaster />
        <ReactQueryDevtools initialIsOpen={false} />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
