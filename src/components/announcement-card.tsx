import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Info, AlertTriangle, Bell } from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import type { Announcement, Priority } from '@/types/database'

const priorityConfig: Record<Priority, { icon: typeof AlertCircle; color: string; label: string }> = {
  urgent: { icon: AlertCircle, color: 'text-red-600 bg-red-50 border-red-200', label: 'Urgent' },
  high: { icon: AlertTriangle, color: 'text-rose-orange bg-orange-50 border-orange-200', label: 'Important' },
  normal: { icon: Bell, color: 'text-foreground bg-muted border-border', label: '' },
  low: { icon: Info, color: 'text-muted-foreground bg-muted/50 border-border', label: '' },
}

interface AnnouncementCardProps {
  announcement: Announcement
}

export function AnnouncementCard({ announcement }: AnnouncementCardProps) {
  const config = priorityConfig[announcement.priority]
  const Icon = config.icon
  const isRecent = new Date(announcement.created_at).getTime() > Date.now() - 24 * 60 * 60 * 1000

  return (
    <Card className={`border ${config.color.includes('border') ? config.color.split(' ').find(c => c.startsWith('border-')) : 'border-rose-silver/30'}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-md ${config.color.split(' ').slice(0, 2).join(' ')}`}>
            <Icon className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium truncate">{announcement.title}</h3>
              {config.label && (
                <Badge variant="outline" className="text-xs border-current">
                  {config.label}
                </Badge>
              )}
              {isRecent && (
                <Badge className="bg-rose-red text-white text-xs">New</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {announcement.content}
            </p>
            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
              <span>
                {formatDistanceToNow(new Date(announcement.publish_at), { addSuffix: true })}
              </span>
              {announcement.expires_at && (
                <>
                  <span className="text-rose-silver">|</span>
                  <span>
                    Expires {format(new Date(announcement.expires_at), 'MMM d')}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
