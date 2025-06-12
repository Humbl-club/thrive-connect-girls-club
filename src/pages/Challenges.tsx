
import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProfileProtectedRoute } from "@/components/auth/ProfileProtectedRoute";
import { CreateChallenge } from "@/components/challenges/CreateChallenge";
import { CreateYearRoundChallenge } from "@/components/challenges/CreateYearRoundChallenge";
import { ChallengeFilters, type ChallengeFilters as ChallengeFiltersType } from "@/components/challenges/ChallengeFilters";
import { ChallengesGrid } from "@/components/challenges/ChallengesGrid";
import { ChallengesEmptyState } from "@/components/challenges/ChallengesEmptyState";
import { Button } from "@/components/ui/button";
import { RefreshCw, Trophy } from "lucide-react";
import { ChallengeDetails } from "@/components/challenges/ChallengeDetails";
import { useChallenges } from "@/hooks/useChallenges";

export default function Challenges() {
  const {
    challenges,
    loading,
    refreshing,
    handleRefresh,
    handleJoinChallenge,
    handleLeaveChallenge,
    fetchChallenges
  } = useChallenges();

  const [filters, setFilters] = useState<ChallengeFiltersType>({
    status: "all",
    type: "all",
    visibility: "all",
    participation: "all",
  });
  const [selectedChallengeId, setSelectedChallengeId] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const handleChallengeCreated = () => {
    fetchChallenges();
  };
  
  const handleViewDetails = (challengeId: string) => {
    setSelectedChallengeId(challengeId);
    setDetailsOpen(true);
  };

  const filteredChallenges = challenges.filter(challenge => {
    if (filters.status !== "all" && challenge.status !== filters.status) return false;
    if (filters.type !== "all" && challenge.type !== filters.type) return false;
    if (filters.visibility !== "all" && challenge.visibility !== filters.visibility) return false;
    if (filters.participation !== "all") {
      if (filters.participation === "joined" && !challenge.isJoined) return false;
      if (filters.participation === "not_joined" && challenge.isJoined) return false;
    }
    return true;
  });

  const hasFilters = Object.values(filters).some(f => f !== "all");

  return (
    <ProfileProtectedRoute>
      <AppLayout>
        <div className="container max-w-4xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Challenges</h1>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          <div className="mb-6 flex flex-wrap gap-4">
            <CreateChallenge onChallengeCreated={handleChallengeCreated} />
            <CreateYearRoundChallenge />
          </div>

          <div className="mb-6">
            <ChallengeFilters 
              onFilterChange={setFilters}
            />
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading challenges...</p>
              </div>
            ) : filteredChallenges.length > 0 ? (
              <ChallengesGrid
                challenges={filteredChallenges}
                onJoin={handleJoinChallenge}
                onLeave={handleLeaveChallenge}
                onViewDetails={handleViewDetails}
              />
            ) : (
              <ChallengesEmptyState
                hasFilters={hasFilters}
                onChallengeCreated={handleChallengeCreated}
              />
            )}
          </div>
          
          <ChallengeDetails 
            challengeId={selectedChallengeId}
            isOpen={detailsOpen}
            onClose={() => setDetailsOpen(false)}
            onJoin={handleJoinChallenge}
            onLeave={handleLeaveChallenge}
          />
        </div>
      </AppLayout>
    </ProfileProtectedRoute>
  );
}
