
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

// Define a more specific type for Profile based on your Supabase schema
type Profile = Database['public']['Tables']['profiles']['Row'];

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (currentUser: User) => {
    try {
      const { data: userProfile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116: 'single' row not found
        console.error('Error fetching profile:', error.message);
        setProfile(null);
        return;
      }

      if (userProfile) {
        setProfile(userProfile as Profile);
      } else {
        const username = currentUser.email ? currentUser.email.split('@')[0] : `user_${Date.now()}`;
        
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: currentUser.id,
            username,
            full_name: currentUser.user_metadata?.full_name || null,
            avatar_url: currentUser.user_metadata?.avatar_url || null,
          })
          .select()
          .single();

        if (insertError) {
          console.error('Error creating profile:', insertError.message);
          const fallbackProfile: Profile = {
            id: currentUser.id,
            username,
            full_name: currentUser.user_metadata?.full_name || null,
            avatar_url: currentUser.user_metadata?.avatar_url || null,
            bio: null,
            birth_date: null,
            created_at: new Date().toISOString(),
            instagram_handle: null,
            location: null,
            updated_at: new Date().toISOString(),
          };
          setProfile(fallbackProfile);
        } else if (newProfile) {
          setProfile(newProfile as Profile);
        } else {
          setProfile(null);
        }
      }
    } catch (error: any) {
      console.error('Error in fetchUserProfile:', error.message);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchUserProfile(user);
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, currentSession) => {
        if (!isMounted) return;
        
        setLoading(true);
        
        if (currentSession?.user) {
          setSession(currentSession);
          setUser(currentSession.user);
          await fetchUserProfile(currentSession.user);
        } else {
          setSession(null);
          setUser(null);
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(async ({ data: { session: initialSession } }) => {
      if (!isMounted) return;
      if (initialSession?.user) {
        setSession(initialSession);
        setUser(initialSession.user);
        await fetchUserProfile(initialSession.user);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user, profile, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
