
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Trophy, Users, Calendar, Target } from "lucide-react";
import { format } from "date-fns";
import type { Challenge } from "@/hooks/useChallenges";

interface ChallengeCardProps {
  challenge: Challenge;
  onJoin?: (challengeId: string) => void;
  onLeave?: (challengeId: string) => void;
  onViewDetails?: (challengeId: string) => void;
}

export function ChallengeCard({ challenge, onJoin, onLeave, onViewDetails }: ChallengeCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const getTypeIcon = () => {
    switch (challenge.type) {
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

  const getStatusColor = () => {
    switch (challenge.status) {
      case "upcoming":
        return "bg-blue-100 text-blue-800";
      case "active":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getVisibilityColor = () => {
    switch (challenge.visibility) {
      case "public":
        return "bg-purple-100 text-purple-800";
      case "friends":
        return "bg-pink-100 text-pink-800";
      case "private":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleJoinLeave = async () => {
    setIsLoading(true);
    try {
      if (challenge.isJoined) {
        await onLeave?.(challenge.id);
      } else {
        await onJoin?.(challenge.id);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const progressPercentage = challenge.userProgress 
    ? Math.min((challenge.userProgress / challenge.goal) * 100, 100)
    : 0;

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{getTypeIcon()}</span>
              <CardTitle className="text-lg font-bold truncate">{challenge.title}</CardTitle>
            </div>
            <CardDescription className="text-sm line-clamp-2">
              {challenge.description}
            </CardDescription>
          </div>
          <div className="flex flex-col gap-1 items-end">
            <Badge className={getStatusColor()}>
              {challenge.status}
            </Badge>
            <Badge variant="outline" className={getVisibilityColor()}>
              {challenge.visibility}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Challenge Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-muted-foreground" />
            <span>Goal: {challenge.goal?.toLocaleString() || 0}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{challenge.participantCount} joined</span>
          </div>
        </div>

        {/* Date Range */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>
            {format(new Date(challenge.startDate), "MMM dd")} - {format(new Date(challenge.endDate), "MMM dd")}
          </span>
        </div>

        {/* Progress (if joined) */}
        {challenge.isJoined && challenge.userProgress !== undefined && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Your Progress</span>
              <span>{challenge.userProgress.toLocaleString()} / {challenge.goal?.toLocaleString() || 0}</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <div className="text-xs text-muted-foreground text-center">
              {progressPercentage.toFixed(1)}% complete
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {challenge.status === "active" && (
            <Button
              onClick={handleJoinLeave}
              disabled={isLoading}
              variant={challenge.isJoined ? "outline" : "default"}
              className="flex-1"
            >
              {isLoading ? "..." : challenge.isJoined ? "Leave" : "Join Challenge"}
            </Button>
          )}
          
          <Button
            onClick={() => onViewDetails?.(challenge.id)}
            variant="ghost"
            size="sm"
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
