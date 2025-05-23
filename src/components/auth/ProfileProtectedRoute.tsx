
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
  
  console.log("ProfileProtectedRoute - State:", { 
    loading, 
    hasUser: !!user, 
    hasProfile: !!profile,
    profileData: profile 
  });
  
  // Show loading while auth is initializing
  if (loading) {
    console.log("ProfileProtectedRoute - Still loading auth state...");
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
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
