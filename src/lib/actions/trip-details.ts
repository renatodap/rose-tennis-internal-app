'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type {
  TripScheduleEntry,
  TripMeal,
  TripGroceryItem,
  TripTask,
  TripStaffMember,
} from '@/types/database'

// ---------------------------------------------------------------------------
// Schedule
// ---------------------------------------------------------------------------

export async function getTripSchedule(
  tripId: number,
  date?: string
): Promise<TripScheduleEntry[]> {
  try {
    const supabase = await createClient()

    let query = supabase
      .from('trip_schedule')
      .select('*')
      .eq('trip_id', tripId)

    if (date) {
      query = query.eq('day_date', date)
    }

    const { data, error } = await query
      .order('day_date', { ascending: true })
      .order('sort_order', { ascending: true })
      .order('start_time', { ascending: true })

    if (error) {
      console.error('Error fetching trip schedule:', error)
      return []
    }

    return (data ?? []) as TripScheduleEntry[]
  } catch (err) {
    console.error('Error in getTripSchedule:', err)
    return []
  }
}

// ---------------------------------------------------------------------------
// Meals
// ---------------------------------------------------------------------------

export async function getTripMeals(
  tripId: number,
  date?: string
): Promise<TripMeal[]> {
  try {
    const supabase = await createClient()

    let query = supabase
      .from('trip_meals')
      .select('*')
      .eq('trip_id', tripId)

    if (date) {
      query = query.eq('day_date', date)
    }

    const { data, error } = await query
      .order('day_date', { ascending: true })
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('Error fetching trip meals:', error)
      return []
    }

    return (data ?? []) as TripMeal[]
  } catch (err) {
    console.error('Error in getTripMeals:', err)
    return []
  }
}

// ---------------------------------------------------------------------------
// Grocery List
// ---------------------------------------------------------------------------

export async function getTripGroceryList(
  tripId: number
): Promise<TripGroceryItem[]> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('trip_grocery_items')
      .select('*, purchaser:players!purchased_by(id, first_name, last_name)')
      .eq('trip_id', tripId)
      .order('category', { ascending: true })
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('Error fetching grocery list:', error)
      return []
    }

    return (data ?? []) as TripGroceryItem[]
  } catch (err) {
    console.error('Error in getTripGroceryList:', err)
    return []
  }
}

export async function toggleGroceryPurchased(
  itemId: number,
  playerId: number
): Promise<void> {
  const supabase = await createClient()

  const { data: item, error: fetchError } = await supabase
    .from('trip_grocery_items')
    .select('is_purchased')
    .eq('id', itemId)
    .single()

  if (fetchError) throw fetchError

  const nowPurchased = !(item as { is_purchased: boolean }).is_purchased

  const { error: updateError } = await supabase
    .from('trip_grocery_items')
    .update({
      is_purchased: nowPurchased,
      purchased_by: nowPurchased ? playerId : null,
    } as never)
    .eq('id', itemId)

  if (updateError) throw updateError

  revalidatePath('/trips')
}

// ---------------------------------------------------------------------------
// Grocery Budget
// ---------------------------------------------------------------------------

export async function getGroceryBudget(tripId: number): Promise<{
  estimated_total: number
  purchased_total: number
  items_total: number
  items_purchased: number
}> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('trip_grocery_items')
      .select('estimated_price, is_purchased')
      .eq('trip_id', tripId)

    if (error) {
      console.error('Error fetching grocery budget:', error)
      return { estimated_total: 0, purchased_total: 0, items_total: 0, items_purchased: 0 }
    }

    const items = (data ?? []) as { estimated_price: number | null; is_purchased: boolean }[]

    const estimated_total = items.reduce(
      (sum, item) => sum + (item.estimated_price ?? 0),
      0
    )
    const purchased_total = items
      .filter((item) => item.is_purchased)
      .reduce((sum, item) => sum + (item.estimated_price ?? 0), 0)
    const items_total = items.length
    const items_purchased = items.filter((item) => item.is_purchased).length

    return { estimated_total, purchased_total, items_total, items_purchased }
  } catch (err) {
    console.error('Error in getGroceryBudget:', err)
    return { estimated_total: 0, purchased_total: 0, items_total: 0, items_purchased: 0 }
  }
}

// ---------------------------------------------------------------------------
// Tasks
// ---------------------------------------------------------------------------

export async function getTripTasks(
  tripId: number,
  date?: string
): Promise<TripTask[]> {
  try {
    const supabase = await createClient()

    let query = supabase
      .from('trip_tasks')
      .select(
        '*, signups:trip_task_signups(*, player:players(id, first_name, last_name))'
      )
      .eq('trip_id', tripId)

    if (date) {
      query = query.eq('day_date', date)
    }

    const { data, error } = await query
      .order('day_date', { ascending: true })
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('Error fetching trip tasks:', error)
      return []
    }

    return (data ?? []) as TripTask[]
  } catch (err) {
    console.error('Error in getTripTasks:', err)
    return []
  }
}

export async function signUpForTask(
  taskId: number,
  playerId: number
): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('trip_task_signups')
    .insert({ task_id: taskId, player_id: playerId } as never)

  if (error) throw error

  revalidatePath('/trips')
}

