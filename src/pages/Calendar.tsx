
import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProfileProtectedRoute } from "@/components/auth/ProfileProtectedRoute";
import { CalendarView } from "@/components/calendar/CalendarView";
import { ListView } from "@/components/calendar/ListView";
import { ViewToggle } from "@/components/calendar/ViewToggle";
import { CalendarEvent } from "@/data/calendarEvents";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/hooks/use-toast";

export default function Calendar() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, [user]);

  const fetchEvents = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const { data: eventsData, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', user.id)
        .order('event_date', { ascending: true });

      if (error) throw error;

      // Transform data to match CalendarEvent interface
      const transformedEvents: CalendarEvent[] = eventsData.map(event => ({
        id: event.id,
        title: event.title,
        description: event.description || undefined,
        date: new Date(event.event_date),
        startTime: event.start_time,
        endTime: event.end_time || undefined,
        location: event.location || undefined,
        isAttending: event.is_attending || false
      }));

      setEvents(transformedEvents);
    } catch (error: any) {
      console.error("Error fetching events:", error);
      toast({
        title: "Error",
        description: "Failed to load events",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEventCreated = () => {
    fetchEvents(); // Refresh events when a new one is created
  };

  if (loading) {
    return (
      <ProfileProtectedRoute>
        <AppLayout>
          <div className="container max-w-4xl mx-auto px-4 py-6">
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading calendar...</p>
            </div>
          </div>
        </AppLayout>
      </ProfileProtectedRoute>
    );
  }

  return (
    <ProfileProtectedRoute>
      <AppLayout>
        <div className="container max-w-4xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Calendar</h1>
            <ViewToggle view={view} onViewChange={setView} />
          </div>

          {view === "calendar" ? (
            <CalendarView 
              events={events} 
              date={date} 
              setDate={setDate}
              onEventCreated={handleEventCreated}
            />
          ) : (
            <ListView events={events} />
          )}
        </div>
      </AppLayout>
    </ProfileProtectedRoute>
  );
}
