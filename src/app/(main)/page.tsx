import Link from 'next/link'
import { getUpcomingEvents } from '@/lib/actions/events'
import { getRecentAnnouncements } from '@/lib/actions/announcements'
import { getActiveTripSummary } from '@/lib/actions/trip-details'
import { EventCard } from '@/components/event-card'
import { AnnouncementCard } from '@/components/announcement-card'
import { TripBanner } from '@/components/trip/trip-banner'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronRight, Calendar, Bell, FileText, User, Clock } from 'lucide-react'
import { format } from 'date-fns'

export default async function DashboardPage() {
  const [events, announcements, tripSummary] = await Promise.all([
    getUpcomingEvents(3),
    getRecentAnnouncements(3),
    getActiveTripSummary(),
  ])

  const formatTime = (time: string) => {
    const [h, m] = time.split(':')
    const d = new Date()
    d.setHours(parseInt(h), parseInt(m))
    return format(d, 'h:mm a')
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-rose-red">
            <span className="text-xl font-bold text-white">R</span>
          </div>
          <div>
            <h1 className="text-xl font-semibold">Rose-Hulman Tennis</h1>
            <p className="text-sm text-muted-foreground">Welcome back</p>
          </div>
        </div>
        <Link href="/profile">
          <Button variant="ghost" size="icon" className="rounded-full">
            <User className="h-5 w-5" />
          </Button>
        </Link>
      </div>

      {/* Active Trip Banner */}
      {tripSummary && (
        <TripBanner
          trip={tripSummary.trip}
          scheduleCount={tripSummary.scheduleCount}
          taskCount={tripSummary.taskCount}
          groceryCount={tripSummary.groceryCount}
        />
      )}

      {/* Today's Trip Schedule */}
      {tripSummary && tripSummary.todaySchedule.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Today&apos;s Trip Schedule</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/trips/${tripSummary.trip.id}`} className="text-rose-red">
                Full schedule <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
          <div className="space-y-2">
            {tripSummary.todaySchedule.map((entry) => (
              <Card key={entry.id} className="border-rose-silver/30">
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0 w-[60px]">
                    <Clock className="h-3 w-3" />
                    <span>{formatTime(entry.start_time)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{entry.title}</p>
                    {entry.location && (
                      <p className="text-xs text-muted-foreground truncate">{entry.location}</p>
                    )}
                  </div>
                  <Badge className="shrink-0 text-[10px] bg-rose-red/10 text-rose-red">
                    {entry.category}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-3">
        <Link href="/schedule">
          <Card className="border-rose-silver/30 hover:border-rose-red/50 transition-colors">
            <CardContent className="p-3 flex flex-col items-center justify-center text-center">
              <Calendar className="h-6 w-6 text-rose-red mb-1" />
              <span className="text-xs font-medium">Schedule</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/updates">
          <Card className="border-rose-silver/30 hover:border-rose-red/50 transition-colors">
            <CardContent className="p-3 flex flex-col items-center justify-center text-center">
              <Bell className="h-6 w-6 text-rose-red mb-1" />
              <span className="text-xs font-medium">Updates</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/notes">
          <Card className="border-rose-silver/30 hover:border-rose-red/50 transition-colors">
            <CardContent className="p-3 flex flex-col items-center justify-center text-center">
              <FileText className="h-6 w-6 text-rose-red mb-1" />
              <span className="text-xs font-medium">Notes</span>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Upcoming Events */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Upcoming Events</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/schedule" className="text-rose-red">
              View all <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
        {events && events.length > 0 ? (
          <div className="space-y-3">
            {events.map((event) => (
              <Link key={event.id} href={`/schedule/${event.id}`}>
                <EventCard event={event} />
              </Link>
            ))}
          </div>
        ) : (
          <Card className="border-rose-silver/30">
            <CardContent className="p-6 text-center text-muted-foreground">
              No upcoming events
            </CardContent>
          </Card>
        )}
      </section>

      {/* Recent Announcements */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Announcements</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/updates" className="text-rose-red">
              View all <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
        {announcements && announcements.length > 0 ? (
          <div className="space-y-3">
            {announcements.map((announcement) => (
              <AnnouncementCard key={announcement.id} announcement={announcement} />
            ))}
          </div>
        ) : (
          <Card className="border-rose-silver/30">
            <CardContent className="p-6 text-center text-muted-foreground">
              No announcements
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  )
}
