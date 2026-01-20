import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getEvent } from '@/lib/actions/events'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Calendar, Clock, MapPin, Users, FileText } from 'lucide-react'
import { format } from 'date-fns'

interface EventPageProps {
  params: Promise<{ id: string }>
}

const eventTypeColors: Record<string, string> = {
  practice: 'bg-rose-silver text-foreground',
  match: 'bg-rose-red text-white',
  fitness: 'bg-rose-orange text-white',
  meeting: 'bg-slate-600 text-white',
  scrimmage: 'bg-rose-red/80 text-white',
  trip: 'bg-green-600 text-white',
  other: 'bg-slate-400 text-white',
}

export default async function EventPage({ params }: EventPageProps) {
  const { id } = await params
  const event = await getEvent(parseInt(id))

  if (!event) {
    notFound()
  }

  const formatTime = (time: string | null) => {
    if (!time) return null
    const [hours, minutes] = time.split(':')
    const date = new Date()
    date.setHours(parseInt(hours), parseInt(minutes))
    return format(date, 'h:mm a')
  }

  const teamIndicator = () => {
    if (event.for_mens && event.for_womens) return 'All Teams'
    if (event.for_mens) return "Men's Team"
    if (event.for_womens) return "Women's Team"
    return null
  }

  return (
    <div className="p-4">
      {/* Back Button */}
      <Button variant="ghost" size="sm" className="mb-4 -ml-2" asChild>
        <Link href="/schedule">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Schedule
        </Link>
      </Button>

      {/* Event Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h1 className="text-2xl font-semibold">{event.title}</h1>
          <Badge className={eventTypeColors[event.event_type] || eventTypeColors.other}>
            {event.event_type}
          </Badge>
        </div>
        {event.match_details && (
          <p className="text-lg text-muted-foreground">
            vs {event.match_details.opponent}
            {event.match_details.home_away && (
              <span className="ml-2">
                ({event.match_details.home_away === 'home' ? 'Home' :
                  event.match_details.home_away === 'away' ? 'Away' : 'Neutral'})
              </span>
            )}
          </p>
        )}
      </div>

      {/* Event Details */}
      <Card className="border-rose-silver/30 mb-4">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-rose-red" />
            <div>
              <p className="font-medium">
                {format(new Date(event.event_date), 'EEEE, MMMM d, yyyy')}
              </p>
            </div>
          </div>

          {event.start_time && (
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-rose-red" />
              <div>
                <p className="font-medium">
                  {formatTime(event.start_time)}
                  {event.end_time && ` - ${formatTime(event.end_time)}`}
                </p>
              </div>
            </div>
          )}

          {event.location && (
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-rose-red" />
              <div>
                <p className="font-medium">{event.location}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-rose-red" />
            <div>
              <p className="font-medium">{teamIndicator()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Match Score (if applicable) */}
      {event.match_details && event.match_details.result && (
        <Card className="border-rose-silver/30 mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Match Result</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-4">
              <Badge variant={event.match_details.result === 'win' ? 'default' : 'secondary'}>
                {event.match_details.result.toUpperCase()}
              </Badge>
              {event.match_details.mens_score && (
                <span className="text-sm">Men: {event.match_details.mens_score}</span>
              )}
              {event.match_details.womens_score && (
                <span className="text-sm">Women: {event.match_details.womens_score}</span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      {event.notes && (
        <Card className="border-rose-silver/30 mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {event.notes}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Meeting Notes */}
      {event.meeting_notes && (
        <Card className="border-rose-silver/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Meeting Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {event.meeting_notes}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
