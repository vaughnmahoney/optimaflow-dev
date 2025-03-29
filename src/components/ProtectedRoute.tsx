
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { session, loading, userRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("ProtectedRoute - session:", session, "loading:", loading, "userRole:", userRole);
    
    if (!loading) {
      if (!session) {
        console.log("No session, redirecting to login");
        navigate("/login", { replace: true });
      } else if (requiredRole && userRole !== requiredRole) {
        console.log(`Role ${requiredRole} required, user has ${userRole}, redirecting to work orders`);
        navigate("/work-orders", { replace: true });
      }
    }
  }, [session, loading, userRole, requiredRole]);

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

  // If we need a specific role and the user doesn't have it, render nothing
  if (requiredRole && userRole !== requiredRole) {
    return null;
  }

  return session ? <>{children}</> : null;
}
