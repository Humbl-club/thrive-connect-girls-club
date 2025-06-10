
import { useEffect, useRef } from "react";
import { StepCounter } from "@/components/ui/step-counter";
import { Button } from "@/components/ui/button";
import { Footprints, MoreHorizontal, Settings, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useStepCount } from "@/hooks/use-step-count"; 

export function StepWidgetSmall() {
  const { 
    currentSteps, 
    dailyGoal, 
    loading, 
    startDeviceTracking 
  } = useStepCount();
  
  const trackingAttempted = useRef(false);
  
  // Try to start device tracking on component mount, but only once
  useEffect(() => {
    if (trackingAttempted.current) return;
    
    const initTracking = async () => {
      try {
        trackingAttempted.current = true;
        console.log('StepWidgetSmall: Attempting to start device tracking...');
        await startDeviceTracking();
        console.log('StepWidgetSmall: Device tracking started successfully');
      } catch (error) {
        console.log('StepWidgetSmall: Automatic step tracking not available:', error);
        // Don't show any popup or toast here - let the hook handle it
      }
    };
    
    // Use a short delay to prevent blocking the UI
    const timer = setTimeout(initTracking, 100);
    return () => clearTimeout(timer);
  }, []); // Remove startDeviceTracking from dependencies to prevent re-runs
  
  console.log('StepWidgetSmall render:', { currentSteps, dailyGoal, loading });
  
  return (
    <div className="bg-white rounded-xl girls-shadow p-4">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <Footprints className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Today's Steps</h3>
        </div>
        
        <div className="flex gap-1">
          <Link to="/analytics">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </Link>
          
          <Link to="/settings">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Settings className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="flex flex-col items-center justify-center">
        <StepCounter
          currentSteps={currentSteps}
          goalSteps={dailyGoal}
          size="md"
        />
        
        <div className="text-center mt-2">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">
              {Math.round((currentSteps / dailyGoal) * 100)}%
            </span> of daily goal
          </p>
          
          {currentSteps === 0 && !loading && (
            <p className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Use manual entry if needed
            </p>
          )}
          
          {loading && (
            <p className="text-xs text-muted-foreground mt-1">
              Loading steps...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
