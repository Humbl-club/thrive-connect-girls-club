
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
  const [trackingDisabled, setTrackingDisabled] = useState(false);
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

  // Show error and disable tracking
  const disableTrackingWithError = useCallback((message: string) => {
    setTrackingDisabled(true);
    setIsTracking(false);
    setLoading(false);
    stepTracker.stopTracking();
    
    toast({
      title: "Step Tracking Unavailable",
      description: message,
      variant: "destructive"
    });
  }, [toast]);

  // Connect to device pedometer
  const connectDevice = async () => {
    if (trackingDisabled) return;
    
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
        disableTrackingWithError("Device step tracking is not available on this device or browser. Please try manual step entry instead.");
      }
    } catch (error) {
      disableTrackingWithError("Step tracking cannot be accessed. Please use manual step entry.");
    } finally {
      setLoading(false);
    }
  };

  // Connect to Apple Health
  const connectAppleHealth = async () => {
    if (trackingDisabled) return;
    
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
        disableTrackingWithError("Apple Health is not available. This feature requires iOS 16+ and installation as a web app.");
      }
    } catch (error) {
      disableTrackingWithError("Apple Health connection failed. Please use manual step entry.");
    } finally {
      setLoading(false);
    }
  };

  // Connect to Google Fit
  const connectGoogleFit = async () => {
    if (trackingDisabled) return;
    
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
        disableTrackingWithError("Google Fit connection is not configured. Please use manual step entry.");
      }
    } catch (error) {
      disableTrackingWithError("Google Fit is not available. Please use manual step entry.");
    } finally {
      setLoading(false);
    }
  };

  // Connect to Fitbit
  const connectFitbit = async () => {
    if (trackingDisabled) return;
    
    setLoading(true);
    try {
      // Configure Fitbit client ID (you'll need to get this from Fitbit Dev Console)
      stepTracker.setConfig({
        fitbitClientId: 'your-fitbit-client-id'
      });
      
      const success = await stepTracker.connectFitbit();
      if (success) {
        toast({
          title: "Redirecting to Fitbit",
          description: "You'll be redirected to authorize Fitbit access"
        });
      }
    } catch (error) {
      disableTrackingWithError("Fitbit connection is not available. Please use manual step entry.");
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
    trackingDisabled,
    connectDevice,
    connectAppleHealth,
    connectGoogleFit,
    connectFitbit,
    stopTracking
  };
};
