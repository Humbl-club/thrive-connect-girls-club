
import { useState } from 'react';
import { Heart, MessageSquare, MoreHorizontal } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

export interface PostProps {
  id: string;
  user: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
  content: string;
  imageUrl?: string;
  likes: number;
  comments: number;
  createdAt: Date;
  hasLiked?: boolean;
  className?: string;
}

export function FeedPost({
  id,
  user,
  content,
  imageUrl,
  likes,
  comments,
  createdAt,
  hasLiked = false,
  className,
}: PostProps) {
  const [isLiked, setIsLiked] = useState(hasLiked);
  const [likeCount, setLikeCount] = useState(likes);

  const handleLike = () => {
    if (isLiked) {
      setLikeCount((prev) => prev - 1);
    } else {
      setLikeCount((prev) => prev + 1);
    }
    setIsLiked(!isLiked);
  };

  return (
    <div className={cn("bg-white rounded-xl shadow-sm p-4", className)}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <Avatar className="h-10 w-10">
            {user.avatarUrl ? (
              <AvatarImage src={user.avatarUrl} alt={user.username} />
            ) : (
              <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
            )}
          </Avatar>
          <div>
            <p className="font-medium text-sm">{user.username}</p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(createdAt, { addSuffix: true })}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>

      <p className="text-sm mb-3 whitespace-pre-line">{content}</p>

      {imageUrl && (
        <div className="mb-3 rounded-lg overflow-hidden">
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
            "flex items-center gap-1",
            isLiked ? "text-rose-500" : "text-muted-foreground"
          )}
          onClick={handleLike}
        >
          <Heart className={cn("h-4 w-4", isLiked && "fill-rose-500")} />
          <span className="text-xs">{likeCount}</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-1 text-muted-foreground"
        >
          <MessageSquare className="h-4 w-4" />
          <span className="text-xs">{comments}</span>
        </Button>
      </div>
    </div>
  );
}
