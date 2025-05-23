
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Calendar, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";

export function CreateYearRoundChallenge() {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [goal, setGoal] = useState("");
  const [challengeType, setChallengeType] = useState<"steps" | "distance" | "active_minutes">("steps");
  const [winnerFrequency, setWinnerFrequency] = useState<"weekly" | "monthly">("weekly");
  const [visibility, setVisibility] = useState<"public" | "friends" | "private">("public");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You need to be logged in to create challenges",
        variant: "destructive"
      });
      return;
    }

    if (!title.trim() || !goal) {
      toast({
        title: "Missing information",
        description: "Please provide a title and goal",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Create year-round challenge (start now, end next year)
      const startDate = new Date();
      const endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + 1);
      
      const { error } = await supabase
        .from('challenges')
        .insert({
          title: title.trim(),
          description: description.trim(),
          goal: parseInt(goal),
          type: challengeType,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          visibility: visibility,
          created_by: user.id,
          challenge_meta: {
            is_year_round: true,
            winner_frequency: winnerFrequency,
            max_wins_per_user: 2
          }
        });

      if (error) throw error;
      
      toast({
        title: "Challenge created",
        description: `Your year-round challenge with ${winnerFrequency} winners has been created`
      });
      
      // Reset form
      setTitle("");
      setDescription("");
      setGoal("");
      setChallengeType("steps");
      setWinnerFrequency("weekly");
      setVisibility("public");
      setIsOpen(false);
      
    } catch (error: any) {
      console.error("Error creating year-round challenge:", error);
      toast({
        title: "Error",
        description: `Failed to create challenge: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <Trophy className="h-4 w-4" />
          Create Year-Round Challenge
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle>Create Year-Round Challenge</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Challenge Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter challenge title"
              disabled={isSubmitting}
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Challenge description (optional)"
              disabled={isSubmitting}
              rows={3}
            />
          </div>
          
          <div>
            <Label htmlFor="challengeType">Challenge Type</Label>
            <Select value={challengeType} onValueChange={(value: "steps" | "distance" | "active_minutes") => setChallengeType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select challenge type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="steps">Steps</SelectItem>
                <SelectItem value="distance">Distance (km)</SelectItem>
                <SelectItem value="active_minutes">Active Minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="goal">Goal Amount *</Label>
            <Input
              id="goal"
              type="number"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="Enter goal (e.g., 10000 for steps)"
              disabled={isSubmitting}
            />
          </div>
          
          <div>
            <Label htmlFor="visibility">Visibility</Label>
            <Select value={visibility} onValueChange={(value: "public" | "friends" | "private") => setVisibility(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="friends">Friends Only</SelectItem>
                <SelectItem value="private">Private (Invite Only)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="winnerFrequency">Winner Frequency</Label>
            <Select value={winnerFrequency} onValueChange={(value: "weekly" | "monthly") => setWinnerFrequency(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select winner frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly Winners</SelectItem>
                <SelectItem value="monthly">Monthly Winners</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> This is a year-round challenge with {winnerFrequency} winners. 
              Each participant can only win twice before being excluded from future wins.
            </p>
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !title.trim() || !goal}
              className="flex-1"
            >
              {isSubmitting ? "Creating..." : "Create Challenge"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
