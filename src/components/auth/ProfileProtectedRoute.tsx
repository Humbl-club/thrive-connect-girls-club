
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
  const [profileChecked, setProfileChecked] = useState(false);
  
  useEffect(() => {
    // Only mark profile as checked after we have both user and profile data
    if (!loading && user && profile) {
      console.log("Profile data:", profile);
      setProfileChecked(true);
    }
  }, [loading, user, profile]);
  
  if (loading || !profileChecked) {
    console.log("Still loading or checking profile...");
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    console.log("No user, redirecting to auth");
    return <Navigate to="/auth" replace />;
  }

  // Check if profile setup is needed - checking for mandatory fields
  const needsProfileSetup = requiresProfile && profile && (
    !profile.full_name || 
    !profile.username || 
    !profile.instagram_handle
  );

  console.log("Needs profile setup:", needsProfileSetup);
  
  if (needsProfileSetup) {
    console.log("Redirecting to profile setup");
    return <Navigate to="/profile-setup" replace />;
  }
  
  console.log("Profile check passed, rendering children");
  return <>{children}</>;
}
