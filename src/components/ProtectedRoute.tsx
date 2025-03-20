
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";

type ProtectedRouteProps = {
  children: React.ReactNode;
  allowedRoles?: Array<'admin' | 'qc_reviewer' | 'billing_admin' | 'supervisor'>;
};

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log("ProtectedRoute - session:", session, "loading:", loading);
    
    if (!loading && !session) {
      console.log("No session, redirecting to login");
      navigate("/login", { replace: true });
    }
  }, [session, loading, navigate]);

  // Show loading indicator while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Only render children if user is authenticated
  // Role checking happens separately in a useEffect within each protected page
  return session ? <>{children}</> : null;
}
