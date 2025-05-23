
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { FriendsList } from "@/components/social/FriendsList";
import { CreateChallenge } from "@/components/challenges/CreateChallenge";
import { LeaderboardCard } from "@/components/challenges/LeaderboardCard";
import { FeedPost } from "@/components/feed/FeedPost";
import { Users, Trophy, MessageSquare } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock leaderboard data
const mockLeaderboardUsers = [
  { id: "1", username: "Ashley", avatarUrl: "", steps: 12453, rank: 1 },
  { id: "2", username: "Madison", avatarUrl: "", steps: 10782, rank: 2 },
  { id: "3", username: "Jessica", avatarUrl: "", steps: 9356, rank: 3 },
  { id: "4", username: "Emma", avatarUrl: "", steps: 8142, rank: 4 },
  { id: "5", username: "Sophia", avatarUrl: "", steps: 7895, rank: 5 },
  { id: "current", username: "You", avatarUrl: "", steps: 5621, rank: 8 },
];

// Mock feed data
const mockPosts = [
  {
    id: "1",
    user: { id: "2", username: "Madison", avatarUrl: "" },
    content: "Just completed my first 10K run! Thanks to everyone for the encouragement!",
    imageUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
    likes: 24,
    comments: [
      {
        id: "comment1",
        content: "Amazing work!",
        created_at: new Date(2025, 4, 21, 16, 30).toISOString(),
        user: { id: "3", username: "Emma", avatarUrl: "" }
      },
      {
        id: "comment2",
        content: "Inspiring!",
        created_at: new Date(2025, 4, 21, 17, 15).toISOString(),
        user: { id: "4", username: "Jessica", avatarUrl: "" }
      }
    ],
    createdAt: new Date(2025, 4, 21, 14, 32),
    hasLiked: true
  },
  {
    id: "2",
    user: { id: "1", username: "Ashley", avatarUrl: "" },
    content: "Morning workout done! Starting the day with positive energy. 💪",
    likes: 18,
    comments: [
      {
        id: "comment3",
        content: "That's the spirit!",
        created_at: new Date(2025, 4, 22, 9, 20).toISOString(),
        user: { id: "5", username: "Sophia", avatarUrl: "" }
      }
    ],
    createdAt: new Date(2025, 4, 22, 8, 15),
    hasLiked: false
  }
];

const Social = () => {
  return (
    <AppLayout>
      <div className="container px-4 py-6 pb-20 max-w-md mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Social</h1>
          <Button variant="outline" size="icon" className="rounded-full">
            <MessageSquare className="h-5 w-5" />
          </Button>
        </div>
        
        <Tabs defaultValue="feed">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="feed">Feed</TabsTrigger>
            <TabsTrigger value="friends">Friends</TabsTrigger>
            <TabsTrigger value="challenges">Challenges</TabsTrigger>
          </TabsList>
          
          <TabsContent value="feed" className="space-y-6 animate-enter">
            <div className="space-y-4">
              {mockPosts.map(post => (
                <FeedPost key={post.id} {...post} />
              ))}
              
              <Button variant="outline" className="w-full">Load More</Button>
            </div>
          </TabsContent>
          
          <TabsContent value="friends" className="animate-enter">
            <FriendsList />
          </TabsContent>
          
          <TabsContent value="challenges" className="space-y-6 animate-enter">
            <div>
              <h2 className="font-semibold text-lg mb-3 flex items-center">
                <Trophy className="h-5 w-5 mr-2 text-primary" /> Active Challenges
              </h2>
              
              <div className="space-y-4">
                <LeaderboardCard
                  title="Spring Step Challenge"
                  description="May 20-26"
                  timeframe="weekly"
                  users={mockLeaderboardUsers}
                  currentUserId="current"
                />
                
                <LeaderboardCard
                  title="May Marathon"
                  description="May 1-31"
                  timeframe="monthly"
                  users={mockLeaderboardUsers.slice(0, 3).concat(mockLeaderboardUsers[5])}
                  currentUserId="current"
                />
              </div>
            </div>
            
            <div className="pt-4">
              <CreateChallenge />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Social;
