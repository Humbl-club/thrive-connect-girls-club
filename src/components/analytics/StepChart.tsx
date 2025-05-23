
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format, subDays } from 'date-fns';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';

interface StepData {
  date: string;
  steps: number;
  goal: number;
}

export function StepChart() {
  const [data, setData] = useState<StepData[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchStepData = async () => {
      if (!user) return;
      
      try {
        // Get last 7 days of data
        const dates = Array.from({ length: 7 }, (_, i) => {
          const date = subDays(new Date(), i);
          return date.toISOString().split('T')[0];
        }).reverse();

        const { data: stepData, error } = await supabase
          .from('activity_data')
          .select('date, steps')
          .eq('user_id', user.id)
          .in('date', dates)
          .order('date', { ascending: true });

        if (error) throw error;

        // Create data array with all dates, filling missing days with 0
        const chartData = dates.map(date => {
          const dayData = stepData.find(d => d.date === date);
          return {
            date: format(new Date(date), 'MM/dd'),
            steps: dayData?.steps || 0,
            goal: 10000 // Default goal
          };
        });

        setData(chartData);
      } catch (error) {
        console.error('Error fetching step data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStepData();
  }, [user]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Daily Steps</CardTitle>
          <CardDescription>Your step count over the last 7 days</CardDescription>
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
        <CardTitle>Daily Steps</CardTitle>
        <CardDescription>Your step count over the last 7 days</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip 
              formatter={(value, name) => [
                `${value.toLocaleString()} steps`, 
                name === 'steps' ? 'Steps' : 'Goal'
              ]}
            />
            <Line 
              type="monotone" 
              dataKey="goal" 
              stroke="#e5e7eb" 
              strokeDasharray="5 5" 
              name="goal"
            />
            <Line 
              type="monotone" 
              dataKey="steps" 
              stroke="#8b5cf6" 
              strokeWidth={2}
              name="steps"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
