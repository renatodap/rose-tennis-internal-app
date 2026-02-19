'use client'

import { useMemo } from 'react'
import { format } from 'date-fns'
import { DayPicker } from '@/components/trip/day-picker'
import { ScheduleBlock } from '@/components/trip/schedule-block'
import { MealCard } from '@/components/trip/meal-card'
import type { TripScheduleEntry, TripMeal } from '@/types/database'

interface ScheduleViewProps {
  schedule: TripScheduleEntry[]
  meals: TripMeal[]
  tripDates: string[]
  selectedDate: string
  onDateChange: (date: string) => void
}

export function ScheduleView({
  schedule,
  meals,
  tripDates,
  selectedDate,
  onDateChange,
}: ScheduleViewProps) {
  const daySchedule = useMemo(
    () => schedule.filter((e) => e.day_date === selectedDate),
    [schedule, selectedDate]
  )

  const dayMeals = useMemo(
    () => meals.filter((m) => m.day_date === selectedDate),
    [meals, selectedDate]
  )

  // Track which meals have been matched to avoid duplicates
  const findMealForEntry = (entry: TripScheduleEntry): TripMeal | null => {
    if (entry.category !== 'meal') return null
    const titleLower = entry.title.toLowerCase()
    return (
      dayMeals.find(
        (m) =>
          titleLower.includes(m.meal_type) ||
          titleLower.includes(m.name.toLowerCase())
      ) ?? null
    )
  }

  const formatTime = (time: string) => {
    const [h, m] = time.split(':')
    const d = new Date()
    d.setHours(parseInt(h), parseInt(m))
    return format(d, 'h:mm a')
  }

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
            {daySchedule.map((entry) => {
              const meal = findMealForEntry(entry)
              if (meal) {
                return (
                  <div key={entry.id} className="flex gap-3">
                    {/* Time column */}
                    <div className="w-[50px] shrink-0 text-right pt-3">
                      <p className="text-xs font-medium text-muted-foreground leading-tight">
                        {formatTime(entry.start_time)}
                      </p>
                    </div>
                    {/* Timeline dot (orange for meals) */}
                    <div className="relative flex items-start pt-3.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-orange shrink-0 z-10" />
                    </div>
                    {/* Meal card */}
                    <div className="flex-1">
                      <MealCard meal={meal} />
                    </div>
                  </div>
                )
              }
              return <ScheduleBlock key={entry.id} entry={entry} />
            })}
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
