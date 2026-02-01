import Link from 'next/link'
import { getUpcomingEvents } from '@/lib/actions/events'
import { getRecentAnnouncements } from '@/lib/actions/announcements'
import { EventCard } from '@/components/event-card'
import { AnnouncementCard } from '@/components/announcement-card'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronRight, Calendar, Bell, FileText, Plane, User } from 'lucide-react'

export default async function DashboardPage() {
  const [events, announcements] = await Promise.all([
    getUpcomingEvents(3),
    getRecentAnnouncements(3),
  ])

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

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
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
        <Link href="/trips">
          <Card className="border-rose-silver/30 hover:border-rose-red/50 transition-colors">
            <CardContent className="p-3 flex flex-col items-center justify-center text-center">
              <Plane className="h-6 w-6 text-rose-red mb-1" />
              <span className="text-xs font-medium">Trips</span>
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
