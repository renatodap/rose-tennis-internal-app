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
import { ArrowLeft } from 'lucide-react'
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

  return (
    <div className="p-4">
      <Button variant="ghost" size="sm" className="mb-4 -ml-2" asChild>
        <Link href="/trips">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Trips
        </Link>
      </Button>
      <div className="mb-4">
        <h1 className="text-xl font-semibold">{trip.name}</h1>
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
