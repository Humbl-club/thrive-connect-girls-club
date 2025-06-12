
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/ui/use-toast";

export function useSocialData() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [leaderboardUsers, setLeaderboardUsers] = useState<any[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch posts for the feed tab
  useEffect(() => {
    const fetchPosts = async () => {
      console.log("Fetching posts, loading state:", loading);
      try {
        // Get latest posts with user profiles
        const { data: postsData, error: postsError } = await supabase
          .from('feed_posts')
          .select('*, profiles:user_id(*)')
          .order('created_at', { ascending: false })
          .limit(5);
        
        if (postsError) throw postsError;
        
        // For each post, check if current user has liked it and get comments
        const enhancedPosts = await Promise.all((postsData || []).map(async (post) => {
          // Get like status
          let hasLiked = false;
          if (user) {
            const { data: likeData } = await supabase
              .from('post_likes')
              .select('id')
              .match({ user_id: user.id, post_id: post.id })
              .single();
            
            hasLiked = !!likeData;
          }
          
          // Get comments with user profiles
          const { data: commentsData } = await supabase
            .from('post_comments')
            .select('*, profiles:user_id(*)')
            .eq('post_id', post.id)
            .order('created_at', { ascending: true });
          
          // Format comments for FeedPost component
          const comments = (commentsData || []).map(comment => ({
            id: comment.id,
            content: comment.content,
            created_at: comment.created_at,
            user: {
              id: comment.user_id,
              username: comment.profiles?.username || `user_${comment.user_id.substring(0, 6)}`,
              avatarUrl: comment.profiles?.avatar_url
            }
          }));
          
          return {
            id: post.id,
            user: {
              id: post.user_id,
              username: post.profiles?.username || `user_${post.user_id.substring(0, 6)}`,
              avatarUrl: post.profiles?.avatar_url
            },
            content: post.content,
            imageUrl: post.image_url,
            likes: post.likes || 0,
            comments,
            createdAt: post.created_at,
            hasLiked,
          };
        }));
        
        setPosts(enhancedPosts);
        console.log("Posts fetched successfully:", enhancedPosts.length);
      } catch (error) {
        console.error('Error fetching posts:', error);
        toast({
          title: "Error",
          description: "Failed to load posts. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
        console.log("Posts loading completed");
      }
    };
    
    fetchPosts();
  }, [user, toast]);

  // Fetch leaderboard data for challenges tab
  useEffect(() => {
    const fetchLeaderboardData = async () => {
      console.log("Fetching leaderboard data, loading state:", loadingLeaderboard);
      try {
        // Find active challenges
        const { data: challengeData, error: challengeError } = await supabase
          .from('challenges')
          .select('*')
          .gte('end_date', new Date().toISOString())
          .order('start_date', { ascending: false })
          .limit(1);
        
        if (challengeError) throw challengeError;
        
        if (challengeData && challengeData.length > 0) {
          const activeChallenge = challengeData[0];
          
          // Get participants for the active challenge
          const { data: participantsData, error: participantsError } = await supabase
            .from('challenge_participants')
            .select('*, profiles:user_id(*)')
            .eq('challenge_id', activeChallenge.id)
            .order('steps', { ascending: false });
          
          if (participantsError) throw participantsError;
          
          // Format data for the leaderboard component
          const formattedUsers = (participantsData || []).map((participant, index) => ({
            id: participant.user_id,
            username: participant.profiles?.username || `user_${participant.user_id.substring(0, 6)}`,
            avatarUrl: participant.profiles?.avatar_url,
            steps: participant.steps || 0,
            rank: index + 1
          }));
          
          // If current user is in the challenge, find their entry
          if (user) {
            const userParticipant = participantsData?.find(p => p.user_id === user.id);
            if (userParticipant) {
              const userRank = participantsData?.findIndex(p => p.user_id === user.id) + 1;
              const currentUserEntry = {
                id: user.id,
                username: "You",
                avatarUrl: "",
                steps: userParticipant.steps || 0,
                rank: userRank
              };
              
              // If user is not in top 5, add them at the end
              if (userRank > 5) {
                formattedUsers.push(currentUserEntry);
              }
            }
          }
          
          setLeaderboardUsers(formattedUsers.slice(0, 5));
        } else {
          // No active challenges, use dummy data
          setLeaderboardUsers([
            { id: "1", username: "Ashley", avatarUrl: "", steps: 12453, rank: 1 },
            { id: "2", username: "Madison", avatarUrl: "", steps: 10782, rank: 2 },
            { id: "3", username: "Jessica", avatarUrl: "", steps: 9356, rank: 3 }
          ]);
        }
        
        console.log("Leaderboard data fetched successfully");
      } catch (error) {
        console.error('Error fetching leaderboard data:', error);
      } finally {
        setLoadingLeaderboard(false);
        console.log("Leaderboard loading completed");
      }
    };
    
    fetchLeaderboardData();
  }, [user, toast]);

  const refreshPosts = () => {
    setLoading(true);
  };

  return {
    posts,
    loading,
    leaderboardUsers,
    loadingLeaderboard,
    refreshPosts
  };
}
