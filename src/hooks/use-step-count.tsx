
import { useState, useEffect } from "react";
import { stepTracker, StepData } from "@/services/stepTracker";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/hooks/use-toast";

export interface StepCountOptions {
  autoSync?: boolean;
  syncInterval?: number;
}

export function useStepCount(options: StepCountOptions = {}) {
  const { autoSync = true, syncInterval = 30000 } = options;
  const [currentSteps, setCurrentSteps] = useState<number>(0);
  const [dailyGoal, setDailyGoal] = useState<number>(10000);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [trackingSource, setTrackingSource] = useState<'device' | 'fitbit' | 'apple_health' | 'google_fit' | 'manual' | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch steps from database on initial load
  useEffect(() => {
    if (!user) return;
    
    const fetchStepsFromDB = async () => {
      setLoading(true);
      try {
        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split('T')[0];
        
        // Fetch today's step count from the database
        const { data, error } = await supabase
          .from('activity_data')
          .select('steps')
          .eq('user_id', user.id)
          .eq('date', today)
          .maybeSingle();
        
        if (error) throw error;
        
        // If data exists, update the state
        if (data) {
          setCurrentSteps(data.steps || 0);
        }
      } catch (err: any) {
        console.error("Error fetching steps from database:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStepsFromDB();

    // Also fetch user settings for daily goal
    const fetchUserSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('user_settings')
          .select('settings')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (error) throw error;
        
        if (data?.settings?.stepGoal) {
          setDailyGoal(data.settings.stepGoal);
        }
      } catch (err) {
        console.error("Error fetching user settings:", err);
      }
    };

    fetchUserSettings();
  }, [user]);

  // Set up step tracking
  useEffect(() => {
    // Set up the step counter callback
    stepTracker.setStepCountCallback((data: StepData) => {
      setCurrentSteps(data.steps);
      setTrackingSource(data.source);
      
      // If user is logged in, save steps to database
      if (user) {
        saveStepsToDB(data.steps, data.source).catch(console.error);
      }
    });

    return () => {
      // Clean up by stopping tracking when component unmounts
      if (stepTracker.getTrackingStatus()) {
        stepTracker.stopTracking();
      }
    };
  }, [user]);

  // Auto sync to database at regular intervals if enabled
  useEffect(() => {
    if (!autoSync || !user) return;
    
    const syncTimer = setInterval(() => {
      if (currentSteps > 0) {
        saveStepsToDB(currentSteps, trackingSource || 'manual').catch(console.error);
      }
    }, syncInterval);
    
    return () => clearInterval(syncTimer);
  }, [autoSync, syncInterval, currentSteps, user, trackingSource]);

  // Save steps to the database
  const saveStepsToDB = async (steps: number, source: StepData['source']) => {
    if (!user) return;
    
    try {
      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0];
      
      // Check if an entry for today exists
      const { data: existingData, error: fetchError } = await supabase
        .from('activity_data')
        .select('id, steps')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();
      
      if (fetchError) throw fetchError;
      
      if (existingData) {
        // Update existing entry if the new step count is higher
        if (steps > (existingData.steps || 0)) {
          const { error: updateError } = await supabase
            .from('activity_data')
            .update({ 
              steps: steps,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingData.id);
          
          if (updateError) throw updateError;
        }
      } else {
        // Create new entry for today
        const { error: insertError } = await supabase
          .from('activity_data')
          .insert({
            user_id: user.id,
            date: today,
            steps: steps
          });
        
        if (insertError) throw insertError;
      }
    } catch (err: any) {
      console.error("Error saving steps to database:", err);
      setError(err.message);
    }
  };

  // Start device tracking
  const startDeviceTracking = async () => {
    try {
      const success = await stepTracker.startDeviceTracking();
      if (success) {
        setTrackingSource('device');
        toast({
          title: "Step tracking started",
          description: "Using device sensors to track steps",
        });
      } else {
        toast({
          title: "Could not start tracking",
          description: "Device sensors not available or permission denied",
          variant: "destructive"
        });
      }
      return success;
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error starting step tracking",
        description: err.message,
        variant: "destructive"
      });
      return false;
    }
  };

  // Connect to fitness services
  const connectFitbit = async () => {
    try {
      const success = await stepTracker.connectFitbit();
      if (success) {
        setTrackingSource('fitbit');
        toast({
          title: "Connected to Fitbit",
          description: "Your Fitbit steps will now be tracked",
        });
      }
      return success;
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error connecting to Fitbit",
        description: err.message,
        variant: "destructive"
      });
      return false;
    }
  };

  const connectGoogleFit = async () => {
    try {
      const success = await stepTracker.connectGoogleFit();
      if (success) {
        setTrackingSource('google_fit');
        toast({
          title: "Connected to Google Fit",
          description: "Your Google Fit steps will now be tracked",
        });
      }
      return success;
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error connecting to Google Fit",
        description: err.message,
        variant: "destructive"
      });
      return false;
    }
  };

  const connectAppleHealth = async () => {
    try {
      const success = await stepTracker.connectAppleHealth();
      if (success) {
        setTrackingSource('apple_health');
        toast({
          title: "Connected to Apple Health",
          description: "Your Apple Health steps will now be tracked",
        });
      }
      return success;
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error connecting to Apple Health",
        description: err.message,
        variant: "destructive"
      });
      return false;
    }
  };

  // Update steps manually
  const updateStepsManually = async (steps: number) => {
    setCurrentSteps(steps);
    setTrackingSource('manual');
    
    if (user) {
      await saveStepsToDB(steps, 'manual');
      toast({
        title: "Steps updated",
        description: `Manually updated to ${steps} steps`,
      });
    }
    
    return true;
  };

  // Update daily goal
  const updateDailyGoal = async (goal: number) => {
    setDailyGoal(goal);
    
    if (user) {
      try {
        // Get current settings
        const { data, error: fetchError } = await supabase
          .from('user_settings')
          .select('settings')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (fetchError) throw fetchError;
        
        if (data) {
          // Update existing settings
          const newSettings = { ...data.settings, stepGoal: goal };
          const { error: updateError } = await supabase
            .from('user_settings')
            .update({ settings: newSettings })
            .eq('user_id', user.id);
          
          if (updateError) throw updateError;
        } else {
          // Create new settings
          const { error: insertError } = await supabase
            .from('user_settings')
            .insert({
              user_id: user.id,
              settings: { stepGoal: goal }
            });
          
          if (insertError) throw insertError;
        }
        
        toast({
          title: "Daily goal updated",
          description: `New goal set to ${goal.toLocaleString()} steps`,
        });
      } catch (err: any) {
        console.error("Error updating daily goal:", err);
        toast({
          title: "Error updating goal",
          description: err.message,
          variant: "destructive"
        });
        return false;
      }
    }
    
    return true;
  };

  return {
    currentSteps,
    dailyGoal,
    loading,
    error,
    trackingSource,
    progress: dailyGoal > 0 ? (currentSteps / dailyGoal) * 100 : 0,
    startDeviceTracking,
    connectFitbit,
    connectGoogleFit,
    connectAppleHealth,
    updateStepsManually,
    updateDailyGoal,
    saveStepsToDB
  };
}
