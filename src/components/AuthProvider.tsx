
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
  const [profileLoading, setProfileLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Function to fetch user profile
  const fetchUserProfile = async (userId: string) => {
    if (!userId) return null;
    
    setProfileLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) {
        console.error("Error fetching user profile:", error);
        return null;
      }
      
      return data as UserProfile;
    } catch (error) {
      console.error("Exception fetching user profile:", error);
      return null;
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log("Auth state changed:", event, currentSession);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // Handle profile fetching
        if (currentSession?.user) {
          const userProfile = await fetchUserProfile(currentSession.user.id);
          setProfile(userProfile);
        } else {
          setProfile(null);
        }
        
        // Only redirect if we're on the login page and have a session
        if (currentSession && location.pathname === '/login') {
          console.log("Redirecting from auth state change");
          navigate('/dashboard', { replace: true });
        }
        
        // Always update loading state, even if profile fetch fails
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session: currentSession } }) => {
      console.log("Initial session check:", currentSession);
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      // Handle profile fetching
      if (currentSession?.user) {
        const userProfile = await fetchUserProfile(currentSession.user.id);
        setProfile(userProfile);
      }
      
      // Only redirect if we're on the login page and have a session
      if (currentSession && location.pathname === '/login') {
        console.log("Redirecting from initial session check");
        navigate('/dashboard', { replace: true });
      }
      
      // Always update loading state, even if profile fetch fails
      setLoading(false);
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
