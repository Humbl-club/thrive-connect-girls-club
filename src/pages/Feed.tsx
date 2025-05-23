
import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { FeedPostForm } from "@/components/feed/FeedPostForm";
import { EnhancedFeedPost, FeedPostSkeleton } from "@/components/feed/EnhancedFeedPost";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { ProfileProtectedRoute } from "@/components/auth/ProfileProtectedRoute";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Post = {
  id: string;
  user_id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  likes: number;
  profiles: {
    username: string | null;
    avatar_url: string | null;
  } | null;
  hasLiked?: boolean;
};

export default function Feed() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, [user]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      
      // Fetch posts with profile information joined
      const { data: postsData, error } = await supabase
        .from('feed_posts')
        .select(`
          *,
          profiles:user_id (
            username, 
            avatar_url
          )
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      // If user is logged in, check which posts they've liked
      let postsWithLikeStatus = postsData;
      
      if (user) {
        const { data: likedPosts, error: likesError } = await supabase
          .from('post_likes')
          .select('post_id')
          .eq('user_id', user.id);

        if (likesError) throw likesError;

        const likedPostIds = new Set(likedPosts.map(like => like.post_id));
        
        postsWithLikeStatus = postsData.map(post => ({
          ...post,
          hasLiked: likedPostIds.has(post.id)
        }));
      }

      setPosts(postsWithLikeStatus);
    } catch (error: any) {
      console.error("Error fetching posts:", error);
      toast({
        title: "Error",
        description: "Failed to load posts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  const handleNewPost = () => {
    fetchPosts();
  };

  const handleDeletePost = (postId: string) => {
    setPosts(current => current.filter(post => post.id !== postId));
  };

  return (
    <ProfileProtectedRoute>
      <AppLayout>
        <div className="container max-w-2xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Feed</h1>
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

          <div className="mb-6">
            <FeedPostForm onPostCreated={handleNewPost} />
          </div>

          <div className="space-y-4">
            {loading ? (
              <>
                <FeedPostSkeleton />
                <FeedPostSkeleton />
                <FeedPostSkeleton />
              </>
            ) : posts.length > 0 ? (
              posts.map((post) => (
                <EnhancedFeedPost
                  key={post.id}
                  id={post.id}
                  userId={post.user_id}
                  username={post.profiles?.username || "User"}
                  userAvatar={post.profiles?.avatar_url || undefined}
                  content={post.content}
                  imageUrl={post.image_url || undefined}
                  createdAt={post.created_at}
                  likes={post.likes || 0}
                  hasLiked={post.hasLiked}
                  onDelete={handleDeletePost}
                />
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No posts yet. Be the first to share!</p>
              </div>
            )}
          </div>
        </div>
      </AppLayout>
    </ProfileProtectedRoute>
  );
}
