
import { useEffect } from "react";
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
  
  // Try to start device tracking on component mount, but don't show errors here
  useEffect(() => {
    const initTracking = async () => {
      try {
        await startDeviceTracking();
      } catch (error) {
        // Silently fail - errors will be handled by the tracking hook
        console.log("Automatic step tracking not available");
      }
    };
    
    initTracking();
  }, [startDeviceTracking]);
  
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
          currentSteps={loading ? 0 : currentSteps}
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
        </div>
      </div>
    </div>
  );
}
