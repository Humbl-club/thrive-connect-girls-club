
import { Trophy } from "lucide-react";
import { CreateChallenge } from "./CreateChallenge";

interface ChallengesEmptyStateProps {
  hasFilters: boolean;
  onChallengeCreated: () => void;
}

export function ChallengesEmptyState({ hasFilters, onChallengeCreated }: ChallengesEmptyStateProps) {
  return (
    <div className="text-center py-12">
      <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <p className="text-lg font-medium text-muted-foreground mb-2">
        No challenges found
      </p>
      <p className="text-muted-foreground mb-4">
        {hasFilters
          ? "No challenges match your current filters."
          : "Be the first to create a challenge!"
        }
      </p>
      <CreateChallenge onChallengeCreated={onChallengeCreated} />
    </div>
  );
}
