
import { useState, useEffect } from "react";
import { Send } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

type Comment = {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  user?: {
    username?: string;
    avatar_url?: string;
    full_name?: string;
  };
};

type CommentSectionProps = {
  postId: string;
};

export function EnhancedCommentSection({ postId }: CommentSectionProps) {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      // Get comments with user profiles joined
      const { data, error } = await supabase
        .from('post_comments')
        .select(`
          id, 
          content, 
          created_at, 
          user_id,
          profiles:user_id (
            username, 
            avatar_url,
            full_name
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data to include user info directly
      const formattedComments = data.map((comment) => ({
        ...comment,
        user: comment.profiles
      }));

      setComments(formattedComments);
    } catch (error: any) {
      console.error('Error fetching comments:', error);
      toast({
        title: "Error fetching comments",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !user) return;
    
    setIsSending(true);
    
    try {
      const { error } = await supabase
        .from('post_comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content: commentText.trim()
        });
      
      if (error) throw error;
      
      // Add the new comment to the list
      const newComment: Comment = {
        id: 'temp-id', // Will be replaced when refreshing comments
        content: commentText.trim(),
        created_at: new Date().toISOString(),
        user_id: user.id,
        user: {
          username: profile?.username,
          avatar_url: profile?.avatar_url,
          full_name: profile?.full_name
        }
      };
      
      setComments([newComment, ...comments]);
      setCommentText("");
      
      // Refresh comments to get the correct IDs
      fetchComments();
      
    } catch (error: any) {
      toast({
        title: "Error adding comment",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-4">
      {user ? (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            {profile?.avatar_url ? (
              <AvatarImage src={profile.avatar_url} />
            ) : (
              <AvatarFallback>{profile?.full_name?.[0] || user.email?.[0] || "U"}</AvatarFallback>
            )}
          </Avatar>
          <Input
            placeholder="Add a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="flex-grow"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleAddComment();
              }
            }}
          />
          <Button
            size="icon"
            onClick={handleAddComment}
            disabled={!commentText.trim() || isSending}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-2">
          Sign in to leave a comment
        </p>
      )}

      <div className="space-y-3 max-h-80 overflow-y-auto">
        {isLoading ? (
          <>
            <CommentSkeleton />
            <CommentSkeleton />
            <CommentSkeleton />
          </>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-2">
              <Avatar className="h-8 w-8">
                {comment.user?.avatar_url ? (
                  <AvatarImage src={comment.user.avatar_url} />
                ) : (
                  <AvatarFallback>{comment.user?.username?.[0] || "U"}</AvatarFallback>
                )}
              </Avatar>
              <div className="flex-1">
                <div className="bg-gray-100 rounded-lg p-2 inline-block">
                  <p className="font-medium text-sm">{comment.user?.username || "User"}</p>
                  <p className="text-sm">{comment.content}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground text-center py-2">
            No comments yet
          </p>
        )}
      </div>
    </div>
  );
}

function CommentSkeleton() {
  return (
    <div className="flex gap-2">
      <Skeleton className="h-8 w-8 rounded-full" />
      <div className="flex-1">
        <Skeleton className="h-16 w-3/4 rounded-lg" />
        <Skeleton className="h-3 w-16 mt-1" />
      </div>
    </div>
  );
}
