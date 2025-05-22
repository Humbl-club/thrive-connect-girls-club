
import { useState, useEffect } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { cn } from "@/lib/utils";

interface StepCounterProps {
  currentSteps: number;
  goalSteps?: number;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

export function StepCounter({
  currentSteps,
  goalSteps = 10000,
  size = "md",
  showText = true,
  className,
}: StepCounterProps) {
  const [percentage, setPercentage] = useState(0);
  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-36 h-36",
  };

  // Animate the progress
  useEffect(() => {
    const timer = setTimeout(() => {
      setPercentage(Math.min((currentSteps / goalSteps) * 100, 100));
    }, 200);

    return () => clearTimeout(timer);
  }, [currentSteps, goalSteps]);

  return (
    <div className={cn("relative flex flex-col items-center", className)}>
      <div className={cn(sizeClasses[size], "relative")}>
        <CircularProgressbar
          value={percentage}
          strokeWidth={10}
          styles={buildStyles({
            strokeLinecap: "round",
            pathTransitionDuration: 1,
            pathColor: `rgba(138, 43, 226, ${percentage / 100})`,
            trailColor: "#f3f4f6",
          })}
        />
        {showText && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn(
              "font-bold",
              size === "sm" ? "text-lg" : size === "md" ? "text-2xl" : "text-4xl"
            )}>
              {currentSteps.toLocaleString()}
            </span>
            <span className={cn(
              "text-xs text-muted-foreground",
              size === "lg" && "text-sm"
            )}>
              steps
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
