
import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { LeaderboardCard } from "@/components/challenges/LeaderboardCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { StepCounter } from "@/components/ui/step-counter";
import { Trophy, Calendar } from "lucide-react";

// Mock data
const mockDailyLeaderboard = [
  { id: "1", username: "Ashley", avatarUrl: "", steps: 12453, rank: 1 },
  { id: "2", username: "Madison", avatarUrl: "", steps: 10782, rank: 2 },
  { id: "3", username: "Jessica", avatarUrl: "", steps: 9356, rank: 3 },
  { id: "4", username: "Emma", avatarUrl: "", steps: 8142, rank: 4 },
  { id: "5", username: "Sophia", avatarUrl: "", steps: 7895, rank: 5 },
  { id: "6", username: "Olivia", avatarUrl: "", steps: 7521, rank: 6 },
  { id: "7", username: "Ava", avatarUrl: "", steps: 7102, rank: 7 },
  { id: "current", username: "You", avatarUrl: "", steps: 5621, rank: 8 },
  { id: "8", username: "Isabella", avatarUrl: "", steps: 5214, rank: 9 },
  { id: "9", username: "Mia", avatarUrl: "", steps: 4587, rank: 10 },
];

const mockWeeklyLeaderboard = [
  { id: "1", username: "Ashley", avatarUrl: "", steps: 68231, rank: 1 },
  { id: "2", username: "Madison", avatarUrl: "", steps: 62145, rank: 2 },
  { id: "3", username: "Jessica", avatarUrl: "", steps: 59874, rank: 3 },
  { id: "4", username: "Emma", avatarUrl: "", steps: 54289, rank: 4 },
  { id: "5", username: "Sophia", avatarUrl: "", steps: 49856, rank: 5 },
  { id: "current", username: "You", avatarUrl: "", steps: 37594, rank: 8 },
];

const mockMonthlyLeaderboard = [
  { id: "1", username: "Ashley", avatarUrl: "", steps: 298754, rank: 1 },
  { id: "2", username: "Madison", avatarUrl: "", steps: 275421, rank: 2 },
  { id: "3", username: "Jessica", avatarUrl: "", steps: 254875, rank: 3 },
  { id: "4", username: "Emma", avatarUrl: "", steps: 231456, rank: 4 },
  { id: "5", username: "Sophia", avatarUrl: "", steps: 215687, rank: 5 },
  { id: "current", username: "You", avatarUrl: "", steps: 143240, rank: 12 },
];

const Challenges = () => {
  const [currentSteps, setCurrentSteps] = useState(5621);
  
  return (
    <AppLayout>
      <div className="container px-4 py-6 pb-20 max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Trophy className="h-6 w-6 text-primary" />
          Challenges
        </h1>
        
        {/* Current Progress */}
        <div className="bg-white rounded-xl girls-shadow mb-6">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold mb-1">Today's Progress</h2>
            <p className="text-sm text-muted-foreground">May 22, 2025</p>
          </div>
          
          <div className="p-4 flex items-center justify-between">
            <StepCounter currentSteps={currentSteps} goalSteps={10000} size="md" />
            
            <div>
              <div className="text-sm mb-1">
                <span className="font-medium">{currentSteps.toLocaleString()}</span> of {(10000).toLocaleString()} steps
              </div>
              
              <div className="w-36 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-500" 
                  style={{ width: `${(currentSteps / 10000) * 100}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>0</span>
                <span>Goal: 10K</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Active Challenges */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">Active Challenges</h2>
            <Button variant="ghost" size="sm" className="text-primary flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span className="text-xs">Calendar</span>
            </Button>
          </div>
          
          <Tabs defaultValue="daily" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
            </TabsList>
            
            <TabsContent value="daily" className="pt-4 animate-enter">
              <LeaderboardCard 
                title="Today's Steps"
                description="May 22, 2025"
                timeframe="daily"
                users={mockDailyLeaderboard}
                currentUserId="current"
              />
            </TabsContent>
            
            <TabsContent value="weekly" className="pt-4 animate-enter">
              <LeaderboardCard 
                title="Spring Step Challenge"
                description="May 20-26"
                timeframe="weekly"
                users={mockWeeklyLeaderboard}
                currentUserId="current"
              />
            </TabsContent>
            
            <TabsContent value="monthly" className="pt-4 animate-enter">
              <LeaderboardCard 
                title="May Marathon"
                description="May 1-31"
                timeframe="monthly"
                users={mockMonthlyLeaderboard}
                currentUserId="current"
              />
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Upcoming Challenges */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Upcoming Challenges</h2>
          
          <div className="space-y-4">
            <div className="bg-white rounded-xl girls-shadow p-4">
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-semibold">Summer Solstice Challenge</h3>
                <div className="bg-purple-100 text-primary px-2 py-0.5 rounded-full text-xs">Weekly</div>
              </div>
              
              <p className="text-sm text-muted-foreground mb-3">June 20-26</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <Trophy className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <span className="text-sm">16 members joined</span>
                </div>
                
                <Button size="sm">Join Challenge</Button>
              </div>
            </div>
            
            <div className="bg-white rounded-xl girls-shadow p-4">
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-semibold">June Journey</h3>
                <div className="bg-pink-100 text-secondary px-2 py-0.5 rounded-full text-xs">Monthly</div>
              </div>
              
              <p className="text-sm text-muted-foreground mb-3">June 1-30</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <Trophy className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <span className="text-sm">21 members joined</span>
                </div>
                
                <Button size="sm">Join Challenge</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Challenges;
