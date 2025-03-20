
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface UserProfile {
  id: string;
  full_name: string | null;
  role: 'admin' | 'qc_reviewer' | 'billing_admin' | 'supervisor';
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  loading: true,
  isAdmin: false,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log("Auth state changed:", event, currentSession);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // Clear loading state immediately once we know the session status
        setLoading(false);
        
        // Attempt to fetch profile in background (but don't block UI on it)
        if (currentSession?.user) {
          try {
            const { data, error } = await supabase
              .from('user_profiles')
              .select('*')
              .eq('id', currentSession.user.id)
              .single();
              
            if (error) {
              console.error("Error fetching user profile:", error);
              setProfile(null);
            } else {
              setProfile(data as UserProfile);
            }
          } catch (error) {
            console.error("Exception fetching user profile:", error);
            setProfile(null);
          }
          
          // Only redirect if we're on the login page and have a session
          if (location.pathname === '/login') {
            console.log("Redirecting from auth state change");
            navigate('/dashboard', { replace: true });
          }
        } else {
          setProfile(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session: currentSession } }) => {
      console.log("Initial session check:", currentSession);
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      // Clear loading state immediately once we know the session status
      setLoading(false);
      
      // Attempt to fetch profile in background (but don't block UI on it)
      if (currentSession?.user) {
        try {
          const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', currentSession.user.id)
            .single();
            
          if (error) {
            console.error("Error fetching user profile:", error);
            setProfile(null);
          } else {
            setProfile(data as UserProfile);
          }
        } catch (error) {
          console.error("Exception fetching user profile:", error);
          setProfile(null);
        }
        
        // Only redirect if we're on the login page and have a session
        if (location.pathname === '/login') {
          console.log("Redirecting from initial session check");
          navigate('/dashboard', { replace: true });
        }
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, location.pathname]);

  const isAdmin = Boolean(profile?.role === 'admin');

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}
