
import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useSettings } from "@/hooks/use-settings";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import {
  Moon,
  Sun,
  Save,
  Bell,
  EyeOff,
  Users,
  Globe,
  PaintBucket,
} from "lucide-react";

const Settings = () => {
  const { settings, updateSettings, isLoading } = useSettings();
  const { theme, toggleTheme } = useTheme();
  
  const [stepGoal, setStepGoal] = useState(settings.dailyStepGoal);
  const [weeklyStepGoal, setWeeklyStepGoal] = useState(settings.weeklyStepGoal);
  const [primaryColor, setPrimaryColor] = useState(settings.themePrimaryColor);
  const [secondaryColor, setSecondaryColor] = useState(settings.themeSecondaryColor);
  
  const saveSettings = async () => {
    try {
      await updateSettings({
        dailyStepGoal: stepGoal,
        weeklyStepGoal: weeklyStepGoal,
        themePrimaryColor: primaryColor,
        themeSecondaryColor: secondaryColor,
      });
      toast({
        title: "Settings saved",
        description: "Your preferences have been updated",
      });
    } catch (error) {
      toast({
        title: "Failed to save settings",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  const updatePrivacyLevel = async (value: "public" | "friends" | "private") => {
    try {
      await updateSettings({ privacyLevel: value });
      toast({
        description: "Privacy settings updated",
      });
    } catch (error) {
      toast({
        description: "Failed to update privacy settings",
        variant: "destructive",
      });
    }
  };

  const toggleNotifications = async () => {
    try {
      await updateSettings({ notificationsEnabled: !settings.notificationsEnabled });
      toast({
        description: settings.notificationsEnabled 
          ? "Notifications disabled" 
          : "Notifications enabled",
      });
    } catch (error) {
      toast({
        description: "Failed to update notification settings",
        variant: "destructive",
      });
    }
  };

  const updateUnitSystem = async (value: "imperial" | "metric") => {
    try {
      await updateSettings({ unitSystem: value });
      toast({
        description: `Unit system changed to ${value}`,
      });
    } catch (error) {
      toast({
        description: "Failed to update unit system",
        variant: "destructive",
      });
    }
  };

  return (
    <AppLayout>
      <div className="container px-4 py-6 pb-20 max-w-md mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Settings</h1>
          <Button variant="outline" size="icon" className="rounded-full" onClick={toggleTheme}>
            {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>
        </div>

        <Tabs defaultValue="goals" className="mb-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
          </TabsList>

          <TabsContent value="goals" className="pt-4 space-y-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Daily Step Goal</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">{stepGoal.toLocaleString()} steps</span>
                    <span className="text-sm text-muted-foreground">
                      {stepGoal < 5000 ? "Easy" : stepGoal < 10000 ? "Moderate" : "Challenging"}
                    </span>
                  </div>
                  <Slider
                    value={[stepGoal]}
                    min={1000}
                    max={20000}
                    step={1000}
                    onValueChange={(vals) => setStepGoal(vals[0])}
                  />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Weekly Step Goal</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">{weeklyStepGoal.toLocaleString()} steps</span>
                  </div>
                  <Slider
                    value={[weeklyStepGoal]}
                    min={10000}
                    max={140000}
                    step={5000}
                    onValueChange={(vals) => setWeeklyStepGoal(vals[0])}
                  />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Unit System</h3>
                <Select
                  value={settings.unitSystem}
                  onValueChange={(value: "imperial" | "metric") => updateUnitSystem(value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select unit system" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="imperial">Imperial (miles, lbs)</SelectItem>
                    <SelectItem value="metric">Metric (km, kg)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button className="w-full" onClick={saveSettings}>
                <Save className="mr-2 h-4 w-4" /> Save Goal Settings
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="appearance" className="pt-4 space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Theme</h3>
              <div className="flex items-center justify-between">
                <span>Dark mode</span>
                <Switch 
                  checked={theme === "dark"} 
                  onCheckedChange={toggleTheme} 
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Primary Color</h3>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input 
                    type="color" 
                    value={primaryColor} 
                    onChange={(e) => setPrimaryColor(e.target.value)} 
                    className="h-12 w-full cursor-pointer"
                  />
                </div>
                <Input 
                  type="text" 
                  value={primaryColor} 
                  onChange={(e) => setPrimaryColor(e.target.value)} 
                  className="w-24"
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Secondary Color</h3>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input 
                    type="color" 
                    value={secondaryColor} 
                    onChange={(e) => setSecondaryColor(e.target.value)} 
                    className="h-12 w-full cursor-pointer"
                  />
                </div>
                <Input 
                  type="text" 
                  value={secondaryColor} 
                  onChange={(e) => setSecondaryColor(e.target.value)} 
                  className="w-24"
                />
              </div>
            </div>

            <Button className="w-full" onClick={saveSettings}>
              <PaintBucket className="mr-2 h-4 w-4" /> Apply Theme Changes
            </Button>
          </TabsContent>

          <TabsContent value="privacy" className="pt-4 space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Activity Privacy</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <span>Public</span>
                  </div>
                  <Switch 
                    checked={settings.privacyLevel === "public"} 
                    onCheckedChange={() => updatePrivacyLevel("public")} 
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>Friends Only</span>
                  </div>
                  <Switch 
                    checked={settings.privacyLevel === "friends"} 
                    onCheckedChange={() => updatePrivacyLevel("friends")} 
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <EyeOff className="h-4 w-4" />
                    <span>Private</span>
                  </div>
                  <Switch 
                    checked={settings.privacyLevel === "private"} 
                    onCheckedChange={() => updatePrivacyLevel("private")} 
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Notifications</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  <span>Enable Notifications</span>
                </div>
                <Switch 
                  checked={settings.notificationsEnabled} 
                  onCheckedChange={toggleNotifications} 
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Settings;
