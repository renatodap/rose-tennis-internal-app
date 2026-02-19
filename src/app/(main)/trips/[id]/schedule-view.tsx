'use client'

import { useMemo } from 'react'
import { DayPicker } from '@/components/trip/day-picker'
import { ScheduleBlock } from '@/components/trip/schedule-block'
import type { TripScheduleEntry } from '@/types/database'

interface ScheduleViewProps {
  schedule: TripScheduleEntry[]
  tripDates: string[]
  selectedDate: string
  onDateChange: (date: string) => void
}

export function ScheduleView({
  schedule,
  tripDates,
  selectedDate,
  onDateChange,
}: ScheduleViewProps) {
  const daySchedule = useMemo(
    () => schedule.filter((e) => e.day_date === selectedDate),
    [schedule, selectedDate]
  )

  return (
    <div className="space-y-4">
      <DayPicker
        dates={tripDates}
        selectedDate={selectedDate}
        onDateChange={onDateChange}
      />

      {daySchedule.length > 0 ? (
        <div className="relative">
          {/* Vertical timeline line */}
          <div className="absolute left-[59px] top-2 bottom-2 w-px bg-rose-silver/40" />

          <div className="space-y-3">
            {daySchedule.map((entry) => (
              <ScheduleBlock key={entry.id} entry={entry} />
            ))}
          </div>
        </div>
      ) : (
        <p className="text-center text-sm text-muted-foreground py-8">
          No schedule entries for this day.
        </p>
      )}
    </div>
  )
}
