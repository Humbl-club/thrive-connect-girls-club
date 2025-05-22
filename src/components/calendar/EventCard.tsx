
import { Calendar, Clock, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

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
}: EventProps) {
  const handleAttendToggle = () => {
    console.log(`Toggle attendance for event ${id}`);
  };

  const handleAddToCalendar = () => {
    console.log(`Add event ${id} to calendar`);
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
              variant={isAttending ? "default" : "outline"}
              size="sm"
              className="flex-1 text-xs h-8"
              onClick={handleAttendToggle}
            >
              {isAttending ? 'Attending' : 'Attend'}
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
