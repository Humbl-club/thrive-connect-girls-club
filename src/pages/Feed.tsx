
import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { FeedPost } from "@/components/feed/FeedPost";
import { FeedPostForm } from "@/components/feed/FeedPostForm";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/ui/use-toast";

const Feed = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Fetch posts from Supabase
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        // Get posts with user profiles
        const { data: postsData, error: postsError } = await supabase
          .from('feed_posts')
          .select('*, profiles:user_id(*)')
          .order('created_at', { ascending: false });
        
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
          
          const username = post.profiles?.username || `user_${post.user_id.substring(0, 6)}`;
          
          return {
            id: post.id,
            user: {
              id: post.user_id,
              username: username,
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
    };
    
    fetchPosts();
    
    // Set up real-time subscription for new posts
    const channel = supabase
      .channel('public:feed_posts')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'feed_posts' }, 
        () => {
          fetchPosts(); // Refetch posts when changes occur
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast]);
  
  const handlePostCreated = () => {
    // This will refetch posts after a new post is created
  };
  
  return (
    <AppLayout>
      <div className="container px-4 py-6 pb-20 max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">Club Feed</h1>
        
        {/* Create Post */}
        <FeedPostForm onPostCreated={handlePostCreated} />
        
        {/* Posts Feed */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10">
            <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground">Loading posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground">No posts yet. Be the first to post!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post, index) => (
              <FeedPost
                key={post.id}
                {...post}
                className="animate-enter"
                style={{ animationDelay: `${index * 100}ms` }}
                onLikeToggle={handlePostCreated}
                onCommentAdded={handlePostCreated}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Feed;
