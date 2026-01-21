'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Trip, TripStatus, TripRoster } from '@/types/database'

export async function getTrips(): Promise<Trip[]> {
  try {
    const supabase = await createClient()
    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('trips')
      .select(`
        *,
        trip_roster (
          *,
          player:players (id, first_name, last_name, gender)
        )
      `)
      .gte('return_date', today)
      .order('departure_date', { ascending: true })

    if (error) {
      console.error('Error fetching trips:', error)
      return []
    }
    return (data ?? []) as Trip[]
  } catch (err) {
    console.error('Error in getTrips:', err)
    return []
  }
}

export async function getTrip(id: number): Promise<Trip | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('trips')
    .select(`
      *,
      trip_roster (
        *,
        player:players (id, first_name, last_name, gender, email, class_year)
      )
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Trip | null
}

export async function updateTripRosterStatus(
  tripId: number,
  playerId: number,
  status: TripStatus
) {
  const supabase = await createClient()

  const rosterData: Omit<TripRoster, 'player'> = {
    trip_id: tripId,
    player_id: playerId,
    status,
  }

  const { error } = await supabase
    .from('trip_roster')
    .upsert(rosterData as never)

  if (error) throw error

  revalidatePath('/trips')
}

export async function createTrip(tripData: Omit<Trip, 'id' | 'created_at' | 'trip_roster'>): Promise<Trip> {
  const supabase = await createClient()

  const { data: trip, error } = await supabase
    .from('trips')
    .insert(tripData as never)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/trips')
  return trip as Trip
}

export async function addPlayerToTrip(tripId: number, playerId: number) {
  const supabase = await createClient()

  const rosterData: Omit<TripRoster, 'player'> = {
    trip_id: tripId,
    player_id: playerId,
    status: 'pending',
  }

  const { error } = await supabase
    .from('trip_roster')
    .insert(rosterData as never)

  if (error) throw error

  revalidatePath('/trips')
}

export async function removePlayerFromTrip(tripId: number, playerId: number) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('trip_roster')
    .delete()
    .eq('trip_id', tripId)
    .eq('player_id', playerId)

  if (error) throw error

  revalidatePath('/trips')
}
