
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { 
  UserPlus, 
  Search, 
  Users, 
  Award, 
  ArrowRight,
  MessageSquare
} from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// Mock friend data
const mockFriends = [
  { id: "1", username: "Ashley", avatarUrl: "", steps: 12453, rank: 1, isOnline: true },
  { id: "2", username: "Madison", avatarUrl: "", steps: 10782, rank: 2, isOnline: false },
  { id: "3", username: "Jessica", avatarUrl: "", steps: 9356, rank: 3, isOnline: true },
  { id: "4", username: "Emma", avatarUrl: "", steps: 8142, rank: 4, isOnline: false },
  { id: "5", username: "Sophia", avatarUrl: "", steps: 7895, rank: 5, isOnline: false },
];

const mockSuggestions = [
  { id: "6", username: "Olivia", avatarUrl: "", mutualFriends: 3 },
  { id: "7", username: "Ava", avatarUrl: "", mutualFriends: 2 },
  { id: "8", username: "Isabella", avatarUrl: "", mutualFriends: 1 },
];

const mockRequests = [
  { id: "9", username: "Mia", avatarUrl: "", mutualFriends: 2 },
  { id: "10", username: "Charlotte", avatarUrl: "", mutualFriends: 1 },
];

export function FriendsList() {
  const [activeTab, setActiveTab] = useState("friends");
  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredFriends = mockFriends.filter(friend => 
    friend.username.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <Card className="girls-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center">
            <Users className="h-5 w-5 mr-2 text-primary" /> 
            Friends
          </CardTitle>
          <Button variant="outline" size="icon" className="rounded-full">
            <UserPlus className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>Connect with friends and track progress together</CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="friends" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="friends">
              Friends
              <span className="ml-1 text-xs bg-primary/10 text-primary px-1.5 rounded-full">
                {mockFriends.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="requests">
              Requests
              {mockRequests.length > 0 && (
                <span className="ml-1 text-xs bg-secondary/10 text-secondary px-1.5 rounded-full">
                  {mockRequests.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="suggestions">Suggested</TabsTrigger>
          </TabsList>
          
          <div className="relative mb-4">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>

          <TabsContent value="friends" className="space-y-3">
            {filteredFriends.length > 0 ? (
              filteredFriends.map(friend => (
                <div 
                  key={friend.id} 
                  className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        {friend.avatarUrl ? (
                          <AvatarImage src={friend.avatarUrl} alt={friend.username} />
                        ) : (
                          <AvatarFallback>{friend.username[0]}</AvatarFallback>
                        )}
                      </Avatar>
                      {friend.isOnline && (
                        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-white" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-sm flex items-center">
                        {friend.username}
                        <Award 
                          className={cn(
                            "ml-1 h-3 w-3",
                            friend.rank === 1 ? "text-yellow-500" :
                            friend.rank === 2 ? "text-gray-400" :
                            friend.rank === 3 ? "text-amber-700" : "hidden"
                          )} 
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {friend.steps.toLocaleString()} steps today
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-sm text-muted-foreground py-4">
                No friends match your search
              </p>
            )}
          </TabsContent>
          
          <TabsContent value="requests" className="space-y-3">
            {mockRequests.length > 0 ? (
              mockRequests.map(request => (
                <div 
                  key={request.id} 
                  className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      {request.avatarUrl ? (
                        <AvatarImage src={request.avatarUrl} alt={request.username} />
                      ) : (
                        <AvatarFallback>{request.username[0]}</AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <div className="font-medium text-sm">{request.username}</div>
                      <p className="text-xs text-muted-foreground">
                        {request.mutualFriends} mutual friends
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="h-8">Ignore</Button>
                    <Button size="sm" className="h-8">Accept</Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-sm text-muted-foreground py-4">
                No friend requests
              </p>
            )}
          </TabsContent>
          
          <TabsContent value="suggestions" className="space-y-3">
            {mockSuggestions.map(suggestion => (
              <div 
                key={suggestion.id} 
                className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    {suggestion.avatarUrl ? (
                      <AvatarImage src={suggestion.avatarUrl} alt={suggestion.username} />
                    ) : (
                      <AvatarFallback>{suggestion.username[0]}</AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <div className="font-medium text-sm">{suggestion.username}</div>
                    <p className="text-xs text-muted-foreground">
                      {suggestion.mutualFriends} mutual friends
                    </p>
                  </div>
                </div>
                <Button size="sm" className="h-8">
                  <UserPlus className="h-3 w-3 mr-1" />
                  Add
                </Button>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
      
      {activeTab === "friends" && (
        <CardFooter className="border-t pt-4 flex justify-center">
          <Button variant="link" size="sm" className="text-primary">
            Browse All Friends
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
