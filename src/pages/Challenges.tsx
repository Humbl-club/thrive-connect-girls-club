
import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProfileProtectedRoute } from "@/components/auth/ProfileProtectedRoute";
import { ChallengeCard } from "@/components/challenges/ChallengeCard";
import { CreateChallenge } from "@/components/challenges/CreateChallenge";
import { CreateYearRoundChallenge } from "@/components/challenges/CreateYearRoundChallenge";
import { ChallengeFilters } from "@/components/challenges/ChallengeFilters";
import { Button } from "@/components/ui/button";
import { RefreshCw, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/hooks/use-toast";

interface Challenge {
  id: string;
  title: string;
  description: string;
  goal: number;
  type: "steps" | "distance" | "active_minutes";
  start_date: string;
  end_date: string;
  visibility: "public" | "friends" | "private";
  created_by: string;
  participantCount: number;
  userProgress?: number;
  isJoined?: boolean;
  status: "upcoming" | "active" | "completed";
}

export default function Challenges() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    fetchChallenges();
  }, [user]);

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      
      // Fetch challenges
      const { data: challengesData, error } = await supabase
        .from('challenges')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Process challenges and determine status
      const processedChallenges = challengesData.map(challenge => {
        const now = new Date();
        const startDate = new Date(challenge.start_date);
        const endDate = new Date(challenge.end_date);
        
        let status: "upcoming" | "active" | "completed";
        if (now < startDate) {
          status = "upcoming";
        } else if (now > endDate) {
          status = "completed";
        } else {
          status = "active";
        }

        return {
          id: challenge.id,
          title: challenge.title,
          description: challenge.description || "",
          goal: challenge.goal || 0,
          type: challenge.type || "steps",
          start_date: challenge.start_date,
          end_date: challenge.end_date,
          visibility: "public" as const,
          created_by: challenge.created_by,
          participantCount: 0, // Will be updated with actual count
          status,
          isJoined: false // Will be updated with actual status
        };
      });

      setChallenges(processedChallenges);
    } catch (error: any) {
      console.error("Error fetching challenges:", error);
      toast({
        title: "Error",
        description: "Failed to load challenges",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchChallenges();
    setRefreshing(false);
  };

  const handleJoinChallenge = async (challengeId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('challenge_participants')
        .insert({
          challenge_id: challengeId,
          user_id: user.id
        });

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "You've joined the challenge!"
      });
      
      // Update local state
      setChallenges(prev => prev.map(challenge => 
        challenge.id === challengeId 
          ? { ...challenge, isJoined: true, participantCount: challenge.participantCount + 1 }
          : challenge
      ));
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to join challenge: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const handleLeaveChallenge = async (challengeId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('challenge_participants')
        .delete()
        .eq('challenge_id', challengeId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "You've left the challenge"
      });
      
      // Update local state
      setChallenges(prev => prev.map(challenge => 
        challenge.id === challengeId 
          ? { ...challenge, isJoined: false, participantCount: Math.max(0, challenge.participantCount - 1) }
          : challenge
      ));
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to leave challenge: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const filteredChallenges = challenges.filter(challenge => {
    if (activeFilter === "all") return true;
    return challenge.status === activeFilter;
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
            <CreateChallenge onChallengeCreated={fetchChallenges} />
            <CreateYearRoundChallenge />
          </div>

          <div className="mb-6">
            <ChallengeFilters 
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
            />
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading challenges...</p>
              </div>
            ) : filteredChallenges.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredChallenges.map((challenge) => (
                  <ChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                    onJoin={handleJoinChallenge}
                    onLeave={handleLeaveChallenge}
                    onViewDetails={(id) => console.log("View challenge details:", id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium text-muted-foreground mb-2">
                  No challenges found
                </p>
                <p className="text-muted-foreground mb-4">
                  {activeFilter === "all" 
                    ? "Be the first to create a challenge!"
                    : `No ${activeFilter} challenges available.`
                  }
                </p>
                <CreateChallenge onChallengeCreated={fetchChallenges} />
              </div>
            )}
          </div>
        </div>
      </AppLayout>
    </ProfileProtectedRoute>
  );
}
