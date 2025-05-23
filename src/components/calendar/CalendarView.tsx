
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { EventCard } from "@/components/calendar/EventCard";
import { CreateEventDialog } from "@/components/calendar/CreateEventDialog";
import { CalendarEvent, groupEventsByDate } from "@/data/calendarEvents";

interface CalendarViewProps {
  events: CalendarEvent[];
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
}

export function CalendarView({ events, date, setDate }: CalendarViewProps) {
  const groupedEvents = groupEventsByDate(events);
  const selectedDateEvents = date ? groupedEvents[date.toDateString()] || [] : [];
  
  // Get dates that have events
  const eventDates = Object.keys(groupedEvents).map(dateStr => new Date(dateStr));
  
  // Handle month navigation
  const goToPreviousMonth = () => {
    if (!date) return;
    const newDate = new Date(date);
    newDate.setMonth(date.getMonth() - 1);
    setDate(newDate);
  };
  
  const goToNextMonth = () => {
    if (!date) return;
    const newDate = new Date(date);
    newDate.setMonth(date.getMonth() + 1);
    setDate(newDate);
  };
  
  return (
    <>
      <div className="bg-white rounded-xl girls-shadow p-4 mb-6 animate-enter">
        <div className="flex items-center justify-between mb-4">
          <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="font-medium">
            {date?.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          <Button variant="outline" size="icon" onClick={goToNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md"
          modifiers={{
            event: eventDates,
          }}
          modifiersStyles={{
            event: {
              fontWeight: "bold",
            }
          }}
          components={{
            DayContent: ({ date: dayDate }) => {
              const dateStr = dayDate.toDateString();
              const hasEvent = groupedEvents[dateStr];
              
              return (
                <div className="relative">
                  <div>{dayDate.getDate()}</div>
                  {hasEvent && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 -mb-1">
                      <div className="w-1 h-1 bg-primary rounded-full" />
                    </div>
                  )}
                </div>
              );
            },
          }}
        />
      </div>
      
      <div className="animate-enter" style={{ animationDelay: "100ms" }}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-lg">
            {date?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </h2>
          <CreateEventDialog selectedDate={date} />
        </div>
        
        {selectedDateEvents.length > 0 ? (
          <div className="space-y-4">
            {selectedDateEvents.map(event => (
              <EventCard key={event.id} {...event} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl girls-shadow p-8 text-center">
            <p className="text-muted-foreground">No events scheduled for this day</p>
          </div>
        )}
      </div>
    </>
  );
}
