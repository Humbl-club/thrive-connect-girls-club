
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
  const [isReady, setIsReady] = useState(false);
  
  useEffect(() => {
    // Wait for auth to finish loading
    if (!loading) {
      console.log("Auth loading finished. User:", !!user, "Profile:", !!profile);
      if (user) {
        console.log("Profile data:", profile);
        // Give a small delay to ensure profile data is fully loaded
        setTimeout(() => {
          setIsReady(true);
        }, 100);
      } else {
        setIsReady(true);
      }
    }
  }, [loading, user, profile]);
  
  // Show loading while auth is initializing or we're waiting for profile data
  if (loading || !isReady) {
    console.log("Still loading - auth loading:", loading, "isReady:", isReady);
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  // Redirect to auth if no user
  if (!user) {
    console.log("No user, redirecting to auth");
    return <Navigate to="/auth" replace />;
  }

  // Check if profile setup is needed only if we require a profile
  if (requiresProfile && profile) {
    const needsProfileSetup = (
      !profile.full_name || 
      !profile.username || 
      !profile.instagram_handle
    );

    console.log("Profile check - needs setup:", needsProfileSetup);
    console.log("Profile fields:", {
      full_name: profile.full_name,
      username: profile.username,
      instagram_handle: profile.instagram_handle
    });
    
    if (needsProfileSetup) {
      console.log("Redirecting to profile setup");
      return <Navigate to="/profile-setup" replace />;
    }
  }
  
  // If we require a profile but don't have one yet, redirect to setup
  if (requiresProfile && !profile) {
    console.log("No profile found, redirecting to profile setup");
    return <Navigate to="/profile-setup" replace />;
  }
  
  console.log("Profile check passed, rendering children");
  return <>{children}</>;
}
