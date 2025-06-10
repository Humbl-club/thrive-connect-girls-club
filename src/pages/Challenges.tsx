
import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProfileProtectedRoute } from "@/components/auth/ProfileProtectedRoute";
import { CreateChallenge } from "@/components/challenges/CreateChallenge";
import { ChallengeFilters, type ChallengeFilters as ChallengeFiltersType } from "@/components/challenges/ChallengeFilters";
import { ChallengesGrid } from "@/components/challenges/ChallengesGrid";
import { ChallengesEmptyState } from "@/components/challenges/ChallengesEmptyState";
import { Button } from "@/components/ui/button";
import { RefreshCw, Trophy } from "lucide-react";
import { ChallengeDetails } from "@/components/challenges/ChallengeDetails";
import { useChallenges } from "@/hooks/useChallenges";
import { useAdmin } from "@/components/auth/AuthProvider"; // Use the new hook

export default function Challenges() {
  const { challenges, loading, refreshing, handleRefresh } = useChallenges();
  const isAdmin = useAdmin(); // Check if user is an admin
  const [filters, setFilters] = useState<ChallengeFiltersType>({
    status: "all",
    type: "all",
    visibility: "all",
    participation: "all",
  });
  const [selectedChallengeId, setSelectedChallengeId] = useState<string | null>(null);

  const filteredChallenges = challenges.filter(challenge => {
    if (filters.status !== "all" && challenge.status !== filters.status) return false;
    if (filters.type !== "all" && challenge.type !== filters.type) return false;
    if (filters.visibility !== "all" && challenge.visibility !== filters.visibility) return false;
    // Note: Participation filter needs `isJoined` which requires a user-specific query
    return true;
  });

  return (
    <ProfileProtectedRoute>
      <AppLayout>
        <div className="container max-w-4xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Challenges</h1>
            </div>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {isAdmin && (
            <div className="mb-6">
              <CreateChallenge onChallengeCreated={handleRefresh} />
            </div>
          )}

          <div className="mb-6">
            <ChallengeFilters onFilterChange={setFilters} />
          </div>

          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading challenges...</div>
          ) : filteredChallenges.length > 0 ? (
            <ChallengesGrid
              challenges={filteredChallenges}
              onJoin={() => {}} // Placeholder
              onLeave={() => {}} // Placeholder
              onViewDetails={setSelectedChallengeId}
            />
          ) : (
            <ChallengesEmptyState
              hasFilters={Object.values(filters).some(f => f !== "all")}
              onChallengeCreated={handleRefresh}
            />
          )}
          
          {selectedChallengeId && (
            <ChallengeDetails 
              challengeId={selectedChallengeId}
              isOpen={!!selectedChallengeId}
              onClose={() => setSelectedChallengeId(null)}
            />
          )}
        </div>
      </AppLayout>
    </ProfileProtectedRoute>
  );
}
