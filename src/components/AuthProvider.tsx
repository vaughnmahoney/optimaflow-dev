
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
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial session check:", session);
      setSession(session);
      setLoading(false);
      
      // Redirect based on session state
      if (session) {
        // If user is on login and has a session, redirect to dashboard
        if (location.pathname === '/login' || location.pathname === '/') {
          console.log("Redirecting to /dashboard from initial session check");
          navigate('/dashboard', { replace: true });
        }
      } else if (location.pathname !== '/login') {
        // If no session and not on login page, redirect to login
        console.log("No session, redirecting to login");
        navigate('/login', { replace: true });
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Auth state changed:", _event, session);
      setSession(session);
      setLoading(false);

      // Redirect based on session state
      if (session) {
        // If user is on login and has a session, redirect to dashboard
        if (location.pathname === '/login' || location.pathname === '/') {
          console.log("Redirecting to /dashboard from auth state change");
          navigate('/dashboard', { replace: true });
        }
      } else if (location.pathname !== '/login') {
        // If no session and not on login page, redirect to login
        console.log("No session, redirecting to login");
        navigate('/login', { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, location.pathname]);

  return (
    <AuthContext.Provider value={{ session, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
