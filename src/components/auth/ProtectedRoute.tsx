
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  redirectTo = "/auth" 
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  
  // Check if profiles table exists
  useEffect(() => {
    const checkProfilesTable = async () => {
      if (!user) return;
      
      try {
        // Try to create profiles table if it doesn't exist
        // This triggers on first login
        await supabase.rpc('create_profiles_if_not_exists', {});
      } catch (error) {
        // This might fail if the function doesn't exist, which is fine
        console.log("Note: create_profiles_if_not_exists function not available");
      }
    };
    
    checkProfilesTable();
  }, [user]);
  
  if (loading) {
    // You could return a loading spinner here
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }
  
  return <>{children}</>;
}
