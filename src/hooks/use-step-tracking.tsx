
import { useState, useEffect, useCallback } from 'react';
import { stepTracker, StepData } from '@/services/stepTracker';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/components/ui/use-toast';

export const useStepTracking = () => {
  const [currentSteps, setCurrentSteps] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [connectedSources, setConnectedSources] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Handle step count updates from any source
  const handleStepUpdate = useCallback(async (stepData: StepData) => {
    setCurrentSteps(stepData.steps);
    
    // Save to database if user is authenticated
    if (user) {
      try {
        const today = new Date().toISOString().split('T')[0];
        
        const { error } = await supabase
          .from('activity_data')
          .upsert({
            user_id: user.id,
            date: today,
            steps: stepData.steps,
            updated_at: new Date().toISOString()
          });

        if (error) {
          console.error('Failed to save step data:', error);
        }
      } catch (error) {
        console.error('Error saving step data:', error);
      }
    }
  }, [user]);

  // Initialize step tracking service
  useEffect(() => {
    stepTracker.setStepCountCallback(handleStepUpdate);
  }, [handleStepUpdate]);

  // Connect to device pedometer
  const connectDevice = async () => {
    setLoading(true);
    try {
      const success = await stepTracker.startDeviceTracking();
      if (success) {
        setIsTracking(true);
        setConnectedSources(prev => [...prev, 'device']);
        toast({
          title: "Device Connected",
          description: "Successfully connected to device pedometer"
        });
      } else {
        toast({
          title: "Connection Failed",
          description: "Could not access device pedometer. Please check permissions.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect to device pedometer",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Connect to Apple Health
  const connectAppleHealth = async () => {
    setLoading(true);
    try {
      const success = await stepTracker.connectAppleHealth();
      if (success) {
        setConnectedSources(prev => [...prev, 'apple_health']);
        toast({
          title: "Apple Health Connected",
          description: "Successfully connected to Apple Health"
        });
      } else {
        toast({
          title: "Connection Failed",
          description: "Could not connect to Apple Health. Make sure you're on iOS and have granted permissions.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect to Apple Health",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Connect to Google Fit
  const connectGoogleFit = async () => {
    setLoading(true);
    try {
      // Configure Google Fit client ID (you'll need to get this from Google Cloud Console)
      stepTracker.setConfig({
        googleFitClientId: 'your-google-fit-client-id'
      });
      
      const success = await stepTracker.connectGoogleFit();
      if (success) {
        setConnectedSources(prev => [...prev, 'google_fit']);
        toast({
          title: "Google Fit Connected",
          description: "Successfully connected to Google Fit"
        });
      } else {
        toast({
          title: "Connection Failed",
          description: "Could not connect to Google Fit. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect to Google Fit",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Connect to Fitbit
  const connectFitbit = async () => {
    setLoading(true);
    try {
      // Configure Fitbit client ID (you'll need to get this from Fitbit Dev Console)
      stepTracker.setConfig({
        fitbitClientId: 'your-fitbit-client-id'
      });
      
      const success = await stepTracker.connectFitbit();
      if (success) {
        // Note: This will redirect to Fitbit auth, so we don't set state here
        toast({
          title: "Redirecting to Fitbit",
          description: "You'll be redirected to authorize Fitbit access"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect to Fitbit",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Stop tracking
  const stopTracking = () => {
    stepTracker.stopTracking();
    setIsTracking(false);
  };

  // Load today's steps on mount
  useEffect(() => {
    const loadTodaySteps = async () => {
      if (user) {
        try {
          const today = new Date().toISOString().split('T')[0];
          
          const { data, error } = await supabase
            .from('activity_data')
            .select('steps')
            .eq('user_id', user.id)
            .eq('date', today)
            .single();

          if (data && !error) {
            setCurrentSteps(data.steps || 0);
          }
        } catch (error) {
          console.error('Error loading today steps:', error);
        }
      }
    };

    loadTodaySteps();
  }, [user]);

  return {
    currentSteps,
    isTracking,
    connectedSources,
    loading,
    connectDevice,
    connectAppleHealth,
    connectGoogleFit,
    connectFitbit,
    stopTracking
  };
};
