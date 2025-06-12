import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { FriendsList } from "@/components/social/FriendsList";
import { CreateChallenge } from "@/components/challenges/CreateChallenge";
import { LeaderboardCard } from "@/components/challenges/LeaderboardCard";
import { FeedPost } from "@/components/feed/FeedPost";
import { FeedPostForm } from "@/components/feed/FeedPostForm";
import { Users, Trophy, MessageSquare, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/ui/use-toast";

const Social = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [leaderboardUsers, setLeaderboardUsers] = useState<any[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch posts for the feed tab
  useEffect(() => {
    const fetchPosts = async () => {
      if (loading) {
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
        } catch (error) {
          console.error('Error fetching posts:', error);
          toast({
            title: "Error",
            description: "Failed to load posts. Please try again later.",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchPosts();
  }, [user, loading, toast]);

  // Fetch leaderboard data for challenges tab
  useEffect(() => {
    const fetchLeaderboardData = async () => {
      if (loadingLeaderboard) {
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
            let currentUserEntry = null;
            if (user) {
              const userParticipant = participantsData?.find(p => p.user_id === user.id);
              if (userParticipant) {
                const userRank = participantsData?.findIndex(p => p.user_id === user.id) + 1;
                currentUserEntry = {
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
        } catch (error) {
          console.error('Error fetching leaderboard data:', error);
        } finally {
          setLoadingLeaderboard(false);
        }
      }
    };
    
    fetchLeaderboardData();
  }, [user, loadingLeaderboard, toast]);

  const handleLoadMore = () => {
    // Implement load more functionality if needed
    toast({
      title: "Coming soon",
      description: "Load more functionality is under development",
    });
  };

  const handlePostCreated = () => {
    setLoading(true);
    // Refresh posts when a new post is created
  };
  
  return (
    <AppLayout>
      <div className="container px-4 py-6 pb-20 max-w-md mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-brand-navy">Social</h1>
          <Button variant="outline" size="icon" className="rounded-full border-brand-navy text-brand-navy hover:bg-brand-navy hover:text-white">
            <MessageSquare className="h-5 w-5" />
          </Button>
        </div>
        
        <Tabs defaultValue="feed">
          <TabsList className="grid w-full grid-cols-3 mb-4 bg-brand-light border border-brand-navy/20">
            <TabsTrigger value="feed" className="data-[state=active]:bg-brand-navy data-[state=active]:text-white">Feed</TabsTrigger>
            <TabsTrigger value="friends" className="data-[state=active]:bg-brand-navy data-[state=active]:text-white">Friends</TabsTrigger>
            <TabsTrigger value="challenges" className="data-[state=active]:bg-brand-navy data-[state=active]:text-white">Challenges</TabsTrigger>
          </TabsList>
          
          <TabsContent value="feed" className="space-y-6 animate-enter">
            <div className="mb-6">
              <FeedPostForm onPostCreated={handlePostCreated} />
            </div>
            
            {loading ? (
              <div className="flex flex-col items-center justify-center py-10">
                <Loader2 className="h-8 w-8 text-brand-navy animate-spin mb-4" />
                <p className="text-brand-navy/70">Loading posts...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-brand-navy/70">No posts yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map(post => (
                  <FeedPost key={post.id} {...post} />
                ))}
                
                <Button variant="outline" className="w-full border-brand-navy text-brand-navy hover:bg-brand-navy hover:text-white" onClick={handleLoadMore}>
                  Load More
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="friends" className="animate-enter">
            <FriendsList />
          </TabsContent>
          
          <TabsContent value="challenges" className="space-y-6 animate-enter">
            <div>
              <h2 className="font-semibold text-lg mb-3 flex items-center text-brand-navy">
                <Trophy className="h-5 w-5 mr-2 text-brand-accent" /> Active Challenges
              </h2>
              
              {loadingLeaderboard ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <Loader2 className="h-8 w-8 text-brand-navy animate-spin mb-4" />
                  <p className="text-brand-navy/70">Loading challenges...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <LeaderboardCard
                    title="Spring Step Challenge"
                    description="May 20-26"
                    timeframe="weekly"
                    users={leaderboardUsers}
                    currentUserId={user?.id}
                  />
                </div>
              )}
            </div>
            
            <div className="pt-4">
              <CreateChallenge />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Social;
