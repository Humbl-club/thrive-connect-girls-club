
import { useState } from 'react';
import { Heart, MessageSquare, MoreHorizontal } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { CommentSection } from './CommentSection';

export interface PostProps {
  id: string;
  user: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
  content?: string;
  imageUrl?: string;
  likes: number;
  comments: Array<{
    id: string;
    content: string;
    created_at: string;
    user: {
      id: string;
      username: string;
      avatarUrl?: string;
    };
  }>;
  createdAt: Date | string;
  hasLiked?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onLikeToggle?: () => void;
  onCommentAdded?: () => void;
}

export function FeedPost({
  id,
  user,
  content,
  imageUrl,
  likes = 0,
  comments = [],
  createdAt,
  hasLiked = false,
  className,
  style,
  onLikeToggle,
  onCommentAdded
}: PostProps) {
  const [isLiked, setIsLiked] = useState(hasLiked);
  const [likeCount, setLikeCount] = useState(likes);
  const [showComments, setShowComments] = useState(false);
  const { user: currentUser } = useAuth();
  const { toast } = useToast();

  const handleLike = async () => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please log in to like posts",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isLiked) {
        // Unlike post
        await supabase
          .from('post_likes')
          .delete()
          .match({ user_id: currentUser.id, post_id: id });
        
        setLikeCount((prev) => prev - 1);
      } else {
        // Like post
        await supabase
          .from('post_likes')
          .insert({ user_id: currentUser.id, post_id: id });
        
        setLikeCount((prev) => prev + 1);
      }
      
      setIsLiked(!isLiked);
      if (onLikeToggle) onLikeToggle();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update like",
        variant: "destructive",
      });
    }
  };

  const handleCommentAdded = () => {
    if (onCommentAdded) onCommentAdded();
  };

  return (
    <div className={cn("bg-white rounded-xl shadow-sm p-4 border border-gray-100", className)} style={style}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <Avatar className="h-10 w-10">
            {user.avatarUrl ? (
              <AvatarImage src={user.avatarUrl} alt={user.username} />
            ) : (
              <AvatarFallback className="bg-brand-navy text-white font-medium">
                {user.username[0].toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>
          <div>
            <p className="font-semibold text-sm text-text-primary">{user.username}</p>
            <p className="text-xs text-text-muted">
              {typeof createdAt === 'string' 
                ? formatDistanceToNow(new Date(createdAt), { addSuffix: true })
                : formatDistanceToNow(createdAt, { addSuffix: true })}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 text-text-muted hover:text-text-primary">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {content && <p className="text-sm text-text-primary mb-3 whitespace-pre-line leading-relaxed">{content}</p>}

      {imageUrl && (
        <div className="mb-3 rounded-lg overflow-hidden border border-gray-100">
          <img
            src={imageUrl}
            alt="Post image"
            className="w-full object-cover max-h-80"
          />
        </div>
      )}

      <div className="flex items-center justify-between border-t border-gray-100 pt-3">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "flex items-center gap-1 font-medium",
            isLiked ? "text-rose-500 hover:text-rose-600" : "text-text-muted hover:text-text-primary"
          )}
          onClick={handleLike}
        >
          <Heart className={cn("h-4 w-4", isLiked && "fill-rose-500")} />
          <span className="text-xs font-medium">{likeCount}</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-1 text-text-muted hover:text-text-primary font-medium"
          onClick={() => setShowComments(!showComments)}
        >
          <MessageSquare className="h-4 w-4" />
          <span className="text-xs font-medium">{comments.length}</span>
        </Button>
      </div>

      {showComments && (
        <CommentSection 
          postId={id} 
          comments={comments} 
          onCommentAdded={handleCommentAdded} 
        />
      )}
    </div>
  );
}
