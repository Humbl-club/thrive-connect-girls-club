
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LeaderboardCard } from "./LeaderboardCard";
import { Trophy, Users, Calendar, Target, User } from "lucide-react";
import { format } from "date-fns";

interface ChallengeDetailsProps {
  challengeId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onJoin?: (challengeId: string) => void;
  onLeave?: (challengeId: string) => void;
}

type ChallengeType = "steps" | "distance" | "active_minutes";

// Mock data - replace with real data fetching
const mockChallengeDetails = {
  id: "1",
  title: "Spring Step Challenge",
  description: "Let's get moving this spring! Walk 100,000 steps in one week.",
  goal: 100000,
  type: "steps" as ChallengeType,
  startDate: "2025-05-20",
  endDate: "2025-05-26",
  visibility: "public" as const,
  createdBy: "Ashley",
  participantCount: 24,
  userProgress: 65420,
  isJoined: true,
  status: "active" as const,
  participants: [
    { id: "1", username: "Ashley", avatarUrl: "", steps: 89453, rank: 1 },
    { id: "2", username: "Madison", avatarUrl: "", steps: 78542, rank: 2 },
    { id: "3", username: "Jessica", avatarUrl: "", steps: 72156, rank: 3 },
    { id: "current", username: "You", avatarUrl: "", steps: 65420, rank: 4 },
    { id: "4", username: "Emma", avatarUrl: "", steps: 61247, rank: 5 },
  ]
};

export function ChallengeDetails({ challengeId, isOpen, onClose, onJoin, onLeave }: ChallengeDetailsProps) {
  const [challenge, setChallenge] = useState(mockChallengeDetails);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (challengeId && isOpen) {
      // Fetch challenge details by ID
      // For now, using mock data
      setChallenge(mockChallengeDetails);
    }
  }, [challengeId, isOpen]);

  const handleJoinLeave = async () => {
    if (!challengeId) return;
    
    setIsLoading(true);
    try {
      if (challenge.isJoined) {
        await onLeave?.(challengeId);
        setChallenge(prev => ({ ...prev, isJoined: false, participantCount: prev.participantCount - 1 }));
      } else {
        await onJoin?.(challengeId);
        setChallenge(prev => ({ ...prev, isJoined: true, participantCount: prev.participantCount + 1 }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const progressPercentage = Math.min((challenge.userProgress / challenge.goal) * 100, 100);

  const getTypeIcon = (type: ChallengeType) => {
    switch (type) {
      case "steps":
        return "👟";
      case "distance":
        return "🏃";
      case "active_minutes":
        return "⏱️";
      default:
        return "🎯";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <span className="text-xl">{getTypeIcon(challenge.type)}</span>
            <DialogTitle className="text-xl font-bold">{challenge.title}</DialogTitle>
          </div>
          <DialogDescription>
            {challenge.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Visibility */}
          <div className="flex gap-2">
            <Badge className="bg-green-100 text-green-800">
              {challenge.status}
            </Badge>
            <Badge variant="outline" className="bg-purple-100 text-purple-800">
              {challenge.visibility}
            </Badge>
          </div>

          {/* Challenge Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-muted rounded-lg">
              <Target className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
              <div className="text-lg font-semibold">{challenge.goal.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Goal</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <Users className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
              <div className="text-lg font-semibold">{challenge.participantCount}</div>
              <div className="text-xs text-muted-foreground">Participants</div>
            </div>
          </div>

          {/* Date Range */}
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="font-medium">
                {format(new Date(challenge.startDate), "MMMM dd")} - {format(new Date(challenge.endDate), "MMMM dd, yyyy")}
              </div>
              <div className="text-sm text-muted-foreground">Challenge Duration</div>
            </div>
          </div>

          {/* Created By */}
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <User className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="font-medium">Created by {challenge.createdBy}</div>
              <div className="text-sm text-muted-foreground">Challenge Host</div>
            </div>
          </div>

          {/* Your Progress (if joined) */}
          {challenge.isJoined && (
            <div className="space-y-3 p-4 bg-primary/5 rounded-lg">
              <h3 className="font-semibold flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Your Progress
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{challenge.userProgress.toLocaleString()} / {challenge.goal.toLocaleString()}</span>
                </div>
                <Progress value={progressPercentage} className="h-3" />
                <div className="text-sm text-center text-muted-foreground">
                  {progressPercentage.toFixed(1)}% complete
                </div>
              </div>
            </div>
          )}

          {/* Leaderboard */}
          <div>
            <h3 className="font-semibold mb-3">Leaderboard</h3>
            <LeaderboardCard
              title=""
              timeframe="weekly"
              users={challenge.participants}
              currentUserId="current"
              className="border-0 shadow-none bg-muted/30"
            />
          </div>

          {/* Action Button */}
          {challenge.status === "active" && (
            <Button
              onClick={handleJoinLeave}
              disabled={isLoading}
              variant={challenge.isJoined ? "outline" : "default"}
              className="w-full"
              size="lg"
            >
              {isLoading ? "..." : challenge.isJoined ? "Leave Challenge" : "Join Challenge"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
