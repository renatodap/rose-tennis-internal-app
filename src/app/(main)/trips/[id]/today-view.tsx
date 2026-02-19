'use client'

import { useMemo, useState, useTransition } from 'react'
import { format, differenceInDays, differenceInMinutes, parseISO } from 'date-fns'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Clock,
  CheckCircle2,
  UtensilsCrossed,
  ListChecks,
  ChevronDown,
  Calendar,
  ShoppingCart,
  Info,
  UserPlus,
} from 'lucide-react'
import { useUser } from '@/hooks/use-user'
import { markTaskDone, signUpForTask } from '@/lib/actions/trip-details'
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

const MEAL_BADGE_COLORS: Record<string, string> = {
  breakfast: 'bg-amber-100 text-amber-700',
  lunch: 'bg-green-100 text-green-700',
  dinner: 'bg-rose-red/10 text-rose-red',
  snack: 'bg-gray-100 text-gray-600',
}

interface TodayViewProps {
  schedule: TripScheduleEntry[]
  meals: TripMeal[]
  tasks: TripTask[]
  tripDates: string[]
  selectedDate: string
  onDateChange: (date: string) => void
  tripDepartureDate: string
  tripReturnDate: string
  groceryBudget: {
    estimated_total: number
    purchased_total: number
    items_total: number
    items_purchased: number
  }
  onSwitchTab: (tab: string) => void
}

