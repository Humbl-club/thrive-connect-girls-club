
// Event type definition
export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: Date;
  startTime: string;
  endTime?: string;
  location?: string;
  isAttending?: boolean;
}

// Mock data
export const mockEvents: CalendarEvent[] = [
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
export const groupEventsByDate = (events: CalendarEvent[]) => {
  const grouped = events.reduce((acc, event) => {
    const dateStr = event.date.toDateString();
    if (!acc[dateStr]) {
      acc[dateStr] = [];
    }
    acc[dateStr].push(event);
    return acc;
  }, {} as Record<string, CalendarEvent[]>);
  
  return grouped;
};
