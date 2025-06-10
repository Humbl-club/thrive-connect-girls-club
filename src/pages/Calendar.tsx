
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
  const { user, isAdmin } = useAuth(); // Use isAdmin hook
  const { toast } = useToast();
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { data: eventsData, error } = await supabase
        .from('calendar_events')
        .select('*')
        .order('event_date', { ascending: true });

      if (error) throw error;

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
      toast({ title: "Error", description: "Failed to load events", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <ProfileProtectedRoute>
      <AppLayout>
        <div className="container max-w-4xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Calendar</h1>
            <div className="flex items-center gap-4">
              {isAdmin && view === 'calendar' && (
                <CalendarView events={[]} date={date} setDate={setDate} onEventCreated={fetchEvents} />
              )}
              <ViewToggle view={view} setView={setView} />
            </div>
          </div>
          
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading calendar...</div>
          ) : view === "calendar" ? (
            <CalendarView events={events} date={date} setDate={setDate} onEventCreated={isAdmin ? fetchEvents : undefined} />
          ) : (
            <ListView events={events} />
          )}
        </div>
      </AppLayout>
    </ProfileProtectedRoute>
  );
}
