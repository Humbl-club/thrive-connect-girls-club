
import { Calendar, Clock, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

export interface EventProps {
  id: string;
  title: string;
  description?: string;
  date: Date;
  startTime: string;
  endTime?: string;
  location?: string;
  isAttending?: boolean;
  className?: string;
  onAttendanceChange?: (eventId: string, attending: boolean) => void;
}

export function EventCard({
  id,
  title,
  description,
  date,
  startTime,
  endTime,
  location,
  isAttending = false,
  className,
  onAttendanceChange,
}: EventProps) {
  const { toast } = useToast();
  const [attending, setAttending] = useState(isAttending);
  const [loading, setLoading] = useState(false);

  const handleAttendToggle = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('calendar_events')
        .update({ is_attending: !attending })
        .eq('id', id);

      if (error) throw error;

      const newAttendingState = !attending;
      setAttending(newAttendingState);
      onAttendanceChange?.(id, newAttendingState);
      
      toast({
        title: newAttendingState ? "You're attending!" : "Attendance removed",
        description: newAttendingState 
          ? `You're now attending ${title}` 
          : `You're no longer attending ${title}`,
      });
    } catch (error) {
      console.error('Error updating attendance:', error);
      toast({
        title: "Error",
        description: "Failed to update attendance",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCalendar = () => {
    const startDate = new Date(date);
    const [hours, minutes] = startTime.split(':');
    startDate.setHours(parseInt(hours), parseInt(minutes));
    
    const endDate = new Date(startDate);
    if (endTime) {
      const [endHours, endMinutes] = endTime.split(':');
      endDate.setHours(parseInt(endHours), parseInt(endMinutes));
    } else {
      endDate.setHours(endDate.getHours() + 1);
    }

    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z&details=${encodeURIComponent(description || '')}&location=${encodeURIComponent(location || '')}`;
    
    window.open(calendarUrl, '_blank');
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="h-2 bg-girls-gradient" />
      <CardContent className="p-4">
        <div className="flex flex-col">
          <h3 className="font-bold truncate">{title}</h3>
          
          {description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {description}
            </p>
          )}

          <div className="flex items-center gap-1.5 mt-3">
            <Calendar className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium">
              {format(date, 'EEEE, MMMM d, yyyy')}
            </span>
          </div>

          <div className="flex items-center gap-1.5 mt-1.5">
            <Clock className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs">
              {startTime}{endTime ? ` - ${endTime}` : ''}
            </span>
          </div>

          {location && (
            <div className="flex items-center gap-1.5 mt-1.5">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs truncate">{location}</span>
            </div>
          )}

          <div className="flex items-center gap-2 mt-4">
            <Button
              variant={attending ? "default" : "outline"}
              size="sm"
              className="flex-1 text-xs h-8"
              onClick={handleAttendToggle}
              disabled={loading}
            >
              {loading ? '...' : (attending ? 'Attending' : 'Attend')}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-8"
              onClick={handleAddToCalendar}
            >
              Add to Calendar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
