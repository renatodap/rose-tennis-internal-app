import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin, Clock, Users } from 'lucide-react'
import { format } from 'date-fns'
import type { Event } from '@/types/database'

const eventTypeColors: Record<string, string> = {
  practice: 'bg-rose-silver text-foreground',
  match: 'bg-rose-red text-white',
  fitness: 'bg-rose-orange text-white',
  meeting: 'bg-slate-600 text-white',
  scrimmage: 'bg-rose-red/80 text-white',
  trip: 'bg-green-600 text-white',
  other: 'bg-slate-400 text-white',
}

interface EventCardProps {
  event: Event
  compact?: boolean
}

export function EventCard({ event, compact = false }: EventCardProps) {
  const formatTime = (time: string | null) => {
    if (!time) return null
    const [hours, minutes] = time.split(':')
    const date = new Date()
    date.setHours(parseInt(hours), parseInt(minutes))
    return format(date, 'h:mm a')
  }

  const teamIndicator = () => {
    if (event.for_mens && event.for_womens) return 'All'
    if (event.for_mens) return 'Men'
    if (event.for_womens) return 'Women'
    return null
  }

  if (compact) {
    return (
      <div className="flex items-center gap-3 py-2">
        <div className="flex flex-col items-center justify-center w-12 text-center">
          <span className="text-xs text-muted-foreground">
            {format(new Date(event.event_date), 'EEE')}
          </span>
          <span className="text-lg font-semibold">
            {format(new Date(event.event_date), 'd')}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{event.title}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {event.start_time && (
              <span>{formatTime(event.start_time)}</span>
            )}
            {event.location && (
              <span className="truncate">{event.location}</span>
            )}
          </div>
        </div>
        <Badge className={eventTypeColors[event.event_type] || eventTypeColors.other}>
          {event.event_type}
        </Badge>
      </div>
    )
  }

  return (
    <Card className="border-rose-silver/30">
      <CardContent className="p-4">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-foreground truncate">{event.title}</h3>
              {event.match_details && (
                <span className="text-sm text-muted-foreground">
                  vs {event.match_details.opponent}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
              <span>{format(new Date(event.event_date), 'EEE, MMM d')}</span>
            </div>
            {event.start_time && (
              <div className="flex items-center gap-2 mt-0.5 text-sm text-muted-foreground">
                <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                <span>
                  {formatTime(event.start_time)}
                  {event.end_time && ` - ${formatTime(event.end_time)}`}
                </span>
              </div>
            )}
            {event.location && (
              <div className="flex items-center gap-2 mt-0.5 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">{event.location}</span>
              </div>
            )}
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge className={eventTypeColors[event.event_type] || eventTypeColors.other}>
              {event.event_type}
            </Badge>
            {teamIndicator() && teamIndicator() !== 'All' && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="h-3 w-3" />
                <span>{teamIndicator()}</span>
              </div>
            )}
          </div>
        </div>
        {event.notes && (
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
            {event.notes}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
