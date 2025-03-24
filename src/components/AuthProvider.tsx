
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

  // Helper function to fetch the user's role from the database
  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error("Error fetching user role:", error);
        return "user"; // Default role if there's an error
      }
      
      console.log("Fetched user role:", data);
      return data?.role || "user";
    } catch (err) {
      console.error("Exception in fetchUserRole:", err);
      return "user"; // Default role if there's an exception
    }
  };

  useEffect(() => {
    try {
      // Set up auth state listener FIRST
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (_event, currentSession) => {
          console.log("Auth state changed:", _event, currentSession);
          setSession(currentSession);
          
          // Fetch role from database if we have a user
          if (currentSession?.user?.id) {
            const role = await fetchUserRole(currentSession.user.id);
            setUserRole(role);
            console.log("Setting user role to:", role);
          } else {
            setUserRole("");
          }
          
          setLoading(false);

          // Handle navigation based on auth state
          if (currentSession && (location.pathname === '/' || location.pathname === '/login')) {
            console.log("Auth state change: Has session, redirecting to work orders");
            navigate('/work-orders', { replace: true });
          } else if (!currentSession && location.pathname !== '/' && location.pathname !== '/login') {
            console.log("Auth state change: No session, redirecting to login");
            navigate('/login', { replace: true });
          }
        }
      );

      // THEN check for existing session
      supabase.auth.getSession().then(async ({ data: { session: currentSession } }) => {
        console.log("Initial session check:", currentSession);
        setSession(currentSession);
        
        // Fetch role from database if we have a user
        if (currentSession?.user?.id) {
          const role = await fetchUserRole(currentSession.user.id);
          setUserRole(role);
          console.log("Setting initial user role to:", role);
        }
        
        setLoading(false);
        
        // Handle navigation based on auth state
        if (currentSession && (location.pathname === '/' || location.pathname === '/login')) {
          console.log("Has session, redirecting to work orders");
          navigate('/work-orders', { replace: true });
        } else if (!currentSession && location.pathname !== '/' && location.pathname !== '/login') {
          console.log("No session, redirecting to login");
          navigate('/login', { replace: true });
        }
      }).catch(error => {
        console.error("Error getting session:", error);
        setLoading(false);
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
