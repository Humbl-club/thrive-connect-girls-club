
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from '@/pages/Index';
import Feed from '@/pages/Feed';
import Profile from '@/pages/Profile';
import Social from '@/pages/Social';
import Calendar from '@/pages/Calendar';
import Challenges from '@/pages/Challenges';
import Analytics from '@/pages/Analytics';
import Settings from '@/pages/Settings';
import Auth from '@/pages/Auth';
import ProfileSetup from '@/pages/ProfileSetup';
import NotFound from '@/pages/NotFound';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ProfileProtectedRoute } from '@/components/auth/ProfileProtectedRoute';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

function App() {
  const { toast } = useToast();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const setupBuckets = async () => {
      try {
        // Check if posts bucket exists
        const { data: buckets } = await supabase.storage.listBuckets();
        const postsBucket = buckets?.find(bucket => bucket.name === 'posts');
        
        if (!postsBucket) {
          // Create posts bucket
          await supabase.storage.createBucket('posts', {
            public: true,
            fileSizeLimit: 5 * 1024 * 1024, // 5MB limit
          });
          
          // Add RLS policies for posts bucket
          // Note: These policies should ideally be set up via SQL migrations
          console.log('Posts bucket created successfully');
        }
        
        setInitialized(true);
      } catch (error) {
        console.error('Error setting up storage buckets:', error);
      }
    };
    
    setupBuckets();
  }, []);

  if (!initialized) {
    return <div className="flex h-screen items-center justify-center">Initializing...</div>;
  }

  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route 
            path="/profile-setup" 
            element={
              <ProtectedRoute>
                <ProfileSetup />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/feed" 
            element={
              <ProfileProtectedRoute>
                <Feed />
              </ProfileProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProfileProtectedRoute>
                <Profile />
              </ProfileProtectedRoute>
            } 
          />
          <Route 
            path="/social" 
            element={
              <ProfileProtectedRoute>
                <Social />
              </ProfileProtectedRoute>
            } 
          />
          <Route 
            path="/calendar" 
            element={
              <ProfileProtectedRoute>
                <Calendar />
              </ProfileProtectedRoute>
            } 
          />
          <Route 
            path="/challenges" 
            element={
              <ProfileProtectedRoute>
                <Challenges />
              </ProfileProtectedRoute>
            } 
          />
          <Route 
            path="/analytics" 
            element={
              <ProfileProtectedRoute>
                <Analytics />
              </ProfileProtectedRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <ProfileProtectedRoute>
                <Settings />
              </ProfileProtectedRoute>
            } 
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </Router>
  );
}

export default App;
