import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { LeaderboardCard } from "@/components/challenges/LeaderboardCard";
import { CreateChallenge } from "@/components/challenges/CreateChallenge";
import { ChallengeCard } from "@/components/challenges/ChallengeCard";
import { ChallengeDetails } from "@/components/challenges/ChallengeDetails";
import { ChallengeFilters, type ChallengeFilters as ChallengeFiltersType } from "@/components/challenges/ChallengeFilters";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { StepCounter } from "@/components/ui/step-counter";
import { Trophy, Calendar, Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// Mock data for challenges
const mockChallenges = [
  {
    id: "1",
    title: "Spring Step Challenge",
    description: "Let's get moving this spring! Walk 100,000 steps in one week.",
    goal: 100000,
    type: "steps" as const,
    startDate: "2025-05-20",
    endDate: "2025-05-26",
    visibility: "public" as const,
    createdBy: "Ashley",
    participantCount: 24,
    userProgress: 65420,
    isJoined: true,
    status: "active" as const,
  },
  {
    id: "2",
    title: "Summer Solstice Challenge",
    description: "Celebrate the longest day with 21,000 steps on June 21st!",
    goal: 21000,
    type: "steps" as const,
    startDate: "2025-06-20",
    endDate: "2025-06-26",
    visibility: "public" as const,
    createdBy: "Madison",
    participantCount: 16,
    isJoined: false,
    status: "upcoming" as const,
  },
  {
    id: "3",
    title: "Weekend Warriors",
    description: "Get active this weekend with friends!",
    goal: 180,
    type: "active_minutes" as const,
    startDate: "2025-05-24",
    endDate: "2025-05-25",
    visibility: "friends" as const,
    createdBy: "Jessica",
    participantCount: 8,
    userProgress: 95,
    isJoined: true,
    status: "active" as const,
  },
  {
    id: "4",
    title: "May Marathon",
    description: "Complete the equivalent of a marathon distance this month.",
    goal: 42195,
    type: "distance" as const,
    startDate: "2025-05-01",
    endDate: "2025-05-31",
    visibility: "public" as const,
    createdBy: "Emma",
    participantCount: 45,
    userProgress: 32000,
    isJoined: true,
    status: "active" as const,
  },
];

const mockDailyLeaderboard = [
  { id: "1", username: "Ashley", avatarUrl: "", steps: 12453, rank: 1 },
  { id: "2", username: "Madison", avatarUrl: "", steps: 10782, rank: 2 },
  { id: "3", username: "Jessica", avatarUrl: "", steps: 9356, rank: 3 },
  { id: "4", username: "Emma", avatarUrl: "", steps: 8142, rank: 4 },
  { id: "5", username: "Sophia", avatarUrl: "", steps: 7895, rank: 5 },
  { id: "current", username: "You", avatarUrl: "", steps: 5621, rank: 8 },
];

const Challenges = () => {
  const [currentSteps, setCurrentSteps] = useState(5621);
  const [challenges, setChallenges] = useState(mockChallenges);
  const [filteredChallenges, setFilteredChallenges] = useState(mockChallenges);
  const [selectedChallengeId, setSelectedChallengeId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFilterChange = (filters: ChallengeFiltersType) => {
    let filtered = challenges;

    if (filters.status !== "all") {
      filtered = filtered.filter(c => c.status === filters.status);
    }

    if (filters.type !== "all") {
      filtered = filtered.filter(c => c.type === filters.type);
    }

    if (filters.visibility !== "all") {
      filtered = filtered.filter(c => c.visibility === filters.visibility);
    }

    if (filters.participation !== "all") {
      if (filters.participation === "joined") {
        filtered = filtered.filter(c => c.isJoined);
      } else if (filters.participation === "not_joined") {
        filtered = filtered.filter(c => !c.isJoined);
      }
    }

    setFilteredChallenges(filtered);
  };

  const handleJoinChallenge = async (challengeId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setChallenges(prev => prev.map(c => 
        c.id === challengeId 
          ? { ...c, isJoined: true, participantCount: c.participantCount + 1 }
          : c
      ));
      
      toast({
        title: "Challenge Joined!",
        description: "You've successfully joined the challenge. Good luck!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to join challenge. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleLeaveChallenge = async (challengeId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setChallenges(prev => prev.map(c => 
        c.id === challengeId 
          ? { ...c, isJoined: false, participantCount: Math.max(0, c.participantCount - 1) }
          : c
      ));
      
      toast({
        title: "Left Challenge",
        description: "You've successfully left the challenge.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to leave challenge. Please try again.",
        variant: "destructive",
      });
    }
  };

  // ... keep existing code (filter challenges based on current filters)
  const activeChallenges = filteredChallenges.filter(c => c.status === "active");
  const upcomingChallenges = filteredChallenges.filter(c => c.status === "upcoming");
  const joinedChallenges = filteredChallenges.filter(c => c.isJoined);
  
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
        
        {/* Challenges Tabs */}
        <Tabs defaultValue="browse" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="browse">Browse</TabsTrigger>
            <TabsTrigger value="joined">Joined</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaders</TabsTrigger>
            <TabsTrigger value="create">Create</TabsTrigger>
          </TabsList>
          
          <TabsContent value="browse" className="pt-4 animate-enter">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Browse Challenges</h2>
                <Button variant="ghost" size="sm" className="text-primary flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  <span className="text-xs">Calendar</span>
                </Button>
              </div>

              <ChallengeFilters onFilterChange={handleFilterChange} />
              
              {/* Active Challenges */}
              {activeChallenges.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-medium text-sm text-muted-foreground">Active Challenges</h3>
                  {activeChallenges.map(challenge => (
                    <ChallengeCard
                      key={challenge.id}
                      challenge={challenge}
                      onJoin={handleJoinChallenge}
                      onLeave={handleLeaveChallenge}
                      onViewDetails={setSelectedChallengeId}
                    />
                  ))}
                </div>
              )}

              {/* Upcoming Challenges */}
              {upcomingChallenges.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-medium text-sm text-muted-foreground">Upcoming Challenges</h3>
                  {upcomingChallenges.map(challenge => (
                    <ChallengeCard
                      key={challenge.id}
                      challenge={challenge}
                      onJoin={handleJoinChallenge}
                      onLeave={handleLeaveChallenge}
                      onViewDetails={setSelectedChallengeId}
                    />
                  ))}
                </div>
              )}

              {filteredChallenges.length === 0 && (
                <div className="text-center py-8">
                  <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No challenges found with current filters.</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="joined" className="pt-4 animate-enter">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Your Challenges</h2>
              
              {joinedChallenges.length > 0 ? (
                <div className="space-y-3">
                  {joinedChallenges.map(challenge => (
                    <ChallengeCard
                      key={challenge.id}
                      challenge={challenge}
                      onJoin={handleJoinChallenge}
                      onLeave={handleLeaveChallenge}
                      onViewDetails={setSelectedChallengeId}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground mb-4">You haven't joined any challenges yet.</p>
                  <Button onClick={() => setSelectedChallengeId("1")}>
                    Browse Challenges
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="leaderboard" className="pt-4 animate-enter">
            <LeaderboardCard 
              title="Today's Steps"
              description="May 22, 2025"
              timeframe="daily"
              users={mockDailyLeaderboard}
              currentUserId="current"
            />
          </TabsContent>
          
          <TabsContent value="create" className="pt-4 animate-enter">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Create Challenge</h2>
              <CreateChallenge />
            </div>
          </TabsContent>
        </Tabs>

        {/* Challenge Details Modal */}
        <ChallengeDetails
          challengeId={selectedChallengeId}
          isOpen={!!selectedChallengeId}
          onClose={() => setSelectedChallengeId(null)}
          onJoin={handleJoinChallenge}
          onLeave={handleLeaveChallenge}
        />
      </div>
    </AppLayout>
  );
};

export default Challenges;
