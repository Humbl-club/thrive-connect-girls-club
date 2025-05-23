
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Filter, SlidersHorizontal } from "lucide-react";

interface ChallengeFiltersProps {
  onFilterChange: (filters: ChallengeFilters) => void;
}

export interface ChallengeFilters {
  status: "all" | "upcoming" | "active" | "completed";
  type: "all" | "steps" | "distance" | "active_minutes";
  visibility: "all" | "public" | "friends" | "private";
  participation: "all" | "joined" | "not_joined";
}

export function ChallengeFilters({ onFilterChange }: ChallengeFiltersProps) {
  const [filters, setFilters] = useState<ChallengeFilters>({
    status: "all",
    type: "all",
    visibility: "all",
    participation: "all",
  });

  const updateFilter = <K extends keyof ChallengeFilters>(
    key: K,
    value: ChallengeFilters[K]
  ) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => value !== "all").length;
  };

  const clearFilters = () => {
    const clearedFilters: ChallengeFilters = {
      status: "all",
      type: "all",
      visibility: "all",
      participation: "all",
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className="flex items-center gap-2 mb-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="relative">
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Filter Challenges</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
              Status
            </DropdownMenuLabel>
            {(["all", "upcoming", "active", "completed"] as const).map((status) => (
              <DropdownMenuItem
                key={status}
                onSelect={() => updateFilter("status", status)}
                className={filters.status === status ? "bg-accent" : ""}
              >
                {status === "all" ? "All Statuses" : status.charAt(0).toUpperCase() + status.slice(1)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>

          <DropdownMenuSeparator />
          
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
              Type
            </DropdownMenuLabel>
            {(["all", "steps", "distance", "active_minutes"] as const).map((type) => (
              <DropdownMenuItem
                key={type}
                onSelect={() => updateFilter("type", type)}
                className={filters.type === type ? "bg-accent" : ""}
              >
                {type === "all" ? "All Types" : type.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>

          <DropdownMenuSeparator />
          
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
              Visibility
            </DropdownMenuLabel>
            {(["all", "public", "friends", "private"] as const).map((visibility) => (
              <DropdownMenuItem
                key={visibility}
                onSelect={() => updateFilter("visibility", visibility)}
                className={filters.visibility === visibility ? "bg-accent" : ""}
              >
                {visibility === "all" ? "All Visibility" : visibility.charAt(0).toUpperCase() + visibility.slice(1)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>

          <DropdownMenuSeparator />
          
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
              Participation
            </DropdownMenuLabel>
            {(["all", "joined", "not_joined"] as const).map((participation) => (
              <DropdownMenuItem
                key={participation}
                onSelect={() => updateFilter("participation", participation)}
                className={filters.participation === participation ? "bg-accent" : ""}
              >
                {participation === "all" ? "All Challenges" : 
                 participation === "joined" ? "Joined" : "Not Joined"}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>

          {activeFiltersCount > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={clearFilters} className="text-destructive">
                Clear All Filters
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-1">
          {Object.entries(filters).map(([key, value]) => {
            if (value === "all") return null;
            return (
              <Badge key={key} variant="secondary" className="text-xs">
                {value.replace("_", " ")}
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}
