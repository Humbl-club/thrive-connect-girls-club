
import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { EventCard } from "@/components/calendar/EventCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarIcon, ChevronLeft, ChevronRight, Plus } from "lucide-react";

// Mock data
const mockEvents = [
  {
    id: "1",
    title: "Morning Run & Coffee",
    description: "Join us for a light 5K run followed by coffee and conversation.",
    date: new Date(2025, 4, 25, 8, 0),
    startTime: "8:00 AM",
    endTime: "10:00 AM",
    location: "Central Park, Main Entrance",
    isAttending: true
  },
  {
    id: "2",
    title: "Weekend Yoga Session",
    description: "Outdoor yoga session for all skill levels. Bring your own mat!",
    date: new Date(2025, 4, 27, 9, 0),
    startTime: "9:00 AM",
    endTime: "10:30 AM",
    location: "Riverside Park, Lawn Area",
  },
  {
    id: "3",
    title: "Monthly Club Meeting",
    description: "Discuss upcoming challenges and events. All members welcome!",
    date: new Date(2025, 5, 3, 18, 0),
    startTime: "6:00 PM",
    endTime: "7:30 PM",
    location: "Community Center, Room 204",
  },
  {
    id: "4",
    title: "Trail Hike Adventure",
    description: "Moderate difficulty hike with beautiful views. Water and snacks recommended.",
    date: new Date(2025, 5, 10, 9, 0),
    startTime: "9:00 AM",
    endTime: "12:00 PM",
    location: "Trailhead Mountain Park",
  }
];

// Helper function to group events by date
const groupEventsByDate = (events: typeof mockEvents) => {
  const grouped = events.reduce((acc, event) => {
    const dateStr = event.date.toDateString();
    if (!acc[dateStr]) {
      acc[dateStr] = [];
    }
    acc[dateStr].push(event);
    return acc;
  }, {} as Record<string, typeof mockEvents>);
  
  return grouped;
};

const CalendarPage = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [view, setView] = useState<"calendar" | "list">("calendar");
  
  const groupedEvents = groupEventsByDate(mockEvents);
  const selectedDateEvents = date ? groupedEvents[date.toDateString()] || [] : [];
  
  // Get dates that have events
  const eventDates = Object.keys(groupedEvents).map(dateStr => new Date(dateStr));
  
  return (
    <AppLayout>
      <div className="container px-4 py-6 pb-20 max-w-md mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Events</h1>
          <div className="space-x-2">
            <Button variant="outline" size="sm" onClick={() => setView("calendar")} className={view === "calendar" ? "bg-muted" : ""}>
              <CalendarIcon className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setView("list")} className={view === "list" ? "bg-muted" : ""}>
              <div className="flex flex-col items-center justify-center h-4 w-4 space-y-0.5">
                <div className="w-3 h-0.5 bg-current" />
                <div className="w-3 h-0.5 bg-current" />
                <div className="w-3 h-0.5 bg-current" />
              </div>
            </Button>
          </div>
        </div>
        
        {view === "calendar" ? (
          <>
            <div className="bg-white rounded-xl girls-shadow p-4 mb-6 animate-enter">
              <div className="flex items-center justify-between mb-4">
                <Button variant="outline" size="icon" onClick={() => setDate(prev => {
                  if (!prev) return new Date();
                  const newDate = new Date(prev);
                  newDate.setMonth(prev.getMonth() - 1);
                  return newDate;
                })}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h2 className="font-medium">
                  {date?.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h2>
                <Button variant="outline" size="icon" onClick={() => setDate(prev => {
                  if (!prev) return new Date();
                  const newDate = new Date(prev);
                  newDate.setMonth(prev.getMonth() + 1);
                  return newDate;
                })}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              
              <CalendarComponent
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
                <Button size="sm" className="flex items-center gap-1">
                  <Plus className="h-3.5 w-3.5" />
                  <span className="text-xs">Add Event</span>
                </Button>
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
        ) : (
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
        )}
      </div>
    </AppLayout>
  );
};

export default CalendarPage;
