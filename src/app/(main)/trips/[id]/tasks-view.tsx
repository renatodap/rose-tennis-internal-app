'use client'

import { useMemo, useState, useTransition } from 'react'
import { useUser } from '@/hooks/use-user'
import {
  signUpForTask,
  withdrawFromTask,
  markTaskDone,
  toggleGroceryPurchased,
} from '@/lib/actions/trip-details'
import { DayPicker } from '@/components/trip/day-picker'
import { TaskCard } from '@/components/trip/task-card'
import { ProgressBadge } from '@/components/trip/progress-badge'
import { BudgetBar } from '@/components/trip/budget-bar'
import { GroceryRow } from '@/components/trip/grocery-row'
import { Progress } from '@/components/ui/progress'
import type {
  TripTask,
  TripTaskCategory,
  TripGroceryItem,
  GroceryCategory,
} from '@/types/database'

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

const TASK_CATEGORY_LABELS: Record<TripTaskCategory, string> = {
  cooking: 'Cooking',
  dishes: 'Dishes',
  cleanup: 'Cleanup',
  shopping: 'Shopping',
  packing: 'Packing',
  driving: 'Driving',
  night_prep: 'Night Prep',
  other: 'Other',
}

const GROCERY_CATEGORY_LABELS: Record<GroceryCategory, string> = {
  produce: 'Produce',
  meat: 'Meat',
  dairy: 'Dairy',
  bakery: 'Bakery',
  frozen: 'Frozen',
  canned: 'Canned',
  dry_goods: 'Dry Goods',
  condiments: 'Condiments',
  spices: 'Spices',
  breakfast: 'Breakfast',
  snacks: 'Snacks',
  beverages: 'Beverages',
  household: 'Household',
}

interface TasksViewProps {
  tasks: TripTask[]
  tripDates: string[]
  selectedDate: string
  onDateChange: (date: string) => void
  groceryItems: TripGroceryItem[]
  groceryBudget: {
    estimated_total: number
    purchased_total: number
    items_total: number
    items_purchased: number
  }
}

export function TasksView({
  tasks,
  tripDates,
  selectedDate,
  onDateChange,
  groceryItems,
  groceryBudget,
}: TasksViewProps) {
  const { player } = useUser()
  const [isPending, startTransition] = useTransition()
  const [activeSection, setActiveSection] = useState<'tasks' | 'shopping'>(
    'tasks'
  )
  const [activeGroceryCategory, setActiveGroceryCategory] = useState<
    GroceryCategory | 'all'
  >('all')
  const playerId = player?.id ?? null

  // --- Task logic ---
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
    dayProgress.total > 0
      ? Math.round((dayProgress.completed / dayProgress.total) * 100)
      : 0

  // --- Grocery logic ---
  const groceryCategories = useMemo(() => {
    const cats = new Set(groceryItems.map((item) => item.category))
    return Array.from(cats).sort() as GroceryCategory[]
  }, [groceryItems])

  const filteredGroceryItems = useMemo(() => {
    if (activeGroceryCategory === 'all') return groceryItems
    return groceryItems.filter(
      (item) => item.category === activeGroceryCategory
    )
  }, [groceryItems, activeGroceryCategory])

  const groupedGroceryItems = useMemo(() => {
    const groups: Record<string, TripGroceryItem[]> = {}
    for (const item of filteredGroceryItems) {
      const key = item.category
      if (!groups[key]) groups[key] = []
      groups[key].push(item)
    }
    return groups
  }, [filteredGroceryItems])

  // --- Handlers ---
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

  function handleGroceryToggle(itemId: number) {
    if (!playerId) return
    startTransition(async () => {
      await toggleGroceryPurchased(itemId, playerId)
    })
  }

  return (
    <div className="space-y-4">
      {/* Section toggle */}
      <div className="flex gap-1 bg-muted rounded-lg p-1">
        <button
          onClick={() => setActiveSection('tasks')}
          className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors min-h-[44px] ${
            activeSection === 'tasks'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground'
          }`}
        >
          Tasks
        </button>
        <button
          onClick={() => setActiveSection('shopping')}
          className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors min-h-[44px] ${
            activeSection === 'shopping'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground'
          }`}
        >
          Shopping List
        </button>
      </div>

      {activeSection === 'tasks' ? (
        <>
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
                    {TASK_CATEGORY_LABELS[category]}
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
        </>
      ) : (
        <>
          <BudgetBar
            estimated={groceryBudget.estimated_total}
            purchased={groceryBudget.purchased_total}
            itemsTotal={groceryBudget.items_total}
            itemsPurchased={groceryBudget.items_purchased}
          />

          {/* Category filter pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            <button
              onClick={() => setActiveGroceryCategory('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap min-h-[36px] transition-colors ${
                activeGroceryCategory === 'all'
                  ? 'bg-rose-red text-white'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              All
            </button>
            {groceryCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveGroceryCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap min-h-[36px] transition-colors ${
                  activeGroceryCategory === cat
                    ? 'bg-rose-red text-white'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {GROCERY_CATEGORY_LABELS[cat] ?? cat}
              </button>
            ))}
          </div>

          {/* Grouped items */}
          {Object.keys(groupedGroceryItems).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(groupedGroceryItems).map(
                ([category, items]) => (
                  <div key={category}>
                    <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-2 tracking-wide">
                      {GROCERY_CATEGORY_LABELS[
                        category as GroceryCategory
                      ] ?? category}
                    </h3>
                    <div className="space-y-1">
                      {items.map((item) => (
                        <GroceryRow
                          key={item.id}
                          item={item}
                          playerId={playerId}
                          onToggle={handleGroceryToggle}
                          isPending={isPending}
                        />
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          ) : (
            <p className="text-center text-sm text-muted-foreground py-8">
              No grocery items found.
            </p>
          )}
        </>
      )}
    </div>
  )
}
