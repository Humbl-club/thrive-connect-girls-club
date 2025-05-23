
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
    if (!loading && user) {
      setProfileChecked(true);
    }
  }, [loading, user, profile]);
  
  if (loading || !profileChecked) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Check if profile setup is needed - checking for mandatory fields
  const needsProfileSetup = requiresProfile && profile && (
    !profile.full_name || 
    !profile.username || 
    !profile.instagram_handle
  );

  if (needsProfileSetup) {
    return <Navigate to="/profile-setup" replace />;
  }
  
  return <>{children}</>;
}
