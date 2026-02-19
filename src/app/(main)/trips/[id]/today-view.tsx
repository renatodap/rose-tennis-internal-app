'use client'

import { useMemo, useTransition } from 'react'
import { format } from 'date-fns'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Clock, CheckCircle2, UtensilsCrossed, ListChecks } from 'lucide-react'
import { useUser } from '@/hooks/use-user'
import { markTaskDone } from '@/lib/actions/trip-details'
import { DayPicker } from '@/components/trip/day-picker'
import { ProgressBadge } from '@/components/trip/progress-badge'
import type { TripScheduleEntry, TripMeal, TripTask } from '@/types/database'

const CATEGORY_COLORS: Record<string, string> = {
  travel: 'bg-blue-100 text-blue-700',
  match: 'bg-rose-red/10 text-rose-red',
  meal: 'bg-orange-100 text-orange-700',
  prep: 'bg-amber-100 text-amber-700',
  free: 'bg-green-100 text-green-700',
  recovery: 'bg-purple-100 text-purple-700',
  other: 'bg-gray-100 text-gray-700',
}

interface TodayViewProps {
  schedule: TripScheduleEntry[]
  meals: TripMeal[]
  tasks: TripTask[]
  tripDates: string[]
  selectedDate: string
  onDateChange: (date: string) => void
}

export function TodayView({
  schedule,
  meals,
  tasks,
  tripDates,
  selectedDate,
  onDateChange,
}: TodayViewProps) {
  const { player } = useUser()
  const [isPending, startTransition] = useTransition()
  const playerId = player?.id ?? null

  const daySchedule = useMemo(
    () => schedule.filter((e) => e.day_date === selectedDate),
    [schedule, selectedDate]
  )

  const dayMeals = useMemo(
    () => meals.filter((m) => m.day_date === selectedDate),
    [meals, selectedDate]
  )

  const dayTasks = useMemo(
    () => tasks.filter((t) => t.day_date === selectedDate),
    [tasks, selectedDate]
  )

  const myTasks = useMemo(() => {
    if (!playerId) return []
    return dayTasks.filter((t) =>
      t.signups?.some((s) => s.player_id === playerId)
    )
  }, [dayTasks, playerId])

  const currentOrNext = useMemo(() => {
    const now = format(new Date(), 'HH:mm:ss')
    const upcoming = daySchedule.filter(
      (e) => !e.end_time || e.end_time >= now
    )
    return upcoming[0] ?? daySchedule[daySchedule.length - 1] ?? null
  }, [daySchedule])

  const dayTaskSlots = useMemo(() => {
    const total = dayTasks.reduce((s, t) => s + t.slots_needed, 0)
    const filled = dayTasks.reduce((s, t) => s + (t.signups?.length ?? 0), 0)
    const completed = dayTasks.reduce(
      (s, t) =>
        s + (t.signups?.filter((su) => su.completed_at !== null).length ?? 0),
      0
    )
    return { total, filled, completed }
  }, [dayTasks])

  const progressPercent =
    dayTaskSlots.total > 0
      ? Math.round((dayTaskSlots.completed / dayTaskSlots.total) * 100)
      : 0

  function handleMarkDone(signupId: number) {
    startTransition(async () => {
      await markTaskDone(signupId)
    })
  }

  const formatTime = (time: string) => {
    const [h, m] = time.split(':')
    const d = new Date()
    d.setHours(parseInt(h), parseInt(m))
    return format(d, 'h:mm a')
  }

  return (
    <div className="space-y-4">
      <DayPicker dates={tripDates} selectedDate={selectedDate} onDateChange={onDateChange} />

      {/* Current / Next Activity */}
      {currentOrNext && (
        <Card className="border-rose-red/40 bg-rose-red/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-rose-red" />
              <span className="text-xs font-medium text-rose-red uppercase">
                Up Next
              </span>
            </div>
            <h3 className="font-semibold text-base mb-1">{currentOrNext.title}</h3>
            <p className="text-sm text-muted-foreground">
              {formatTime(currentOrNext.start_time)}
              {currentOrNext.end_time && ` - ${formatTime(currentOrNext.end_time)}`}
            </p>
            {currentOrNext.location && (
              <p className="text-sm text-muted-foreground mt-1">
                {currentOrNext.location}
              </p>
            )}
            <Badge className={`mt-2 ${CATEGORY_COLORS[currentOrNext.category] ?? CATEGORY_COLORS.other}`}>
              {currentOrNext.category}
            </Badge>
          </CardContent>
        </Card>
      )}

      {/* My Tasks Today */}
      {playerId && myTasks.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <ListChecks className="h-4 w-4 text-rose-red" />
            <h3 className="font-semibold text-sm">My Tasks Today</h3>
          </div>
          <div className="space-y-2">
            {myTasks.map((task) => {
              const mySignup = task.signups?.find((s) => s.player_id === playerId)
              const isDone = !!mySignup?.completed_at
              return (
                <Card key={task.id} className="border-rose-silver/30">
                  <CardContent className="p-3 flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${isDone ? 'line-through text-muted-foreground' : ''}`}>
                        {task.title}
                      </p>
                      {task.time_slot && (
                        <p className="text-xs text-muted-foreground">{task.time_slot}</p>
                      )}
                    </div>
                    {isDone ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                    ) : mySignup ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="shrink-0 min-h-[44px]"
                        disabled={isPending}
                        onClick={() => handleMarkDone(mySignup.id)}
                      >
                        Done
                      </Button>
                    ) : null}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Today's Meals */}
      {dayMeals.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <UtensilsCrossed className="h-4 w-4 text-rose-orange" />
            <h3 className="font-semibold text-sm">Meals Today</h3>
          </div>
          <div className="space-y-2">
            {dayMeals.map((meal) => (
              <Card key={meal.id} className="border-rose-silver/30">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <MealBadge type={meal.meal_type} />
                    <span className="font-medium text-sm">{meal.name}</span>
                  </div>
                  {meal.description && (
                    <p className="text-xs text-muted-foreground">{meal.description}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Task Progress */}
      {dayTaskSlots.total > 0 && (
        <Card className="border-rose-silver/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-sm">Task Progress</h3>
              <ProgressBadge
                filled={dayTaskSlots.filled}
                total={dayTaskSlots.total}
                completed={dayTaskSlots.completed}
              />
            </div>
            <Progress value={progressPercent} className="h-2" />
          </CardContent>
        </Card>
      )}

      {daySchedule.length === 0 && dayMeals.length === 0 && dayTasks.length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-8">
          Nothing scheduled for this day.
        </p>
      )}
    </div>
  )
}

const MEAL_BADGE_COLORS: Record<string, string> = {
  breakfast: 'bg-amber-100 text-amber-700',
  lunch: 'bg-green-100 text-green-700',
  dinner: 'bg-rose-red/10 text-rose-red',
  snack: 'bg-gray-100 text-gray-600',
}

function MealBadge({ type }: { type: string }) {
  return (
    <Badge className={MEAL_BADGE_COLORS[type] ?? MEAL_BADGE_COLORS.snack}>
      {type}
    </Badge>
  )
}
