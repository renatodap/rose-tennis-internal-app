'use client'

import { format } from 'date-fns'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Car } from 'lucide-react'
import type { TripScheduleEntry } from '@/types/database'

const CATEGORY_COLORS: Record<string, string> = {
  travel: 'bg-blue-100 text-blue-700',
  match: 'bg-rose-red/10 text-rose-red',
  meal: 'bg-orange-100 text-orange-700',
  prep: 'bg-amber-100 text-amber-700',
  free: 'bg-green-100 text-green-700',
  recovery: 'bg-purple-100 text-purple-700',
  other: 'bg-gray-100 text-gray-700',
}

interface ScheduleBlockProps {
  entry: TripScheduleEntry
}

export function ScheduleBlock({ entry }: ScheduleBlockProps) {
  const formatTime = (time: string) => {
    const [h, m] = time.split(':')
    const d = new Date()
    d.setHours(parseInt(h), parseInt(m))
    return format(d, 'h:mm a')
  }

  return (
    <div className="flex gap-3">
      {/* Time column */}
      <div className="w-[50px] shrink-0 text-right pt-3">
        <p className="text-xs font-medium text-muted-foreground leading-tight">
          {formatTime(entry.start_time)}
        </p>
      </div>

      {/* Timeline dot */}
      <div className="relative flex items-start pt-3.5">
        <div className="w-2.5 h-2.5 rounded-full bg-rose-red shrink-0 z-10" />
      </div>

      {/* Card */}
      <Card className="flex-1 border-rose-silver/30">
        <CardContent className="p-3">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="font-medium text-sm">{entry.title}</h4>
            <Badge className={CATEGORY_COLORS[entry.category] ?? CATEGORY_COLORS.other}>
              {entry.category}
            </Badge>
          </div>

          {entry.end_time && (
            <p className="text-xs text-muted-foreground mb-1">
              {formatTime(entry.start_time)} - {formatTime(entry.end_time)}
            </p>
          )}

          {entry.description && (
            <p className="text-xs text-muted-foreground mb-1.5">
              {entry.description}
            </p>
          )}

          {entry.location && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 shrink-0" />
              <span>{entry.location}</span>
            </div>
          )}

          {entry.drive_info && (
            <div className="mt-2 p-2 bg-blue-50 rounded-md text-xs">
              <div className="flex items-center gap-1.5 text-blue-700 font-medium mb-1">
                <Car className="h-3.5 w-3.5" />
                <span>Drive to {entry.drive_info.destination}</span>
              </div>
              <p className="text-blue-600">
                {entry.drive_info.distance_mi} mi / ~{entry.drive_info.drive_time_min} min
              </p>
              {entry.drive_info.route_notes && (
                <p className="text-blue-600 mt-0.5">{entry.drive_info.route_notes}</p>
              )}
              {entry.drive_info.i4_risk && (
                <p className="text-amber-600 mt-0.5">I-4 risk: {entry.drive_info.i4_risk}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
