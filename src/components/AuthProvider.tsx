
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

interface AuthContextType {
  session: Session | null;
  loading: boolean;
  userRole: string; // Add user role to the context
}

const AuthContext = createContext<AuthContextType>({ session: null, loading: true, userRole: "" });

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    try {
      // Get initial session
      supabase.auth.getSession().then(({ data: { session } }) => {
        console.log("Initial session check:", session);
        setSession(session);
        
        // Determine role based on email (for demo purposes)
        if (session?.user?.email) {
          const email = session.user.email;
          // In a real app, you would fetch this from a user_roles table
          // For now, simple string matching for demo
          if (email.includes("lead")) {
            setUserRole("lead");
          } else if (email.includes("admin")) {
            setUserRole("admin");
          } else {
            setUserRole("user");
          }
        }
        
        setLoading(false);
        
        // Handle navigation based on auth state
        if (session && (location.pathname === '/' || location.pathname === '/login')) {
          console.log("Has session, redirecting to work orders");
          navigate('/work-orders', { replace: true });
        } else if (!session && location.pathname !== '/' && location.pathname !== '/login') {
          console.log("No session, redirecting to login");
          navigate('/login', { replace: true });
        }
      }).catch(error => {
        console.error("Error getting session:", error);
        setLoading(false);
      });

      // Listen for auth changes
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        console.log("Auth state changed:", _event, session);
        setSession(session);
        
        // Determine role based on email (for demo purposes)
        if (session?.user?.email) {
          const email = session.user.email;
          // In a real app, you would fetch this from a user_roles table
          if (email.includes("lead")) {
            setUserRole("lead");
          } else if (email.includes("admin")) {
            setUserRole("admin");
          } else {
            setUserRole("user");
          }
        } else {
          setUserRole("");
        }
        
        setLoading(false);

        // Handle navigation based on auth state
        if (session && (location.pathname === '/' || location.pathname === '/login')) {
          console.log("Auth state change: Has session, redirecting to work orders");
          navigate('/work-orders', { replace: true });
        } else if (!session && location.pathname !== '/' && location.pathname !== '/login') {
          console.log("Auth state change: No session, redirecting to login");
          navigate('/login', { replace: true });
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    } catch (error) {
      console.error("Error in auth provider:", error);
      setLoading(false);
    }
  }, [navigate, location.pathname]);

  return (
    <AuthContext.Provider value={{ session, loading, userRole }}>
      {children}
    </AuthContext.Provider>
  );
}
