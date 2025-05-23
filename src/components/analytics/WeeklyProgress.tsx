
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format, startOfWeek, endOfWeek, eachWeekOfInterval, subWeeks } from 'date-fns';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';

interface WeeklyData {
  week: string;
  steps: number;
  goal: number;
}

export function WeeklyProgress() {
  const [data, setData] = useState<WeeklyData[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchWeeklyData = async () => {
      if (!user) return;
      
      try {
        // Get last 4 weeks
        const weeks = eachWeekOfInterval({
          start: subWeeks(new Date(), 3),
          end: new Date()
        });

        const weeklyData: WeeklyData[] = [];

        for (const week of weeks) {
          const start = startOfWeek(week);
          const end = endOfWeek(week);
          
          const { data: stepData, error } = await supabase
            .from('activity_data')
            .select('steps')
            .eq('user_id', user.id)
            .gte('date', start.toISOString().split('T')[0])
            .lte('date', end.toISOString().split('T')[0]);

          if (error) throw error;

          const totalSteps = stepData.reduce((sum, day) => sum + (day.steps || 0), 0);
          
          weeklyData.push({
            week: format(start, 'MM/dd'),
            steps: totalSteps,
            goal: 70000 // Weekly goal (10k * 7 days)
          });
        }

        setData(weeklyData);
      } catch (error) {
        console.error('Error fetching weekly data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeeklyData();
  }, [user]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Weekly Progress</CardTitle>
          <CardDescription>Your weekly step totals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Progress</CardTitle>
        <CardDescription>Your weekly step totals over the last 4 weeks</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" />
            <YAxis />
            <Tooltip 
              formatter={(value, name) => [
                `${value.toLocaleString()} steps`, 
                name === 'steps' ? 'Steps' : 'Goal'
              ]}
            />
            <Bar dataKey="goal" fill="#e5e7eb" />
            <Bar dataKey="steps" fill="#8b5cf6" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
