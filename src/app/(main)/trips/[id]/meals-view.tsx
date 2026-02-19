'use client'

import { useMemo } from 'react'
import { DayPicker } from '@/components/trip/day-picker'
import { MealCard } from '@/components/trip/meal-card'
import type { TripMeal } from '@/types/database'

interface MealsViewProps {
  meals: TripMeal[]
  tripDates: string[]
  selectedDate: string
  onDateChange: (date: string) => void
}

export function MealsView({
  meals,
  tripDates,
  selectedDate,
  onDateChange,
}: MealsViewProps) {
  const dayMeals = useMemo(
    () => meals.filter((m) => m.day_date === selectedDate),
    [meals, selectedDate]
  )

  return (
    <div className="space-y-4">
      <DayPicker
        dates={tripDates}
        selectedDate={selectedDate}
        onDateChange={onDateChange}
      />

      {dayMeals.length > 0 ? (
        <div className="space-y-3">
          {dayMeals.map((meal) => (
            <MealCard key={meal.id} meal={meal} />
          ))}
        </div>
      ) : (
        <p className="text-center text-sm text-muted-foreground py-8">
          No meals planned for this day.
        </p>
      )}
    </div>
  )
}
