import { Suspense } from 'react'
import Link from 'next/link'
import { getAnnouncements } from '@/lib/actions/announcements'
import { getForms } from '@/lib/actions/forms'
import { AnnouncementCard } from '@/components/announcement-card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { FileText, Clock, ChevronRight } from 'lucide-react'
import { formatDistanceToNow, isPast } from 'date-fns'

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-24 w-full" />
      ))}
    </div>
  )
}

export default async function UpdatesPage() {
  const [announcements, forms] = await Promise.all([
    getAnnouncements(),
    getForms(),
  ])

  const activeForms = forms?.filter(f => f.is_active && (!f.due_date || !isPast(new Date(f.due_date)))) || []
  const urgentAnnouncements = announcements?.filter(a => a.priority === 'urgent' || a.priority === 'high') || []

  return (
    <div className="p-4">
      {/* Header */}
      <h1 className="text-xl font-semibold mb-4">Updates</h1>

      {/* Urgent Banner */}
      {urgentAnnouncements.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm font-medium text-red-800">
            {urgentAnnouncements.length} urgent announcement{urgentAnnouncements.length > 1 ? 's' : ''}
          </p>
        </div>
      )}

      <Tabs defaultValue="announcements" className="w-full">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="announcements" className="flex-1">
            Announcements
            {announcements && announcements.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {announcements.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="forms" className="flex-1">
            Forms
            {activeForms.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeForms.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="announcements">
          <Suspense fallback={<LoadingSkeleton />}>
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
          </Suspense>
        </TabsContent>

        <TabsContent value="forms">
          <Suspense fallback={<LoadingSkeleton />}>
            {activeForms.length > 0 ? (
              <div className="space-y-3">
                {activeForms.map((form) => (
                  <Link key={form.id} href={`/updates/forms/${form.id}`}>
                    <Card className="border-rose-silver/30 hover:border-rose-red/50 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-rose-red/10 rounded-md">
                              <FileText className="h-4 w-4 text-rose-red" />
                            </div>
                            <div>
                              <h3 className="font-medium">{form.title}</h3>
                              {form.description && (
                                <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                                  {form.description}
                                </p>
                              )}
                              {form.due_date && (
                                <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  <span>
                                    Due {formatDistanceToNow(new Date(form.due_date), { addSuffix: true })}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card className="border-rose-silver/30">
                <CardContent className="p-6 text-center text-muted-foreground">
                  No active forms
                </CardContent>
              </Card>
            )}
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
}
