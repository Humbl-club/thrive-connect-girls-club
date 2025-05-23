
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Footprints, MinusCircle, PlusCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface StepInputDialogProps {
  initialSteps?: number;
  onSave: (steps: number) => void;
  triggerLabel?: string;
  dialogTitle?: string;
  dialogDescription?: string;
}

export function StepInputDialog({
  initialSteps = 0,
  onSave,
  triggerLabel = "Enter Steps",
  dialogTitle = "Enter Steps",
  dialogDescription = "Update your daily step count manually",
}: StepInputDialogProps) {
  const [open, setOpen] = useState(false);
  const [steps, setSteps] = useState<number>(initialSteps);
  const [error, setError] = useState<string | null>(null);
  
  const handleStepChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    if (isNaN(value)) {
      setSteps(0);
    } else if (value < 0) {
      setSteps(0);
      setError("Step count cannot be negative");
    } else if (value > 100000) {
      setSteps(100000);
      setError("Maximum step count is 100,000");
    } else {
      setSteps(value);
      setError(null);
    }
  };
  
  const handleSave = () => {
    onSave(steps);
    setOpen(false);
  };
  
  const increment = () => {
    setSteps(prev => Math.min(prev + 1000, 100000));
    setError(null);
  };
  
  const decrement = () => {
    setSteps(prev => Math.max(prev - 1000, 0));
    setError(null);
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex gap-2">
          <Footprints className="h-4 w-4" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>
        <div className="my-6">
          <div className="flex items-center space-x-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={decrement}
            >
              <MinusCircle className="h-4 w-4" />
            </Button>
            <Input
              type="number"
              id="steps"
              value={steps}
              onChange={handleStepChange}
              className="text-center"
              min={0}
              max={100000}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={increment}
            >
              <PlusCircle className="h-4 w-4" />
            </Button>
          </div>
          {error && (
            <p className="text-sm text-red-500 mt-2">{error}</p>
          )}
          <div className="flex justify-center mt-4">
            <p className="text-sm text-muted-foreground">
              Enter your total steps for today
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleSave} disabled={!!error}>
            Save Steps
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
