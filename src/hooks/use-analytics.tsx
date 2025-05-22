import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ActivityData {
  date: string;
  steps: number;
  caloriesBurned: number;
  distance: number;
  activeMinutes: number;
}

export interface WeeklyStats {
  totalSteps: number;
  totalCalories: number;
  totalDistance: number;
  totalActiveMinutes: number;
  dailyAvgSteps: number;
  goalCompletionRate: number;
  mostActiveDay: string;
}

export interface MonthlyStats {
  totalSteps: number;
  totalCalories: number;
  totalDistance: number;
  totalActiveMinutes: number;
  dailyAvgSteps: number;
  weeklyAvgSteps: number;
  goalCompletionRate: number;
  mostActiveWeek: number;
}

interface AnalyticsContextType {
  activityData: ActivityData[];
  weeklyStats: WeeklyStats | null;
  monthlyStats: MonthlyStats | null;
  isLoading: boolean;
  fetchActivityData: (startDate: Date, endDate: Date) => Promise<void>;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

// Mock data generation functions
const generateMockActivityData = (startDate: Date, endDate: Date): ActivityData[] => {
  const data: ActivityData[] = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const steps = Math.floor(Math.random() * 6000) + 4000; // Random between 4000-10000
    data.push({
      date: currentDate.toISOString().split('T')[0],
      steps,
      caloriesBurned: Math.floor(steps * 0.04),
      distance: parseFloat((steps * 0.0008).toFixed(2)), // miles
      activeMinutes: Math.floor(steps / 100),
    });
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return data;
};

const calculateWeeklyStats = (activityData: ActivityData[]): WeeklyStats => {
  const totalSteps = activityData.reduce((sum, day) => sum + day.steps, 0);
  const totalCalories = activityData.reduce((sum, day) => sum + day.caloriesBurned, 0);
  const totalDistance = activityData.reduce((sum, day) => sum + day.distance, 0);
  const totalActiveMinutes = activityData.reduce((sum, day) => sum + day.activeMinutes, 0);
  
  let mostActiveDay = activityData[0]?.date || "";
  let maxSteps = 0;
  
  activityData.forEach(day => {
    if (day.steps > maxSteps) {
      maxSteps = day.steps;
      mostActiveDay = day.date;
    }
  });
  
  const goalCompletedDays = activityData.filter(day => day.steps >= 10000).length;
  const goalCompletionRate = activityData.length > 0 
    ? parseFloat((goalCompletedDays / activityData.length).toFixed(2)) 
    : 0;
  
  return {
    totalSteps,
    totalCalories,
    totalDistance: parseFloat(totalDistance.toFixed(2)),
    totalActiveMinutes,
    dailyAvgSteps: activityData.length > 0 
      ? Math.round(totalSteps / activityData.length) 
      : 0,
    goalCompletionRate,
    mostActiveDay,
  };
};

const calculateMonthlyStats = (activityData: ActivityData[]): MonthlyStats => {
  const weeklyData: { week: number, steps: number }[] = [];
  let currentWeekNumber = 0;
  let currentWeekSteps = 0;
  let currentWeekStart = new Date(activityData[0]?.date || new Date());
  
  // Group by week
  activityData.forEach((day, index) => {
    const dayDate = new Date(day.date);
    
    // Check if we're starting a new week
    if (index > 0 && dayDate.getDay() === 0) {
      weeklyData.push({
        week: currentWeekNumber,
        steps: currentWeekSteps,
      });
      
      currentWeekNumber++;
      currentWeekSteps = 0;
      currentWeekStart = dayDate;
    }
    
    currentWeekSteps += day.steps;
    
    // Add the last week if we're at the end
    if (index === activityData.length - 1) {
      weeklyData.push({
        week: currentWeekNumber,
        steps: currentWeekSteps,
      });
    }
  });
  
  const totalSteps = activityData.reduce((sum, day) => sum + day.steps, 0);
  const totalCalories = activityData.reduce((sum, day) => sum + day.caloriesBurned, 0);
  const totalDistance = activityData.reduce((sum, day) => sum + day.distance, 0);
  const totalActiveMinutes = activityData.reduce((sum, day) => sum + day.activeMinutes, 0);
  
  const mostActiveWeekData = weeklyData.reduce(
    (max, week) => (week.steps > max.steps ? week : max),
    { week: 0, steps: 0 }
  );
  
  const goalCompletedDays = activityData.filter(day => day.steps >= 10000).length;
  const goalCompletionRate = activityData.length > 0 
    ? parseFloat((goalCompletedDays / activityData.length).toFixed(2)) 
    : 0;
  
  return {
    totalSteps,
    totalCalories,
    totalDistance: parseFloat(totalDistance.toFixed(2)),
    totalActiveMinutes,
    dailyAvgSteps: activityData.length > 0 
      ? Math.round(totalSteps / activityData.length)
      : 0,
    weeklyAvgSteps: weeklyData.length > 0
      ? Math.round(totalSteps / weeklyData.length)
      : 0,
    goalCompletionRate,
    mostActiveWeek: mostActiveWeekData.week + 1, // Make it 1-based for display
  };
};

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchActivityData = async (startDate: Date, endDate: Date) => {
    setIsLoading(true);
    
    try {
      // Try to get user session
      const { data: { session } } = await supabase.auth.getSession();
      
      let data: ActivityData[] = [];
      
      if (session?.user) {
        // If authenticated, try to get activity data from database
        try {
          const { data: dbData, error } = await supabase
            .from('activity_data')
            .select('*')
            .eq('user_id', session.user.id)
            .gte('date', startDate.toISOString().split('T')[0])
            .lte('date', endDate.toISOString().split('T')[0])
            .order('date', { ascending: true });
            
          if (error) {
            console.error("Error fetching activity data:", error);
            // Fall back to mock data
            data = generateMockActivityData(startDate, endDate);
          } else if (dbData && dbData.length > 0) {
            // Map the database response to our ActivityData interface
            data = dbData.map(item => ({
              date: item.date,
              steps: item.steps,
              caloriesBurned: item.calories_burned,
              distance: item.distance,
              activeMinutes: item.active_minutes,
            }));
          } else {
            // No data in database, use mock data
            data = generateMockActivityData(startDate, endDate);
          }
        } catch (error) {
          console.error("Error querying database:", error);
          data = generateMockActivityData(startDate, endDate);
        }
      } else {
        // Not authenticated, use mock data
        data = generateMockActivityData(startDate, endDate);
      }
      
      setActivityData(data);
      
      // Calculate stats based on data
      const weekly = calculateWeeklyStats(data);
      const monthly = calculateMonthlyStats(data);
      
      setWeeklyStats(weekly);
      setMonthlyStats(monthly);
    } catch (error) {
      console.error("Error in fetchActivityData:", error);
      // Use mock data as fallback
      const mockData = generateMockActivityData(startDate, endDate);
      setActivityData(mockData);
      setWeeklyStats(calculateWeeklyStats(mockData));
      setMonthlyStats(calculateMonthlyStats(mockData));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnalyticsContext.Provider 
      value={{ 
        activityData, 
        weeklyStats, 
        monthlyStats,
        isLoading,
        fetchActivityData
      }}
    >
      {children}
    </AnalyticsContext.Provider>
  );
}

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error("useAnalytics must be used within an AnalyticsProvider");
  }
  return context;
};
