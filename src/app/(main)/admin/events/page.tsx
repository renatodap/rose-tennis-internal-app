import Link from 'next/link'
import { getEvents } from '@/lib/actions/events'
import { EventCard } from '@/components/event-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, Plus } from 'lucide-react'
import { format, startOfMonth, endOfMonth, addMonths } from 'date-fns'

interface AdminEventsPageProps {
  searchParams: Promise<{ month?: string }>
}

export default async function AdminEventsPage({ searchParams }: AdminEventsPageProps) {
  const params = await searchParams
  const currentMonth = params.month ? new Date(params.month) : new Date()
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)

  const events = await getEvents({
    startDate: format(monthStart, 'yyyy-MM-dd'),
    endDate: format(monthEnd, 'yyyy-MM-dd'),
  })

  const prevMonth = format(addMonths(monthStart, -1), 'yyyy-MM-dd')
  const nextMonth = format(addMonths(monthStart, 1), 'yyyy-MM-dd')

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-xl font-semibold">Events</h1>
        </div>
        <Button className="bg-rose-red hover:bg-rose-red/90" asChild>
          <Link href="/admin/events/new">
            <Plus className="h-4 w-4 mr-2" />
            New Event
          </Link>
        </Button>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/admin/events?month=${prevMonth}`}>Previous</Link>
        </Button>
        <span className="font-medium">{format(currentMonth, 'MMMM yyyy')}</span>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/admin/events?month=${nextMonth}`}>Next</Link>
        </Button>
      </div>

      {/* Events List */}
      {events && events.length > 0 ? (
        <div className="space-y-3">
          {events.map((event) => (
            <Link key={event.id} href={`/admin/events/${event.id}`}>
              <EventCard event={event} />
            </Link>
          ))}
        </div>
      ) : (
        <Card className="border-rose-silver/30">
          <CardContent className="p-6 text-center text-muted-foreground">
            No events this month
          </CardContent>
        </Card>
      )}
    </div>
  )
}
