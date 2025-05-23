
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { StepCounter } from "@/components/ui/step-counter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Award, Settings, Camera, Instagram, MapPin, Upload } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Profile = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
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

  useEffect(() => {
    if (profile?.avatar_url) {
      setAvatarUrl(profile.avatar_url);
    }
  }, [profile]);

  useEffect(() => {
    const fetchActivityData = async () => {
      if (!user) return;
      
      try {
        const today = new Date().toISOString().split('T')[0];
        
        const { data: todayData } = await supabase
          .from('activity_data')
          .select('steps')
          .eq('user_id', user.id)
          .eq('date', today)
          .maybeSingle();
        
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
        
        const firstDayOfMonth = new Date();
        firstDayOfMonth.setDate(1);
        const monthStart = firstDayOfMonth.toISOString().split('T')[0];
        
        const { data: monthData } = await supabase
          .from('activity_data')
          .select('steps')
          .eq('user_id', user.id)
          .gte('date', monthStart)
          .lte('date', today);

        const goalDays = monthData?.filter(day => day.steps && day.steps >= 10000).length || 0;
        const totalSteps = monthData?.reduce((sum, day) => sum + (day.steps || 0), 0) || 0;
        const miles = (totalSteps / 2000).toFixed(1);
        
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

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0 || !user) {
        return;
      }
      
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${fileExt}`;
      
      setUploadingAvatar(true);
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });
        
      if (uploadError) throw uploadError;
      
      const { data: publicURL } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
        
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicURL.publicUrl })
        .eq('id', user.id);
        
      if (updateError) throw updateError;
      
      setAvatarUrl(publicURL.publicUrl);
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
      <div className="container max-w-4xl mx-auto px-4 py-6">
        {/* Header Section */}
        <div className="relative mb-8">
          <div className="h-40 bg-girls-gradient rounded-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-girls-purple to-girls-pink opacity-80" />
            
            <div className="absolute top-4 right-4 flex gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="rounded-full bg-white/90 backdrop-blur-sm"
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
                    <div className="flex flex-col items-center gap-2">
                      <Input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleAvatarUpload} 
                        disabled={uploadingAvatar}
                        className="hidden"
                        id="avatar-upload"
                      />
                      <label htmlFor="avatar-upload" className="cursor-pointer">
                        <Button 
                          type="button" 
                          variant="outline"
                          disabled={uploadingAvatar}
                          asChild
                        >
                          <span className="flex items-center gap-2">
                            <Upload className="h-4 w-4" />
                            {uploadingAvatar ? "Uploading..." : "Upload Photo"}
                          </span>
                        </Button>
                      </label>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-full bg-white/90 backdrop-blur-sm"
                asChild
              >
                <Link to="/settings">
                  <Settings className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
          
          <div className="absolute -bottom-16 left-6">
            <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
              {avatarUrl ? (
                <AvatarImage src={avatarUrl} alt={fullName} />
              ) : (
                <AvatarFallback className="text-4xl">{fullName[0].toUpperCase()}</AvatarFallback>
              )}
            </Avatar>
          </div>
        </div>
        
        {/* Profile Info */}
        <div className="mt-20 mb-6">
          <h1 className="text-3xl font-bold">{fullName}</h1>
          <p className="text-muted-foreground text-lg">@{username}</p>
          <p className="text-muted-foreground mt-2">{bioText}</p>
          
          {(location || instagramHandle) && (
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
              {location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{location}</span>
                </div>
              )}
              
              {instagramHandle && (
                <div className="flex items-center gap-1">
                  <Instagram className="h-4 w-4" />
                  <span>{instagramHandle}</span>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Achievements */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Achievements</h2>
          <div className="flex flex-wrap gap-3">
            {stats.totalSteps >= 10000 && (
              <Badge variant="outline" className="bg-white py-2 px-4 girls-shadow">
                <Award className="h-4 w-4 mr-2 text-primary" />
                <span>10K Steps Champion</span>
              </Badge>
            )}
            {stats.goalDays >= 7 && (
              <Badge variant="outline" className="bg-white py-2 px-4 girls-shadow">
                <Award className="h-4 w-4 mr-2 text-primary" />
                <span>Week Streak</span>
              </Badge>
            )}
          </div>
        </div>
        
        <Tabs defaultValue="progress" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>
          
          <TabsContent value="progress" className="mt-6">
            <div className="grid gap-6">
              {/* Daily Progress */}
              <Card>
                <CardHeader>
                  <CardTitle>Today's Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6">
                    <StepCounter currentSteps={stats.currentSteps} goalSteps={stats.goalSteps} size="lg" />
                    <div className="flex-1">
                      <div className="text-2xl font-bold">{stats.currentSteps.toLocaleString()}</div>
                      <div className="text-muted-foreground">of {stats.goalSteps.toLocaleString()} steps</div>
                      <div className="text-sm text-muted-foreground">
                        {Math.round((stats.currentSteps / stats.goalSteps) * 100)}% of daily goal
                      </div>
                      <div className="h-2 w-full bg-gray-100 rounded-full mt-2 overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all duration-500" 
                          style={{ width: `${Math.min(100, (stats.currentSteps / stats.goalSteps) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Weekly Progress */}
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-end h-32">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => {
                      const percentage = stats.weeklyData[index];
                      return (
                        <div key={index} className="flex flex-col items-center">
                          <div className="h-20 w-8 bg-gray-100 rounded-full overflow-hidden relative">
                            <div 
                              className="absolute bottom-0 w-full bg-primary rounded-full transition-all duration-500"
                              style={{ height: `${percentage}%` }}
                            />
                          </div>
                          <div className="mt-2 text-xs font-medium">{day}</div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
              
              {/* Monthly Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">{stats.totalSteps.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">Total Steps</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">{stats.miles}</div>
                      <div className="text-sm text-muted-foreground">Miles</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">{stats.goalDays}</div>
                      <div className="text-sm text-muted-foreground">Goal Days</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="activity" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">
                  No recent activity to display. Start tracking your steps to see your progress here!
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Profile;
