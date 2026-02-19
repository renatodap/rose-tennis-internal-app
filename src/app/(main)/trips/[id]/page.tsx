import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getTrip } from '@/lib/actions/trips'
import {
  getTripSchedule,
  getTripMeals,
  getTripGroceryList,
  getTripTasks,
  getTripStaffRoster,
  getGroceryBudget,
} from '@/lib/actions/trip-details'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft } from 'lucide-react'
import { differenceInDays, parseISO, isWithinInterval } from 'date-fns'
import { TripTabs } from './trip-tabs'

interface Props {
  params: Promise<{ id: string }>
}

export default async function TripDetailPage({ params }: Props) {
  const { id } = await params
  const tripId = parseInt(id)
  const trip = await getTrip(tripId)
  if (!trip) notFound()

  const [schedule, meals, groceryItems, tasks, staffRoster, groceryBudget] =
    await Promise.all([
      getTripSchedule(tripId),
      getTripMeals(tripId),
      getTripGroceryList(tripId),
      getTripTasks(tripId),
      getTripStaffRoster(tripId),
      getGroceryBudget(tripId),
    ])

  // Calculate trip status for header badge
  const now = new Date()
  const departure = parseISO(trip.departure_date)
  const returnDate = parseISO(trip.return_date)
  const isActive = isWithinInterval(now, {
    start: departure,
    end: returnDate,
  })
  const isPast = now > returnDate
  const daysUntil = differenceInDays(departure, now)
  const totalDays = differenceInDays(returnDate, departure) + 1
  const currentDay = isActive ? differenceInDays(now, departure) + 1 : 0

  let statusText: string | null = null
  let statusColor = ''
  if (isActive) {
    statusText = `Day ${currentDay} of ${totalDays}`
    statusColor = 'bg-rose-red text-white'
  } else if (isPast) {
    statusText = 'Trip complete'
    statusColor = 'bg-gray-100 text-gray-600'
  } else if (daysUntil <= 14) {
    statusText =
      daysUntil === 0
        ? 'Departing today!'
        : daysUntil === 1
          ? 'Tomorrow!'
          : `${daysUntil} days away`
    statusColor = 'bg-green-600 text-white'
  }

  return (
    <div className="p-4">
      <Button variant="ghost" size="sm" className="mb-4 -ml-2" asChild>
        <Link href="/trips">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Trips
        </Link>
      </Button>
      <div className="mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-xl font-semibold">{trip.name}</h1>
          {statusText && (
            <Badge className={statusColor}>{statusText}</Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{trip.destination}</p>
      </div>
      <TripTabs
        trip={trip}
        schedule={schedule}
        meals={meals}
        groceryItems={groceryItems}
        tasks={tasks}
        staffRoster={staffRoster}
        groceryBudget={groceryBudget}
      />
    </div>
  )
}
