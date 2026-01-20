'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Event, MatchDetails } from '@/types/database'

export async function getEvents(filters?: {
  startDate?: string
  endDate?: string
  gender?: 'male' | 'female'
}) {
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

  // Filter by gender if specified
  if (filters?.gender && data) {
    return data.filter(event =>
      filters.gender === 'male' ? event.for_mens : event.for_womens
    )
  }

  return data
}

export async function getUpcomingEvents(limit: number = 5) {
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

  if (error) throw error
  return data
}

export async function getEvent(id: number) {
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
  return data
}

export async function createEvent(
  data: Omit<Event, 'id' | 'created_at' | 'match_details'>,
  matchDetails?: Omit<MatchDetails, 'event_id'>
) {
  const supabase = await createClient()

  const { data: event, error } = await supabase
    .from('events')
    .insert(data)
    .select()
    .single()

  if (error) throw error

  if (matchDetails && event) {
    const { error: matchError } = await supabase
      .from('match_details')
      .insert({ ...matchDetails, event_id: event.id })

    if (matchError) throw matchError
  }

  revalidatePath('/schedule')
  revalidatePath('/')
  revalidatePath('/admin/events')
  return event
}

export async function updateEvent(
  id: number,
  data: Partial<Event>,
  matchDetails?: Partial<MatchDetails>
) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('events')
    .update(data)
    .eq('id', id)

  if (error) throw error

  if (matchDetails) {
    const { error: matchError } = await supabase
      .from('match_details')
      .upsert({ ...matchDetails, event_id: id })

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
