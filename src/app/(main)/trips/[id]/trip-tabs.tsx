'use client'

import { useMemo, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  CalendarClock,
  Calendar,
  ClipboardCheck,
  Info,
} from 'lucide-react'
import { addDays, format, parseISO, isWithinInterval } from 'date-fns'
import type {
  Trip,
  TripScheduleEntry,
  TripMeal,
  TripGroceryItem,
  TripTask,
  TripStaffMember,
} from '@/types/database'
import { TodayView } from './today-view'
import { ScheduleView } from './schedule-view'
import { TasksView } from './tasks-view'
import { InfoView } from './info-view'

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: CalendarClock },
  { id: 'schedule', label: 'Schedule', icon: Calendar },
  { id: 'tasks', label: 'Tasks & Grocery', icon: ClipboardCheck },
  { id: 'info', label: 'Info', icon: Info },
] as const

type TabId = (typeof TABS)[number]['id']

// Map old tab IDs to new ones for backwards compatibility
const TAB_MIGRATION: Record<string, string> = {
  today: 'dashboard',
  meals: 'schedule',
  grocery: 'tasks',
}

interface TripTabsProps {
  trip: Trip
  schedule: TripScheduleEntry[]
  meals: TripMeal[]
  groceryItems: TripGroceryItem[]
  tasks: TripTask[]
  staffRoster: TripStaffMember[]
  groceryBudget: {
    estimated_total: number
    purchased_total: number
    items_total: number
    items_purchased: number
  }
}

export function TripTabs({
  trip,
  schedule,
  meals,
  groceryItems,
  tasks,
  staffRoster,
  groceryBudget,
}: TripTabsProps) {
  const searchParams = useSearchParams()
  const router = useRouter()

  const rawTab = searchParams.get('tab') || 'dashboard'
  const activeTab = (TAB_MIGRATION[rawTab] ?? rawTab) as TabId

  const tripDates = useMemo(() => {
    const start = parseISO(trip.departure_date)
    const end = parseISO(trip.return_date)
    const dates: string[] = []
    let current = start
    while (current <= end) {
      dates.push(format(current, 'yyyy-MM-dd'))
      current = addDays(current, 1)
    }
    return dates
  }, [trip.departure_date, trip.return_date])

  const selectedDate = useMemo(() => {
    const dayParam = searchParams.get('day')
    if (dayParam && tripDates.includes(dayParam)) return dayParam
    const today = format(new Date(), 'yyyy-MM-dd')
    const tripStart = parseISO(trip.departure_date)
    const tripEnd = parseISO(trip.return_date)
    if (isWithinInterval(new Date(), { start: tripStart, end: tripEnd })) {
      return today
    }
    if (new Date() < tripStart) return trip.departure_date
    return trip.return_date
  }, [searchParams, tripDates, trip.departure_date, trip.return_date])

  const setTab = useCallback(
    (tab: TabId) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set('tab', tab)
      router.replace(`?${params.toString()}`, { scroll: false })
    },
    [searchParams, router]
  )

  const setDay = useCallback(
    (day: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set('day', day)
      router.replace(`?${params.toString()}`, { scroll: false })
    },
    [searchParams, router]
  )

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-hide">
        {TABS.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap min-h-[44px] transition-colors ${
                isActive
                  ? 'bg-rose-red text-white'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      <div className="mt-4">
        {activeTab === 'dashboard' && (
          <TodayView
            schedule={schedule}
            meals={meals}
            tasks={tasks}
            tripDates={tripDates}
            selectedDate={selectedDate}
            onDateChange={setDay}
            tripDepartureDate={trip.departure_date}
            tripReturnDate={trip.return_date}
            groceryBudget={groceryBudget}
            onSwitchTab={(tab) => setTab(tab as TabId)}
          />
        )}
        {activeTab === 'schedule' && (
          <ScheduleView
            schedule={schedule}
            meals={meals}
            tripDates={tripDates}
            selectedDate={selectedDate}
            onDateChange={setDay}
          />
        )}
        {activeTab === 'tasks' && (
          <TasksView
            tasks={tasks}
            tripDates={tripDates}
            selectedDate={selectedDate}
            onDateChange={setDay}
            groceryItems={groceryItems}
            groceryBudget={groceryBudget}
          />
        )}
        {activeTab === 'info' && (
          <InfoView trip={trip} staffRoster={staffRoster} />
        )}
      </div>
    </div>
  )
}
