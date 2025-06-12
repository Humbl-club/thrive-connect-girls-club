
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FeedPost } from "@/components/feed/FeedPost";
import { FeedPostForm } from "@/components/feed/FeedPostForm";
import { useToast } from "@/components/ui/use-toast";

interface FeedTabProps {
  posts: any[];
  loading: boolean;
  onPostCreated: () => void;
}

export function FeedTab({ posts, loading, onPostCreated }: FeedTabProps) {
  const { toast } = useToast();

  const handleLoadMore = () => {
    toast({
      title: "Coming soon",
      description: "Load more functionality is under development",
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <Loader2 className="h-8 w-8 text-brand-navy animate-spin mb-4" />
        <p className="text-text-muted font-medium">Loading posts...</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="space-y-6">
        <div className="mb-6">
          <FeedPostForm onPostCreated={onPostCreated} />
        </div>
        <div className="text-center py-10">
          <p className="text-text-muted font-medium">No posts yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <FeedPostForm onPostCreated={onPostCreated} />
      </div>
      
      <div className="space-y-4">
        {posts.map(post => (
          <FeedPost key={post.id} {...post} />
        ))}
        
        <Button 
          variant="outline" 
          className="w-full border-brand-navy text-brand-navy hover:bg-brand-navy hover:text-white font-medium" 
          onClick={handleLoadMore}
        >
          Load More
        </Button>
      </div>
    </div>
  );
}
