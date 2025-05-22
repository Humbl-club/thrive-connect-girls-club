
import { useState } from "react";
import { ChevronDown, Trophy } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LeaderboardUser {
  id: string;
  username: string;
  avatarUrl?: string;
  steps: number;
  rank: number;
}

interface LeaderboardCardProps {
  title: string;
  description?: string;
  timeframe: "daily" | "weekly" | "monthly";
  users: LeaderboardUser[];
  currentUserId?: string;
  className?: string;
}

export function LeaderboardCard({
  title,
  description,
  timeframe,
  users,
  currentUserId,
  className,
}: LeaderboardCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const displayUsers = isExpanded ? users : users.slice(0, 5);
  const currentUser = users.find(user => user.id === currentUserId);
  
  // Get medal color based on rank
  const getMedalColor = (rank: number) => {
    if (rank === 1) return "text-yellow-500";
    if (rank === 2) return "text-gray-400";
    if (rank === 3) return "text-amber-700";
    return "text-muted-foreground";
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg font-bold">{title}</CardTitle>
            {description && (
              <CardDescription>{description}</CardDescription>
            )}
          </div>
          {timeframe === "weekly" && (
            <div className="bg-purple-100 text-primary px-2 py-1 rounded-full text-xs font-medium">
              Weekly
            </div>
          )}
          {timeframe === "monthly" && (
            <div className="bg-pink-100 text-secondary px-2 py-1 rounded-full text-xs font-medium">
              Monthly
            </div>
          )}
          {timeframe === "daily" && (
            <div className="bg-teal-100 text-accent px-2 py-1 rounded-full text-xs font-medium">
              Today
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="space-y-2">
          {displayUsers.map((user) => (
            <div
              key={user.id}
              className={cn(
                "flex items-center justify-between py-2 px-3 rounded-lg transition-colors",
                user.id === currentUserId
                  ? "bg-primary/10"
                  : "hover:bg-muted/50"
              )}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 flex justify-center">
                  {user.rank <= 3 ? (
                    <Trophy className={cn("h-5 w-5", getMedalColor(user.rank))} />
                  ) : (
                    <span className="text-sm font-medium text-muted-foreground">
                      {user.rank}
                    </span>
                  )}
                </div>
                <Avatar className="h-8 w-8">
                  {user.avatarUrl ? (
                    <AvatarImage src={user.avatarUrl} alt={user.username} />
                  ) : (
                    <AvatarFallback>{user.username[0]}</AvatarFallback>
                  )}
                </Avatar>
                <span className="font-medium text-sm">{user.username}</span>
              </div>
              <span className="font-semibold text-sm">
                {user.steps.toLocaleString()} steps
              </span>
            </div>
          ))}

          {users.length > 5 && (
            <Button
              variant="ghost"
              className="w-full text-xs text-muted-foreground"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <span>{isExpanded ? "Show Less" : `Show All (${users.length})`}</span>
              <ChevronDown
                className={cn(
                  "ml-1 h-4 w-4 transition-transform",
                  isExpanded && "rotate-180"
                )}
              />
            </Button>
          )}
          
          {currentUser && !displayUsers.includes(currentUser) && (
            <>
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-dashed border-muted" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-background px-2 text-xs text-muted-foreground">
                    Your Position
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-primary/10">
                <div className="flex items-center gap-3">
                  <div className="w-8 flex justify-center">
                    <span className="text-sm font-medium text-muted-foreground">
                      {currentUser.rank}
                    </span>
                  </div>
                  <Avatar className="h-8 w-8">
                    {currentUser.avatarUrl ? (
                      <AvatarImage src={currentUser.avatarUrl} alt={currentUser.username} />
                    ) : (
                      <AvatarFallback>{currentUser.username[0]}</AvatarFallback>
                    )}
                  </Avatar>
                  <span className="font-medium text-sm">{currentUser.username}</span>
                </div>
                <span className="font-semibold text-sm">
                  {currentUser.steps.toLocaleString()} steps
                </span>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
