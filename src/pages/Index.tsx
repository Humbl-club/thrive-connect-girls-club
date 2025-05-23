import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Medal, Flame, LineChart, Users, Settings, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/components/layout/AppLayout";
import { StepCounter } from "@/components/ui/step-counter";
import { LeaderboardCard } from "@/components/challenges/LeaderboardCard";
import { FeedPost } from "@/components/feed/FeedPost";
import { EventCard } from "@/components/calendar/EventCard";
import { ThemeCustomizer } from "@/components/ui/theme-customizer";
import { useSettings } from "@/hooks/use-settings";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const { settings } = useSettings();
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentSteps, setCurrentSteps] = useState(5621);
  const [leaderboardUsers, setLeaderboardUsers] = useState<any[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState({
    leaderboard: true,
    events: true,
    posts: true
  });
  
  // Simulate step update for demo purposes
  const updateSteps = () => {
    setCurrentSteps(prev => Math.min(prev + Math.floor(Math.random() * 500) + 100, settings.dailyStepGoal));
  };
  
  // Fetch leaderboard data
  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        // Find active challenges
        const { data: challengeData } = await supabase
          .from('challenges')
          .select('*')
          .gte('end_date', new Date().toISOString())
          .order('start_date', { ascending: false })
          .limit(1);
        
        if (challengeData && challengeData.length > 0) {
          const activeChallenge = challengeData[0];
          
          // Get participants for the active challenge
          const { data: participantsData } = await supabase
            .from('challenge_participants')
            .select('*, profiles:user_id(*)')
            .eq('challenge_id', activeChallenge.id)
            .order('steps', { ascending: false });
          
          // Format data for the leaderboard component
          const formattedUsers = (participantsData || []).map((participant, index) => ({
            id: participant.user_id,
            username: participant.profiles?.username || `user_${participant.user_id.substring(0, 6)}`,
            avatarUrl: participant.profiles?.avatar_url,
            steps: participant.steps || 0,
            rank: index + 1
          }));
          
          // If current user is in the challenge, add them
          if (user) {
            const userParticipant = participantsData?.find(p => p.user_id === user.id);
            if (userParticipant) {
              const userRank = participantsData?.findIndex(p => p.user_id === user.id) + 1;
              if (userRank > 5) {
                formattedUsers.push({
                  id: user.id,
                  username: "You",
                  avatarUrl: "",
                  steps: userParticipant.steps || 0,
                  rank: userRank
                });
              }
            } else {
              // User not in challenge yet, add them with default values
              formattedUsers.push({
                id: "current",
                username: "You",
                avatarUrl: "",
                steps: currentSteps,
                rank: formattedUsers.length + 1
              });
            }
          }
          
          setLeaderboardUsers(formattedUsers.slice(0, 6));
        } else {
          // No active challenges found
          setLeaderboardUsers([
            { id: "1", username: "Ashley", avatarUrl: "", steps: 12453, rank: 1 },
            { id: "2", username: "Madison", avatarUrl: "", steps: 10782, rank: 2 },
            { id: "3", username: "Jessica", avatarUrl: "", steps: 9356, rank: 3 },
            { id: "current", username: "You", avatarUrl: "", steps: currentSteps, rank: 8 }
          ]);
        }
      } catch (error) {
        console.error('Error fetching leaderboard data:', error);
      } finally {
        setLoading(prev => ({ ...prev, leaderboard: false }));
      }
    };
    
    fetchLeaderboardData();
  }, [user, currentSteps]);
  
  // Fetch upcoming events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const { data: eventsData } = await supabase
          .from('calendar_events')
          .select('*')
          .gte('event_date', today.toISOString())
          .order('event_date', { ascending: true })
          .limit(2);
        
        if (eventsData && eventsData.length > 0) {
          const formattedEvents = eventsData.map(event => ({
            id: event.id,
            title: event.title,
            description: event.description || "",
            date: new Date(event.event_date),
            startTime: event.start_time,
            endTime: event.end_time || "",
            location: event.location || "",
            isAttending: event.is_attending
          }));
          
          setUpcomingEvents(formattedEvents);
        } else {
          // No events found, use mock data
          setUpcomingEvents([
            {
              id: "1",
              title: "Morning Run & Coffee",
              description: "Join us for a light 5K run followed by coffee and conversation.",
              date: new Date(2025, 4, 25, 8, 0),
              startTime: "8:00 AM",
              endTime: "10:00 AM",
              location: "Central Park, Main Entrance",
              isAttending: true
            }
          ]);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(prev => ({ ...prev, events: false }));
      }
    };
    
    fetchEvents();
  }, []);
  
  // Fetch recent posts
  useEffect(() => {
    const fetchRecentPosts = async () => {
      try {
        // Get latest post with user profile
        const { data: postsData } = await supabase
          .from('feed_posts')
          .select('*, profiles:user_id(*)')
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (postsData && postsData.length > 0) {
          const post = postsData[0];
          
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
          
          // Get comments
          const { data: commentsData } = await supabase
            .from('post_comments')
            .select('*, profiles:user_id(*)')
            .eq('post_id', post.id)
            .order('created_at', { ascending: true })
            .limit(1);
          
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
          
          const formattedPost = {
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
            hasLiked
          };
          
          setRecentPosts([formattedPost]);
        } else {
          // No posts found, use mock data
          setRecentPosts([
            {
              id: "1",
              user: { id: "2", username: "Madison", avatarUrl: "" },
              content: "Just completed my first 10K run! Thanks to everyone for the encouragement!",
              imageUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
              likes: 24,
              comments: [
                {
                  id: "comment1",
                  content: "Amazing job!",
                  created_at: new Date(2025, 4, 21, 15, 10).toISOString(),
                  user: { id: "3", username: "Emma", avatarUrl: "" }
                }
              ],
              createdAt: new Date(2025, 4, 21, 14, 32),
              hasLiked: true
            }
          ]);
        }
      } catch (error) {
        console.error('Error fetching recent posts:', error);
      } finally {
        setLoading(prev => ({ ...prev, posts: false }));
      }
    };
    
    fetchRecentPosts();
  }, [user]);
  
  return (
    <AppLayout>
      <div className="container px-4 py-6 pb-20 max-w-md mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-1">
              Hello, <span className="text-primary">{user?.email?.split('@')[0] || "Friend"}!</span>
            </h1>
            <p className="text-sm text-muted-foreground">
              Ready to reach your goals today?
            </p>
          </div>
          <div className="flex gap-2">
            <ThemeCustomizer />
            <Link to="/settings">
              <Button variant="outline" size="icon" className="rounded-full">
                <Settings className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Today's Progress */}
        <div className="bg-white rounded-xl girls-shadow p-5 mb-6 animate-enter">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">Today's Progress</h2>
            <Link to="/analytics">
              <Button variant="ghost" size="sm" className="flex items-center gap-1 text-primary text-xs">
                <LineChart className="h-4 w-4" />
                View Stats
              </Button>
            </Link>
          </div>
          
          <div className="flex justify-center mb-2" onClick={updateSteps}>
            <StepCounter currentSteps={currentSteps} goalSteps={settings.dailyStepGoal} size="lg" />
          </div>
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              {settings.dailyStepGoal - currentSteps} steps to reach your daily goal
            </p>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg bg-gray-50 p-2 flex flex-col items-center">
                <span className="text-lg font-semibold text-primary">3.2</span>
                <span className="text-xs text-muted-foreground">miles</span>
              </div>
              <div className="rounded-lg bg-gray-50 p-2 flex flex-col items-center">
                <span className="text-lg font-semibold text-primary">284</span>
                <span className="text-xs text-muted-foreground">calories</span>
              </div>
              <div className="rounded-lg bg-gray-50 p-2 flex flex-col items-center">
                <span className="text-lg font-semibold text-primary">42</span>
                <span className="text-xs text-muted-foreground">mins</span>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Challenge */}
        <div className="mb-6 animate-enter" style={{ animationDelay: "100ms" }}>
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold text-lg">Weekly Challenge</h2>
            <Link to="/social">
              <Button variant="ghost" size="sm" className="flex items-center gap-1 text-primary text-xs p-0">
                <Users className="h-4 w-4" />
                Social
              </Button>
            </Link>
          </div>
          {loading.leaderboard ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 text-primary animate-spin" />
            </div>
          ) : (
            <LeaderboardCard
              title="Spring Step Challenge"
              description="May 20-26"
              timeframe="weekly"
              users={leaderboardUsers}
              currentUserId={user?.id || "current"}
            />
          )}
        </div>

        {/* Upcoming Events */}
        <div className="mb-6 animate-enter" style={{ animationDelay: "200ms" }}>
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold text-lg">Upcoming Events</h2>
            <Link to="/calendar">
              <Button variant="link" size="sm" className="text-primary">
                View All
              </Button>
            </Link>
          </div>
          
          {loading.events ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 text-primary animate-spin" />
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingEvents.map(event => (
                <EventCard key={event.id} {...event} />
              ))}
            </div>
          )}
        </div>

        {/* Recent Posts */}
        <div className="animate-enter" style={{ animationDelay: "300ms" }}>
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold text-lg">Recent Posts</h2>
            <Link to="/feed">
              <Button variant="link" size="sm" className="text-primary">
                View All
              </Button>
            </Link>
          </div>
          
          {loading.posts ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 text-primary animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              {recentPosts.map(post => (
                <FeedPost key={post.id} {...post} />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
