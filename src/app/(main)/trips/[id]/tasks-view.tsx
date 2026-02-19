'use client'

import { useMemo, useTransition } from 'react'
import { useUser } from '@/hooks/use-user'
import { signUpForTask, withdrawFromTask, markTaskDone } from '@/lib/actions/trip-details'
import { DayPicker } from '@/components/trip/day-picker'
import { TaskCard } from '@/components/trip/task-card'
import { ProgressBadge } from '@/components/trip/progress-badge'
import { Progress } from '@/components/ui/progress'
import type { TripTask, TripTaskCategory } from '@/types/database'

const CATEGORY_ORDER: TripTaskCategory[] = [
  'cooking',
  'dishes',
  'cleanup',
  'shopping',
  'packing',
  'driving',
  'night_prep',
  'other',
]

const CATEGORY_LABELS: Record<TripTaskCategory, string> = {
  cooking: 'Cooking',
  dishes: 'Dishes',
  cleanup: 'Cleanup',
  shopping: 'Shopping',
  packing: 'Packing',
  driving: 'Driving',
  night_prep: 'Night Prep',
  other: 'Other',
}

interface TasksViewProps {
  tasks: TripTask[]
  tripDates: string[]
  selectedDate: string
  onDateChange: (date: string) => void
}

export function TasksView({
  tasks,
  tripDates,
  selectedDate,
  onDateChange,
}: TasksViewProps) {
  const { player } = useUser()
  const [isPending, startTransition] = useTransition()
  const playerId = player?.id ?? null

  const dayTasks = useMemo(
    () => tasks.filter((t) => t.day_date === selectedDate),
    [tasks, selectedDate]
  )

  const groupedTasks = useMemo(() => {
    const groups: Record<string, TripTask[]> = {}
    for (const task of dayTasks) {
      const key = task.category
      if (!groups[key]) groups[key] = []
      groups[key].push(task)
    }
    return groups
  }, [dayTasks])

  const sortedCategories = useMemo(() => {
    const present = Object.keys(groupedTasks) as TripTaskCategory[]
    return CATEGORY_ORDER.filter((c) => present.includes(c))
  }, [groupedTasks])

  const dayProgress = useMemo(() => {
    const total = dayTasks.reduce((s, t) => s + t.slots_needed, 0)
    const filled = dayTasks.reduce((s, t) => s + (t.signups?.length ?? 0), 0)
    const completed = dayTasks.reduce(
      (s, t) => s + (t.signups?.filter((su) => su.completed_at !== null).length ?? 0),
      0
    )
    return { total, filled, completed }
  }, [dayTasks])

  const progressPercent =
    dayProgress.total > 0
      ? Math.round((dayProgress.completed / dayProgress.total) * 100)
      : 0

  function handleSignUp(taskId: number) {
    if (!playerId) return
    startTransition(async () => {
      await signUpForTask(taskId, playerId)
    })
  }

  function handleWithdraw(taskId: number) {
    if (!playerId) return
    startTransition(async () => {
      await withdrawFromTask(taskId, playerId)
    })
  }

  function handleMarkDone(signupId: number) {
    startTransition(async () => {
      await markTaskDone(signupId)
    })
  }

  return (
    <div className="space-y-4">
      <DayPicker
        dates={tripDates}
        selectedDate={selectedDate}
        onDateChange={onDateChange}
      />

      {/* Day progress bar */}
      {dayProgress.total > 0 && (
        <div className="flex items-center gap-3">
          <Progress value={progressPercent} className="h-2 flex-1" />
          <ProgressBadge
            filled={dayProgress.filled}
            total={dayProgress.total}
            completed={dayProgress.completed}
          />
        </div>
      )}

      {/* Tasks grouped by category */}
      {sortedCategories.length > 0 ? (
        <div className="space-y-5">
          {sortedCategories.map((category) => (
            <div key={category}>
              <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-2 tracking-wide">
                {CATEGORY_LABELS[category]}
              </h3>
              <div className="space-y-2">
                {groupedTasks[category].map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    playerId={playerId}
                    onSignUp={handleSignUp}
                    onWithdraw={handleWithdraw}
                    onMarkDone={handleMarkDone}
                    isPending={isPending}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-sm text-muted-foreground py-8">
          No tasks for this day.
        </p>
      )}
    </div>
  )
}
