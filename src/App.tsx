
import { useState } from "react";
import { Routes, Route, useLocation, BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Layout } from "@/components/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AuthProvider } from "@/components/AuthProvider";

// Import the MaterialRequirements page
import MaterialRequirementsPage from "@/pages/MaterialRequirements";

const queryClient = new QueryClient();

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Authentication routes */}
            <Route path="/login" element={<div>Login Page</div>} />
            <Route path="/register" element={<div>Register Page</div>} />

            {/* Protected routes */}
            <Route
              path="/material-requirements"
              element={
                <ProtectedRoute>
                  <Layout>
                    <MaterialRequirementsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Default route */}
            <Route path="*" element={<div>Page not found</div>} />
          </Routes>
          <Toaster />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
