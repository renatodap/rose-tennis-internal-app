'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Event, MatchDetails } from '@/types/database'

export async function getEvents(filters?: {
  startDate?: string
  endDate?: string
  gender?: 'male' | 'female'
}): Promise<Event[]> {
  const supabase = await createClient()

  let query = supabase
    .from('events')
    .select(`
      *,
      match_details (*)
    `)
    .order('event_date', { ascending: true })
    .order('start_time', { ascending: true })

  if (filters?.startDate) {
    query = query.gte('event_date', filters.startDate)
  }

  if (filters?.endDate) {
    query = query.lte('event_date', filters.endDate)
  }

  const { data, error } = await query

  if (error) throw error

  const events = (data ?? []) as Event[]

  // Filter by gender if specified
  if (filters?.gender) {
    return events.filter(event =>
      filters.gender === 'male' ? event.for_mens : event.for_womens
    )
  }

  return events
}

export async function getUpcomingEvents(limit: number = 5): Promise<Event[]> {
  try {
    const supabase = await createClient()
    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        match_details (*)
      `)
      .gte('event_date', today)
      .order('event_date', { ascending: true })
      .order('start_time', { ascending: true })
      .limit(limit)

    if (error) {
      console.error('Error fetching upcoming events:', error)
      return []
    }
    return (data ?? []) as Event[]
  } catch (err) {
    console.error('Error in getUpcomingEvents:', err)
    return []
  }
}

export async function getEvent(id: number): Promise<Event> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      match_details (*)
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Event
}

export async function createEvent(
  eventData: Omit<Event, 'id' | 'created_at' | 'match_details'>,
  matchDetails?: Omit<MatchDetails, 'event_id'>
) {
  const supabase = await createClient()

  const { data: event, error } = await supabase
    .from('events')
    .insert(eventData as never)
    .select()
    .single()

  if (error) throw error

  const createdEvent = event as { id: number }

  if (matchDetails && createdEvent) {
    const matchData: MatchDetails = {
      event_id: createdEvent.id,
      opponent: matchDetails.opponent,
      home_away: matchDetails.home_away,
      mens_score: matchDetails.mens_score,
      womens_score: matchDetails.womens_score,
      result: matchDetails.result,
    }
    const { error: matchError } = await supabase
      .from('match_details')
      .insert(matchData as never)

    if (matchError) throw matchError
  }

  revalidatePath('/schedule')
  revalidatePath('/')
  revalidatePath('/admin/events')
  return createdEvent
}

export async function updateEvent(
  id: number,
  eventData: Partial<Event>,
  matchDetails?: Partial<MatchDetails>
) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('events')
    .update(eventData as never)
    .eq('id', id)

  if (error) throw error

  if (matchDetails) {
    const matchData = { ...matchDetails, event_id: id }
    const { error: matchError } = await supabase
      .from('match_details')
      .upsert(matchData as never)

    if (matchError) throw matchError
  }

  revalidatePath('/schedule')
  revalidatePath(`/schedule/${id}`)
  revalidatePath('/')
  revalidatePath('/admin/events')
}

export async function deleteEvent(id: number) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id)

  if (error) throw error

  revalidatePath('/schedule')
  revalidatePath('/')
  revalidatePath('/admin/events')
}