export async function withdrawFromTask(
  taskId: number,
  playerId: number
): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('trip_task_signups')
    .delete()
    .eq('task_id', taskId)
    .eq('player_id', playerId)

  if (error) throw error

  revalidatePath('/trips')
}

export async function markTaskDone(signupId: number): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('trip_task_signups')
    .update({ completed_at: new Date().toISOString() } as never)
    .eq('id', signupId)

  if (error) throw error

  revalidatePath('/trips')
}

// ---------------------------------------------------------------------------
// Task Progress
// ---------------------------------------------------------------------------

export async function getTaskProgress(
  tripId: number,
  date?: string
): Promise<{
  total_slots: number
  filled_slots: number
  completed_slots: number
}> {
  try {
    const supabase = await createClient()

    let query = supabase
      .from('trip_tasks')
      .select(
        'slots_needed, signups:trip_task_signups(id, completed_at)'
      )
      .eq('trip_id', tripId)

    if (date) {
      query = query.eq('day_date', date)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching task progress:', error)
      return { total_slots: 0, filled_slots: 0, completed_slots: 0 }
    }

    const tasks = (data ?? []) as {
      slots_needed: number
      signups: { id: number; completed_at: string | null }[]
    }[]

    const total_slots = tasks.reduce((sum, t) => sum + t.slots_needed, 0)
    const filled_slots = tasks.reduce((sum, t) => sum + (t.signups?.length ?? 0), 0)
    const completed_slots = tasks.reduce(
      (sum, t) =>
        sum + (t.signups?.filter((s) => s.completed_at !== null).length ?? 0),
      0
    )

    return { total_slots, filled_slots, completed_slots }
  } catch (err) {
    console.error('Error in getTaskProgress:', err)
    return { total_slots: 0, filled_slots: 0, completed_slots: 0 }
  }
}

// ---------------------------------------------------------------------------
// Active Trip Summary (for home page banner)
// ---------------------------------------------------------------------------

export async function getActiveTripSummary(): Promise<{
  trip: { id: number; name: string; destination: string; departure_date: string; return_date: string }
  scheduleCount: number
  taskCount: number
  groceryCount: number
  todaySchedule: TripScheduleEntry[]
} | null> {
  try {
    const supabase = await createClient()
    const today = new Date().toISOString().split('T')[0]

    const { data: trips, error } = await supabase
      .from('trips')
      .select('id, name, destination, departure_date, return_date')
      .gte('return_date', today)
      .order('departure_date', { ascending: true })
      .limit(1)

    if (error || !trips || trips.length === 0) return null

    const trip = trips[0] as {
      id: number; name: string; destination: string
      departure_date: string; return_date: string
    }

    const [scheduleRes, taskRes, groceryRes, todayScheduleRes] = await Promise.all([
      supabase.from('trip_schedule').select('id').eq('trip_id', trip.id),
      supabase.from('trip_tasks').select('id').eq('trip_id', trip.id),
      supabase.from('trip_grocery_items').select('id').eq('trip_id', trip.id),
      supabase
        .from('trip_schedule')
        .select('*')
        .eq('trip_id', trip.id)
        .eq('day_date', today)
        .order('start_time', { ascending: true })
        .limit(3),
    ])

    return {
      trip,
      scheduleCount: scheduleRes.data?.length ?? 0,
      taskCount: taskRes.data?.length ?? 0,
      groceryCount: groceryRes.data?.length ?? 0,
      todaySchedule: (todayScheduleRes.data ?? []) as TripScheduleEntry[],
    }
  } catch (err) {
    console.error('Error in getActiveTripSummary:', err)
    return null
  }
}

// ---------------------------------------------------------------------------
// Active Trip ID (for bottom nav)
// ---------------------------------------------------------------------------

export async function getActiveTripId(): Promise<number | null> {
  try {
    const supabase = await createClient()
    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('trips')
      .select('id, departure_date, return_date')
      .gte('return_date', today)
      .order('departure_date', { ascending: true })
      .limit(1)

    if (error || !data || data.length === 0) return null

    const trip = data[0] as { id: number; departure_date: string; return_date: string }
    const departure = new Date(trip.departure_date)
    const returnDate = new Date(trip.return_date)
    const now = new Date()

    const windowStart = new Date(departure)
    windowStart.setDate(windowStart.getDate() - 14)
    const windowEnd = new Date(returnDate)
    windowEnd.setDate(windowEnd.getDate() + 1)

    if (now >= windowStart && now <= windowEnd) {
      return trip.id
    }

    return null
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// Staff Roster
// ---------------------------------------------------------------------------

export async function getTripStaffRoster(
  tripId: number
): Promise<TripStaffMember[]> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('trip_staff_roster')
      .select('*')
      .eq('trip_id', tripId)
      .order('start_date', { ascending: true })

    if (error) {
      console.error('Error fetching trip staff roster:', error)
      return []
    }

    return (data ?? []) as TripStaffMember[]
  } catch (err) {
    console.error('Error in getTripStaffRoster:', err)
    return []
  }
}
