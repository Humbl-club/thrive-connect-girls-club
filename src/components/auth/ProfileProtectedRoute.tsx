
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";

interface ProfileProtectedRouteProps {
  children: React.ReactNode;
  requiresProfile?: boolean;
}

export function ProfileProtectedRoute({ 
  children, 
  requiresProfile = true 
}: ProfileProtectedRouteProps) {
  const { user, profile, loading } = useAuth();
  
  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Check if profile setup is needed - now checking for mandatory instagram_handle
  if (requiresProfile && profile && (
    profile.needs_setup || 
    !profile.full_name || 
    !profile.username || 
    !profile.instagram_handle
  )) {
    return <Navigate to="/profile-setup" replace />;
  }
  
  return <>{children}</>;
}
