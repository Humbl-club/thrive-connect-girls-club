
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProfileHeader } from "@/components/ui/profile-header";
import { Badge } from "@/components/ui/badge";
import { StepCounter } from "@/components/ui/step-counter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Award, Settings, Camera, Instagram, MapPin } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

const Profile = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [stats, setStats] = useState({
    currentSteps: 0,
    goalSteps: 10000,
    weeklyData: [0, 0, 0, 0, 0, 0, 0],
    totalSteps: 0,
    miles: 0,
    goalDays: 0
  });

  // Fetch avatar URL and set it when profile changes
  useEffect(() => {
    if (profile?.avatar_url) {
      setAvatarUrl(profile.avatar_url);
    }
  }, [profile]);

  // Fetch user's activity data
  useEffect(() => {
    const fetchActivityData = async () => {
      if (!user) return;
      
      try {
        // Get today's date in ISO format (YYYY-MM-DD)
        const today = new Date().toISOString().split('T')[0];
        
        // Fetch today's step data
        const { data: todayData } = await supabase
          .from('activity_data')
          .select('steps')
          .eq('user_id', user.id)
          .eq('date', today)
          .maybeSingle();
        
        // Fetch weekly data (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        const startDate = sevenDaysAgo.toISOString().split('T')[0];
        
        const { data: weekData } = await supabase
          .from('activity_data')
          .select('date, steps')
          .eq('user_id', user.id)
          .gte('date', startDate)
          .lte('date', today)
          .order('date', { ascending: true });
        
        // Fetch monthly summary
        const firstDayOfMonth = new Date();
        firstDayOfMonth.setDate(1);
        const monthStart = firstDayOfMonth.toISOString().split('T')[0];
        
        const { data: monthData } = await supabase
          .from('activity_data')
          .select('steps')
          .eq('user_id', user.id)
          .gte('date', monthStart)
          .lte('date', today);

        // Calculate days where goal was met
        const goalDays = monthData?.filter(day => day.steps && day.steps >= 10000).length || 0;
        
        // Calculate total steps for the month
        const totalSteps = monthData?.reduce((sum, day) => sum + (day.steps || 0), 0) || 0;
        
        // Convert steps to miles (roughly 2000 steps per mile)
        const miles = (totalSteps / 2000).toFixed(1);
        
        // Process weekly data into array format
        const weeklySteps = [0, 0, 0, 0, 0, 0, 0];
        if (weekData) {
          const today = new Date();
          weekData.forEach(day => {
            const dayDate = new Date(day.date);
            const dayIndex = 6 - Math.floor((today.getTime() - dayDate.getTime()) / (1000 * 60 * 60 * 24));
            if (dayIndex >= 0 && dayIndex < 7) {
              weeklySteps[dayIndex] = day.steps || 0;
            }
          });
        }
        
        setStats({
          currentSteps: todayData?.steps || 0,
          goalSteps: 10000,
          weeklyData: weeklySteps.map(steps => Math.min(100, (steps / 10000) * 100)),
          totalSteps,
          miles: parseFloat(miles),
          goalDays
        });
        
      } catch (error) {
        console.error('Error fetching activity data:', error);
      }
    };

    fetchActivityData();
  }, [user]);

  // Handle avatar file upload
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0 || !user) {
        return;
      }
      
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${fileExt}`;
      
      setUploadingAvatar(true);
      
      // Upload the file
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });
        
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: publicURL } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
        
      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicURL.publicUrl })
        .eq('id', user.id);
        
      if (updateError) throw updateError;
      
      // Update local state
      setAvatarUrl(publicURL.publicUrl);
      
      // Refresh profile in context
      await refreshProfile();
      
      toast({
        title: "Success",
        description: "Avatar updated successfully",
      });
      
    } catch (error: any) {
      toast({
        title: "Error uploading avatar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploadingAvatar(false);
    }
  };
  
  const fullName = profile?.full_name || user?.email?.split('@')[0] || "User";
  const username = profile?.username || user?.email?.split('@')[0] || "username";
  const bioText = profile?.bio || "Welcome to my fitness journey! 💪";
  const location = profile?.location || "";
  const instagramHandle = profile?.instagram_handle || "";
  
  return (
    <AppLayout>
      <div className="animate-enter">
        <div className="relative">
          <ProfileHeader 
            username={username}
            bio={bioText}
            isEditable={true}
            backgroundUrl="https://images.unsplash.com/photo-1518495973542-4542c06a5843"
          />
          
          <div className="absolute flex gap-2 top-4 right-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="rounded-full bg-white/80 backdrop-blur-sm"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Update Profile Picture</DialogTitle>
                  <DialogDescription>
                    Choose a new profile picture to upload.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="flex justify-center mb-4">
                    <Avatar className="h-24 w-24">
                      {avatarUrl ? (
                        <AvatarImage src={avatarUrl} alt={fullName} />
                      ) : (
                        <AvatarFallback>{fullName[0].toUpperCase()}</AvatarFallback>
                      )}
                    </Avatar>
                  </div>
                  <label className="flex flex-col items-center gap-2 cursor-pointer">
                    <span className="text-sm font-medium">
                      {uploadingAvatar ? "Uploading..." : "Select a new photo"}
                    </span>
                    <Input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleAvatarUpload} 
                      disabled={uploadingAvatar}
                      className="hidden"
                    />
                    <Button 
                      type="button" 
                      variant="outline"
                      disabled={uploadingAvatar}
                    >
                      {uploadingAvatar ? "Uploading..." : "Upload Photo"}
                    </Button>
                  </label>
                </div>
              </DialogContent>
            </Dialog>
            
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full bg-white/80 backdrop-blur-sm"
              asChild
            >
              <Link to="/settings">
                <Settings className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          <div className="absolute -bottom-16 left-4">
            <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
              {avatarUrl ? (
                <AvatarImage src={avatarUrl} alt={fullName} />
              ) : (
                <AvatarFallback className="text-4xl">{fullName[0].toUpperCase()}</AvatarFallback>
              )}
            </Avatar>
          </div>
        </div>
        
        <div className="container px-4 mt-20">
          <div className="mb-4">
            <h1 className="text-2xl font-bold">{fullName}</h1>
            <p className="text-muted-foreground">@{username}</p>
            
            {(location || instagramHandle) && (
              <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                {location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>{location}</span>
                  </div>
                )}
                
                {instagramHandle && (
                  <div className="flex items-center gap-1">
                    <Instagram className="h-3 w-3" />
                    <span>{instagramHandle}</span>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <Separator className="my-4" />
          
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
                  <StepCounter currentSteps={stats.currentSteps} goalSteps={stats.goalSteps} size="md" />
                  <div>
                    <div className="text-sm font-medium">{stats.currentSteps.toLocaleString()} / {stats.goalSteps.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">{Math.round((stats.currentSteps / stats.goalSteps) * 100)}% of daily goal</div>
                    <div className="h-2 w-full bg-gray-100 rounded-full mt-1 overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full" 
                        style={{ width: `${Math.min(100, (stats.currentSteps / stats.goalSteps) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl girls-shadow p-4 mb-4">
                <h3 className="font-semibold mb-3">Weekly Progress</h3>
                <div className="flex justify-between">
                  {["M", "T", "W", "T", "F", "S", "S"].map((dayLabel, index) => {
                    const percentage = stats.weeklyData[index];
                    return (
                      <div key={index} className="flex flex-col items-center">
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
                    <div className="text-xl font-bold text-primary">{stats.totalSteps.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">Total Steps</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-primary">{stats.miles}</div>
                    <div className="text-xs text-muted-foreground">Miles</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-primary">{stats.goalDays}/30</div>
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
                      <div className="text-xs text-muted-foreground">{stats.currentSteps.toLocaleString()} steps today</div>
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
                      <div className="text-xs text-muted-foreground">{stats.totalSteps.toLocaleString()} steps this month</div>
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
