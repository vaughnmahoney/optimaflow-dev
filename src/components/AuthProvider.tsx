
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

  // Determine fallback user role based on email
  const determineUserRoleFromEmail = (email: string | undefined) => {
    if (!email) return "";
    
    if (email.includes("lead")) {
      return "lead";
    } else if (email.includes("admin")) {
      return "admin";
    } else {
      return "user";
    }
  };

  // Fetch user role from database
  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("role")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching user role:", error);
        return null;
      }

      return data?.role || null;
    } catch (error) {
      console.error("Exception fetching user role:", error);
      return null;
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

  // Update user role when session changes
  useEffect(() => {
    const updateUserRole = async () => {
      if (session?.user?.id) {
        // First try to get role from database
        const dbRole = await fetchUserRole(session.user.id);
        
        if (dbRole) {
          setUserRole(dbRole);
        } else {
          // Fallback to email-based role
          setUserRole(determineUserRoleFromEmail(session.user.email));
        }
      } else {
        setUserRole("");
      }
    };

    updateUserRole();
  }, [session]);

  useEffect(() => {
    try {
      // Get initial session
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setLoading(false);
        handleNavigation(!!session);
      }).catch(error => {
        console.error("Error getting session:", error);
        setLoading(false);
      });

      // Listen for auth changes
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
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
