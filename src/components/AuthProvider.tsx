
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

interface AuthContextType {
  session: Session | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ session: null, loading: true });

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    try {
      // Get initial session
      supabase.auth.getSession().then(({ data: { session } }) => {
        console.log("Initial session check:", session);
        setSession(session);
        setLoading(false);
        
        // Handle navigation based on auth state
        if (!session && location.pathname !== '/' && location.pathname !== '/login') {
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
        setLoading(false);

        // Handle navigation based on auth state
        if (!session && location.pathname !== '/' && location.pathname !== '/login') {
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
    <AuthContext.Provider value={{ session, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
