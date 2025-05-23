
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { useEffect, useState } from "react";

interface ProfileProtectedRouteProps {
  children: React.ReactNode;
  requiresProfile?: boolean;
}

export function ProfileProtectedRoute({ 
  children, 
  requiresProfile = true 
}: ProfileProtectedRouteProps) {
  const { user, profile, loading } = useAuth();
  const [authReady, setAuthReady] = useState(false);
  
  useEffect(() => {
    if (!loading) {
      console.log("Auth ready - User:", !!user, "Profile:", !!profile);
      if (profile) {
        console.log("Profile details:", {
          full_name: profile.full_name,
          username: profile.username,
          instagram_handle: profile.instagram_handle
        });
      }
      setAuthReady(true);
    }
  }, [loading, user, profile]);
  
  // Show loading while auth is initializing
  if (loading || !authReady) {
    console.log("Loading auth state...");
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  // Redirect to auth if no user
  if (!user) {
    console.log("No user found, redirecting to auth");
    return <Navigate to="/auth" replace />;
  }

  // If we require a profile, check if setup is needed
  if (requiresProfile) {
    // If no profile exists at all, redirect to setup
    if (!profile) {
      console.log("No profile found, redirecting to setup");
      return <Navigate to="/profile-setup" replace />;
    }
    
    // Check if profile is incomplete
    const isProfileIncomplete = !profile.full_name || !profile.username || !profile.instagram_handle;
    
    if (isProfileIncomplete) {
      console.log("Profile incomplete, redirecting to setup");
      return <Navigate to="/profile-setup" replace />;
    }
    
    console.log("Profile complete, allowing access");
  }
  
  return <>{children}</>;
}
