import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { CalendarIcon, Plus, Trophy } from "lucide-react";

interface ChallengeFormData {
  title: string;
  description: string;
  goal: number;
  type: string;
  startDate: Date;
  endDate: Date;
  visibility: string;
}

export function CreateChallenge() {
  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<ChallengeFormData>();
  
  const onSubmit = (data: ChallengeFormData) => {
    if (!startDate || !endDate) {
      toast({
        description: "Please select both start and end dates",
        variant: "destructive",
      });
      return;
    }
    
    // Submit challenge data
    console.log({
      ...data,
      startDate,
      endDate,
    });
    
    toast({
      title: "Challenge Created!",
      description: "Your new challenge has been created successfully.",
    });
    
    // Reset form and close dialog
    reset();
    setStartDate(undefined);
    setEndDate(undefined);
    setOpen(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Create Challenge
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Trophy className="mr-2 h-5 w-5 text-primary" />
            Create New Challenge
          </DialogTitle>
          <DialogDescription>
            Set up a new challenge to compete with friends and track your progress.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Challenge Title</Label>
            <Input 
              id="title"
              placeholder="e.g., Summer Step Challenge"
              {...register("title", { required: "Title is required" })}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description"
              placeholder="Describe your challenge..."
              {...register("description")}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="goal">Goal</Label>
              <Input 
                id="goal"
                type="number"
                placeholder="e.g., 10000"
                {...register("goal", { 
                  required: "Goal is required",
                  min: { value: 1000, message: "Minimum goal is 1,000" }
                })}
              />
              {errors.goal && (
                <p className="text-xs text-destructive">{errors.goal.message}</p>
              )}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="type">Type</Label>
              <Select defaultValue="steps" onValueChange={(value) => register("type").onChange({ target: { value } })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Challenge Type</SelectLabel>
                    <SelectItem value="steps">Steps</SelectItem>
                    <SelectItem value="distance">Distance</SelectItem>
                    <SelectItem value="active_minutes">Active Minutes</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="grid gap-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    disabled={(date) => 
                      (startDate ? date < startDate : false) || 
                      date < new Date(new Date().setHours(0, 0, 0, 0))
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="visibility">Who can see this challenge?</Label>
            <Select defaultValue="friends" onValueChange={(value) => register("visibility").onChange({ target: { value } })}>
              <SelectTrigger>
                <SelectValue placeholder="Select visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Visibility</SelectLabel>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="friends">Friends Only</SelectItem>
                  <SelectItem value="private">Private (Invite Only)</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="pt-4">
            <Button type="submit" className="w-full">Create Challenge</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
