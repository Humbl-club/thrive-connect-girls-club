
import { AppLayout } from "@/components/layout/AppLayout";
import { ProfileHeader } from "@/components/ui/profile-header";
import { Badge } from "@/components/ui/badge";
import { StepCounter } from "@/components/ui/step-counter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Award, Settings } from "lucide-react";

const Profile = () => {
  return (
    <AppLayout>
      <div className="animate-enter">
        <div className="relative">
          <ProfileHeader 
            username="Sarah Johnson"
            bio="Fitness enthusiast, coffee lover. On a journey to become my best self!"
            isEditable={true}
            backgroundUrl="https://images.unsplash.com/photo-1518495973542-4542c06a5843"
          />
          
          <Button 
            variant="outline" 
            size="icon" 
            className="absolute top-4 right-4 rounded-full bg-white/80 backdrop-blur-sm"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="container px-4 mt-6">
          {/* Achievements */}
          <div className="mb-6">
            <h2 className="font-semibold text-sm mb-2">Achievements</h2>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="bg-white py-1 px-3 girls-shadow">
                <Award className="h-3 w-3 mr-1 text-primary" />
                <span>10K Steps Champion</span>
              </Badge>
              <Badge variant="outline" className="bg-white py-1 px-3 girls-shadow">
                <Award className="h-3 w-3 mr-1 text-primary" />
                <span>3 Week Streak</span>
              </Badge>
              <Badge variant="outline" className="bg-white py-1 px-3 girls-shadow">
                <Award className="h-3 w-3 mr-1 text-primary" />
                <span>Early Riser</span>
              </Badge>
            </div>
          </div>
          
          <Tabs defaultValue="progress">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="progress">Progress</TabsTrigger>
              <TabsTrigger value="challenges">Challenges</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="progress" className="pt-4">
              <div className="bg-white rounded-xl girls-shadow p-4 mb-4">
                <h3 className="font-semibold mb-3">Daily Progress</h3>
                <div className="flex items-center gap-4">
                  <StepCounter currentSteps={5621} goalSteps={10000} size="md" />
                  <div>
                    <div className="text-sm font-medium">5,621 / 10,000</div>
                    <div className="text-xs text-muted-foreground">56% of daily goal</div>
                    <div className="h-2 w-full bg-gray-100 rounded-full mt-1 overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: '56%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl girls-shadow p-4 mb-4">
                <h3 className="font-semibold mb-3">Weekly Progress</h3>
                <div className="flex justify-between">
                  {[0, 1, 2, 3, 4, 5, 6].map((day) => {
                    const percentage = [30, 65, 45, 80, 56, 0, 0][day];
                    const dayLabel = ["M", "T", "W", "T", "F", "S", "S"][day];
                    return (
                      <div key={day} className="flex flex-col items-center">
                        <div className="h-24 w-6 bg-gray-100 rounded-full overflow-hidden relative">
                          <div 
                            className="absolute bottom-0 w-full bg-primary rounded-full transition-all duration-500"
                            style={{ height: `${percentage}%` }}
                          ></div>
                        </div>
                        <div className="mt-1 text-xs font-medium">{dayLabel}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="bg-white rounded-xl girls-shadow p-4">
                <h3 className="font-semibold mb-3">Monthly Summary</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-primary">143,240</div>
                    <div className="text-xs text-muted-foreground">Total Steps</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-primary">68.2</div>
                    <div className="text-xs text-muted-foreground">Miles</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-primary">16/31</div>
                    <div className="text-xs text-muted-foreground">Goal Days</div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="challenges" className="pt-4">
              <div className="space-y-4">
                <div className="bg-white rounded-xl girls-shadow p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold">Spring Step Challenge</h3>
                    <Badge className="bg-purple-100 text-primary hover:bg-purple-200 text-xs">Active</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">May 20-26 • Weekly Challenge</p>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm">Your position: <span className="font-semibold">8th</span></div>
                      <div className="text-xs text-muted-foreground">5,621 steps today</div>
                    </div>
                    <Button variant="outline" size="sm">View Leaderboard</Button>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl girls-shadow p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold">May Marathon</h3>
                    <Badge className="bg-pink-100 text-secondary hover:bg-pink-200 text-xs">Active</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">May 1-31 • Monthly Challenge</p>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm">Your position: <span className="font-semibold">12th</span></div>
                      <div className="text-xs text-muted-foreground">143,240 steps this month</div>
                    </div>
                    <Button variant="outline" size="sm">View Leaderboard</Button>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="history" className="pt-4">
              <div className="space-y-4">
                <div className="bg-white rounded-xl girls-shadow p-4">
                  <h3 className="font-semibold mb-3">April Challenge</h3>
                  <p className="text-xs text-muted-foreground mb-2">April 1-30 • Monthly Challenge</p>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm">Final position: <span className="font-semibold">5th place</span></div>
                      <div className="text-xs text-muted-foreground">289,145 steps</div>
                    </div>
                    <Badge className="bg-gray-100 text-muted-foreground hover:bg-gray-200 text-xs">Completed</Badge>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl girls-shadow p-4">
                  <h3 className="font-semibold mb-3">Spring Kickoff</h3>
                  <p className="text-xs text-muted-foreground mb-2">March 20-26 • Weekly Challenge</p>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm">Final position: <span className="font-semibold">1st place 🏆</span></div>
                      <div className="text-xs text-muted-foreground">76,324 steps</div>
                    </div>
                    <Badge className="bg-gray-100 text-muted-foreground hover:bg-gray-200 text-xs">Completed</Badge>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
};

export default Profile;
