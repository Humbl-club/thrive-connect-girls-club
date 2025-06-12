
import { Loader2, Trophy } from "lucide-react";
import { LeaderboardCard } from "@/components/challenges/LeaderboardCard";
import { CreateChallenge } from "@/components/challenges/CreateChallenge";

interface ChallengesTabProps {
  leaderboardUsers: any[];
  loadingLeaderboard: boolean;
  currentUserId?: string;
}

export function ChallengesTab({ leaderboardUsers, loadingLeaderboard, currentUserId }: ChallengesTabProps) {
  if (loadingLeaderboard) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <Loader2 className="h-8 w-8 text-brand-navy animate-spin mb-4" />
        <p className="text-text-muted font-medium">Loading challenges...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-semibold text-lg mb-3 flex items-center text-text-primary">
          <Trophy className="h-5 w-5 mr-2 text-brand-accent" /> Active Challenges
        </h2>
        
        <div className="space-y-4">
          <LeaderboardCard
            title="Spring Step Challenge"
            description="May 20-26"
            timeframe="weekly"
            users={leaderboardUsers}
            currentUserId={currentUserId}
          />
        </div>
      </div>
      
      <div className="pt-4">
        <CreateChallenge />
      </div>
    </div>
  );
}
