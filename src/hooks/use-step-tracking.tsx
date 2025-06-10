
import { useState, useEffect, useCallback, useRef } from 'react';
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
  const [initialized, setInitialized] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Prevent multiple error messages
  const errorShown = useRef(false);

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

  // Initialize step tracking service once
  useEffect(() => {
    if (!initialized) {
      console.log('Initializing step tracker...');
      
      // Check if step tracking is available
      const checkAvailability = async () => {
        try {
          // Quick check for step tracking availability
          if (!('permissions' in navigator) || !stepTracker) {
            console.log('Step tracking not available on this device');
            setTrackingDisabled(true);
            setInitialized(true);
            return;
          }
          
          stepTracker.setStepCountCallback(handleStepUpdate);
          setInitialized(true);
          console.log('Step tracker initialized successfully');
        } catch (error) {
          console.error('Error initializing step tracker:', error);
          setTrackingDisabled(true);
          setInitialized(true);
        }
      };
      
      checkAvailability();
    }
  }, [handleStepUpdate, initialized]);

  // Show single error and disable tracking - only once
  const disableTrackingWithError = useCallback((message: string) => {
    if (errorShown.current) return; // Prevent multiple error messages
    
    console.log('Disabling tracking:', message);
    errorShown.current = true;
    setTrackingDisabled(true);
    setIsTracking(false);
    setLoading(false);
    
    try {
      stepTracker.stopTracking();
    } catch (error) {
      console.error('Error stopping tracker:', error);
    }
    
    toast({
      title: "Step Tracking Disabled",
      description: message,
      variant: "destructive"
    });
  }, [toast]);

  // Connect to device pedometer with timeout
  const connectDevice = async () => {
    if (trackingDisabled || loading || errorShown.current) return false;
    
    setLoading(true);
    console.log('Attempting to connect device...');
    
    try {
      // Add timeout to prevent hanging
      const connectPromise = stepTracker.startDeviceTracking();
      const timeoutPromise = new Promise<boolean>((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), 5000) // Reduced timeout
      );
      
      const success = await Promise.race([connectPromise, timeoutPromise]);
      
      if (success) {
        setIsTracking(true);
        setConnectedSources(prev => [...prev, 'device']);
        toast({
          title: "Device Connected",
          description: "Successfully connected to device pedometer"
        });
        setLoading(false);
        return true;
      } else {
        disableTrackingWithError("Device step tracking is not available. You can manually enter your steps instead.");
        return false;
      }
    } catch (error: any) {
      console.error('Device connection error:', error);
      disableTrackingWithError("Step tracking is not available on this device. You can manually enter your steps instead.");
      return false;
    }
  };

  // Connect to Apple Health with timeout
  const connectAppleHealth = async () => {
    if (trackingDisabled || loading || errorShown.current) return false;
    
    setLoading(true);
    try {
      const connectPromise = stepTracker.connectAppleHealth();
      const timeoutPromise = new Promise<boolean>((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), 3000)
      );
      
      const success = await Promise.race([connectPromise, timeoutPromise]);
      
      if (success) {
        setConnectedSources(prev => [...prev, 'apple_health']);
        toast({
          title: "Apple Health Connected",
          description: "Successfully connected to Apple Health"
        });
        setLoading(false);
        return true;
      } else {
        disableTrackingWithError("Apple Health is not available. Manual step entry is available.");
        return false;
      }
    } catch (error) {
      disableTrackingWithError("Apple Health connection failed. Manual step entry is available.");
      return false;
    }
  };

  // Connect to Google Fit with timeout
  const connectGoogleFit = async () => {
    if (trackingDisabled || loading || errorShown.current) return false;
    
    setLoading(true);
    try {
      const connectPromise = stepTracker.connectGoogleFit();
      const timeoutPromise = new Promise<boolean>((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), 3000)
      );
      
      const success = await Promise.race([connectPromise, timeoutPromise]);
      
      if (success) {
        setConnectedSources(prev => [...prev, 'google_fit']);
        toast({
          title: "Google Fit Connected",
          description: "Successfully connected to Google Fit"
        });
        setLoading(false);
        return true;
      } else {
        disableTrackingWithError("Google Fit connection is not configured. Manual step entry is available.");
        return false;
      }
    } catch (error) {
      disableTrackingWithError("Google Fit is not available. Manual step entry is available.");
      return false;
    }
  };

  // Connect to Fitbit with timeout
  const connectFitbit = async () => {
    if (trackingDisabled || loading || errorShown.current) return false;
    
    setLoading(true);
    try {
      const success = await stepTracker.connectFitbit();
      if (success) {
        toast({
          title: "Redirecting to Fitbit",
          description: "You'll be redirected to authorize Fitbit access"
        });
      }
      setLoading(false);
      return success;
    } catch (error) {
      disableTrackingWithError("Fitbit connection is not available. Manual step entry is available.");
      return false;
    }
  };

  // Stop tracking
  const stopTracking = () => {
    try {
      stepTracker.stopTracking();
      setIsTracking(false);
    } catch (error) {
      console.error('Error stopping tracking:', error);
    }
  };

  // Load today's steps on mount
  useEffect(() => {
    if (!user || !initialized) return;
    
    const loadTodaySteps = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        
        const { data, error } = await supabase
          .from('activity_data')
          .select('steps')
          .eq('user_id', user.id)
          .eq('date', today)
          .maybeSingle();

        if (data && !error) {
          setCurrentSteps(data.steps || 0);
        }
      } catch (error) {
        console.error('Error loading today steps:', error);
      }
    };

    loadTodaySteps();
  }, [user, initialized]);

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
