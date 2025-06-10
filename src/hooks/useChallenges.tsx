
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import type { Database, Tables } from "@/integrations/supabase/types";

export type Challenge = Tables<'challenges'> & {
  participantCount: number;
  userProgress?: number;
  isJoined?: boolean;
  status: "upcoming" | "active" | "completed";
  type: "steps" | "distance" | "active_minutes";
  visibility: "public" | "friends" | "private";
  goal: number;
  startDate: string;
  endDate: string;
  createdBy: string;
};

export function useChallenges() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchChallenges = useCallback(async () => {
    if (!user) {
      setChallenges([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data: challengesData, error: challengesError } = await supabase
        .from('challenges')
        .select('*')
        .order('created_at', { ascending: false });

      if (challengesError) throw challengesError;

      const { data: userParticipantsData, error: participantsError } = await supabase
        .from('challenge_participants')
        .select('challenge_id, steps')
        .eq('user_id', user.id);

      if (participantsError) throw participantsError;

      const joinedChallengesMap = new Map<string, number | null>();
      if (userParticipantsData) {
        userParticipantsData.forEach(p => {
          joinedChallengesMap.set(p.challenge_id, p.steps);
        });
      }

      const participantCountsPromises = challengesData.map(async (challenge) => {
        const { count, error: countError } = await supabase
          .from('challenge_participants')
          .select('*', { count: 'exact', head: true })
          .eq('challenge_id', challenge.id);
        
        if (countError) {
          console.error(`Error fetching participant count for challenge ${challenge.id}:`, countError);
          return { challengeId: challenge.id, count: 0 };
        }
        return { challengeId: challenge.id, count: count || 0 };
      });

      const participantCountsResults = await Promise.all(participantCountsPromises);
      const participantCountsMap = new Map(participantCountsResults.map(r => [r.challengeId, r.count]));

      const processedChallenges: Challenge[] = challengesData.map(dbChallenge => {
        const now = new Date();
        const startDate = new Date(dbChallenge.start_date);
        const endDate = new Date(dbChallenge.end_date);
        
        let status: "upcoming" | "active" | "completed";
        if (now < startDate) {
          status = "upcoming";
        } else if (now > endDate) {
          status = "completed";
        } else {
          status = "active";
        }

        const isJoined = joinedChallengesMap.has(dbChallenge.id);
        const userProgress = isJoined ? joinedChallengesMap.get(dbChallenge.id) : undefined;

        return {
          ...dbChallenge,
          type: (dbChallenge as any).type as Challenge['type'] || 'steps',
          visibility: (dbChallenge as any).visibility as Challenge['visibility'] || 'public',
          goal: (dbChallenge as any).goal || 10000,
          startDate: dbChallenge.start_date,
          endDate: dbChallenge.end_date,
          createdBy: dbChallenge.created_by,
          participantCount: participantCountsMap.get(dbChallenge.id) || 0,
          userProgress: userProgress ?? undefined,
          status,
          isJoined,
        };
      });

      setChallenges(processedChallenges);
    } catch (error: any) {
      console.error("Error fetching challenges:", error.message);
      toast({
        title: "Error",
        description: "Failed to load challenges. " + error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, toast]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchChallenges();
  };

  const handleJoinChallenge = async (challengeId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('challenge_participants')
        .insert({
          challenge_id: challengeId,
          user_id: user.id,
          steps: 0
        });

      if (error) throw error;
      
      toast({ title: "Success", description: "You've joined the challenge!" });
      await fetchChallenges();
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
      
      toast({ title: "Success", description: "You've left the challenge" });
      await fetchChallenges();
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to leave challenge: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchChallenges();
    } else {
      setChallenges([]);
      setLoading(false);
    }
  }, [user, fetchChallenges]);

  return {
    challenges,
    loading,
    refreshing,
    handleRefresh,
    handleJoinChallenge,
    handleLeaveChallenge,
    fetchChallenges
  };
}
