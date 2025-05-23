
import { useState, useEffect } from 'react';
import { StepChart } from './StepChart';
import { WeeklyProgress } from './WeeklyProgress';
import { StatsCard } from './StatsCard';
import { AchievementBadges } from './AchievementBadges';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { subDays, format } from 'date-fns';

interface DashboardStats {
  todaySteps: number;
  yesterdaySteps: number;
  weeklyAverage: number;
  totalSteps: number;
  goalProgress: number;
}

export function AnalyticsDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    todaySteps: 0,
    yesterdaySteps: 0,
    weeklyAverage: 0,
    totalSteps: 0,
    goalProgress: 0
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      
      try {
        const today = new Date().toISOString().split('T')[0];
        const yesterday = subDays(new Date(), 1).toISOString().split('T')[0];
        const weekAgo = subDays(new Date(), 7).toISOString().split('T')[0];

        // Get today's steps
        const { data: todayData } = await supabase
          .from('activity_data')
          .select('steps')
          .eq('user_id', user.id)
          .eq('date', today)
          .maybeSingle();

        // Get yesterday's steps
        const { data: yesterdayData } = await supabase
          .from('activity_data')
          .select('steps')
          .eq('user_id', user.id)
          .eq('date', yesterday)
          .maybeSingle();

        // Get last 7 days for weekly average
        const { data: weeklyData } = await supabase
          .from('activity_data')
          .select('steps')
          .eq('user_id', user.id)
          .gte('date', weekAgo)
          .lte('date', today);

        // Get total steps
        const { data: totalData } = await supabase
          .from('activity_data')
          .select('steps')
          .eq('user_id', user.id);

        const todaySteps = todayData?.steps || 0;
        const yesterdaySteps = yesterdayData?.steps || 0;
        const weeklyTotal = weeklyData?.reduce((sum, day) => sum + (day.steps || 0), 0) || 0;
        const weeklyAverage = weeklyData?.length ? Math.round(weeklyTotal / weeklyData.length) : 0;
        const totalSteps = totalData?.reduce((sum, day) => sum + (day.steps || 0), 0) || 0;
        const goalProgress = Math.round((todaySteps / 10000) * 100);

        setStats({
          todaySteps,
          yesterdaySteps,
          weeklyAverage,
          totalSteps,
          goalProgress
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  const getTrend = (current: number, previous: number) => {
    if (current > previous) return 'up';
    if (current < previous) return 'down';
    return 'neutral';
  };

  const getTrendValue = (current: number, previous: number) => {
    if (previous === 0) return '+100%';
    const change = ((current - previous) / previous) * 100;
    return `${change > 0 ? '+' : ''}${change.toFixed(0)}%`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
        <div className="h-80 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard
          title="Today's Steps"
          value={stats.todaySteps}
          description="vs yesterday"
          trend={getTrend(stats.todaySteps, stats.yesterdaySteps)}
          trendValue={getTrendValue(stats.todaySteps, stats.yesterdaySteps)}
        />
        <StatsCard
          title="Goal Progress"
          value={`${stats.goalProgress}%`}
          description="of daily goal"
          trend={stats.goalProgress >= 100 ? 'up' : 'neutral'}
        />
        <StatsCard
          title="Weekly Average"
          value={stats.weeklyAverage}
          description="steps per day"
        />
        <StatsCard
          title="Total Steps"
          value={stats.totalSteps}
          description="all time"
        />
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <StepChart />
        <WeeklyProgress />
      </div>

      {/* Achievements */}
      <AchievementBadges />
    </div>
  );
}
