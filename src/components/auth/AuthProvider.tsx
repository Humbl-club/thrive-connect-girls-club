
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
  clearAuthState: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const clearAuthState = () => {
    console.log("AuthProvider: Clearing auth state manually");
    setSession(null);
    setUser(null);
    setProfile(null);
    setLoading(false);
  };

  const fetchUserProfile = async (currentUser: User) => {
    try {
      console.log("Fetching profile for user:", currentUser.id);
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
        console.log("Profile found:", userProfile);
        setProfile(userProfile as Profile);
      } else {
        console.log("No profile found, creating one...");
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
            role: 'user',
            updated_at: new Date().toISOString(),
          };
          setProfile(fallbackProfile);
        } else if (newProfile) {
          console.log("Profile created:", newProfile);
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
    
    console.log("AuthProvider: Initializing auth...");
    
    const initializeAuth = async () => {
      try {
        // Add a small delay to ensure Supabase is ready
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Check if Supabase client is properly initialized
        console.log("AuthProvider: Checking Supabase connection...");
        
        // First, get the current session
        console.log("AuthProvider: Getting initial session...");
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting initial session:", error);
          if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            console.error("Supabase connection error - check your internet connection and Supabase config");
            if (isMounted) {
              setLoading(false);
            }
            return;
          }
          throw error;
        }
        
        console.log("AuthProvider: Initial session result:", { 
          hasSession: !!initialSession, 
          hasUser: !!initialSession?.user,
          sessionId: initialSession?.access_token ? 'present' : 'missing'
        });
        
        if (!isMounted) return;
        
        if (initialSession?.user) {
          console.log("AuthProvider: Setting initial session and user");
          setSession(initialSession);
          setUser(initialSession.user);
          await fetchUserProfile(initialSession.user);
        } else {
          console.log("AuthProvider: No initial session found");
          setSession(null);
          setUser(null);
          setProfile(null);
        }
        
        console.log("AuthProvider: Finished initial auth setup");
        setLoading(false);
        
      } catch (error) {
        console.error("Error in initializeAuth:", error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Set up auth state change listener
    console.log("AuthProvider: Setting up auth state listener");
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log("Auth state change event:", event, { 
          hasSession: !!currentSession, 
          hasUser: !!currentSession?.user 
        });
        
        if (!isMounted) return;
        
        // Only handle auth state changes after initial load
        if (loading) {
          console.log("AuthProvider: Ignoring auth state change during initial load");
          return;
        }
        
        console.log("AuthProvider: Processing auth state change");
        
        if (currentSession?.user) {
          setSession(currentSession);
          setUser(currentSession.user);
          await fetchUserProfile(currentSession.user);
        } else {
          setSession(null);
          setUser(null);
          setProfile(null);
        }
      }
    );

    // Initialize authentication
    initializeAuth();

    return () => {
      console.log("AuthProvider: Cleaning up");
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    console.log("AuthProvider: Signing out...");
    try {
      await supabase.auth.signOut();
      // Clear local state immediately
      setSession(null);
      setUser(null);
      setProfile(null);
      console.log("AuthProvider: Sign out completed");
    } catch (error) {
      console.error("Error signing out:", error);
      // Clear local state even if signOut fails
      setSession(null);
      setUser(null);
      setProfile(null);
    }
  };

  const value = {
    session,
    user,
    profile,
    loading,
    signOut,
    refreshProfile,
    clearAuthState
  };

  console.log("AuthProvider rendering with state:", {
    loading,
    hasUser: !!user,
    hasProfile: !!profile,
    isProfileComplete: profile ? !!(profile.full_name && profile.username && profile.instagram_handle) : false
  });

  return (
    <AuthContext.Provider value={value}>
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
