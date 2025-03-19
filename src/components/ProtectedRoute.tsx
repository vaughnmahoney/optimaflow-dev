
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";

type ProtectedRouteProps = {
  children: React.ReactNode;
  allowedRoles?: Array<'admin' | 'qc_reviewer' | 'billing_admin' | 'supervisor'>;
};

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { session, loading, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log("ProtectedRoute - session:", session, "loading:", loading, "profile:", profile);
    
    if (!loading) {
      // Check if user is authenticated
      if (!session) {
        console.log("No session, redirecting to login");
        navigate("/login", { replace: true });
        return;
      }
      
      // If roles are specified, check if user has permission
      if (allowedRoles && allowedRoles.length > 0 && profile) {
        if (!allowedRoles.includes(profile.role)) {
          console.log(`User role ${profile.role} not allowed, redirecting to dashboard`);
          navigate("/dashboard", { replace: true });
          return;
        }
      }
    }
  }, [session, loading, profile, allowedRoles, navigate]);

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
  return session ? <>{children}</> : null;
}
