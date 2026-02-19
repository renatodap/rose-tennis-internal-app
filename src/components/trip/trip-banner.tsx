'use client'

import Link from 'next/link'
import { Plane, ChevronRight, Calendar, ClipboardCheck, ShoppingCart } from 'lucide-react'
import { differenceInDays, parseISO, isWithinInterval, format } from 'date-fns'

interface TripBannerProps {
  trip: {
    id: number
    name: string
    destination: string
    departure_date: string
    return_date: string
  }
  scheduleCount: number
  taskCount: number
  groceryCount: number
}

export function TripBanner({ trip, scheduleCount, taskCount, groceryCount }: TripBannerProps) {
  const now = new Date()
  const departure = parseISO(trip.departure_date)
  const returnDate = parseISO(trip.return_date)

  const isActive = isWithinInterval(now, { start: departure, end: returnDate })
  const isPast = now > returnDate
  const daysUntil = differenceInDays(departure, now)
  const totalDays = differenceInDays(returnDate, departure) + 1
  const currentDay = isActive ? differenceInDays(now, departure) + 1 : 0

  let statusText: string
  if (isPast) {
    statusText = 'Trip complete'
  } else if (isActive) {
    statusText = `Day ${currentDay} of ${totalDays}`
  } else if (daysUntil === 0) {
    statusText = 'Departing today!'
  } else if (daysUntil === 1) {
    statusText = 'Tomorrow!'
  } else {
    statusText = `${daysUntil} days away`
  }

  return (
    <Link href={`/trips/${trip.id}`} className="block">
      <div className="rounded-xl border border-rose-red/30 bg-rose-red/5 p-4 transition-colors hover:bg-rose-red/10">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-red/10">
              <Plane className="h-5 w-5 text-rose-red" />
            </div>
            <div>
              <h3 className="font-semibold text-base">{trip.name}</h3>
              <p className="text-sm text-muted-foreground">{trip.destination}</p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground mt-1 shrink-0" />
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span
            className={`text-sm font-semibold ${
              isActive ? 'text-rose-red' : isPast ? 'text-muted-foreground' : 'text-green-700'
            }`}
          >
            {statusText}
          </span>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>
              {format(departure, 'MMM d')} - {format(returnDate, 'MMM d')}
            </span>
          </div>
        </div>

        <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <ClipboardCheck className="h-3.5 w-3.5" />
            <span>{taskCount} tasks</span>
          </div>
          <div className="flex items-center gap-1">
            <ShoppingCart className="h-3.5 w-3.5" />
            <span>{groceryCount} grocery</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            <span>{scheduleCount} events</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
