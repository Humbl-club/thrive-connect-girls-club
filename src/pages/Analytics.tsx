
import { useState, useEffect } from "react";
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, ChevronLeft, ChevronRight, BarChart4, Activity, LineChart } from "lucide-react";
import { useAnalytics } from "@/hooks/use-analytics";
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";

const ActivityStats = () => {
  const [timeframe, setTimeframe] = useState<"week" | "month">("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  const { activityData, weeklyStats, monthlyStats, fetchActivityData, isLoading } = useAnalytics();

  useEffect(() => {
    const loadData = async () => {
      let startDate: Date;
      let endDate: Date;
      
      if (timeframe === "week") {
        startDate = startOfWeek(currentDate, { weekStartsOn: 0 });
        endDate = endOfWeek(currentDate, { weekStartsOn: 0 });
      } else {
        startDate = startOfMonth(currentDate);
        endDate = endOfMonth(currentDate);
      }
      
      await fetchActivityData(startDate, endDate);
    };
    
    loadData();
  }, [timeframe, currentDate, fetchActivityData]);

  const goToPrevious = () => {
    if (timeframe === "week") {
      setCurrentDate(prevDate => subDays(prevDate, 7));
    } else {
      const prevMonth = new Date(currentDate);
      prevMonth.setMonth(prevMonth.getMonth() - 1);
      setCurrentDate(prevMonth);
    }
  };

  const goToNext = () => {
    if (timeframe === "week") {
      setCurrentDate(prevDate => {
        const newDate = new Date(prevDate);
        newDate.setDate(newDate.getDate() + 7);
        return newDate > new Date() ? new Date() : newDate;
      });
    } else {
      const nextMonth = new Date(currentDate);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      setCurrentDate(nextMonth > new Date() ? new Date() : nextMonth);
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const formatChartData = () => {
    return activityData.map(day => ({
      date: format(new Date(day.date), 'MMM dd'),
      steps: day.steps,
      distance: day.distance,
      calories: day.caloriesBurned,
      active: day.activeMinutes,
    }));
  };

  const chartData = formatChartData();

  return (
    <AppLayout>
      <div className="container px-4 py-6 pb-20 max-w-md mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Analytics</h1>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
        </div>

        <Tabs value={timeframe} onValueChange={(v) => setTimeframe(v as "week" | "month")}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="week">Weekly</TabsTrigger>
            <TabsTrigger value="month">Monthly</TabsTrigger>
          </TabsList>

          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" size="icon" onClick={goToPrevious}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-primary" />
              <h2 className="font-medium">
                {timeframe === "week" && 
                  `${format(startOfWeek(currentDate, { weekStartsOn: 0 }), "MMM d")} - ${format(endOfWeek(currentDate, { weekStartsOn: 0 }), "MMM d, yyyy")}`}
                {timeframe === "month" && 
                  format(currentDate, "MMMM yyyy")}
              </h2>
            </div>
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={goToNext} 
              disabled={
                timeframe === "week" 
                  ? startOfWeek(currentDate, { weekStartsOn: 0 }) >= startOfWeek(new Date(), { weekStartsOn: 0 })
                  : startOfMonth(currentDate) >= startOfMonth(new Date())
              }
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          <div className="bg-white rounded-xl girls-shadow p-4 mb-6">
            <h3 className="font-semibold mb-4 flex items-center">
              <Activity className="h-5 w-5 mr-2 text-primary" />
              {timeframe === "week" ? "Weekly" : "Monthly"} Overview
            </h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">Total Steps</p>
                <p className="text-xl font-bold text-primary">
                  {timeframe === "week" 
                    ? weeklyStats?.totalSteps.toLocaleString() 
                    : monthlyStats?.totalSteps.toLocaleString()}
                </p>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">Total Distance</p>
                <p className="text-xl font-bold text-primary">
                  {timeframe === "week" 
                    ? weeklyStats?.totalDistance 
                    : monthlyStats?.totalDistance} mi
                </p>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">Calories Burned</p>
                <p className="text-xl font-bold text-primary">
                  {timeframe === "week" 
                    ? weeklyStats?.totalCalories.toLocaleString() 
                    : monthlyStats?.totalCalories.toLocaleString()}
                </p>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">Active Minutes</p>
                <p className="text-xl font-bold text-primary">
                  {timeframe === "week" 
                    ? weeklyStats?.totalActiveMinutes.toLocaleString() 
                    : monthlyStats?.totalActiveMinutes.toLocaleString()}
                </p>
              </div>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-lg mb-4">
              <p className="text-sm text-muted-foreground">Daily Average</p>
              <p className="text-xl font-bold text-primary">
                {timeframe === "week" 
                  ? weeklyStats?.dailyAvgSteps.toLocaleString() 
                  : monthlyStats?.dailyAvgSteps.toLocaleString()} steps
              </p>
              <div className="h-2 w-full bg-gray-200 rounded-full mt-1">
                <div 
                  className="h-full bg-primary rounded-full" 
                  style={{ 
                    width: `${Math.min(
                      ((timeframe === "week" 
                        ? weeklyStats?.dailyAvgSteps 
                        : monthlyStats?.dailyAvgSteps) || 0) / 100, 
                      100
                    )}%` 
                  }}
                />
              </div>
            </div>
            
            {timeframe === "week" && weeklyStats && (
              <div className="text-sm">
                <p>Most active day: <span className="font-medium">{format(new Date(weeklyStats.mostActiveDay), "EEEE")}</span></p>
                <p>Goal completion rate: <span className="font-medium">{(weeklyStats.goalCompletionRate * 100).toFixed(0)}%</span></p>
              </div>
            )}
            
            {timeframe === "month" && monthlyStats && (
              <div className="text-sm">
                <p>Most active week: <span className="font-medium">Week {monthlyStats.mostActiveWeek}</span></p>
                <p>Weekly average: <span className="font-medium">{monthlyStats.weeklyAvgSteps.toLocaleString()} steps</span></p>
                <p>Goal completion rate: <span className="font-medium">{(monthlyStats.goalCompletionRate * 100).toFixed(0)}%</span></p>
              </div>
            )}
          </div>

          <TabsContent value="week" className="space-y-6">
            <div className="bg-white rounded-xl girls-shadow p-4">
              <h3 className="font-semibold mb-4 flex items-center">
                <LineChart className="h-5 w-5 mr-2 text-primary" />
                Daily Steps
              </h3>
              
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart
                    data={chartData}
                    margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }} 
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }} 
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => value.toLocaleString()}
                    />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="steps" 
                      stroke="var(--primary)" 
                      strokeWidth={2} 
                      dot={{ strokeWidth: 2 }}
                      activeDot={{ r: 6 }}
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="bg-white rounded-xl girls-shadow p-4">
              <h3 className="font-semibold mb-4 flex items-center">
                <BarChart4 className="h-5 w-5 mr-2 text-secondary" />
                Activity Breakdown
              </h3>
              
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }} 
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }} 
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => value.toLocaleString()}
                    />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="distance" name="Distance (mi)" fill="var(--primary)" />
                    <Bar dataKey="active" name="Active (min)" fill="var(--secondary)" />
                    <Bar dataKey="calories" name="Calories" fill="var(--accent)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="month" className="space-y-6">
            <div className="bg-white rounded-xl girls-shadow p-4">
              <h3 className="font-semibold mb-4 flex items-center">
                <LineChart className="h-5 w-5 mr-2 text-primary" />
                Monthly Progress
              </h3>
              
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart
                    data={chartData}
                    margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }} 
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }} 
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => value.toLocaleString()}
                    />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="steps" 
                      stroke="var(--primary)" 
                      strokeWidth={2} 
                      dot={{ strokeWidth: 2 }}
                      activeDot={{ r: 6 }}
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="bg-white rounded-xl girls-shadow p-4">
              <h3 className="font-semibold mb-4">Monthly Trends</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Daily Step Progress</p>
                  <div className="h-2 w-full bg-gray-100 rounded-full">
                    <div 
                      className="h-full bg-primary rounded-full" 
                      style={{ width: `${Math.min((monthlyStats?.goalCompletionRate || 0) * 100, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span>0%</span>
                    <span>{Math.round((monthlyStats?.goalCompletionRate || 0) * 100)}% of days met goal</span>
                    <span>100%</span>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Active Days Distribution</p>
                  <div className="grid grid-cols-7 gap-2 mt-2">
                    {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => {
                      // Generate random activity level for each day
                      const activity = Math.random();
                      return (
                        <div key={index} className="text-center">
                          <div 
                            className="h-16 w-full rounded-md mx-auto"
                            style={{ 
                              background: `rgba(138, 43, 226, ${activity})`,
                            }}
                          />
                          <span className="text-xs block mt-1">{day}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default ActivityStats;
