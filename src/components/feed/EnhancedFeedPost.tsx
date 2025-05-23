import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Heart, MessageCircle, Share, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EnhancedCommentSection } from "./EnhancedCommentSection";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

export type FeedPostProps = {
  id: string;
  userId: string;
  username: string;
  userAvatar?: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
  likes: number;
  hasLiked?: boolean;
  onDelete?: (id: string) => void;
};

export function EnhancedFeedPost({
  id,
  userId,
  username,
  userAvatar,
  content,
  imageUrl,
  createdAt,
  likes: initialLikes,
  hasLiked: initialHasLiked = false,
  onDelete
}: FeedPostProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLiked, setIsLiked] = useState(initialHasLiked);
  const [likeCount, setLikeCount] = useState(initialLikes);
  const [showComments, setShowComments] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const isOwnPost = user?.id === userId;
  
  const handleLikeToggle = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You need to be logged in to like posts",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (isLiked) {
        // Unlike the post
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', id)
          .eq('user_id', user.id);
          
        if (error) throw error;
        
        setIsLiked(false);
        setLikeCount(prev => Math.max(0, prev - 1));
        
      } else {
        // Like the post
        const { error } = await supabase
          .from('post_likes')
          .insert({
            post_id: id,
            user_id: user.id
          });
          
        if (error) throw error;
        
        setIsLiked(true);
        setLikeCount(prev => prev + 1);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to ${isLiked ? 'unlike' : 'like'} post: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeletePost = async () => {
    if (!isOwnPost || !onDelete) return;
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('feed_posts')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: "Post deleted",
        description: "Your post has been deleted successfully",
      });
      
      onDelete(id);
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to delete post: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const toggleComments = () => {
    setShowComments(prev => !prev);
  };
  
  return (
    <div className="bg-white rounded-xl girls-shadow p-4 mb-4">
      <div className="flex justify-between items-start">
        <div className="flex space-x-3 items-center">
          <Avatar className="h-10 w-10">
            {userAvatar ? (
              <AvatarImage src={userAvatar} alt={username} />
            ) : (
              <AvatarFallback>{username[0].toUpperCase()}</AvatarFallback>
            )}
          </Avatar>
          <div>
            <h3 className="font-semibold text-black">{username}</h3>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
        
        {isOwnPost && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleDeletePost} disabled={isLoading} className="text-red-500">
                Delete Post
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      
      <div className="mt-3">
        <p className="text-sm text-black whitespace-pre-line">{content}</p>
        {imageUrl && (
          <div className="mt-3 rounded-lg overflow-hidden">
            <img 
              src={imageUrl} 
              alt="Post image" 
              className="w-full h-auto object-cover" 
              style={{ maxHeight: '300px' }}
            />
          </div>
        )}
      </div>
      
      <div className="flex justify-between mt-4 pt-3 border-t border-gray-100">
        <Button 
          variant="ghost" 
          size="sm"
          className="flex items-center gap-1"
          onClick={handleLikeToggle}
          disabled={isLoading}
        >
          <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
          <span className="text-black">{likeCount}</span>
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm"
          className="flex items-center gap-1"
          onClick={toggleComments}
        >
          <MessageCircle className="h-4 w-4" />
          <span className="text-black">Comment</span>
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm"
          className="flex items-center gap-1"
        >
          <Share className="h-4 w-4" />
          <span className="text-black">Share</span>
        </Button>
      </div>
      
      {showComments && (
        <div className="mt-4">
          <EnhancedCommentSection postId={id} />
        </div>
      )}
    </div>
  );
}

export function FeedPostSkeleton() {
  return (
    <div className="bg-white rounded-xl girls-shadow p-4 mb-4">
      <div className="flex space-x-3 items-center">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div>
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16 mt-1" />
        </div>
      </div>
      
      <div className="mt-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4 mt-1" />
      </div>
      
      <div className="mt-3">
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
      
      <div className="flex justify-between mt-4 pt-3">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-16" />
      </div>
    </div>
  );
}
