
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

interface AuthContextType {
  session: Session | null;
  loading: boolean;
  userRole: string;
}

const AuthContext = createContext<AuthContextType>({ session: null, loading: true, userRole: "" });

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch the user role from the database based on user ID
  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("role")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching user role:", error);
        return "";
      }

      return data?.role || "";
    } catch (error) {
      console.error("Error in fetchUserRole:", error);
      return "";
    }
  };

  // Handle navigation based on auth state
  const handleNavigation = (hasSession: boolean) => {
    const isAuthRoute = location.pathname === '/' || location.pathname === '/login';
    
    if (hasSession && isAuthRoute) {
      navigate('/work-orders', { replace: true });
    } else if (!hasSession && !isAuthRoute) {
      navigate('/login', { replace: true });
    }
  };

  useEffect(() => {
    try {
      // Get initial session
      supabase.auth.getSession().then(async ({ data: { session } }) => {
        setSession(session);
        
        if (session?.user?.id) {
          // Fetch role from database instead of determining from email
          const dbRole = await fetchUserRole(session.user.id);
          setUserRole(dbRole);
        }
        
        setLoading(false);
        handleNavigation(!!session);
      }).catch(error => {
        console.error("Error getting session:", error);
        setLoading(false);
      });

      // Listen for auth changes
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (_event, session) => {
        setSession(session);
        
        if (session?.user?.id) {
          // Fetch role from database instead of determining from email
          const dbRole = await fetchUserRole(session.user.id);
          setUserRole(dbRole);
        } else {
          setUserRole("");
        }
        
        setLoading(false);
        handleNavigation(!!session);
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
