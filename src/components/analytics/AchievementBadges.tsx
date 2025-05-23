
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Target, Zap, Star, Award, Medal } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  earned: boolean;
  progress?: number;
  target?: number;
}

export function AchievementBadges() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchAchievements = async () => {
      if (!user) return;
      
      try {
        // Get user's step data to calculate achievements
        const { data: stepData, error } = await supabase
          .from('activity_data')
          .select('steps, date')
          .eq('user_id', user.id)
          .order('date', { ascending: false });

        if (error) throw error;

        const totalSteps = stepData.reduce((sum, day) => sum + (day.steps || 0), 0);
        const maxDailySteps = Math.max(...stepData.map(day => day.steps || 0));
        const streakDays = calculateStreak(stepData);
        const last7Days = stepData.slice(0, 7);
        const weeklyTotal = last7Days.reduce((sum, day) => sum + (day.steps || 0), 0);

        const achievementList: Achievement[] = [
          {
            id: 'first-steps',
            title: 'First Steps',
            description: 'Record your first 1,000 steps',
            icon: <Target className="h-4 w-4" />,
            earned: totalSteps >= 1000,
            progress: Math.min(totalSteps, 1000),
            target: 1000
          },
          {
            id: 'daily-walker',
            title: 'Daily Walker',
            description: 'Walk 10,000 steps in a day',
            icon: <Trophy className="h-4 w-4" />,
            earned: maxDailySteps >= 10000,
            progress: Math.min(maxDailySteps, 10000),
            target: 10000
          },
          {
            id: 'streak-master',
            title: 'Streak Master',
            description: 'Maintain a 7-day walking streak',
            icon: <Zap className="h-4 w-4" />,
            earned: streakDays >= 7,
            progress: Math.min(streakDays, 7),
            target: 7
          },
          {
            id: 'weekly-warrior',
            title: 'Weekly Warrior',
            description: 'Walk 70,000 steps in a week',
            icon: <Star className="h-4 w-4" />,
            earned: weeklyTotal >= 70000,
            progress: Math.min(weeklyTotal, 70000),
            target: 70000
          },
          {
            id: 'milestone-marcher',
            title: 'Milestone Marcher',
            description: 'Reach 100,000 total steps',
            icon: <Award className="h-4 w-4" />,
            earned: totalSteps >= 100000,
            progress: Math.min(totalSteps, 100000),
            target: 100000
          },
          {
            id: 'super-stepper',
            title: 'Super Stepper',
            description: 'Walk 20,000 steps in a day',
            icon: <Medal className="h-4 w-4" />,
            earned: maxDailySteps >= 20000,
            progress: Math.min(maxDailySteps, 20000),
            target: 20000
          }
        ];

        setAchievements(achievementList);
      } catch (error) {
        console.error('Error fetching achievements:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, [user]);

  const calculateStreak = (stepData: any[]) => {
    let streak = 0;
    for (const day of stepData) {
      if ((day.steps || 0) >= 8000) { // Minimum for streak
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Achievements</CardTitle>
          <CardDescription>Your fitness milestones and badges</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading achievements...</p>
        </CardContent>
      </Card>
    );
  }

  const earnedCount = achievements.filter(a => a.earned).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Achievements</CardTitle>
        <CardDescription>
          You've earned {earnedCount} of {achievements.length} badges
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`p-3 rounded-lg border ${
                achievement.earned 
                  ? 'bg-primary/5 border-primary/20' 
                  : 'bg-muted/50 border-muted'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={achievement.earned ? 'text-primary' : 'text-muted-foreground'}>
                  {achievement.icon}
                </div>
                <Badge variant={achievement.earned ? 'default' : 'secondary'} className="text-xs">
                  {achievement.earned ? 'Earned' : 'Locked'}
                </Badge>
              </div>
              <h4 className="font-semibold text-sm mb-1">{achievement.title}</h4>
              <p className="text-xs text-muted-foreground mb-2">{achievement.description}</p>
              {!achievement.earned && achievement.progress !== undefined && achievement.target && (
                <div className="text-xs text-muted-foreground">
                  Progress: {achievement.progress.toLocaleString()} / {achievement.target.toLocaleString()}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
