
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EventCard } from "@/components/calendar/EventCard";
import { Plus } from "lucide-react";
import { CalendarEvent, groupEventsByDate } from "@/data/calendarEvents";

interface ListViewProps {
  events: CalendarEvent[];
}

export function ListView({ events }: ListViewProps) {
  const groupedEvents = groupEventsByDate(events);
  
  return (
    <div className="space-y-6 animate-enter">
      {Object.entries(groupedEvents)
        .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
        .map(([dateStr, events]) => {
          const eventDate = new Date(dateStr);
          const isToday = new Date().toDateString() === dateStr;
          const isPast = eventDate < new Date(new Date().setHours(0, 0, 0, 0));
          
          return (
            <div key={dateStr}>
              <div className="flex items-center gap-2 mb-3">
                <h2 className="font-semibold">
                  {eventDate.toLocaleDateString('en-US', { 
                    weekday: 'short',
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </h2>
                {isToday && (
                  <Badge variant="outline" className="bg-primary text-white">Today</Badge>
                )}
                {isPast && !isToday && (
                  <Badge variant="outline" className="bg-gray-100 text-muted-foreground">Past</Badge>
                )}
              </div>
              
              <div className="space-y-4">
                {events.map(event => (
                  <EventCard key={event.id} {...event} />
                ))}
              </div>
            </div>
          );
        })}
        
      <div className="flex justify-center pt-4 pb-8">
        <Button variant="outline" size="sm" className="text-primary">
          <Plus className="h-3.5 w-3.5 mr-1" />
          <span>Add New Event</span>
        </Button>
      </div>
    </div>
  );
}
