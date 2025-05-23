
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
      console.log("ProfileProtectedRoute - Auth ready. User:", !!user, "Profile:", !!profile);
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
    console.log("ProfileProtectedRoute - Loading auth state...");
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  // Redirect to auth if no user
  if (!user) {
    console.log("ProfileProtectedRoute - No user found, redirecting to auth");
    return <Navigate to="/auth" replace />;
  }

  // If we require a profile, check if setup is needed
  if (requiresProfile) {
    // If no profile exists at all, redirect to setup
    if (!profile) {
      console.log("ProfileProtectedRoute - No profile found, redirecting to setup");
      return <Navigate to="/profile-setup" replace />;
    }
    
    // Check if profile is incomplete (missing required fields)
    const isProfileIncomplete = !profile.full_name || !profile.username || !profile.instagram_handle;
    
    if (isProfileIncomplete) {
      console.log("ProfileProtectedRoute - Profile incomplete, redirecting to setup. Missing:", {
        full_name: !profile.full_name,
        username: !profile.username,
        instagram_handle: !profile.instagram_handle
      });
      return <Navigate to="/profile-setup" replace />;
    }
    
    console.log("ProfileProtectedRoute - Profile complete, allowing access");
  }
  
  return <>{children}</>;
}