export function TodayView({
  schedule,
  meals,
  tasks,
  tripDates,
  selectedDate,
  onDateChange,
  tripDepartureDate,
  tripReturnDate,
  groceryBudget,
  onSwitchTab,
}: TodayViewProps) {
  const { player } = useUser()
  const [isPending, startTransition] = useTransition()
  const playerId = player?.id ?? null

  // Day calculation
  const departure = parseISO(tripDepartureDate)
  const returnDate = parseISO(tripReturnDate)
  const selectedParsed = parseISO(selectedDate)
  const totalDays = differenceInDays(returnDate, departure) + 1
  const currentDayNum = differenceInDays(selectedParsed, departure) + 1

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

  // Open tasks that need volunteers
  const openTasks = useMemo(() => {
    return dayTasks.filter((t) => {
      const filledSlots = t.signups?.length ?? 0
      return filledSlots < t.slots_needed
    })
  }, [dayTasks])

  const currentOrNext = useMemo(() => {
    const now = format(new Date(), 'HH:mm:ss')
    const upcoming = daySchedule.filter(
      (e) => !e.end_time || e.end_time >= now
    )
    return upcoming[0] ?? daySchedule[daySchedule.length - 1] ?? null
  }, [daySchedule])

  // Time until next event
  const timeUntilNext = useMemo(() => {
    if (!currentOrNext) return null
    const now = new Date()
    const [h, m] = currentOrNext.start_time.split(':')
    const eventTime = new Date()
    eventTime.setHours(parseInt(h), parseInt(m), 0, 0)

    if (eventTime <= now) return null

    const mins = differenceInMinutes(eventTime, now)
    if (mins < 60) return `starts in ${mins} min`
    const hours = Math.floor(mins / 60)
    const remainMins = mins % 60
    if (remainMins === 0) return `starts in ${hours}h`
    return `starts in ${hours}h ${remainMins}m`
  }, [currentOrNext])

  const dayTaskSlots = useMemo(() => {
    const total = dayTasks.reduce((s, t) => s + t.slots_needed, 0)
    const filled = dayTasks.reduce(
      (s, t) => s + (t.signups?.length ?? 0),
      0
    )
    const completed = dayTasks.reduce(
      (s, t) =>
        s +
        (t.signups?.filter((su) => su.completed_at !== null).length ?? 0),
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

  function handleSignUp(taskId: number) {
    if (!playerId) return
    startTransition(async () => {
      await signUpForTask(taskId, playerId)
    })
  }

  const formatTime = (time: string) => {
    const [h, m] = time.split(':')
    const d = new Date()
    d.setHours(parseInt(h), parseInt(m))
    return format(d, 'h:mm a')
  }

  const groceryProgress =
    groceryBudget.items_total > 0
      ? Math.round(
          (groceryBudget.items_purchased / groceryBudget.items_total) * 100
        )
      : 0

  return (
    <div className="space-y-4">
      {/* Day Header */}
      <div className="text-center">
        <h2 className="text-lg font-semibold">
          {format(selectedParsed, 'EEEE, MMMM d')}
        </h2>
        <p className="text-sm text-muted-foreground">
          Day {currentDayNum} of {totalDays}
        </p>
      </div>

      <DayPicker
        dates={tripDates}
        selectedDate={selectedDate}
        onDateChange={onDateChange}
      />

      {/* Up Next */}
      {currentOrNext && (
        <Card className="border-rose-red/40 bg-rose-red/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-rose-red" />
                <span className="text-xs font-medium text-rose-red uppercase">
                  Up Next
                </span>
              </div>
              {timeUntilNext && (
                <span className="text-xs font-medium text-rose-red">
                  {timeUntilNext}
                </span>
              )}
            </div>
            <h3 className="font-semibold text-base mb-1">
              {currentOrNext.title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {formatTime(currentOrNext.start_time)}
              {currentOrNext.end_time &&
                ` - ${formatTime(currentOrNext.end_time)}`}
            </p>
            {currentOrNext.location && (
              <p className="text-sm text-muted-foreground mt-1">
                {currentOrNext.location}
              </p>
            )}
            <Badge
              className={`mt-2 ${
                CATEGORY_COLORS[currentOrNext.category] ??
                CATEGORY_COLORS.other
              }`}
            >
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
            <h3 className="font-semibold text-sm">My Tasks</h3>
          </div>
          <div className="space-y-2">
            {myTasks.map((task) => {
              const mySignup = task.signups?.find(
                (s) => s.player_id === playerId
              )
              const isDone = !!mySignup?.completed_at
              return (
                <Card key={task.id} className="border-rose-silver/30">
                  <CardContent className="p-3 flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium ${
                          isDone
                            ? 'line-through text-muted-foreground'
                            : ''
                        }`}
                      >
                        {task.title}
                      </p>
                      {task.time_slot && (
                        <p className="text-xs text-muted-foreground">
                          {task.time_slot}
                        </p>
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

      {/* Open Tasks (Need Help!) */}
      {openTasks.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <UserPlus className="h-4 w-4 text-rose-orange" />
            <h3 className="font-semibold text-sm">Need Help!</h3>
            <Badge variant="secondary" className="text-xs">
              {openTasks.length} open
            </Badge>
          </div>
          <div className="space-y-2">
            {openTasks.slice(0, 5).map((task) => {
              const filledSlots = task.signups?.length ?? 0
              const alreadySignedUp = playerId
                ? task.signups?.some((s) => s.player_id === playerId)
                : false
              return (
                <Card
                  key={task.id}
                  className="border-rose-orange/30 bg-rose-orange/5"
                >
                  <CardContent className="p-3 flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{task.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {task.time_slot && `${task.time_slot} · `}
                        {filledSlots}/{task.slots_needed} spots filled
                      </p>
                    </div>
                    {!alreadySignedUp && playerId && (
                      <Button
                        size="sm"
                        className="shrink-0 min-h-[44px] bg-rose-orange hover:bg-rose-orange/90"
                        disabled={isPending}
                        onClick={() => handleSignUp(task.id)}
                      >
                        Sign Up
                      </Button>
                    )}
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
            <h3 className="font-semibold text-sm">Meals</h3>
          </div>
          <div className="space-y-2">
            {dayMeals.map((meal) => (
              <MealSummaryCard key={meal.id} meal={meal} />
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

      {/* Quick Links */}
      <div className="space-y-2">
        <Card className="border-rose-silver/30">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Grocery</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {groceryBudget.items_purchased}/{groceryBudget.items_total}{' '}
                items
              </span>
            </div>
            <Progress value={groceryProgress} className="h-1.5" />
          </CardContent>
        </Card>

        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs min-h-[44px]"
            onClick={() => onSwitchTab('schedule')}
          >
            <Calendar className="h-3.5 w-3.5 mr-1" />
            Schedule
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs min-h-[44px]"
            onClick={() => onSwitchTab('tasks')}
          >
            <ListChecks className="h-3.5 w-3.5 mr-1" />
            All Tasks
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs min-h-[44px]"
            onClick={() => onSwitchTab('info')}
          >
            <Info className="h-3.5 w-3.5 mr-1" />
            Trip Info
          </Button>
        </div>
      </div>

      {daySchedule.length === 0 &&
        dayMeals.length === 0 &&
        dayTasks.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">
            Nothing scheduled for this day.
          </p>
        )}
    </div>
  )
}

function MealSummaryCard({ meal }: { meal: TripMeal }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-rose-silver/30">
        <CardContent className="p-3">
          <CollapsibleTrigger asChild>
            <button className="w-full flex items-center justify-between gap-2 min-h-[44px]">
              <div className="flex items-center gap-2">
                <Badge
                  className={
                    MEAL_BADGE_COLORS[meal.meal_type] ??
                    MEAL_BADGE_COLORS.snack
                  }
                >
                  {meal.meal_type}
                </Badge>
                <span className="font-medium text-sm">{meal.name}</span>
              </div>
              <ChevronDown
                className={`h-4 w-4 text-muted-foreground transition-transform ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="pt-2 mt-2 border-t border-rose-silver/20">
              {meal.description && (
                <p className="text-xs text-muted-foreground mb-2">
                  {meal.description}
                </p>
              )}
              {meal.nutrition && (
                <div className="flex gap-2 flex-wrap text-xs">
                  <span className="bg-muted px-2 py-1 rounded">
                    {meal.nutrition.kcal} kcal
                  </span>
                  <span className="bg-muted px-2 py-1 rounded">
                    {meal.nutrition.protein_g}g protein
                  </span>
                  <span className="bg-muted px-2 py-1 rounded">
                    {meal.nutrition.carbs_g}g carbs
                  </span>
                </div>
              )}
              {meal.recipe_content && (
                <p className="text-xs text-rose-red mt-2 font-medium">
                  Full recipe in Schedule tab
                </p>
              )}
            </div>
          </CollapsibleContent>
        </CardContent>
      </Card>
    </Collapsible>
  )
}
