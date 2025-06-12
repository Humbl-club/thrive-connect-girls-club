
import { AppLayout } from "@/components/layout/AppLayout";
import { FriendsList } from "@/components/social/FriendsList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/components/auth/AuthProvider";
import { SocialHeader } from "@/components/social/SocialHeader";
import { FeedTab } from "@/components/social/FeedTab";
import { ChallengesTab } from "@/components/social/ChallengesTab";
import { useSocialData } from "@/hooks/useSocialData";

const Social = () => {
  const { user } = useAuth();
  const { posts, loading, leaderboardUsers, loadingLeaderboard, refreshPosts } = useSocialData();

  return (
    <AppLayout>
      <div className="container px-4 py-6 pb-20 max-w-md mx-auto">
        <SocialHeader />
        
        <Tabs defaultValue="feed">
          <TabsList className="grid w-full grid-cols-3 mb-4 bg-brand-light border border-brand-navy/20">
            <TabsTrigger value="feed" className="data-[state=active]:bg-brand-navy data-[state=active]:text-white font-medium">Feed</TabsTrigger>
            <TabsTrigger value="friends" className="data-[state=active]:bg-brand-navy data-[state=active]:text-white font-medium">Friends</TabsTrigger>
            <TabsTrigger value="challenges" className="data-[state=active]:bg-brand-navy data-[state=active]:text-white font-medium">Challenges</TabsTrigger>
          </TabsList>
          
          <TabsContent value="feed" className="space-y-6 animate-enter">
            <FeedTab 
              posts={posts} 
              loading={loading} 
              onPostCreated={refreshPosts} 
            />
          </TabsContent>
          
          <TabsContent value="friends" className="animate-enter">
            <FriendsList />
          </TabsContent>
          
          <TabsContent value="challenges" className="space-y-6 animate-enter">
            <ChallengesTab 
              leaderboardUsers={leaderboardUsers}
              loadingLeaderboard={loadingLeaderboard}
              currentUserId={user?.id}
            />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Social;
