
import { ChallengeCard } from "./ChallengeCard";
import type { Challenge } from "@/hooks/useChallenges";

interface ChallengesGridProps {
  challenges: Challenge[];
  onJoin: (challengeId: string) => void;
  onLeave: (challengeId: string) => void;
  onViewDetails: (challengeId: string) => void;
}

export function ChallengesGrid({ challenges, onJoin, onLeave, onViewDetails }: ChallengesGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {challenges.map((challenge) => (
        <ChallengeCard
          key={challenge.id}
          challenge={challenge}
          onJoin={onJoin}
          onLeave={onLeave}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
}
