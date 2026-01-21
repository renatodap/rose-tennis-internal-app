'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Trip, TripStatus } from '@/types/database'

export async function getTrips() {
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

  if (error) throw error
  return data
}

export async function getTrip(id: number) {
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
  return data
}

export async function updateTripRosterStatus(
  tripId: number,
  playerId: number,
  status: TripStatus
) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('trip_roster')
    .upsert({
      trip_id: tripId,
      player_id: playerId,
      status,
    })

  if (error) throw error

  revalidatePath('/trips')
}

export async function createTrip(data: Omit<Trip, 'id' | 'created_at' | 'trip_roster'>) {
  const supabase = await createClient()

  const { data: trip, error } = await supabase
    .from('trips')
    .insert(data)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/trips')
  return trip
}

export async function addPlayerToTrip(tripId: number, playerId: number) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('trip_roster')
    .insert({
      trip_id: tripId,
      player_id: playerId,
      status: 'pending',
    })

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
