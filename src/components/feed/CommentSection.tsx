
import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
}

interface CommentSectionProps {
  postId: string;
  comments: Comment[];
  onCommentAdded: () => void;
}

export function CommentSection({ postId, comments, onCommentAdded }: CommentSectionProps) {
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!commentText.trim() || !user) return;
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('post_comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content: commentText.trim()
        });
      
      if (error) throw error;
      
      setCommentText('');
      onCommentAdded();
      
      toast({
        title: 'Comment added',
        description: 'Your comment was successfully posted',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add comment',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-3 space-y-4">
      {comments.length > 0 && (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-2">
              <Avatar className="h-8 w-8">
                {comment.user.avatarUrl ? (
                  <AvatarImage src={comment.user.avatarUrl} alt={comment.user.username} />
                ) : (
                  <AvatarFallback>{comment.user.username[0].toUpperCase()}</AvatarFallback>
                )}
              </Avatar>
              <div className="flex-1 bg-gray-50 rounded-lg p-2">
                <div className="flex justify-between items-center mb-1">
                  <p className="text-xs font-medium">{comment.user.username}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </p>
                </div>
                <p className="text-sm">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {user && (
        <form onSubmit={handleSubmitComment} className="space-y-2">
          <Textarea
            placeholder="Add a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="min-h-[60px]"
          />
          <div className="flex justify-end">
            <Button 
              type="submit" 
              size="sm" 
              disabled={isSubmitting || !commentText.trim()}
            >
              {isSubmitting ? 'Posting...' : 'Post Comment'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
