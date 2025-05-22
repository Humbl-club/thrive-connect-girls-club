
import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { CalendarView } from "@/components/calendar/CalendarView";
import { ListView } from "@/components/calendar/ListView";
import { ViewToggle } from "@/components/calendar/ViewToggle";
import { mockEvents } from "@/data/calendarEvents";

const CalendarPage = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [view, setView] = useState<"calendar" | "list">("calendar");
  
  return (
    <AppLayout>
      <div className="container px-4 py-6 pb-20 max-w-md mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Events</h1>
          <ViewToggle view={view} setView={setView} />
        </div>
        
        {view === "calendar" ? (
          <CalendarView 
            events={mockEvents} 
            date={date} 
            setDate={setDate} 
          />
        ) : (
          <ListView events={mockEvents} />
        )}
      </div>
    </AppLayout>
  );
};

export default CalendarPage;
