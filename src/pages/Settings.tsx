
import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, User, Key, Moon, Sun, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { AppLayout } from "@/components/layout/AppLayout";
import { useSettings } from "@/hooks/use-settings";
import { FitnessTrackingSettings } from "@/components/fitness/FitnessTrackingSettings";

const Settings = () => {
  const { settings, updateSettings } = useSettings();
  const [name, setName] = useState("Ashley Simpson");
  const [email, setEmail] = useState("ashleysimpson@example.com");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Profile updated!");
  };

  return (
    <AppLayout>
      <div className="container px-4 py-6 pb-20 max-w-md mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>

        <div className="space-y-6">
          {/* Profile Section */}
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Manage your profile information</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button type="submit">Update Profile</Button>
              </form>
            </CardContent>
          </Card>

          {/* Fitness Tracking Section */}
          <Card>
            <CardHeader>
              <CardTitle>Fitness Tracking</CardTitle>
              <CardDescription>
                Connect your devices and apps for automatic step tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FitnessTrackingSettings />
            </CardContent>
          </Card>

          {/* Daily Goals Section */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Goals</CardTitle>
              <CardDescription>Set your daily fitness goals</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="steps">Daily Step Goal</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    id="steps"
                    defaultValue={[settings.dailyStepGoal]}
                    max={20000}
                    step={1000}
                    onValueChange={(value) => updateSettings({ dailyStepGoal: value[0] })}
                  />
                  <Input
                    type="number"
                    value={settings.dailyStepGoal}
                    className="w-20"
                    onChange={(e) => updateSettings({ dailyStepGoal: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="weekly">Weekly Step Goal</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    id="weekly"
                    defaultValue={[settings.weeklyStepGoal]}
                    max={150000}
                    step={5000}
                    onValueChange={(value) => updateSettings({ weeklyStepGoal: value[0] })}
                  />
                  <Input
                    type="number"
                    value={settings.weeklyStepGoal}
                    className="w-24"
                    onChange={(e) => updateSettings({ weeklyStepGoal: parseInt(e.target.value) })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preferences Section */}
          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>Customize your app preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <Label htmlFor="notifications">Notifications</Label>
                <Switch
                  id="notifications"
                  checked={settings.notificationsEnabled}
                  onCheckedChange={(checked) => updateSettings({ notificationsEnabled: checked })}
                />
              </div>
              <div>
                <Label htmlFor="units">Unit System</Label>
                <Select 
                  defaultValue={settings.unitSystem} 
                  onValueChange={(value: "imperial" | "metric") => updateSettings({ unitSystem: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit system" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="imperial">Imperial (miles, pounds)</SelectItem>
                    <SelectItem value="metric">Metric (kilometers, kilograms)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="privacy">Privacy Level</Label>
                <Select 
                  defaultValue={settings.privacyLevel} 
                  onValueChange={(value: "public" | "friends" | "private") => updateSettings({ privacyLevel: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select privacy level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="friends">Friends Only</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="destructive">
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Settings;
