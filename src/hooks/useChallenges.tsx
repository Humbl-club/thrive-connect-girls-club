
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

export type Challenge = Tables<'challenges'> & {
  participantCount: number;
  userProgress?: number;
  isJoined?: boolean;
  status: "upcoming" | "active" | "completed";
  type: "steps" | "distance" | "active_minutes";
  visibility: "public" | "friends" | "private";
};

export function useChallenges() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchChallenges = useCallback(async () => {
    setLoading(true);
    try {
      const { data: challengesData, error: challengesError } = await supabase
        .from('challenges')
        .select('*')
        .order('created_at', { ascending: false });

      if (challengesError) throw challengesError;

      const participantCountsPromises = challengesData.map(async (challenge) => {
        const { count } = await supabase
          .from('challenge_participants')
          .select('*', { count: 'exact', head: true })
          .eq('challenge_id', challenge.id);
        return { challengeId: challenge.id, count: count || 0 };
      });
      const participantCountsResults = await Promise.all(participantCountsPromises);
      const participantCountsMap = new Map(participantCountsResults.map(r => [r.challengeId, r.count]));

      let userParticipantsMap = new Map<string, number | null>();
      if (user) {
        const { data: userParticipantsData, error: participantsError } = await supabase
          .from('challenge_participants')
          .select('challenge_id, steps')
          .eq('user_id', user.id);
        if (participantsError) throw participantsError;
        userParticipantsData.forEach(p => userParticipantsMap.set(p.challenge_id, p.steps));
      }

      const processedChallenges: Challenge[] = challengesData.map(dbChallenge => {
        const now = new Date();
        const startDate = new Date(dbChallenge.start_date);
        const endDate = new Date(dbChallenge.end_date);
        
        let status: "upcoming" | "active" | "completed" = 'active';
        if (now < startDate) status = "upcoming";
        else if (now > endDate) status = "completed";

        return {
          ...dbChallenge,
          participantCount: participantCountsMap.get(dbChallenge.id) || 0,
          isJoined: user ? userParticipantsMap.has(dbChallenge.id) : false,
          userProgress: user ? userParticipantsMap.get(dbChallenge.id) ?? undefined : undefined,
          status,
          type: dbChallenge.type as Challenge['type'] || 'steps',
          visibility: dbChallenge.visibility as Challenge['visibility'] || 'public',
          goal: dbChallenge.goal || 10000,
        };
      });

      setChallenges(processedChallenges);
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to load challenges: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, toast]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchChallenges();
  }, [fetchChallenges]);

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  return { challenges, loading, refreshing, handleRefresh };
}
