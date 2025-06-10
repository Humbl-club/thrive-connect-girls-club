
import { Link } from "react-router-dom";
import { Flame, LineChart, Users, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/components/layout/AppLayout";
import { StepWidgetSmall } from "@/components/step-counter/StepWidgetSmall";
import { LeaderboardCard } from "@/components/challenges/LeaderboardCard";
import { useChallenges } from "@/hooks/useChallenges";
import { useAuth } from "@/components/auth/AuthProvider";

const Index = () => {
  const { user, profile } = useAuth();
  const { challenges, loading: challengesLoading } = useChallenges();
  const activeChallenge = challenges.find(c => c.status === 'active');

  return (
    <AppLayout>
      <div className="container py-6 pb-20 max-w-lg mx-auto">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold">
            Hello, <span className="text-primary">{profile?.full_name?.split(' ')[0] || "Friend"}!</span>
          </h1>
          <p className="text-muted-foreground">Ready to crush your goals today?</p>
        </div>

        <div className="space-y-8">
          <div className="animate-slide-in-from-bottom" style={{ animationDelay: '100ms' }}>
            <StepWidgetSmall />
          </div>

          <div className="animate-slide-in-from-bottom" style={{ animationDelay: '200ms' }}>
            <h2 className="text-xl font-semibold mb-3">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <Link to="/challenges">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                  <Trophy className="w-6 h-6 text-primary" />
                  <span>Challenges</span>
                </Button>
              </Link>
              <Link to="/social">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                  <Users className="w-6 h-6 text-primary" />
                  <span>Social</span>
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="animate-slide-in-from-bottom" style={{ animationDelay: '300ms' }}>
            {challengesLoading ? (
              <p>Loading challenges...</p>
            ) : activeChallenge ? (
              <LeaderboardCard
                title="Active Challenge"
                description={activeChallenge.title}
                timeframe="weekly"
                users={[]} // Note: Leaderboard data needs to be fetched separately now
                currentUserId={user?.id}
              />
            ) : (
              <div className="text-center p-8 bg-muted rounded-lg">
                <Flame className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No Active Challenges</h3>
                <p className="mt-1 text-sm text-muted-foreground">Check back soon for new challenges!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
