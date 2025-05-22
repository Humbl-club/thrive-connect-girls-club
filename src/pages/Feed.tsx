
import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { FeedPost } from "@/components/feed/FeedPost";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Image, Send, Smile } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

// Mock data
const mockPosts = [
  {
    id: "1",
    user: { id: "2", username: "Madison", avatarUrl: "" },
    content: "Just completed my first 10K run! Thanks to everyone for the encouragement!",
    imageUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
    likes: 24,
    comments: 5,
    createdAt: new Date(2025, 4, 21, 14, 32),
    hasLiked: true
  },
  {
    id: "2",
    user: { id: "3", username: "Jessica", avatarUrl: "" },
    content: "Morning yoga session with the club was amazing today! Can't wait for next week's meetup. Who else is joining?",
    imageUrl: "https://images.unsplash.com/photo-1518495973542-4542c06a5843",
    likes: 18,
    comments: 7,
    createdAt: new Date(2025, 4, 21, 9, 15),
    hasLiked: false
  },
  {
    id: "3",
    user: { id: "5", username: "Sophia", avatarUrl: "" },
    content: "New personal best on my daily steps! Small victories add up to big changes! 💪",
    imageUrl: "",
    likes: 32,
    comments: 8,
    createdAt: new Date(2025, 4, 20, 18, 45),
    hasLiked: false
  },
  {
    id: "4",
    user: { id: "1", username: "Ashley", avatarUrl: "" },
    content: "Check out these new running shoes I got! Perfect for our weekend runs. Has anyone else tried this brand?",
    imageUrl: "https://images.unsplash.com/photo-1500673922987-e212871fec22",
    likes: 15,
    comments: 12,
    createdAt: new Date(2025, 4, 20, 12, 30),
    hasLiked: true
  }
];

const Feed = () => {
  const [postContent, setPostContent] = useState("");
  
  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (postContent.trim()) {
      console.log("Post content:", postContent);
      setPostContent("");
    }
  };
  
  return (
    <AppLayout>
      <div className="container px-4 py-6 pb-20 max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">Club Feed</h1>
        
        {/* Create Post */}
        <div className="bg-white rounded-xl girls-shadow p-4 mb-6 animate-enter">
          <div className="flex gap-3 mb-4">
            <Avatar className="h-10 w-10">
              <AvatarFallback>You</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <form onSubmit={handlePostSubmit}>
                <div className="mb-2">
                  <Input
                    placeholder="Share something with the club..."
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    className="border-0 bg-gray-50 focus-visible:ring-0 focus-visible:ring-transparent"
                  />
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <Button type="button" variant="ghost" size="icon" className="rounded-full h-8 w-8">
                      <Image className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" className="rounded-full h-8 w-8">
                      <Smile className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                  
                  <Button 
                    type="submit" 
                    size="sm"
                    disabled={!postContent.trim()} 
                    className="rounded-full flex items-center gap-1"
                  >
                    <span>Post</span>
                    <Send className="h-3 w-3" />
                  </Button>
                </div>
              </form>
            </div>
          </div>
          
          <Separator />
        </div>
        
        {/* Posts Feed */}
        <div className="space-y-6">
          {mockPosts.map((post, index) => (
            <FeedPost 
              key={post.id} 
              {...post} 
              className="animate-enter"
              style={{ animationDelay: `${index * 100}ms` }}
            />
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default Feed;
