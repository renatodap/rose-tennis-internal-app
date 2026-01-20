import Link from 'next/link'
import { getEvents } from '@/lib/actions/events'
import { EventCard } from '@/components/event-card'
import { Card, CardContent } from '@/components/ui/card'
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, eachDayOfInterval, isSameDay } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SchedulePageProps {
  searchParams: Promise<{ week?: string }>
}

export default async function SchedulePage({ searchParams }: SchedulePageProps) {
  const params = await searchParams
  const weekParam = params.week

  const currentDate = weekParam ? new Date(weekParam) : new Date()
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 })
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 })

  const prevWeek = format(subWeeks(weekStart, 1), 'yyyy-MM-dd')
  const nextWeek = format(addWeeks(weekStart, 1), 'yyyy-MM-dd')

  const events = await getEvents({
    startDate: format(weekStart, 'yyyy-MM-dd'),
    endDate: format(weekEnd, 'yyyy-MM-dd'),
  })

  const daysOfWeek = eachDayOfInterval({ start: weekStart, end: weekEnd })

  const getEventsForDay = (day: Date) => {
    return events?.filter(event =>
      isSameDay(new Date(event.event_date), day)
    ) || []
  }

  const today = new Date()

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Schedule</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/schedule?week=${prevWeek}`}>
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <span className="text-sm font-medium min-w-[140px] text-center">
            {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
          </span>
          <Button variant="outline" size="icon" asChild>
            <Link href={`/schedule?week=${nextWeek}`}>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Week View */}
      <div className="space-y-4">
        {daysOfWeek.map((day) => {
          const dayEvents = getEventsForDay(day)
          const isToday = isSameDay(day, today)

          return (
            <div key={day.toISOString()}>
              <div className={`flex items-center gap-3 mb-2 ${isToday ? 'text-rose-red' : ''}`}>
                <div className={`flex flex-col items-center justify-center w-12 h-12 rounded-md ${
                  isToday ? 'bg-rose-red text-white' : 'bg-muted'
                }`}>
                  <span className="text-xs font-medium">{format(day, 'EEE')}</span>
                  <span className="text-lg font-semibold">{format(day, 'd')}</span>
                </div>
                <span className={`text-sm ${isToday ? 'font-medium' : 'text-muted-foreground'}`}>
                  {format(day, 'EEEE, MMMM d')}
                </span>
              </div>

              {dayEvents.length > 0 ? (
                <div className="space-y-2 ml-15">
                  {dayEvents.map((event) => (
                    <Link key={event.id} href={`/schedule/${event.id}`}>
                      <EventCard event={event} />
                    </Link>
                  ))}
                </div>
              ) : (
                <Card className="border-rose-silver/30 border-dashed ml-15">
                  <CardContent className="py-3 text-center text-sm text-muted-foreground">
                    No events scheduled
                  </CardContent>
                </Card>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
