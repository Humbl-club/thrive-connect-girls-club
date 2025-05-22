
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";

interface ViewToggleProps {
  view: "calendar" | "list";
  setView: (view: "calendar" | "list") => void;
}

export function ViewToggle({ view, setView }: ViewToggleProps) {
  return (
    <div className="space-x-2">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setView("calendar")} 
        className={view === "calendar" ? "bg-muted" : ""}
      >
        <CalendarIcon className="h-4 w-4" />
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setView("list")} 
        className={view === "list" ? "bg-muted" : ""}
      >
        <div className="flex flex-col items-center justify-center h-4 w-4 space-y-0.5">
          <div className="w-3 h-0.5 bg-current" />
          <div className="w-3 h-0.5 bg-current" />
          <div className="w-3 h-0.5 bg-current" />
        </div>
      </Button>
    </div>
  );
}
