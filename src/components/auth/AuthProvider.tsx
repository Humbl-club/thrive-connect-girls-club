
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: any | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (user: User) => {
    try {
      console.log("Fetching profile for user:", user.id);
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
      }

      if (profile) {
        console.log("Profile found:", profile);
        setProfile(profile);
      } else {
        console.log("No profile found, creating basic profile");
        // Create a basic profile if none exists
        const username = user.email ? user.email.split('@')[0] : `user_${Date.now()}`;
        
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            username,
            full_name: user.user_metadata?.full_name || null,
            avatar_url: user.user_metadata?.avatar_url || null,
          })
          .select()
          .single();

        if (insertError) {
          console.error('Error creating profile:', insertError);
          // Create a fallback profile
          const fallbackProfile = {
            id: user.id,
            username,
            full_name: user.user_metadata?.full_name || null,
            avatar_url: user.user_metadata?.avatar_url || null,
          };
          setProfile(fallbackProfile);
        } else {
          console.log("New profile created:", newProfile);
          setProfile(newProfile);
        }
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      // Create a fallback profile
      const username = user.email ? user.email.split('@')[0] : `user_${Date.now()}`;
      setProfile({
        id: user.id,
        username,
        full_name: user.user_metadata?.full_name || null,
        avatar_url: user.user_metadata?.avatar_url || null,
      });
    }
  };

  const refreshProfile = async () => {
    if (user) {
      console.log("Refreshing profile...");
      await fetchUserProfile(user);
    }
  };

  useEffect(() => {
    console.log("AuthProvider: Setting up auth listener");
    
    let isMounted = true;
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;
        
        console.log("Auth state change:", event, !!session);
        
        if (session?.user) {
          setSession(session);
          setUser(session.user);
          
          // Fetch profile asynchronously without blocking
          setTimeout(() => {
            if (isMounted) {
              fetchUserProfile(session.user);
            }
          }, 0);
        } else {
          setSession(null);
          setUser(null);
          setProfile(null);
        }
        
        // Set loading to false after handling the auth state
        if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
          setLoading(false);
        }
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error("Error getting initial session:", error);
        setLoading(false);
        return;
      }
      
      if (isMounted) {
        console.log("Initial session check:", !!session);
        
        if (session?.user) {
          setSession(session);
          setUser(session.user);
          // Profile will be fetched by the auth state change handler
        } else {
          setSession(null);
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    console.log("Signing out...");
    setLoading(true);
    await supabase.auth.signOut();
    // Auth state change handler will clean up the state
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
