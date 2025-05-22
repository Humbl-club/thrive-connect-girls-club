
import { useState } from "react";
import { Medal, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/components/layout/AppLayout";
import { StepCounter } from "@/components/ui/step-counter";
import { LeaderboardCard } from "@/components/challenges/LeaderboardCard";
import { FeedPost } from "@/components/feed/FeedPost";
import { EventCard } from "@/components/calendar/EventCard";

// Mock data
const mockLeaderboardUsers = [
  { id: "1", username: "Ashley", avatarUrl: "", steps: 12453, rank: 1 },
  { id: "2", username: "Madison", avatarUrl: "", steps: 10782, rank: 2 },
  { id: "3", username: "Jessica", avatarUrl: "", steps: 9356, rank: 3 },
  { id: "4", username: "Emma", avatarUrl: "", steps: 8142, rank: 4 },
  { id: "5", username: "Sophia", avatarUrl: "", steps: 7895, rank: 5 },
  { id: "current", username: "You", avatarUrl: "", steps: 5621, rank: 8 },
];

const mockUpcomingEvents = [
  {
    id: "1",
    title: "Morning Run & Coffee",
    description: "Join us for a light 5K run followed by coffee and conversation.",
    date: new Date(2025, 4, 25, 8, 0),
    startTime: "8:00 AM",
    endTime: "10:00 AM",
    location: "Central Park, Main Entrance",
    isAttending: true
  },
  {
    id: "2",
    title: "Weekend Yoga Session",
    description: "Outdoor yoga session for all skill levels. Bring your own mat!",
    date: new Date(2025, 4, 27, 9, 0),
    startTime: "9:00 AM",
    endTime: "10:30 AM",
    location: "Riverside Park, Lawn Area",
  }
];

const mockRecentPosts = [
  {
    id: "1",
    user: { id: "2", username: "Madison", avatarUrl: "" },
    content: "Just completed my first 10K run! Thanks to everyone for the encouragement!",
    imageUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
    likes: 24,
    comments: 5,
    createdAt: new Date(2025, 4, 21, 14, 32),
    hasLiked: true
  }
];

const Index = () => {
  const [currentSteps, setCurrentSteps] = useState(5621);
  
  return (
    <AppLayout>
      <div className="container px-4 py-6 pb-20 max-w-md mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-1">
              Hello, <span className="text-primary">Sarah!</span>
            </h1>
            <p className="text-sm text-muted-foreground">
              Ready to reach your goals today?
            </p>
          </div>
          <Button variant="outline" size="icon" className="rounded-full">
            <Flame className="h-5 w-5 text-secondary" />
          </Button>
        </div>

        {/* Today's Progress */}
        <div className="bg-white rounded-xl girls-shadow p-5 mb-6 animate-enter">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">Today's Progress</h2>
            <Button variant="ghost" size="sm" className="flex items-center gap-1 text-primary text-xs">
              <Medal className="h-4 w-4" />
              Weekly Goal
            </Button>
          </div>
          
          <div className="flex justify-center mb-2">
            <StepCounter currentSteps={currentSteps} goalSteps={10000} size="lg" />
          </div>
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              {10000 - currentSteps} steps to reach your daily goal
            </p>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg bg-gray-50 p-2 flex flex-col items-center">
                <span className="text-lg font-semibold text-primary">3.2</span>
                <span className="text-xs text-muted-foreground">miles</span>
              </div>
              <div className="rounded-lg bg-gray-50 p-2 flex flex-col items-center">
                <span className="text-lg font-semibold text-primary">284</span>
                <span className="text-xs text-muted-foreground">calories</span>
              </div>
              <div className="rounded-lg bg-gray-50 p-2 flex flex-col items-center">
                <span className="text-lg font-semibold text-primary">42</span>
                <span className="text-xs text-muted-foreground">mins</span>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Challenge */}
        <div className="mb-6 animate-enter" style={{ animationDelay: "100ms" }}>
          <h2 className="font-semibold text-lg mb-3">Weekly Challenge</h2>
          <LeaderboardCard
            title="Spring Step Challenge"
            description="May 20-26"
            timeframe="weekly"
            users={mockLeaderboardUsers}
            currentUserId="current"
          />
        </div>

        {/* Upcoming Events */}
        <div className="mb-6 animate-enter" style={{ animationDelay: "200ms" }}>
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold text-lg">Upcoming Events</h2>
            <Button variant="link" size="sm" className="text-primary">
              View All
            </Button>
          </div>
          
          <div className="space-y-3">
            {mockUpcomingEvents.map(event => (
              <EventCard key={event.id} {...event} />
            ))}
          </div>
        </div>

        {/* Recent Posts */}
        <div className="animate-enter" style={{ animationDelay: "300ms" }}>
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold text-lg">Recent Posts</h2>
            <Button variant="link" size="sm" className="text-primary">
              View All
            </Button>
          </div>
          
          <div className="space-y-4">
            {mockRecentPosts.map(post => (
              <FeedPost key={post.id} {...post} />
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
