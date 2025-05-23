
import { supabase } from "@/integrations/supabase/client";

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

// Fetch real events from Supabase
export const fetchEvents = async (): Promise<CalendarEvent[]> => {
  try {
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .order('event_date', { ascending: true });

    if (error) throw error;

    return data?.map(event => ({
      id: event.id,
      title: event.title,
      description: event.description || '',
      date: new Date(event.event_date),
      startTime: event.start_time,
      endTime: event.end_time || undefined,
      location: event.location || undefined,
      isAttending: event.is_attending || false,
    })) || [];
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
};

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
