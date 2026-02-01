import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getAnnouncement } from '@/lib/actions/announcements'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, Users, Clock, AlertCircle, AlertTriangle, Bell, Info } from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import type { Priority } from '@/types/database'

interface AnnouncementPageProps {
  params: Promise<{ id: string }>
}

const priorityConfig: Record<Priority, { icon: typeof AlertCircle; color: string; label: string }> = {
  urgent: { icon: AlertCircle, color: 'text-red-600 bg-red-50', label: 'Urgent' },
  high: { icon: AlertTriangle, color: 'text-rose-orange bg-orange-50', label: 'Important' },
  normal: { icon: Bell, color: 'text-foreground bg-muted', label: 'Normal' },
  low: { icon: Info, color: 'text-muted-foreground bg-muted/50', label: 'Low' },
}

export default async function AnnouncementPage({ params }: AnnouncementPageProps) {
  const { id } = await params
  const announcement = await getAnnouncement(parseInt(id))

  if (!announcement) {
    notFound()
  }

  const config = priorityConfig[announcement.priority]
  const Icon = config.icon

  const teamIndicator = () => {
    if (announcement.for_mens && announcement.for_womens) return 'All Teams'
    if (announcement.for_mens) return "Men's Team"
    if (announcement.for_womens) return "Women's Team"
    return null
  }

  return (
    <div className="p-4">
      <Button variant="ghost" size="sm" className="mb-4 -ml-2" asChild>
        <Link href="/updates">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Updates
        </Link>
      </Button>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h1 className="text-2xl font-semibold">{announcement.title}</h1>
          <Badge className={`${config.color} shrink-0`}>
            <Icon className="h-3 w-3 mr-1" />
            {config.label}
          </Badge>
        </div>
      </div>

      {/* Meta */}
      <Card className="border-rose-silver/30 mb-4">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-rose-red" />
            <div>
              <p className="font-medium">
                {format(new Date(announcement.publish_at), 'EEEE, MMMM d, yyyy')}
              </p>
              <p className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(announcement.publish_at), { addSuffix: true })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-rose-red" />
            <p className="font-medium">{teamIndicator()}</p>
          </div>

          {announcement.expires_at && (
            <div className="text-sm text-muted-foreground">
              Expires {format(new Date(announcement.expires_at), 'MMM d, yyyy')}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Content */}
      <Card className="border-rose-silver/30">
        <CardContent className="p-4">
          <p className="text-sm whitespace-pre-wrap leading-relaxed">
            {announcement.content}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
